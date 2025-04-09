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

import { joinFieldsForHash, cleanValueList, extractAlgoColumnsFromObject, BaseHasher } from 'common-identifier-algorithm-shared';
import type { Config, Validator, makeHasherFunction } from 'common-identifier-algorithm-shared';

// USCADI implementation that takes the extracted ('static', 'to_translate', 'reference')
// and returns a hashed object
class SYRHasher extends BaseHasher {
    constructor(config: Config.Options["algorithm"]) {
        super(config);
    }

    // Takes the output of `extractAlgoColumnsFromObject` (extracted properties) and
    // return a string with the "static" as per the GOS spec
    private composeHashSource = (extractedObj: Config.AlgorithmColumns) => {
        // the static fields stay the same
        let staticValues = extractedObj.static;
    
        // concat them
        // TODO: check the order
        let concatenated = joinFieldsForHash(cleanValueList(staticValues));
    
        return concatenated;
    }

    // Builds the hash columns from the extracted row object
    generateHashForObject(obj: Validator.InputData["row"]) {
        const extractedObj = extractAlgoColumnsFromObject(this.config.columns, obj);
        const toBeHashed = this.composeHashSource(extractedObj);
        return {
            hashed_id: toBeHashed.length > 0 ? this.generateHashForValue(toBeHashed) : "",
            hashed_id_src: this.composeHashSource(extractedObj),
        }
    }
}

export const REGION = "SYR";
export const makeHasher: makeHasherFunction = (config: Config.Options["algorithm"]) => {
    switch (config.hash.strategy.toLowerCase()) {
        case 'sha256':
            return new SYRHasher(config);
        default:
            throw new Error(`Unknown hash strategy in config: '${config.hash.strategy}'`);
    }
}