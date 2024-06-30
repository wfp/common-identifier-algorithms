const ValidatorBase = require('./base');

const CHECKER_FNS = {
    "arabic": (v) => true,
}

class LanguageCheckValidator extends ValidatorBase {
    constructor(language, opts) {
        super("language_check", opts)
        this.language = language;
    }

    // the default message
    defaultMessage() {
        return `must be in the language "${this.language}"`;
    }

    validate(value) {
        return CHECKER_FNS[this.language](value) ? this.fail() : this.success();
    }

}

// Factory function for the LanguageCheckValidator
function makeLanguageCheckValidator(opts) {
    let language = opts.value;

    // check if there is a regexp value
    if (typeof language !== 'string') {
        throw new Error(`LanguageCheck validator must have a 'value' with language name as string -- ${JSON.stringify(opts)}`)
    }

    // ensure compatibilty
    language = language.toLowerCase();


    // check if there is a regexp value
    let matcher = CHECKER_FNS[language.toLowerCase()];
    if (!matcher) {
        throw new Error(`Cannot find field type: '${language}' for field_type validator`)
    }

    // return a new validator
    return new LanguageCheckValidator(language, opts);
}

// export the factory function
module.exports = makeLanguageCheckValidator;