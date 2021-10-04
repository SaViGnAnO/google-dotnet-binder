const axios = require('axios');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const defaultConfig = require('./defaultConfig').defaultConfig;
const { GOOGLE_MVN_URL } = require('../../../configs/urls');

class ConfigGenerator {
    async generateConfig(groupIds, validateDeps = true) {
        let groupIndex = [];

        function convertVersionsToArray(value, name) {
            var array = [];
            if (typeof value === 'string' && name === 'versions') {
                if (value.includes(',')) {
                    array = value.split(',').reverse();
                } else {
                    array.push(value);
                }
            }
            return array;
        }

        for (const groupId in groupIds) {
            const url = `${GOOGLE_MVN_URL}${groupIds[groupId].replace(/\./g, '/')}/group-index.xml`;
            const config = {
                method: 'get',
                url,
                headers: {
                    'Content-Type': 'application/xml',
                },
            };
            const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, attrValueProcessors: [convertVersionsToArray] });
            let response;
            try {
                response = await axios(config);
            } catch (e) {
                console.log(url);
            }


            let groupdata = await parser.parseStringPromise(response.data);
            await Promise.resolve(
                Object.keys(groupdata).reduce(async (result, key, _index) => {
                    await Promise.all(Object.keys(groupdata[key]).map(async (key2, _index2) => {
                        const versionNum = groupdata[key][key2].versions[0];
                        const artifactMedataUrl = `${GOOGLE_MVN_URL}${groupIds[groupId].replace(/\./g, '/')}/${key2}/${versionNum}/artifact-metadata.json`
                        const artifactRequestConfig = {
                            method: 'get',
                            url: artifactMedataUrl,
                            responseType: 'json',
                            validateStatus() {
                                return true;
                            }
                        };
                        const artifactMetadataResponse = await axios(artifactRequestConfig);
                        const artifactMetadata = artifactMetadataResponse.data.artifacts || [];
                        // Prevent 404 errors in savi-binderator tool
                        const downloadJavaSourceJars = artifactMetadata.filter(am => am.name.includes('-sources.jar')).length > 0;
                        const downloadPoms = artifactMetadata.filter(am => am.name.includes('.pom')).length > 0;
                        const downloadJavaDocJars = artifactMetadata.filter(am => am.name.includes('javadoc.jar')).length > 0;
                        const downloadMetadataFiles = artifactMetadata.filter(am => am.name.includes('-metadata.jar')).length > 0;

                        // xamarin binderator attempts to download these 2 files regardless of packaging unless it's flagged as a dependency.
                        const dependencyOnly = !(artifactMetadata.filter(am =>
                            am.name.includes(`${key2}-${versionNum}.jar`) ||
                            am.name.includes(`${key2}-${versionNum}.aar`)
                        ).length > 0);

                        result.push({
                            groupId: groupIds[groupId],
                            artifactId: key2,
                            version: versionNum,
                            nugetVersion: versionNum,
                            nugetId: `savi.${groupIds[groupId]}.${key}`,
                            dependencyOnly,
                            downloadJavaSourceJars,
                            downloadPoms,
                            downloadJavaDocJars,
                            downloadMetadataFiles
                        });
                    }));
                    return result;

                }, groupIndex)
            );
        }
        if (validateDeps) {
            const missingDepsForConfig = await this.validateDependenciesInConfig(groupIndex);
            groupIndex.push(...missingDepsForConfig);
        }

        defaultConfig.artifacts.push(...groupIndex);
        fs.writeFileSync(path.join(process.cwd(), 'config.json'), JSON.stringify([defaultConfig]));
    }
    /**
     * 
     * @param {Array} groups 
     */
    async validateDependenciesInConfig(groups) {
        const missingDependencies = []
        await groups.reduce(async (result, item, index) => {
            const accum = await result;
            if (!item.downloadPoms) {
                return accum;
            }
            const pomReqUrl = `${GOOGLE_MVN_URL}${item.groupId.replace(/\./g, '/')}/${item.artifactId}/${item.version}/${item.artifactId}-${item.version}.pom`;
            const pomRequestConfig = {
                method: 'get',
                url: pomReqUrl,
                headers: {
                    'Content-Type': 'application/xml',
                },
                validateStatus() {
                    return true;
                }
            };
            const pomRequestResponse = await axios(pomRequestConfig);
            if (pomRequestResponse.status === '404') {
                console.log(`Failed to get: ${pomReqUrl}`);
            }
            const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
            const pomJson = await parser.parseStringPromise(pomRequestResponse.data);
            if(!pomJson.project.dependencies) {
                return accum;
            }
            if (!Array.isArray(pomJson.project.dependencies.dependency)) {
                try {
                    pomJson.project.dependencies.dependency = [pomJson.project.dependencies.dependency]
                } catch (e) {
                    return accum;
                }
            }
            const project = `${pomJson.project.groupId} - ${pomJson.project.artifactId}`;
            pomJson.project.dependencies.dependency.reduce((deps, item, index) => {
                // Ensure it's not already in our list
                if (deps.filter(d => d.groupId === item.groupId && d.artifactId === item.artifactId && d.version === item.version).length > 0){
                    return deps;
                }
                deps.push({
                    groupId: item.groupId,
                    artifactId: item.artifactId,
                    version: item.version.replace("[", "").replace("]", ""),
                    nugetVersion: item.version.replace("[", "").replace("]", ""),
                    nugetId: `savi.${item.groupId}.${item.artifactId}`,
                    dependencyOnly: true
                });
                return deps;
            }, accum)
            return accum;
        }, Promise.resolve(missingDependencies));
        return missingDependencies;
    }
}

module.exports = new ConfigGenerator();