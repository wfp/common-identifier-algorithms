const {FILE_CSV, FILE_XLSX} = require('./document');

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
