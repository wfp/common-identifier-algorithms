
class EncoderBase {

    constructor(mapping) {
        this.mapping = mapping;
    }


    // internal helper to return a full name (with a timestamp according to the config)
    _getOutputNameFor(baseFileName) {
        // TODO: add logic from config
        return baseFileName;
    }

    _generateHeaderRow() {
        return this.mapping.columns.reduce((memo, col) => {
            return Object.assign(memo, { [col.alias] : col.name });
        },{})
    }


    // Starts the wiriting of a new document (could be a single output file or multiple)
    startDocument(document, outputPath, options={}) {
        throw new Error("not implemented");
    }

    // Ends wiriting the document
    endDocument(document) {
        throw new Error("not implemented");
    }


    // Writes a Sheet to the pre-determined output
    writeSheet(sheet, config) {
        throw new Error("not implemented");
    }


    // Wraps encoding a whole document using this encoder.
    encodeDocument(document, outputPath, options={}, sheetConfig={}) {
        // start the document
        this.startDocument(document, outputPath, options);

        // write all sheets to the document
        document.sheets.forEach((sheet) => {
            this.writeSheet(sheet, sheetConfig);
        });

        // end the document
        this.endDocument(document);
    }


}

module.exports = EncoderBase;