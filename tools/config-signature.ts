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
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';

import { generateConfigHash, attemptToReadTOMLData, validateConfig  } from 'common-identifier-algorithm-shared';
import type { Config  } from 'common-identifier-algorithm-shared';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const program = new Command()
  .option("--all")
  .option("--algorithm-name <ALGORITHM_NAME>", "The name of the algorithm to check, typically this is the directory name")
  .option('--algorithm-short-code <ALGORITHM_SHORT_CODE>', 'The algorithm code AKA the region code')
  .action(parseArgs);

program.parse();

function getConfigPath(algoName: string) {
  const configPath = join(__dirname, '..', 'algorithms', algoName, "config", "config.backup.toml");
  if (!existsSync(configPath))
    throw new Error(`ERROR: Unable to find backup config file for algorithm >> ${algoName}: ${configPath}`);
  return configPath;
}

function parseArgs() {
  const args = program.opts();;
  if (args.all) checkAllConfigSignatures();
  
  else if (args.algorithmName && args.algorithmShortCode) {
    const result = checkConfigSignature(args.algorithmName, args.algorithmShortCode);
    console.log("RESULTS: ", result);
    if (result.valid) console.log("Config signature valid 🙌");
    else throw new Error("❗CONFIG SIGNATURE INVALID, CHECK RESULTS");
  }
  
  else console.log(program.usage());
}

type CheckResult = { name: string, shortCode: string, valid: boolean, message: string }

function checkConfigSignature(algoName: string, shortCode: string): CheckResult {
  console.log(`INFO: Checking config signature for algorithm '${algoName}', with shortCode '${shortCode}'`);
  const configPath = getConfigPath(algoName);
  const config = attemptToReadTOMLData<Config.Options>(configPath, "utf-8");
  if (!config) {
    return { name: algoName, shortCode: shortCode, valid: false, message: `ERROR: could not read configuration file: ${configPath}` }
  }

  const validationResult = validateConfig(config, shortCode);
  if (!!validationResult) {
    return { name: algoName, shortCode: shortCode, valid: false, message: `ERROR: could not validate configuration file: ${validationResult}` };
  }
  const hash = generateConfigHash(config);
  
  if (hash !== config.meta.signature) {
    return { name: algoName, shortCode: shortCode, valid: false, message: `ERROR: configuration file contains invalid signature >> expected: ${hash}, got: ${config.meta.signature}` };
  } else return { name: algoName, shortCode: shortCode, valid: true, message: `GENERATED HASH: ${hash}` };
}

async function checkAllConfigSignatures() {
  console.log("INFO: Checking config signatures for all available algorithms");
  const checks: CheckResult[] = [];
  const algorithmDirectories = readdirSync(join(__dirname, "..", "algorithms"));
  for (let algoName of algorithmDirectories) {
    const { REGION } = await import(`../algorithms/${algoName}/index`);
    checks.push(checkConfigSignature(algoName, REGION));
  }
  console.log("RESULTS: ", checks);
  if (checks.every(check => check.valid)) console.log("INOF: All signatures valid 🙌");
  else throw new Error("ERROR: ❗CONFIG SIGNATURES INVALID, CHECK RESULTS");
}