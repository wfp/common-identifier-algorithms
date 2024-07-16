const fs = require('node:fs/promises');
const path = require('node:path')
const { stringify } = require('csv-stringify/sync');

const Config = require('./config');
const {FILE_CSV, FILE_XLSX} = require('./document');

// Returns an array of errors for the config (if the config is valid an empty array is returned)
function validateEncoderConfig(config) {
    if (!Array.isArray(config.columns)) {
        return [`Cannot find 'columns' definition in output config: ${config}`]
    }

    return [];
}

const makeCsvEncoder = require('./encoding/csv');
const makeXlsxEncoder = require('./encoding/xlsx');


function encoderForFile(fileType) {
    switch (fileType) {
        case FILE_CSV:
            return makeCsvEncoder;
        case FILE_XLSX:
            return makeXlsxEncoder;
        default:
            throw new Error(`Unknown file type: '${fileType}'`)
    }

}


module.exports = {
    FILE_CSV,
    FILE_XLSX,
    encoderForFile,
}
