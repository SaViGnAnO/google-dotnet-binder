const inquirer = require('inquirer');
const fuzzy = require('fuzzy');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const child_process = require('child_process');
const util = require('util');
const {
    group
} = require('console');
const exec = util.promisify(child_process.exec);

const BASE_URL = 'https://dl.google.com/android/maven2/';

class Handler {
    constructor() {
        inquirer.registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'));
    }

    async handle(options) {
        if (!options) {
            throw new Error('default not implemented');
        }

        if (options.bindingconfig) {
            const groups = await this.askForMavenPackages();
            if (!groups || groups.groupIds.length < 1) {
                const downloadAll = await inquirer.prompt([{
                    type: 'confirm',
                    message: 'Do you want to download ALL? This could be a minute or 42.',
                    name: 'toBeDumb',
                    default: false
                }]);

                if (!downloadAll.toBeDumb) {
                    return this.handle(options);
                }

                groups.groupIds = await this.GetMasterIndex;
            }

            let configObject = [{
                mavenRepositoryType: "Google",
                slnFile: "generated/AndroidX.sln",
                strictRuntimeDependencies: true,
                additionalProjects: [
                    "source/migration/Dummy/Xamarin.AndroidX.Migration.Dummy.csproj",
                    "source/androidx.appcompat/typeforwarders/androidx.appcompat.appcompat-resources-typeforwarders.csproj"
                ],
                templates: [{
                        templateFile: "source/AndroidXTargets.cshtml",
                        outputFileRule: "generated/{groupid}.{artifactid}/{nugetid}.targets"
                    },
                    {
                        templateFile: "source/AndroidXProject.cshtml",
                        outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.csproj"
                    },
                    {
                        templateFile: "source/AndroidXPom.cshtml",
                        outputFileRule: "generated/{groupid}.{artifactid}/dependencies.pom"
                    },
                    {
                        templateFile: "source/AndroidXSolutionFilter.cshtml",
                        outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.slnf"
                    }
                ],
                artifacts: [],
                templateSets: [{
                        name: "kotlin",
                        mavenRepositoryType: "MavenCentral",
                        templates: [{
                                templateFile: "templates/kotlin/Project.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.csproj"
                            },
                            {
                                templateFile: "templates/kotlin/Targets.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{nugetid}.targets"
                            },
                            {
                                templateFile: "templates/kotlin/Pom.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/dependencies.pom"
                            },
                            {
                                templateFile: "source/AndroidXSolutionFilter.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.slnf"
                            }
                        ]
                    },
                    {
                        name: "kotlinx",
                        mavenRepositoryType: "MavenCentral",
                        templates: [{
                                templateFile: "templates/kotlinx/Project.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.csproj"
                            },
                            {
                                templateFile: "templates/kotlinx/Targets.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{nugetid}.targets"
                            },
                            {
                                templateFile: "source/AndroidXSolutionFilter.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.slnf"
                            }
                        ]
                    },
                    {
                        name: "reactive-streams",
                        mavenRepositoryType: "MavenCentral",
                        templates: [{
                                templateFile: "templates/reactive-streams/Project.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.csproj"
                            },
                            {
                                templateFile: "source/AndroidXSolutionFilter.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.slnf"
                            }
                        ]
                    },
                    {
                        name: "gson",
                        mavenRepositoryType: "MavenCentral",
                        templates: [{
                                templateFile: "templates/gson/Project.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.csproj"
                            },
                            {
                                templateFile: "source/AndroidXSolutionFilter.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.slnf"
                            }
                        ]
                    },
                    {
                        name: "auto-value",
                        mavenRepositoryType: "MavenCentral",
                        templates: [{
                                templateFile: "templates/auto-value/Project.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.csproj"
                            },
                            {
                                templateFile: "source/AndroidXSolutionFilter.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.slnf"
                            }
                        ]
                    },
                    {
                        name: "rxjava",
                        mavenRepositoryType: "MavenCentral",
                        templates: [{
                                templateFile: "templates/rxjava/Project.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.csproj"
                            },
                            {
                                templateFile: "source/AndroidXSolutionFilter.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.slnf"
                            }
                        ]
                    },
                    {
                        name: "tink",
                        mavenRepositoryType: "MavenCentral",
                        templates: [{
                                templateFile: "templates/tink/Project.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.csproj"
                            },
                            {
                                templateFile: "source/AndroidXSolutionFilter.cshtml",
                                outputFileRule: "generated/{groupid}.{artifactid}/{groupid}.{artifactid}.slnf"
                            }
                        ]
                    }
                ]
            }];

            const groupIndex = await this.GetGroupIndex(groups.groupIds);

            configObject[0].artifacts.push(...groupIndex);

            fs.writeFileSync('./config.json', JSON.stringify(configObject));
        }

        if (options.bindings) {
            //await this.InstallDotnetTool();
            //RunProcess("xamarin-android-binderator", $"--config=\"{configFile}\" --basepath=\"{basePath}\"");
            const {
                stdout,
                stderr
            } = await exec(`xamarin-android-binderator --config="${options.bindings}" --basepath="${__dirname}\\output"`);
            if (stdout) {
                console.log(stdout);
            }

            if (stderr) {
                console.log(stderr);
            }
        }
    }

    async InstallDotnetTool() {
        const {
            stdout,
            stderr
        } = await exec(`dotnet tool install -g xamarin.androidbinderator.tool`);
        if (stdout) {
            console.log(stdout);
        }

        if (stderr) {
            console.log(stderr);
        }
    }

    async askForMavenPackages() {
        const choices = (await this.GetMasterIndex).reduce((result, item, index) => {
            result.push({
                name: item,
                value: item
            });
            return result;
        }, []);

        const choiceSource = async (currentAnswers, input) => {
            input = input || '';

            var fuzzyResult = fuzzy.filter(input, choices, {
                extract: function (item) {
                    return item['name'];
                }
            });

            var data = fuzzyResult.map(function (element) {
                return element.original;
            });

            return data;
        };
        const projectQuestion = {
            type: 'checkbox-plus',
            name: 'groupIds',
            message: 'Packages you wish to generate bindings for:',
            pageSize: 10,
            searchable: true,
            highlight: true,
            source: choiceSource
        };
        return await inquirer.prompt([projectQuestion]);
    }

    get GetMasterIndex() {
        return (async () => {
            const url = `${BASE_URL}/master-index.xml`;
            const config = {
                method: 'get',
                url,
                headers: {
                    'Content-Type': 'application/xml',
                },
            };

            const parser = new xml2js.Parser();
            const response = await axios(config);
            const groups = Object.keys((await parser.parseStringPromise(response.data)).metadata);

            return groups;
        })();
    }

    async GetGroupIndex(groupIds) {
        let groupIndex = [];

        function convertVersionsToArray(value, name) {
            if (typeof value === 'string' && name === 'versions') {
                if (value.includes(',')) {
                    value = value.split(',').reverse();
                } else {
                    value = [value];
                }
            }
            return value;
        }

        for (const groupId in groupIds) {
            const url = `${BASE_URL}${groupIds[groupId].replace(/\./g, '/')}/group-index.xml`;
            const config = {
                method: 'get',
                url,
                headers: {
                    'Content-Type': 'application/xml',
                },
            };

            const parser = new xml2js.Parser({
                explicitArray: false,
                mergeAttrs: true,
                attrValueProcessors: [convertVersionsToArray]
            });
            const response = await axios(config);


            var groupdata = await parser.parseStringPromise(response.data);
            await Promise.resolve(
                Object.keys(groupdata).reduce(async (result, key, _index) => {
                    await Promise.all(Object.keys(groupdata[key]).map(async (key2, _index2) => {
                        const versionNum = groupdata[key][key2].versions[0];
                        const artifactMedataUrl = `${BASE_URL}${groupIds[groupId].replace(/\./g, '/')}/${key2}/${versionNum}/artifact-metadata.json`
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
                        const downloadJavaSourceJars =  artifactMetadata.filter(am => am.name.includes('-sources.jar')).length > 0;
                        const downloadPoms = artifactMetadata.filter(am => am.name.includes('.pom')).length > 0;
                        const downloadJavaDocJars =  artifactMetadata.filter(am => am.name.includes('javadoc.jar')).length > 0;
                        const downloadMetadataFiles = artifactMetadata.filter(am => am.name.includes('-metadata.jar')).length > 0;
                        const hasAar = artifactMetadata.filter(am => am.name.includes('.aar')).length > 0;
                        const isNotDependency = downloadJavaSourceJars || hasAar;

                        result.push({
                            groupId: groupIds[groupId],
                            artifactId: key2,
                            version: versionNum,
                            nugetVersion: versionNum,
                            nugetId: `savi.${groupIds[groupId]}.${key}`,
                            dependencyOnly: !isNotDependency, // Sometimes there is no source to download it's a dependency
                            downloadJavaSourceJars,
                            downloadPoms,
                            downloadJavaDocJars,
                            downloadMetadataFiles
                        });
                    }));
                    return result;

                }, groupIndex));


            function VersionSplit(value, _name) {
                return value.split(',').reverse();
            }
        }
        return groupIndex;
    }
}

module.exports = new Handler();