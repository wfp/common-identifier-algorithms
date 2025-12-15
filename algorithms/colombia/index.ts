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

import { joinFieldsForHash, cleanValueList, extractAlgoColumnsFromObject, BaseHasher } from '@wfp/common-identifier-algorithm-shared';
import type { Config, Validator, makeHasherFunction } from '@wfp/common-identifier-algorithm-shared';
import { parseDateString, toExcelSerial } from './utils';

// CID implementation that takes the extracted ('static', 'to_translate', 'reference')
// and returns a hashed object
class CidHasher extends BaseHasher {

    constructor(config: Config.CoreConfiguration["algorithm"]) {
        super(config);
    }

    // cleans a single value in a name column (whitespace and other)
    private cleanNameColumn = (value: string) => {
        // remove all whitespace and digits from all name fields
        let cleaned = value
            .replaceAll(/[\s]+/g, "")
            .replaceAll(/[\d]+/g, "");

            
        // TODO: any other cleans required?

        // take the first 3 letters of the name
        return cleaned.slice(0, 3).toUpperCase();
    }

    // Takes the output of `extractAlgoColumnsFromObject` (extracted properties) and
    // return a string with the "static" and the translated "to_translate" parts
    // concatednated as per the USCADI spec
    private composeHashSource = (extractedObj: Config.AlgorithmColumns) => {
        // the static fields stay the same
        // while the to_translate fields are process as per their algorithm specification

        let processedValues = extractedObj.process.map(this.cleanNameColumn);
        let staticValues = extractedObj.static.map(val => {
            const d = parseDateString(val);
            if (d && typeof d !== "string") return toExcelSerial(d);
            else return d;
        });

        // concat them
        // TODO: check the order
        let concatenated = joinFieldsForHash(cleanValueList(processedValues.concat(staticValues)));

        return concatenated;
    }

    // Takes the output of `extractAlgoColumnsFromObject` (extracted properties) and
    // return a string with the "refernce" parts concatednated as per the USCADI
    // spec
    private composeReferenceHashSource = (extractedObj: Validator.InputData["row"]) => {
        const referenceData = cleanValueList(extractedObj.reference);
        // if any values of reference fields are blank, don't hash and return blank.
        if (referenceData.some((value) => value === "")) return "";
        
        return joinFieldsForHash(referenceData);
    }

    generateHashForObject(obj: Validator.InputData["row"]) {
        const extractedObj = extractAlgoColumnsFromObject(this.config.columns, obj);

        const toBeHashed = this.composeHashSource(extractedObj);
        const toBeHashedRef = this.composeReferenceHashSource(extractedObj);
        return {
            "common_identifier": toBeHashed.length > 0 ? this.generateHashForValue(toBeHashed) : "",
            "reference_identifier": toBeHashedRef.length > 0 ? this.generateHashForValue(toBeHashedRef): "",
            "dev::common_identifier_raw": toBeHashed,
            "dev::reference_identifier_raw": toBeHashedRef,
        }
    }
}

export const ALGORITHM_ID = "COL";
export const makeHasher: makeHasherFunction = (config: Config.CoreConfiguration["algorithm"]) => {
    switch (config.hash.strategy.toLowerCase()) {
        case 'sha256':
            return new CidHasher(config);
        default:
            throw new Error(`Unknown hash strategy in config: '${config.hash.strategy}'`);
    }
}