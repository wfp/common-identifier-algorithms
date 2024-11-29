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

import type { CharMap } from "./charmap.js";

// The aphonix method is based on the 9 phonetic classifications of human speech
// sounds, which in turn are based on where you put your lips and tongue to make
// the sounds.

// Map each normalized Arabic letter (no hamza and tah marbouta) represented in
// the content of the item tag and classification id (as value of the id property)

export default {
    "ا": "0",
    "و": "0",
    "ي": "0",
    "ع": "0",
    "ح": "0",
    "ه": "0",
    "ب": "1",
    "خ": "2",
    "ج": "2",
    "ص": "2",
    "ظ": "2",
    "ق": "2",
    "ك": "2",
    "غ": "2",
    "ش": "2",
    "ت": "3",
    "ث": "3",
    "د": "3",
    "ذ": "3",
    "ض": "3",
    "ط": "3",
    "ة": "3",
    "ل": "4",
    "ن": "5",
    "م": "5",
    "ر": "6",
    "ف": "7",
    "ز": "8",
    "س": "8",
} as CharMap