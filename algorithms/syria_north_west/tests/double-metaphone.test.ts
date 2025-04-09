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

import { doubleMetaphone } from "../engines/double-metaphone"

test("general metaphone processing", ()=> {

    const TEST_DATA: [string, Array<string>][] = [
        ["", ["", ""]],
        ["A", ["A", "1"]],
        ["X XX", ["SKK", "1S1S"]],
        ["WASD WFAS WR", ["ASTWFSR", "F111112"]],
        ["TION TIA TCH TH TTH TT", ["XNXX00T", "3133TT2"]],

        ["BACHER MACHER", ["PKRMKR", "121121"]],
        ["CAESAR", ["SSR", "211"]],
        ["CHAE", ["X", "2"]],

        ["CHARAC", ["KRK", "211"]],

        ["GHO",["K","2"]], ["AGHO",["A","1"]], ["GHI",["J","2"]],

        ["BIAGHA",["P","1"]], ["BICHA",["PX","1K"]], ["CIAGHA",["SK","X2"]],

        ["UTIGNA",["ATN","11KN"]], ["EGLI",["AKL","1L"]], ["GYES",["KS","J1"]], ["GOERI",["KR","11"]],
        ["VANGELIS",["FNJLS","11K11"]], ["JOSE",["JS","H1"]], ["SAN JOSE",["SNHS","1111"]],

        ["ELLENALLAS",["ALNLS","12121"]], ["ACK",["AK","12"]], ["ACKK",["AKK","121"]], ["OPPA",["AP","12"]],

        ["ISLAND",["ALNT","1111"]], ["SUGAR",["XKR","S11"]], ["HOSSHEL",["HSXL","2121"]], ["WICZ",["AKS","F1TS"]],

        ["PECCH",["PX","13"]], ["DGE",["J","3"]], ["DGU",["TK","2"]], ["DDT",["TT","21"]], ["FFOB",["FP","21"]],
        ["BUBBA",["PP","12"]], ["HIJJAB",["HJP","221"]], ["KKLAX",["KLK","21S"]],
        ["NNAMB",["NMP","211"]], ["QQADDEAR",["KTR","221"]], ["PHER",["FR","21"]], ["UVVE",["AF","12"]],
        ["ZHO",["J","2"]], ["RIZZA",["RSS","1TS11"]], ["WHAT",["AT","11"]], ["EWAR",["AWR","111"]], ["AWHAT",["AFT","121"]],


        ["CHIA",["K","2"]], ["ACHAE",["AK","1X"]], ["CZOK",["SK","X1"]],

        ["ACCIA",["AX","13"]], ["AGGRO",["AKR","121"]], ["GERRY",["KR","J2"]], ["ILLO",["AL","1 "]],
        ["MUMBER",["MMPR","1111"]], ["FANGER",["FNJR","11K1"]], ["SHEIM",["SM","21"]],
        ["SIO",["S","X"]], ["SIOW",["S ","3F"]], ["SCHUMAN",["XMN","311"]],
        ["SCHMOCH",["SMK","K12"]], ["SCHOOER",["SKR","31"]], ["PAIS",["PS","1 "]],
    ];

    TEST_DATA.forEach(([input, expected]) => {
        expect(doubleMetaphone(input)).toEqual(expected);
    })

});