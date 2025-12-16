// Common Identifier Application
// Copyright (C) 2024 World Food Programme

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { Command } from '@commander-js/extra-typings';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpSync, readdirSync } from 'node:fs';

import { generateConfigHash, attemptToReadTOMLData, validateConfigFile  } from '@wfp/common-identifier-algorithm-shared';
import type { Config } from '@wfp/common-identifier-algorithm-shared';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const program = new Command()
  .option("--all")
  .option("--algorithm-name <ALGORITHM_NAME>", "The name of the algorithm to check, typically this is the directory name")
  .option('--algorithm-id <ALGORITHM_ID>', 'The algorithm id, typically found in config.meta.id')
  .option('--no-bundle', 'Should the backup configuration file be bundled in the build directory?')
  .action(parseArgs);

program.parse();

function getConfigPath(algoName: string) {
  const configPath = join(__dirname, '..', 'algorithms', algoName, "config", "config.backup.toml");
  if (!existsSync(configPath))
    throw new Error(`ERROR: Unable to find backup config file for algorithm >> ${algoName}: ${configPath}`);
  return configPath;
}

async function parseArgs() {
  const args = program.opts();
  console.log(args);
  if (args.all) await processAllConfigs();

  else if (args.algorithmName && args.algorithmId) {
    const result = checkConfigSignature(args.algorithmName, args.algorithmId);
    console.log("RESULTS: ", result);
    if (result.valid) console.log("Config signature valid 🙌");
    else throw new Error("❗CONFIG SIGNATURE INVALID, CHECK RESULTS");

    if (args.bundle) await copyConfigFile(args.algorithmName);
  }
  
  else console.log(program.usage());
}

type CheckResult = { name: string, shortCode: string, valid: boolean, message: string }

async function copyConfigFile(algoName: string) {
  console.log(`INFO: Copying config file for algorithm '${algoName}'`);
  const importCheck = await import(`../algorithms/${algoName}/index`);

  const src = resolve(`algorithms/${algoName}/config`);
  const dest = resolve(`dist/${algoName}/config`);

  cpSync(src, dest, { recursive: true });
  return { name: algoName, shortCode: importCheck.ALGORITHM_ID, valid: true, message: `COPIED BACKUP CONFIG` };
}

function checkConfigSignature(algoName: string, shortCode: string): CheckResult {
  console.log(`INFO: Checking config signature for algorithm '${algoName}', with shortCode '${shortCode}'`);
  const configPath = getConfigPath(algoName);
  const config = attemptToReadTOMLData<Config.FileConfiguration>(configPath, "utf-8");
  if (!config) {
    return { name: algoName, shortCode: shortCode, valid: false, message: `ERROR: could not read configuration file: ${configPath}` }
  }

  const validationResult = validateConfigFile(config, shortCode);
  if (!!validationResult) {
    return { name: algoName, shortCode: shortCode, valid: false, message: `ERROR: could not validate configuration file: ${validationResult}` };
  }
  const hash = generateConfigHash(config);
  
  if (hash !== config.meta.signature) {
    return { name: algoName, shortCode: shortCode, valid: false, message: `ERROR: configuration file contains invalid signature >> expected: ${hash}, got: ${config.meta.signature}` };
  } else return { name: algoName, shortCode: shortCode, valid: true, message: `GENERATED HASH: ${hash}` };
}

async function processAllConfigs() {
  console.log("INFO: Checking config signatures for all available algorithms");
  const checks: CheckResult[] = [];
  const algorithmDirectories = readdirSync(join(__dirname, "..", "algorithms"));
  for (let algoName of algorithmDirectories) {
    const { ALGORITHM_ID } = await import(`../algorithms/${algoName}/index`);
    const check = checkConfigSignature(algoName, ALGORITHM_ID);
    checks.push(check);

    if (check.valid && program.opts().bundle) await copyConfigFile(algoName);
  }
  console.log("RESULTS: ", checks);
  if (checks.every(check => check.valid)) console.log("INF): All signatures valid 🙌");
  else throw new Error("ERROR: ❗CONFIG SIGNATURES INVALID, CHECK RESULTS");
}