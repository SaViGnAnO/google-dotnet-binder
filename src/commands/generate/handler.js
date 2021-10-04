const inquirer = require('inquirer');
const fuzzy = require('fuzzy');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const util = require('util');
const genSourceHelper = require('./helpers/sourceGenerator');
const configGenerator = require('./helpers/configGenerator');
const { GOOGLE_MVN_URL } = require('../../configs/urls');

const exec = util.promisify(child_process.exec);

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

            await configGenerator.generateConfig(groups.groupIds);
        }

        if (options.sources) {
            if (typeof options.sources !== 'string') {
                options.sources = path.join(process.cwd(), 'source');
            }
            genSourceHelper.generateSources(options.sources);
        }

        if (options.bindings) {
            //await this.InstallDotnetTool();
            //RunProcess("xamarin-android-binderator", $"--config=\"{configFile}\" --basepath=\"{basePath}\"");
            if (!fs.existsSync(path.join(options.bindings))) {
                console.error('The config file you passed cannot be found.')
                console.log('Consider running `gnetbinder -c` to generate a configuration file.');
                return;
            }
            if (!fs.existsSync(path.join(process.cwd(), 'source'))) {
                console.error('No source directory found.')
                console.log('Consider running `gnetbinder --sources` to generate some default source files.');
            }
            const {
                stdout,
                stderr
            } = await exec(`xamarin-android-binderator --config="${options.bindings}" --basepath="${process.cwd()}"`);
            

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
            const url = `${GOOGLE_MVN_URL}/master-index.xml`;
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
}

module.exports = new Handler();