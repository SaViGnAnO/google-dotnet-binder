const fs = require('fs');
const path = require('path');

module.exports = {
    addCommands: (program) => {
        const dirs = fs.readdirSync(__dirname, { withFileTypes: true })
        dirs.forEach((file) => {
            if (file.isDirectory()) {
                require(`${__dirname}${path.sep}${file.name}`).add(program);
            }
        });
    }
}