/*
 * This file is part of Building Blocks CommonID Tool
 * Copyright (c) 2024 WFP
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */


const { makeHasher, REGION } = require('./index')
const makeArabicSoundexEngine = require('./arabic-soundex')

const TEST_CONFIG ={
    salt: { source: "string", value: "TEST_HASH"},
    hash: { strategy: "sha256" }
};

function hasherWithConfig(cfg) {
    return () => { return makeHasher(cfg); }
}

function getTestHasher(cfg=TEST_CONFIG) {
    return hasherWithConfig(cfg)();
}



test('creation with non-supported algorithms should fail', () => {
    expect(hasherWithConfig({})).toThrow();
    expect(hasherWithConfig({ hash: { strategy: "sha512" } })).toThrow();
});


test('creation with good config should succeed', () => {
    expect(hasherWithConfig(TEST_CONFIG)).not.toThrow()
});

test('hashing data should result in a hash and a source', () => {
    const h = getTestHasher()

    expect(h.generateHashForExtractedObject({
        static: ["a", "b", "c"],
        to_translate: [
            "هايل", "عجرمة (العجارمة)",
            "عبد الرّشيد", "السروري", "يعقوب", "الأشراف", "جمان",
            "عبد الخالق", "بنو ياس", "جاد", "بنو الأحمر بن الحارث", "بنفسج",
    ],
        reference: ["545986759749"],
    })).toEqual({
        "USCADI": "K4SJ46VAVA4W6B3BZLWUYOPJVFRULRS5WWBPO3ALODDVFCBDGQSA====",
        "USCADI_src": "abcHLAJRMPLJRMPAPTLRSTALSRRAKPALKRFJMNAPTLKLKPNSJTPNLMRPNLRFPNFSJH4000A2654A1346A4266Y2100A4261J2550A1342B1520J2300B1545B1512",
        "document_hash": "JXMBS6UWOYL663ISCJ5ANIPXIE7G6C6IQAA5LI4QNWLAGTLKBXGA====",
        "document_hash_src": "545986759749",
    })

});


test('ArabicSoundex fail branches', () => {
    const a = makeArabicSoundexEngine()

    expect(a.soundex("")).toEqual(undefined)
    expect(a.soundex("X")).toEqual('00000')
})