const { lightFormat } = require("date-fns");

// Name formatting via Date-Fns lightformat.
// TOKEN GUIDE: https://date-fns.org/v3.6.0/docs/lightFormat
function formatName(name, date) {
    return name.replace(/\{\{(.*?)\}\}/, (match, capture) => {
        let formatString = match.slice(2, -2);
        return lightFormat(date, formatString);
    })
}

class EncoderBase {

    constructor(mapping) {
        this.mapping = mapping;
    }


    // internal helper to return a full name (with a timestamp according to the config)
    _getOutputNameFor(baseFileName) {
        let fullName = `${baseFileName}${this.mapping.postfix}`;
        // TODO: add logic from config
        return formatName(fullName, new Date())
        // return baseFileName;
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


    // Attempts to filter out the columns that should not be present in the
    _filterDataBasedOnConfig(data) {
        // build a set of keys
        let keysArray = this.mapping.columns.map((col) => col.alias);
        // let keysSet = new Set(keysArray);
        return data.map((row) => {
            return keysArray.reduce((newRow, k) => {
                return Object.assign(newRow, { [k]: row[k] });
            }, {})
        })
    }


}

module.exports = EncoderBase;