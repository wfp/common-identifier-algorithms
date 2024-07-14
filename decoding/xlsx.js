let XLSX = require("xlsx");

const DecoderBase = require('./base');


// A decoder for CSVs
class XlsxDecoder extends DecoderBase {

    constructor(sourceConfig, csvOptions={}) {
        super(sourceConfig)
        this.csvOptions = csvOptions;
    }

    async decodeFile(path, fileEncoding='utf-8') {
        let data = await fs.readFile(path, fileEncoding);
        const workbook = XLSX.read(Buffer.concat(bufs));

        console.log(workbook)

        // let parsed = csv.parse(data, this.csvOptions);
        // return this.documentFromSheets([
        //     this.sheetFromRawData("Sheet 1", parsed)
        // ]);
    }
}


// Factory function for the CSV decoder
function makeXlsxDecoder(sourceConfig) {
    return new XlsxDecoder(sourceConfig);
}

module.exports = makeXlsxDecoder;