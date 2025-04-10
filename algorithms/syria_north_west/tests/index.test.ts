// Common Identifier Application
// Copyright (C) 2024 World Food Programme

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


import { makeHasher } from "../index";
import { transliterateWord } from "../engines/transliteration";
import type { Config } from 'common-identifier-algorithm-shared';

const TEST_CONFIG: Config.Options["algorithm"] ={
    salt: { source: "STRING", value: "TEST_HASH" },
    hash: { strategy: "SHA256" },
    columns: { process: [], static: [], reference: [] }
};

function hasherWithConfig(cfg: Config.Options["algorithm"]) {
    return () => { return makeHasher(cfg); }
}

function getTestHasher(cfg=TEST_CONFIG) {
    return hasherWithConfig(cfg)();
}



test('creation with non-supported algorithms should fail', () => {
    const tmp = JSON.parse(JSON.stringify(TEST_CONFIG)) // deep copy
    tmp.hash.strategy = "SCRYPT"
    expect(hasherWithConfig(tmp)).toThrow();
});


test('creation with good config should succeed', () => {
    expect(hasherWithConfig(TEST_CONFIG)).not.toThrow()
});

test('transliterate with non-mapped char should return char', () => {
    const mapping = { "a": "A", "b": "B" }
    expect(transliterateWord("abc", mapping)).toEqual("ABc");
});

test('hashing data should result in a hash and a source', () => {
    const config: Config.Options["algorithm"] ={
        salt: { source: "STRING", value: "TEST_HASH" },
        hash: { strategy: "SHA256" },
        columns: { static: ["a", "b"], process: ["fname", "lname"], reference: [ "ref1", "ref2" ]}
    };
    const h = getTestHasher(config)

    const data = { fname: "فرج", lname: "سموم", a: "A", b: "B", ref1: "REF1", ref2: "REF2" }

    expect(h.generateHashForObject( data)).toEqual({
        USCADI: 'Y7PUHSSAGBJQ7CQVQL3BZX3JVQHCTH26K5HSBAJZS3C5RPLHYXOQ====',
        document_hash: 'THHDQVM2VAH4O4KWSAOV7Q662IIFGA36KZH4MYCY5KUBROGMAWKQ====',
    });
})

test('providing no reference should result in empty reference hash', () => {
    const config: Config.Options["algorithm"] ={
        salt: { source: "STRING", value: "TEST_HASH" },
        hash: { strategy: "SHA256" },
        columns: { static: ["a", "b"], process: ["fname", "lname"], reference: []}
    };
    const h = getTestHasher(config)

    const data = { fname: "فرج", lname: "سموم", a: "A", b: "B", ref1: "REF1", ref2: "REF2" }
    const colConfig = { static: ["a", "b"], process: ["fname", "lname"], reference: []}

    expect(h.generateHashForObject(data)).toEqual({
        USCADI: 'Y7PUHSSAGBJQ7CQVQL3BZX3JVQHCTH26K5HSBAJZS3C5RPLHYXOQ====',
        document_hash: '',
    });
});

test('providing an empty reference field should result in empty reference hash', () => {
    const config: Config.Options["algorithm"] ={
        salt: { source: "STRING", value: "TEST_HASH" },
        hash: { strategy: "SHA256" },
        columns: { static: ["a", "b"], process: ["fname", "lname"], reference: [ "ref1", "ref2"]}
    };
    const h = getTestHasher(config)

    const data = { fname: "فرج", lname: "سموم", a: "A", b: "B", ref1: "REF1", ref2: "" }

    expect(h.generateHashForObject(data)).toEqual({
        USCADI: 'Y7PUHSSAGBJQ7CQVQL3BZX3JVQHCTH26K5HSBAJZS3C5RPLHYXOQ====',
        document_hash: '',
    });
});