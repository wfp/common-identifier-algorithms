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


import { Config } from '../../algo-shared/config/Config.js';
import { makeHasher, REGION } from '../index.js';

const TEST_CONFIG: Config.Options["algorithm"] ={
    salt: { source: "STRING", value: "TEST_HASH", validator_regex: "" },
    hash: { strategy: "SHA256" },
    columns: { to_translate: [], static: [], reference: [] }
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

test('hashing data should result in a hash and a source', () => {
    const h = getTestHasher()

    const data = { a: "A", b: "B", c: "C", d: "D" };
    const colConfig = { static: ["a", "b", "c" ], to_translate: [], reference: [] };

    expect(h.generateHashForObject(colConfig, data)).toEqual({
        hashed_id: "V6SLVUFRBKYAJOO3J2PHY33SAEKDPOWRQTUCJM6UKY6SFG3GRF5A====",
        hashed_id_src: "ABC",
    })
});