const fs = require('node:fs/promises');
const path = require('node:path')
const { stringify } = require('csv-stringify/sync');

const Config = require('./config');


// Returns an array of errors for the config (if the config is valid an empty array is returned)
function validateEncoderConfig(config) {
    if (!Array.isArray(config.columns)) {
        return [`Cannot find 'columns' definition in output config: ${config}`]
    }

    return [];
}

// class EncoderBase {

//     constructor(mapping) {
//         this.mapping = mapping;
//     }


//     // internal helper to return a full name (with a timestamp according to the config)
//     _getOutputNameFor(baseFileName) {
//         // TODO: add logic from config
//         return baseFileName;
//     }

//     _generateHeaderRow() {
//         return this.mapping.columns.reduce((memo, col) => {
//             return Object.assign(memo, { [col.alias] : col.name });
//         },{})
//     }


//     // Starts the wiriting of a new document (could be a single output file or multiple)
//     startDocument(document, outputPath, options={}) {
//         throw new Error("not implemented");
//     }

//     // Ends wiriting the document
//     endDocument(document) {
//         throw new Error("not implemented");
//     }


//     // Writes a Sheet to the pre-determined output
//     writeSheet(sheet, config) {
//         throw new Error("not implemented");
//     }

// }


// class CsvEncoder extends EncoderBase {
//     constructor(mapping, options) {
//         super(mapping)

//         this.options = options;

//         // the base path of the document we'll write
//         this.basePath = null;
//     }

//     startDocument(document, outputPath, options={}) {
//         let opts = Object.assign({
//             // default options go here
//         }, options);

//         // store the base path
//         this.basePath = outputPath;
//     }

//     // Ends wiriting the document
//     endDocument(document) {
//         // no base path means no document yet, so we'll skip
//         if (!this.basePath) {
//             return;
//         }

//         // otherwise we'll return
//         // TODO: this is where metadata injection (writing a summary text file next to the output files) can happen
//         return;
//     }


//     // Writes a Sheet to the pre-determined output
//     writeSheet(sheet, config) {
//         // no base path means no document yet, so we'll skip
//         if (!this.basePath) {
//             throw new Error("No output path provided.");
//         }

//         // generate the full output path
//         let outputBaseName = `${this.basePath}-${sheet.name}`;
//         let outputPath = this._getOutputNameFor(outputBaseName);

//         // attempt to write the data from the sheet as rows
//         let fullData = [this._generateHeaderRow()].concat( sheet.data);
//         let generated = stringify(fullData, {});

//         console.log("-------- ", outputPath, ` ----\n\n${generated}`);
//     }

// }


function encodeDocument(encoder, document, outputPath, options={}, sheetConfig={}) {
    // start the document
    encoder.startDocument(document, outputPath, options);

    // write all sheets to the document
    document.sheets.forEach((sheet) => {
        encoder.writeSheet(sheet, sheetConfig);
    });

    // end the document
    encoder.endDocument(document);
}

function validationResultToDocument(results) {
    return {
        sheets: [],
    }
}

(async ()=>{
    const makeCsvDecoder = require('./decoding/csv');
    const validation = require("./validation");

    // CONFIG

    let config = Config.getConfig();

    // DECODE
    let csvDecoder = makeCsvDecoder(config.source);

    let decoded = await csvDecoder.decodeFile("test_files/basic.csv");
    // console.dir(decoded, { depth: null });

    // VALIDATION
    let validatorDict = validation.makeValidatorListDict(config.validations);
    let validationResult = validation.validateDocumentWithListDict(validatorDict, decoded);
    console.dir(validationResult, {depth: null});

    // ENCODE

    const makeCsvEncoder = require('./encoding/csv');
    let encoder = makeCsvEncoder(config.destination, {});


    decoded.sheets.push({ name: "errors",  })

    encodeDocument(encoder, decoded, "/tmp/lofasz");


    // let validationDocument = decoded.

    // let csvDecoder = makeCsvDecoder(config.source);

    // let decoded = await csvDecoder.decodeFile("test_files/basic.csv");
    // console.log(decoded.sheets[0])
})()