const ValidatorBase = require('./base');

class MaxValueValidator extends ValidatorBase {
    constructor(maxValue, opts) {
        super("max_value", opts)
        this.maxValue = maxValue;
    }

    // the default message
    defaultMessage() {
        return `must be at most: ${this.maxValue}`;
    }

    validate(value) {
        // must be a string
        if (typeof value !== 'number') {
            return this.failWith("must be a number");
        }

        return this.maxValue < value ? this.fail() : this.success();
    }

}

// Factory function for the MaxValueValidator
function makeMaxValueValidator(opts) {
    let maxValue = opts.value;

    // check if there is a regexp value
    if (typeof maxValue !== 'number') {
        throw new Error(`MaxValue validator must have a 'value' with a number -- ${JSON.stringify(opts)}`)
    }

    // return a new validator
    return new MaxValueValidator(maxValue, opts);
}

// export the factory function
module.exports = makeMaxValueValidator;
