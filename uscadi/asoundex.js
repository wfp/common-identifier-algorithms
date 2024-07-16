const AsoundexMapping = require('./asoundex-mapping')

// The soundex class
class Asoundex {
  constructor() {
    /**
     * Soundex code values
     * @type {Object}
     */
    this.codes = AsoundexMapping;
  }

  getPhoneticString(text){
    let str = (text + '').toLowerCase();
    let f = str[0] || '';

    let r = '';
    let code = null;
    let length = str.length;

    for (let i = 1; i < length; i++) {
      if ((code = this.codes[str[i]]) == null) continue;
      else if (i === 1 && code === this.codes[f]) continue;
      else if (code === this.codes[str[i - 1]]) continue;
      r += code;
    }

    return (f + r + '000').substring(0, 4);
  }
}


module.exports = Asoundex;


