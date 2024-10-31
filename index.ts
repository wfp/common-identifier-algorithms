/*
 * This file is part of Building Blocks CommonID Tool
 * Copyright (c) 2024 WFP
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import { joinFieldsForHash, cleanValueList, extractAlgoColumnsFromObject } from '../algo-shared/hashing/utils.js';

import { BaseHasher, makeHasherFunction } from '../algo-shared/hashing/base.js';
import { Config } from '../algo-shared/config/Config.js';
import { Validation } from '../algo-shared/validation/Validation.js';

// USCADI implementation that takes the extracted ('static', 'to_translate', 'reference')
// and returns a hashed object
class GOSHasher extends BaseHasher {
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

    // Helper that generates a hash based on a concatenation result
    private collectData = (extractedObj: Config.AlgorithmColumns, collectorFn: CallableFunction): string => {
        // collect the data for hashing
        const collectedData = collectorFn(extractedObj);

        // if there is an empty string only, return an empty string (no hash)
        if (collectedData === '') {
            return '';
        }
        // if there is data generate a hash
        return collectedData;
    }

    // Builds the hash columns from the extracted row object
    generateHashForObject(columnConfig: Config.AlgorithmColumns, obj: Validation.Data["row"]) {
        const extractedObj = extractAlgoColumnsFromObject(columnConfig, obj);
        const toBeHashed = this.collectData(extractedObj, this.composeHashSource);
        return {
            hashed_id: toBeHashed.length > 0 ? this.generateHashForValue(toBeHashed) : "",
            hashed_id_src: this.composeHashSource(extractedObj),
        }
    }
}

export const REGION = "GOS";
export const makeHasher: makeHasherFunction = (config: Config.Options["algorithm"]) => {
    switch (config.hash.strategy.toLowerCase()) {
        case 'sha256':
            return new GOSHasher(config);
        default:
            throw new Error(`Unknown hash strategy in config: '${config.hash.strategy}'`);
    }
}