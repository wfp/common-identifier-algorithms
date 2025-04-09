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

import AsoundexMapping from '../charmaps/asoundex-mapping';
import TransliterationMapping from '../charmaps/transliteration-mapping';

const TARGET_LANGUAGE_ENGLISH = 'en';

function mapSoundexCode(word: string) {
    return Array.from(word).map((char) => {
        return AsoundexMapping[char] ||  '0'
    }).join('')
}

// Removes repeated characters from a word
function trimRepeatedCharacters(word: string) {
    return Array.from(word).reduce((memo, char) => {
        // if the output is empty we always output the character
        if (memo.length == 0) {
            return char;
        }
        // check if the current character is the same as the last one
        if (memo[memo.length - 1] === char) {
            return memo;
        }

        return memo + char;
    }, '')
}


// pads a string by adding a number of zeroes to reach a minimum length
function rightPadWithZeroes(maxLength: number, str: string) {
    let remainingCount = maxLength - str.length;

    while (remainingCount > 0) {
        str += "0";
        remainingCount--;
    }

    return str;
}

class ArabicSoundex {
    targetLang: string = TARGET_LANGUAGE_ENGLISH;
    targetLength: number = 5;

    constructor() {}

    soundex(word: string): string {
        // empty strings are empty
        if (word === "") return "";

        let soundex = word[0];

        // If we are aiming for english output, transliterate the first character
        if (this.targetLang === TARGET_LANGUAGE_ENGLISH) {
            soundex =  TransliterationMapping[soundex] || '';
        }
        // encode the full word and clean
        let encodedRest = mapSoundexCode(word);
        let cleanEncodedRest = trimRepeatedCharacters(encodedRest);

        // remove zeroes from the raw soundex output
        soundex += cleanEncodedRest.replaceAll("0", "");

        // pad with zeroes on the right to have a sufficiently long string
        return rightPadWithZeroes(this.targetLength, soundex).slice(0, this.targetLength);

    }

}

export function makeArabicSoundexEngine() {
    return new ArabicSoundex()
}