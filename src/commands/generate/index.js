module.exports = {
    add: (program) => {
        program
            .command('generate')
            .option('-c, --bindingconfig', 'generate binding config file')
            .option('-b, --bindings <configfile>', 'generate binding templates')
            .option('-p, --packages [packageoutdir]', 'generate nuget packages')
            .action((command) => {
                require('./handler').handle(command.opts());
            })
    } 
}