// COMMAND-LINE WRAPPER TO GENERATE SIGNATURES FOR CONFIG FILES
const fs = require('node:fs');
const toml = require('toml');
const { program } = require('commander');
const generateConfigHash = require('../config/generateConfigHash');
const { attemptToReadTOMLData } = require('../config/utils');
const { CONFIG_FILE_ENCODING } = require('../config/loadConfig');

program
    .argument('<path>', 'Config file to generate signatures for')

program.parse();

const options = program.opts();

// APP STARTS HERE
// ---------------


const configFile = program.args[0];

console.log("Opening file: ", configFile)
const config = attemptToReadTOMLData(configFile, CONFIG_FILE_ENCODING);
const hash = generateConfigHash(config);

console.log("HASH:", hash);
