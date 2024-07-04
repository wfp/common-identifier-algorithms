const fs = require('fs/promises');
const csv = require('csv-parse/sync');

const Config = require('./config');

const makeCsvDecoder = require('./decoding/csv');


(async ()=>{

    let config = Config.getConfig();

    let csvDecoder = makeCsvDecoder(config.source);

    let decoded = await csvDecoder.decodeFile("test_files/basic.csv");
    console.log(decoded.sheets[0])
})()