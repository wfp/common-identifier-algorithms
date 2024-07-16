const Config = require('./config');
const { Sheet, Document } = require('./document');

// takes an row object and the "algorithm.columns" config and returns a new
// object with { static: [<COL VALUES>], to_translate: [..], reference: [...] } columns
function extractAlgoColumnsFromObject(columnConfig, obj) {
    // check if we have an actual config
    if (typeof columnConfig !== "object") {
        throw new Error("Invalid algorithm columns config");
    }

    // the config values we care about
    let groups = ["static", "to_translate", "reference"];
    let output = {};

    // go through the groups
    for (let groupName of groups) {
        let colNames = columnConfig[groupName];
        // check if this is an array
        if (!Array.isArray(colNames)) {
            throw new Error(`invalid algorithm config: cannot find column group '${groupName}'`);
        }

        let colValues = colNames.map((colName) => {
            // console.log(obj, "--", colName, "==>", obj[colName])
            // let extractedValue = colName + ':' + obj[colName];
            let extractedValue = obj[colName];
            // if (typeof extractedValue !== 'string' || typeof extractedValue !== 'number') {
            //     throw new Error(`Cannot find value for`)
            // }
            return extractedValue;
        });

        output[groupName] = colValues;
    }

    return output;
}


// Centralized helper to join different parts of a field value list
function joinFieldsForHash(fieldValueList) {
    return fieldValueList.join("");
}

// Returns a cleaned version (null and undefined values removed)
// TODO: implement this based on WFP feedback
function cleanValueList(fieldValueList) {
    return fieldValueList.map((v) => typeof v === 'string' ? v : "")
}

// Takes the output of `extractAlgoColumnsFromObject` (extracted properties) and
// return a string with the "refernce" parts concatednated as per the USCADI
// spec
function composeReferenceHashSource(uscadi, extractedObj) {
    return joinFieldsForHash(cleanValueList(extractedObj.reference));
}


// Takes the output of `extractAlgoColumnsFromObject` (extracted properties) and
// return a string with the "static" and the translated "to_translate" parts
// concatednated as per the USCADI spec
function composePersonalHashSource(uscadi, extractedObj) {
    // returnst true if all values are present
    function hasAllValuesPresent(list, nameList) {
        return list.some((v) => typeof v !== 'string' && typeof v !== 'number');
    }

    if (false) {
        // check to see if all values of static and to_translate are present
        if (!hasAllValuesPresent(extractedObj.to_translate) || !hasAllValuesPresent(extractedObj.static)) {
            // TODO: what is the desired thing here?
            throw new Error(`Row is missing some expected values for hashing: '${extractedObj}'`);
        }
    }

    // the static fields stay the same
    // while the to_translate fields are translated

    let translatedValues = extractedObj.to_translate.map((val) => uscadi.translateValue(val));
    let staticValues = extractedObj.static;

    // The original USCADI algorithm seems to concatenate the translated values
    // by grouping them by concatenating per-type:
    // [_mp1_value, _mp2_value, ... , _sx1_value, _sx2_value, ...]
    let {metaphone, soundex} = translatedValues.reduce((memo, val) => {
        memo.metaphone.push(val.transliteratedMetaphone);
        memo.soundex.push(val.soundex);

        return memo;
    }, { metaphone:[], soundex:[] })

    // concat them
    // TODO: check the order
    let concatenated = joinFieldsForHash(cleanValueList(staticValues.concat(metaphone, soundex)));

    return concatenated;
}

// Builds the hash columns from the extracted row object
function generateHashForExtractedObject(uscadi, extractedObj) {
    // Helper that generates a hash based on a concatenation result
    function generateHash(collectorFn) {
        // collect the data for hashing
        const collectedData = collectorFn(uscadi, extractedObj);

        // if there is an empty string only, return an empty string (no hash)
        if (collectedData === '') {
            return '';
        }
        // if there is data generate a hash
        // return collectorFn(uscadi, extractedObj);
        return uscadi.generateHash(collectedData);
    }

    return {
        "USCADI": generateHash(composePersonalHashSource),
        "document_hash": generateHash(composeReferenceHashSource),

        // for debugging the hash
        "USCADI_src": composePersonalHashSource(uscadi, extractedObj),
        "document_hash_src": composeReferenceHashSource(uscadi, extractedObj),
    }
}


// Generate the hash columns from the row object
function generateHashForRow(algorithmConfig, uscadi, rowObject) {
    let extractedObj = extractAlgoColumnsFromObject(algorithmConfig.columns, rowObject);
    let res = generateHashForExtractedObject(uscadi, extractedObj);
    return res;
}

function generateHashesForSheet(algorithmConfig, uscadi, sheet) {
    // generate for all rows
    let rows = sheet.data.map((row) => {
        let generatedHashes = generateHashForRow(algorithmConfig, uscadi, row);

        return Object.assign({}, row, generatedHashes);
    });

    return new Sheet(sheet.name, rows);
}


function generateHashesForDocument(algorithmConfig, uscadi, document) {
    // generate for all rows
    let sheets = document.sheets.map((sheet) => {
        return generateHashesForSheet(algorithmConfig, uscadi, sheet);
    });

    return new Document(sheets);
}

// COMMAND-LINE WRAPPER

const { program } = require('commander');
program
    .argument('<path>', 'Input file to use')
    .option('-l, --limit <number>', 'Limit the input to the given number of rows')
    .option('-f, --format <csv|xlsx>', 'The output format (if not specified the input format is used)')
    //   .option('-c, --config <path>', 'The config file to use', 'config.toml')
    .option('-o, --output <path>', 'The output base path', '/tmp/test');

program.parse();

const options = program.opts();


// PROCESSING BLOCK

(async () => {
    let {makeUscadiHasher} = require('./uscadi');
    const {decoderForFile, fileTypeOf} = require('./decoding');

    // Load the config
    let config = Config.getConfig();


    // the input file path
    let inputFilePath = program.args[0];
    let inputFileType = fileTypeOf(inputFilePath);

    if (!inputFileType) {
        throw new Error("Unknown input file type");
    }

    // DECODE
    // ======

    // find a decoder
    let decoderFactoryFn = decoderForFile(inputFileType);
    let decoder = decoderFactoryFn(config.source);

    // decode the data
    let decoded = await decoder.decodeFile(inputFilePath);


    // apply limiting if needed
    if (options.limit) {
        console.log("[LOAD] Using input row limit: ",  options.limit);
        decoded.sheets[0].data = decoded.sheets[0].data.slice(0, options.limit);
    }

    // VALIDATION
    // ==========
    const validation = require("./validation");
    let validatorDict = validation.makeValidatorListDict(config.validations);
    let validationResult = validation.validateDocumentWithListDict(validatorDict, decoded);
    // console.dir(validationResult, {depth: null});

    // HASHING
    // =======
    let hasher = makeUscadiHasher(config.algorithm.hash);
    let result = generateHashesForDocument(config.algorithm, hasher, decoded)



    // OUTPUT
    // ------


    const {encoderForFile} = require('./encoding');

    // if the user specified a format use that, otherwise use the input format
    const outputFileType = options.format || inputFileType;
    // const makeCsvEncoder = require('./encoding/csv');

    // helper to output a document with a specific config
    function outputDocumentWithConfig(destinationConfig, document) {

        let basePath = options.output;

        let encoderFactoryFn = encoderForFile(outputFileType);
        let encoder = encoderFactoryFn(destinationConfig, {});

        encoder.encodeDocument(document, basePath);
    }

    // output the base document
    outputDocumentWithConfig(config.destination, result);
    // output the mapping document
    outputDocumentWithConfig(config.destination_map, result);

    // let resultOutputConfig = validation.makeValidationResultOutputConfiguration(config.source, validationResult)
    let validationResultDocument = validation.makeValidationResultDocument(config.source, validationResult);

    outputDocumentWithConfig(config.destination_errors, validationResultDocument);

})()