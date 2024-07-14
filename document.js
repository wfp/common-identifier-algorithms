
// The data class describing a sheet
class Sheet {
    constructor(name, data) {
        this.name = name;
        this.data = data;
    }
}

class Document {
    constructor(sheets) {
        this.sheets = sheets;
    }
}

module.exports = {
    Sheet, Document
}