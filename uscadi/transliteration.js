const TransliterationMapping = require('./transliteration-mapping');

function transliterateWord(word) {
        return Array.from(word).map((char) => {
            return TransliterationMapping[char] ||  char
        }).join('')
}

module.exports = transliterateWord;