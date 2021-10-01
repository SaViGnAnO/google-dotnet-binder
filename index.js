#!/usr/bin/env node

const program = require('commander');
const commands = require('./src/commands');

commands.addCommands(program);

program.parse(process.argv);
