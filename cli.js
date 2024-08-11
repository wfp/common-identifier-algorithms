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
    let hasher = makeUscadiHasher(config.algorithm);
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
    console.log(JSON.stringify(result, null, "    "))

    // output the base document
    outputDocumentWithConfig(config.destination, result);
    // output the mapping document
    outputDocumentWithConfig(config.destination_map, result);

    // let resultOutputConfig = validation.makeValidationResultOutputConfiguration(config.source, validationResult)
    let validationResultDocument = validation.makeValidationResultDocument(config.source, validationResult);

    outputDocumentWithConfig(config.destination_errors, validationResultDocument);

})()