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

import { joinFieldsForHash, cleanValueList, extractAlgoColumnsFromObject, BaseHasher } from 'common-identifier-algorithm-shared';
import type { makeHasherFunction } from 'common-identifier-algorithm-shared';
import type { Config, Validation } from 'common-identifier-algorithm-shared';

class GenericHasher extends BaseHasher {
    constructor(config: Config.Options["algorithm"]) {
        super(config);
    }

    private composeHashSource = (extractedObj: Config.AlgorithmColumns) => {
        let staticValues = extractedObj.static;
        let concatenated = joinFieldsForHash(cleanValueList(staticValues));
        return concatenated;
    }

    generateHashForObject(obj: Validation.Data["row"]) {
        const extractedObj = extractAlgoColumnsFromObject(this.config.columns, obj);
        const toBeHashed = this.composeHashSource(extractedObj);
        return {
            hashed_id: toBeHashed.length > 0 ? this.generateHashForValue(toBeHashed) : "",
            hashed_id_src: this.composeHashSource(extractedObj),
        }
    }
}

export const REGION = "undefined";
export const makeHasher: makeHasherFunction = (config: Config.Options["algorithm"]) => {
    switch (config.hash.strategy.toLowerCase()) {
        case 'sha256':
            return new GenericHasher(config);
        default:
            throw new Error(`Unknown hash strategy in config: '${config.hash.strategy}'`);
    }
}