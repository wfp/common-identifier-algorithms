const fs = require('node:fs');

// NOTE: this implementation follows the Python implementation that uses the file content AS-IS
// this can result in cross-platform line-ending and other issues that can result in hash mismatches.
function importSaltFile(filePath, encoding="utf-8") {
    let loadedData = fs.readFileSync(filePath, encoding);
    // TODO: add back this whitespace stripping logic here if compatibility with the example hashes is not needed
    // loadedData = loadedData.replaceAll(/[ \t\r\n]+/g, '')
    return loadedData;
}

module.exports = importSaltFile;