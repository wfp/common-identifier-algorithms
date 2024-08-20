const {
    attemptToReadFileData,
} = require('./utils');

// the encoding used for the salt file
const SALT_FILE_ENCODING = "utf-8";

// Attempts to load and clean up the salt file data
function loadSaltFile(path) {
    // return null;
    // TODO: potentially clean up line endings and whitespace here
    const saltData = attemptToReadFileData(path, SALT_FILE_ENCODING);
    if (!saltData) return;

    // check if the structure is correct for the file
    const CHECK_RX = /-----BEGIN PGP PUBLIC KEY BLOCK-----[A-Za-z0-9+/=\s]+-----END PGP PUBLIC KEY BLOCK-----/

    if (!CHECK_RX.test(saltData)) {
        console.log("SALT FILE Regexp error")
        return null;
    }

    console.log("SALT FILE looks OK")
    return saltData;
}

module.exports = loadSaltFile;