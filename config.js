const fs = require('fs');
const toml = require('toml');

// this is a global with the current configuration.
// TODO: globals are not nice
let CONFIG = null;

// Returns the current configuration.
// DO NOT STORE THE RETURNED VALUE. CONFIG RELOADS ARE POSSIBLE BETWEEN RUNS.
function getConfig() {
    // if we have it already, return it.
    if (CONFIG) {
        return CONFIG;
    }

    // load from the app config
    let newConfig = loadConfig();

    // validate it be sure
    let validationErrors = validateConfig(newConfig);
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        // this error indicates that somehow an invalid config file got copied to the known safe location.
        newConfig = initAndLoadConfig();
        // TODO: validate the initialized config
    }

    CONFIG = newConfig;

    return CONFIG;
}

// parses the application config from a known safe location
function loadConfig() {
    // TODO: if the config file does not exist use a default one in the app and copy it to the app config location
    return toml.parse(fs.readFileSync("config.toml", 'utf-8'));
}

// attempts to provide a sane default config
function initConfig() {
    return {}
}

// initializes the config to a known default and loads it
function initAndLoadConfig() {
    return initConfig();
}

// returns a list of Strings describing the errors if there are any errors with
// the config, or null otherwise
function validateConfig(config) {
    return []
}

module.exports = { getConfig }