const ValidatorBase = require('./base');

class MinValueValidator extends ValidatorBase {
    constructor(minValue, opts) {
        super("min_value", opts)
        this.minValue = minValue;
    }

    // the default message
    defaultMessage() {
        return `must be at least: ${this.minValue}`;
    }

    validate(value) {
        // must be a string
        if (typeof value !== 'number') {
            return this.failWith("must be a number");
        }

        return this.minValue > value ? this.fail() : this.success();
    }

}

// Factory function for the MinValueValidator
function makeMinValueValidator(opts) {
    let minValue = opts.value;

    // check if there is a regexp value
    if (typeof minValue !== 'number') {
        throw new Error(`MinValue validator must have a 'value' with a number -- ${JSON.stringify(opts)}`)
    }

    // return a new validator
    return new MinValueValidator(minValue, opts);
}

// export the factory function
module.exports = makeMinValueValidator;