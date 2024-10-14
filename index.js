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

const {joinFieldsForHash, cleanValueList} = require('../algo-shared/hashing/utils');

const BaseHasher = require('../algo-shared/hashing/base');


// USCADI implementation that takes the extracted ('static', 'to_translate', 'reference')
// and returns a hashed object
class GOSHasher extends BaseHasher {

    constructor(config) {
        super(config);
    }

    // Builds the hash columns from the extracted row object
    generateHashForExtractedObject(extractedObj) {
        return {
            hashed_id: generateHash(this, extractedObj, composeGosHashSource),
            // for debugging the hash
            hashed_id_src: composeGosHashSource(extractedObj),
        }
    }


}


// Takes the output of `extractAlgoColumnsFromObject` (extracted properties) and
// return a string with the "static" as per the GOS spec
function composeGosHashSource(extractedObj) {
    // the static fields stay the same
    let staticValues = extractedObj.static;

    // concat them
    // TODO: check the order
    let concatenated = joinFieldsForHash(cleanValueList(staticValues));

    return concatenated;
}



// Helper that generates a hash based on a concatenation result
function generateHash(hasher, extractedObj, collectorFn) {
    // collect the data for hashing
    const collectedData = collectorFn(extractedObj);

    // if there is an empty string only, return an empty string (no hash)
    if (collectedData === '') {
        return '';
    }
    // if there is data generate a hash
    return hasher.generateHash(collectedData);
}






function makeGOSHasher(config) {
    // TODO: config check
    switch (config.hash.strategy.toLowerCase()) {
        case 'sha256':
            return new GOSHasher(config);
            // return new Sha256Hasher(config);
        default:
            throw new Error(`Unknown hash strategy in config: '${config.hash.strategy}'`);
    }
}



module.exports = {
    makeHasher: makeGOSHasher,
    REGION: 'GOS',
}