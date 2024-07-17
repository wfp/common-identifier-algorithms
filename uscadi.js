const crypto = require('node:crypto');
const importSaltFile = require('./uscadi/salt-importer');
// https://github.com/kartik1998/phonetics
const Phonetics = require('phonetics');

// USCADI uses RFC4648 base32 -- NodeJs has no default implementation for that
const base32 = require('hi-base32');

// the output encoding format for the hashes
const HASH_ENCODING = "base64";

const makeArabicSoundexEngine = require('./uscadi/arabic-soundex');

// the soundex engine we'll use
let arabicSoundexEngine = makeArabicSoundexEngine();



class BaseHasher {
    constructor(config) {
        this.tr_engine = new TrEngine(CAMEL_AR2SAFEBW);
        this.config = config;

        // load the salt value based on the config
        this.saltValue = (config.salt.source.toLowerCase() === 'file') ?
            importSaltFile(config.salt.value) :
            config.salt.value;
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
            soundex: arabicSoundexEngine.soundex(cleanedValue)
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
        let hashDigest = crypto.createHash('sha256').update(this.saltValue).update(stringValue).digest();
        return base32.encode(hashDigest);
    }

}

function makeUscadiHasher(config) {
    // TODO: config check
    switch (config.hash.strategy.toLowerCase()) {
        case 'sha256':
            return new Sha256Hasher(config);
        default:
            throw new Error(`Unknown hash strategy in config: '${config.hash.strategy}'`);
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