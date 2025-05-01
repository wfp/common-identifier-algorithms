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

import { transliterateWord } from './engines/transliteration';
import ar2SafeBwMap from './charmaps/transliteration-mapping-ar2safebw';

import { makeArabicSoundexEngine } from './engines/arabic-soundex';
import { doubleMetaphone } from './engines/double-metaphone';

// the soundex engine we'll use
let arabicSoundexEngine = makeArabicSoundexEngine();

import { joinFieldsForHash, cleanValueList, extractAlgoColumnsFromObject, BaseHasher } from 'common-identifier-algorithm-shared';
import type { Config, Validator, makeHasherFunction } from 'common-identifier-algorithm-shared';

export const REGION = "NWS";


// USCADI implementation that takes the extracted ('static', 'to_translate', 'reference')
// and returns a hashed object
class UscadiHasher extends BaseHasher {

    constructor(config: Config.CoreConfiguration["algorithm"]) {
        super(config);
    }

    // Generates a transliteration, metaphone and soundex for a string
    private translateValue = (value: string) => {
        // clean the column value
        let cleanedValue = this.cleanNameColumn(value);
        // transliterate the value
        const transliteratedStr = transliterateWord(cleanedValue, ar2SafeBwMap);
        // package the output
        return {
            transliterated: transliteratedStr,
            transliteratedMetaphone: doubleMetaphone(transliteratedStr)[0],
            soundex: arabicSoundexEngine.soundex(cleanedValue)
        }
    }

    // cleans a single value in a name column (whitespace and other)
    private cleanNameColumn = (value: string) => {
        // remove all whitespace and digits from all name fields
        let cleaned = value.replaceAll(/[\s]+/g, "")
            .replaceAll(/[\d]+/g, "")
        // for names with Arabic letters, run the following regex replacements
        // ة becomes ه
        cleaned = cleaned.replaceAll("ة", "ه");
        // any of: أ  ئ ؤ ء ى becomes ا
        cleaned = cleaned.replaceAll(/أئؤءى/g, "ا");

        return cleaned;
    }

    // Takes the output of `extractAlgoColumnsFromObject` (extracted properties) and
    // return a string with the "static" and the translated "to_translate" parts
    // concatednated as per the USCADI spec
    private composeHashSource = (extractedObj: Config.AlgorithmColumns) => {
        // the static fields stay the same
        // while the to_translate fields are translated

        let translatedValues = extractedObj.process.map(this.translateValue);
        let staticValues = extractedObj.static;

        // The original USCADI algorithm seems to concatenate the translated values
        // by grouping them by concatenating per-type:
        // [_mp1_value, _mp2_value, ... , _sx1_value, _sx2_value, ...]
        let {metaphone, soundex} = translatedValues.reduce((memo, val) => {
            memo.metaphone.push(val.transliteratedMetaphone);
            memo.soundex.push(val.soundex);

            return memo;
        }, { metaphone:[], soundex:[] } as { metaphone: string[], soundex: string[] })

        // concat them
        // TODO: check the order
        let concatenated = joinFieldsForHash(cleanValueList(staticValues.concat(metaphone, soundex)));

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
            "USCADI": toBeHashed.length > 0 ? this.generateHashForValue(toBeHashed) : "",
            "document_hash": toBeHashedRef.length > 0 ? this.generateHashForValue(toBeHashedRef): "",
        }
    }
}

export const makeHasher: makeHasherFunction = (config: Config.CoreConfiguration["algorithm"]) => {
    switch (config.hash.strategy.toLowerCase()) {
        case 'sha256':
            return new UscadiHasher(config);
        default:
            throw new Error(`Unknown hash strategy in config: '${config.hash.strategy}'`);
    }
}