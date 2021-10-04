module.exports = {
    defaultConfig: Object.assign({},
        {
            mavenRepositoryType: "Google",
            slnFile: "generated/AndroidX.sln",
            strictRuntimeDependencies: true,
            additionalProjects: [
                // "source/migration/Dummy/Xamarin.AndroidX.Migration.Dummy.csproj",
                // "source/androidx.appcompat/typeforwarders/androidx.appcompat.appcompat-resources-typeforwarders.csproj"
            ],
            templates: [
                {
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
            templateSets: [
                {
                    name: "kotlin",
                    mavenRepositoryType: "MavenCentral",
                    templates: [
                        {
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
                    templates: [
                        {
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
                    templates: [
                        {
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
                    templates: [
                        {
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
                    templates: [
                        {
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
                    templates: [
                        {
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
                    templates: [
                        {
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
        }
    )
}