// COMMAND-LINE WRAPPER TO GENERATE SIGNATURES FOR CONFIG FILES
import { program } from 'commander';
import { generateConfigHash, attemptToReadTOMLData } from 'common-identifier-algorithm-shared';

program.argument('<path>', 'Config file to generate signatures for');

program.parse();

// APP STARTS HERE
// ---------------

const configFile = program.args[0];

console.log('Opening file: ', configFile);
const config = attemptToReadTOMLData(configFile, "utf-8");
const hash = generateConfigHash(config);

console.log('HASH:', hash);
