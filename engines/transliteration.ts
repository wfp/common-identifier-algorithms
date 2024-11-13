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


import TransliterationMapping from '../charmaps/transliteration-mapping.js';

// Transliterates a word using the provided mapping
export function transliterateWord(word: string, mapping=TransliterationMapping) {
    return Array.from(word).map((char) => {
        return mapping[char] || char
    }).join('')
}