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


const AsoundexMapping = require('./asoundex-mapping');
const TransliterationMapping = require('./transliteration-mapping');

const TARGET_LANGUAGE_ENGLISH = 'en';


function mapSoundexCode(word) {
    return Array.from(word).map((char) => {
        return AsoundexMapping[char] ||  '0'
    }).join('')
}

// Removes repeated characters from a word
function trimRepeatedCharacters(word) {
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
function rightPadWithZeroes(maxLength, str) {
    let remainingCount = maxLength - str.length;

    while (remainingCount > 0) {
        str += "0";
        remainingCount--;
    }

    return str;
}

class ArabicSoundex {

    constructor() {
        // is present in the original code
        this.targetLang = TARGET_LANGUAGE_ENGLISH;

        // the original implementation targets an output length of 5
        this.targetLength = 5;
    }

    soundex(word) {
        // empty strings are empty
        if (word === "") return;

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

// let A = new ArabicSoundex();
// "هايل,عجرمة (العجارمة),رائد,صيداوي,اعتماد".split(",").forEach(word => {
//     console.log("W:\t", word, "\t\t:", A.soundex(word))
// })

function makeArabicSoundexEngine() {
    return new ArabicSoundex()
}

module.exports = makeArabicSoundexEngine;