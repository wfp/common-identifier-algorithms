const fs = require('node:fs');

const validateConfig = require('./validateConfig');
const loadSaltFile = require('./loadSaltFile');

const {
    attemptToReadTOMLData
} = require('./utils');


// The encoding used by the config file
const CONFIG_FILE_ENCODING = "utf-8";



// Main entry point for loading a config file.
// returns:
// - { success: true } if the config can be loaded
// - { success: false, error: "string" } if there are errors
// - { success: false, isSaltFileError: true, error: "string"}
//     if there is something wrong with the salt file
function loadConfig(configPath) {
    console.log("Loading config from", configPath);


    // attempt to read the file
    const configData = attemptToReadTOMLData(configPath, CONFIG_FILE_ENCODING);

    // if cannot be read, we have an error
    if (!configData) {
        return {
            success: false,
            error: `Unable to read config file '${configPath}'`
        };
    }

    // if the file can be read, attempt to fetch the last modified date
    const lastUpdateDate = new Date(fs.statSync(configPath).mtime);

    // validate the config
    const validationResult = validateConfig(configData);

    // if the config is not valid return fa
    if (validationResult) {
        return {
            success: false,
            error: validationResult,
        };
    }

    // check if we need to inject the salt data into the config
    // if not, the config loading is finished
    if (configData.algorithm.salt.source.toUpperCase() !== "FILE") {
        return {
            success: true,
            lastUpdated: lastUpdateDate,
            config: configData,
        }
    }

    // figure out the file path and the validation regexp
    const saltFilePath = configData.algorithm.salt.value;
    const saltFileValidatorRegexp = configData.algorithm.salt.validator_regex;

    // attempt to load the salt file
    const saltData = loadSaltFile(saltFilePath, saltFileValidatorRegexp);

    // if the salt file load failed, we have failed
    if (!saltData) {
        console.log("Error while loading the salt file!")
        return {
            success: false,
            isSaltFileError: true,
            error: `Invalid salt file: '${saltFilePath}'`
        };
    }

    // replace the "FILE" with "STRING" amd embed the salt data
    configData.algorithm.salt.source = "STRING";
    configData.algorithm.salt.value = saltData;

    // return the freshly injected config
    return {
        success: true,
        lastUpdated: lastUpdateDate,
        config: configData,
    };
}

module.exports = loadConfig;