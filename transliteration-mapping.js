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


// Transliteration map (one to one mode) between each normalized Arabic letter
// (no hamza and tah marbouta) represented in the id property and English letter
// (capital letter) in the content of the item tag

// This table is used for ArabicSoundex
module.exports = {
    "ا": "A",
    "ب": "B",
    "ت": "T",
    "ث": "T",
    "ج": "J",
    "ح": "H",
    "خ": "K",
    "د": "D",
    "ذ": "Z",
    "ر": "R",
    "ز": "Z",
    "س": "S",
    "ش": "S",
    "ص": "S",
    "ض": "D",
    "ط": "T",
    "ظ": "Z",
    "ع": "A",
    "غ": "G",
    "ف": "F",
    "ق": "Q",
    "ك": "K",
    "ل": "L",
    "م": "M",
    "ن": "N",
    "ه": "H",
    "و": "W",
    "ي": "Y",
}