const crypto = require('node:crypto');
const importSaltFile = require('./uscadi/salt-importer');
// https://github.com/kartik1998/phonetics
const Phonetics = require('phonetics');

// USCADI uses RFC4648 base32 -- NodeJs has no default implementation for that
const base32 = require('hi-base32');

const TransliterationMapping = require('./uscadi/transliteration-mapping');
const makeArabicSoundexEngine = require('./uscadi/arabic-soundex');


// the soundex engine we'll use
let arabicSoundexEngine = makeArabicSoundexEngine();




class BaseHasher {
    constructor(config) {
        this.config = config;

        // load the salt value based on the config
        this.saltValue = (config.salt.source.toLowerCase() === 'file') ?
            importSaltFile(config.salt.value) :
            config.salt.value;
    }


    // helps with translating the arabic fields when concatenating for
    //
    translateValue(value) {
        // clean the column value
        let cleanedValue = cleanNameColumn(value);
        // transliterate the value
        const transliteratedStr = transliterateWord(cleanedValue);
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

function transliterateWord(word) {
    return Array.from(word).map((char) => {
        return TransliterationMapping[char] ||  char
    }).join('')
}




module.exports = {
    UscadiHasher: Sha256Hasher,
    makeUscadiHasher,
}