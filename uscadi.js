const crypto = require('node:crypto');
// https://github.com/kartik1998/phonetics
const Phonetics = require('phonetics');

// https://github.com/words/soundex-code
// This library requires a dynamic import instead of the usual require
const soundexCode = import('soundex-code');

// USCADI uses RFC4648 base32 -- NodeJs has no default implementation for that
const base32 = require('hi-base32');

// the output encoding format for the hashes
const HASH_ENCODING = "base64";

// As soundex is loaded async, we need to update a global reference to it
// otherwise we'd have to make all calls async :(
let soundex = Phonetics.soundex;

const Asoundex = require('./uscadi/asoundex')
let SoundexExecutor = new Asoundex();


// soundexCode.then((lib) => soundex = lib.soundex )


class BaseHasher {
    constructor(config) {
        this.tr_engine = new TrEngine(CAMEL_AR2SAFEBW);
        this.config = config;
    }


    // attempt to transliterate the incoming string using the
    // tr_engine.map_string()
    transliterateString(value) {
        return this.tr_engine.map_string(value);
    }

    // helps with translating the arabic fields when concatenating for
    //
    translateValue(value) {
        // clean the column value
        let cleanedValue = cleanNameColumn(value);
        // transliterate the value
        const transliteratedStr = this.transliterateString(cleanedValue);
        // package the output
        return {
            transliterated: transliteratedStr,
            transliteratedMetaphone: Phonetics.metaphone(transliteratedStr),
            // soundex: soundex(value),
            soundex: SoundexExecutor.getPhoneticString(cleanedValue),
        }
    }
}

// A class encapsulating the hashing algorithm along
// with a number of helper functions (like exposing a translate function)
class Sha256Hasher extends BaseHasher {
    constructor(config) {
        super(config);
    }

    // Generates a USCADI hash based on the configuration from an already concatenated
    // string
    generateHash(stringValue) {
        return base32.encode(crypto.createHash('sha256').update(stringValue).digest()); //.digest(HASH_ENCODING);
    }

}

function makeUscadiHasher(config) {
    // TODO: config check
    switch (config.strategy.toLowerCase()) {
        case 'sha256':
            return new Sha256Hasher(config);
        default:
            throw new Error(`Unknown hash strategy in config: '${config.strategy}'`);
    }
}


// cleans a single value in a name column (whitespace and other)
function cleanNameColumn(value) {
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


// UNUSED

function tokeniseSha256(field, saltValue, config={}) {
    let hash = crypto.createHash('sha256');
    let saltedField = `${saltValue}${field}`;
    hash.update(saltedField);
    return hash.digest(HASH_ENCODING);
}


// Required config keys:
// `num_iterations` -> scrypt N (cost)
// `block_size` -> scypt block size
// `parallelization`
// `size` -> scrypt keyLen
function tokeniseScrypt(field, saltValue, hashConfig) {
    let scrypt_config = {
        cost: hashConfig.num_iterations,
        blockSize: hashConfig.block_size,
        parallelization: hashConfig.parallelism,
    };
    return crypto.scryptSync(field, saltValue, hashConfig.size, scrypt_config )
        .toString('hex');
}


// Columm magic
// ============


function cleanNameFields(row, columnsToTranslate) {

    // Create a new copy of the row to modify
    let clonedRow = Object.assign({}, row);

    // each name column is to be cleaned
    return columnsToTranslate.reduce((rowData, colName) => {
        rowData[colName] = cleanNameColumn(rowData[colName]);
        return rowData;
    }, clonedRow);


}


// The names of the fields that were / will be translated
function translatedFieldNames(columnsToTranslate) {
    let columnsTranslated = new Set();

    columnsToTranslate.forEach(col => {
        // add the two columns to the list of translated columns
        columnsTranslated.add(col + "_la_mp").add(col + "_sx")
    });

    return Array.from(columnsTranslated);
}

// Translate the name fields of a row
function translateNameFields(row, tr_engine, sx_engine, columnsToTranslate) {

    function postfixColumnNames(postfix) {
        return columnsToTranslate.map((col) => col + postfix)
    }

    // attempt to transliterate the incoming string using the
    // tr_engine.map_string()
    function transliterateString(value) {
        return tr_engine.map_string(value);
    }

    // Create a new copy of the row to modify
    let clonedRow = Object.assign({}, row);

    // if latin versions of names don't exist, transliterate the Arabic names into Latin characters
    // df[name_la_cols] = df[fields].map(transliterate, engine=tr_engine)
    columnsToTranslate.forEach(col => {
        const originalStr = clonedRow[col];
        const transliteratedStr = transliterateString(clonedRow[col]);

        // if latin versions of names don't exist, transliterate the Arabic names into Latin characters
        // TODO: check if the col already exists
        // TODO: is the base "_la" column needed anywhere?
        clonedRow[col + "_la"] = transliteratedStr;

        // normalise names in latin characters using metaphone
        clonedRow[col + "_la_mp"] = Phonetics.metaphone(transliteratedStr);

        // compute the Arabic soundex code from the arabic names
        clonedRow[col + "_sx"] = soundex(originalStr);

    });

    // // normalise names in latin characters using metaphone
    // df[name_mp_cols] = df[name_la_cols].map(phonetics.metaphone)

    // // compute the Arabic soundex code from the arabic names
    // df[name_sx_cols] = df[fields].map(sx_engine.soundex)
    // return (df, [*name_mp_cols, *name_sx_cols])

    return clonedRow;
}


class TrEngine {
    constructor(charmap, defaultValue) {
        this.charmap = charmap.charMap;
        this.defaultValue = defaultValue;
    }


    // transliterate a string using the
    map_string(str) {
        return Array.from(str).map((ch) => {
            let valueInCharmap = this.charmap[ch];
            // if the new char is in the charmap we'll use it
            if (typeof(valueInCharmap) !== 'undefined' || valueInCharmap === null) {
                return valueInCharmap;
            }
            // otherwise use the incoming character
            return ch;
        }).join("");
    }
}

// The character mapping for the Arabic To Safe Buckwater conversion
const CAMEL_AR2SAFEBW = {
    "default": null,
    "charMap": {
        "\u0621": "C",
        "\u0622": "M",
        "\u0623": "O",
        "\u0624": "W",
        "\u0625": "I",
        "\u0626": "Q",
        "\u0627": "A",
        "\u0628": "b",
        "\u0629": "p",
        "\u062A": "t",
        "\u062B": "v",
        "\u062C": "j",
        "\u062D": "H",
        "\u062E": "x",
        "\u062F": "d",
        "\u0630": "V",
        "\u0631": "r",
        "\u0632": "z",
        "\u0633": "s",
        "\u0634": "c",
        "\u0635": "S",
        "\u0636": "D",
        "\u0637": "T",
        "\u0638": "Z",
        "\u0639": "E",
        "\u063A": "g",
        "\u0640": "_",
        "\u0641": "f",
        "\u0642": "q",
        "\u0643": "k",
        "\u0644": "l",
        "\u0645": "m",
        "\u0646": "n",
        "\u0647": "h",
        "\u0648": "w",
        "\u0649": "Y",
        "\u064A": "y",
        "\u064B": "F",
        "\u064C": "N",
        "\u064D": "K",
        "\u064E": "a",
        "\u064F": "u",
        "\u0650": "i",
        "\u0651": "~",
        "\u0652": "o",
        "\u0670": "e",
        "\u0671": "L",
        "\u067E": "P",
        "\u0686": "J",
        "\u06A4": "B",
        "\u06AF": "G"
    }
}



module.exports = {
    UscadiHasher: Sha256Hasher,
    makeUscadiHasher,
}