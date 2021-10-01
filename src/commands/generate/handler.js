const inquirer = require('inquirer');
const fuzzy = require('fuzzy');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');

const BASE_URL = 'https://dl.google.com/android/maven2/';

class Handler {
    constructor() {
        inquirer.registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'));
    }

    async handle(options) {
        if (!options) {
            throw new Error('default not implemented');
        }
        const groupIndex = await this.GetGroupIndex;

        if (options.bindingconfig) {
            //TODO: add selection option here
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

            const groupIndex = await this.GetGroupIndex();

            configObject[0].artifacts.push(...groupIndex);

            fs.writeFileSync('./config.json', JSON.stringify(configObject));
        }

        if (options.bindings) {
            
        }
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

    async GetGroupIndex (groupIds = undefined) {
            const masterIndex = groupIds || await this.GetMasterIndex;
            let groupIndex = [];

            function convertVersionsToArray(value, name) {
                if (typeof value === 'string' && name === 'versions') {
                    if (value.includes(',')){
                        value = value.split(',').reverse();
                    }
                }
                return value;
            }
        
            for (const groupId in masterIndex) {
                const url = `${BASE_URL}/${masterIndex[groupId].replace(/\./g, '/')}/group-index.xml`;
                const config = {
                    method: 'get',
                    url,
                    headers: {
                        'Content-Type': 'application/xml',
                    },
                };
            
                const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, attrValueProcessors: [convertVersionsToArray] });
                const response = await axios(config);

                var groupdata = await parser.parseStringPromise(response.data);
                Object.keys(groupdata).reduce((result, key, _index) => {
                    Object.keys(groupdata[key]).map((key2, _index2) => {
                        var versionNum = groupdata[key][key2].versions[0];
                
                        result.push({
                            groupId: masterIndex[groupId],
                            artifactId: key2,
                            version: versionNum,
                            nugetVersion: versionNum,
                            nugetId: `savi.${masterIndex[groupId]}.${key}`,
                            dependencyOnly: false
                        });
                    });
                    return result;
                    
                }, groupIndex);
            }

            function VersionSplit(value, _name) {
                return value.split(',').reverse();
            }

            return groupIndex;
    }

    
}



module.exports = new Handler();