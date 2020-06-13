
let code_holder = '';

function return_false() {
    return false;
}

//New
function release_selection(input) {
   input.release_selection();
   code_holder = '';
}

function clear_all(input) {
   input.clear_all();
   code_holder = '';
}

function replace_selection(input, str, highlight) {
   input.replace_selection(str, highlight);
}


//--------------

const initial_table = ["r", "R", "s", "e", "E", "f", "a", "q", "Q", "t", "T", "d", "w", "W", "c", "z", "x", "v", "g"];
const medial_table = ["k", "o", "i", "O", "j", "p", "u", "P", "h", "hk", "ho", "hl", "y", "n", "nj", "np", "nl", "b", "m", "ml", "l"];
const final_table = ["", "r", "R", "rt", "s", "sw", "sg", "e", "f", "fr", "fa", "fq", "ft", "fx", "fv", "fg", "a", "q", "qt", "t", "T", "d", "w", "c", "z", "x", "v", "g"];
const jaso_table = ["r", "R", "rt", "s", "sw", "sg", "e", "E", "f", "fr", "fa", "fq", "ft", "fx", "fv", "fg", "a", "q", "Q", "qt", "t", "T", "d", "w", "W", "c", "z", "x", "v", "g", "k", "o", "i", "O", "j", "p", "u", "P", "h", "hk", "ho", "hl", "y", "n", "nj", "np", "nl", "b", "m", "ml", "l"];


function compose_korean_char(input, alphabet) {
    if (code_holder === '') {
        for (let i = 0; i < jaso_table.length; i++) {
            if (jaso_table[i] === alphabet) {
                code_holder = String.fromCharCode(12593 + i);
                replace_selection(input, code_holder, true);
                return;
            }
        }
    } else if (code_holder.charCodeAt(0) >= 44032 && code_holder.charCodeAt(0) < 44032 + 11172) {
        var shift = code_holder.charCodeAt(0) - 44032;
        var final_code = shift % 28;
        var medial_code = (shift - final_code) / 28 % 21;
        var initial_code = ((shift - final_code) / 28 - medial_code) / 21;
        if ("rRseEfaqQtTdwWczxvg".indexOf(alphabet) !== -1) {
            for (let i = 0; i < final_table.length; i++) {
                if (final_table[i] === final_table[final_code] + alphabet) {
                    code_holder = String.fromCharCode(initial_code * 588 + medial_code * 28 + i + 44032);
                    replace_selection(input, code_holder, true);
                    return;
                }
            }
            replace_selection(input, code_holder, false);
            for (let i = 0; i < jaso_table.length; i++) {
                if (jaso_table[i] === alphabet) {
                    code_holder = String.fromCharCode(12593 + i);
                    replace_selection(input, code_holder, true);
                    return;
                }
            }
        } else if ("koiOjpuPhynbml".indexOf(alphabet) !== -1) {
            if (final_table[final_code].length === 2) {
                for (let i = 0; i < initial_table.length; i++) {
                    if (initial_table[i] === final_table[final_code].charAt(1)) {
                        for (let j = 0; j < medial_table.length; j++) {
                            if (medial_table[j] === alphabet) {
                                for (let k = 0; k < final_table.length; k++) {
                                    if (final_table[k] === final_table[final_code].charAt(0)) {
                                        replace_selection(input, String.fromCharCode(initial_code * 588 + medial_code * 28 + k + 44032), false);
                                        code_holder = String.fromCharCode(i * 588 + j * 28 + 44032);
                                        replace_selection(input, code_holder, true);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (final_table[final_code].length === 1) {
                for (let i = 0; i < initial_table.length; i++) {
                    if (initial_table[i] === final_table[final_code]) {
                        for (let j = 0; j < medial_table.length; j++) {
                            if (medial_table[j] === alphabet) {
                                replace_selection(input, String.fromCharCode(initial_code * 588 + medial_code * 28 + 0 + 44032), false);
                                code_holder = String.fromCharCode(i * 588 + j * 28 + 44032);
                                replace_selection(input, code_holder, true);
                                return;
                            }
                        }
                    }
                }
            } else {
                for (let i = 0; i < medial_table.length; i++) {
                    if (medial_table[i] === medial_table[medial_code] + alphabet) {
                        code_holder = String.fromCharCode(initial_code * 588 + i * 28 + 44032);
                        replace_selection(input, code_holder, true);
                        return;
                    }
                }
                for (let i = 0; i < jaso_table.length; i++) {
                    if (jaso_table[i] === alphabet) {
                        release_selection(input);
                        code_holder = String.fromCharCode(12593 + i);
                        replace_selection(input, code_holder, true);
                        return;
                    }
                }
            }
        }
    } else if (code_holder.charCodeAt(0) >= 12593 && code_holder.charCodeAt(0) < 12644) {
        if ("koiOjpuPhynbml".indexOf(alphabet) !== -1 && code_holder.charCodeAt(0) >= 12593 && code_holder.charCodeAt(0) < 12593 + 30) {
            var tmp = jaso_table[code_holder.charCodeAt(0) - 12593];
            for (var i = 0; i < initial_table.length; i++) {
                if (initial_table[i] === tmp) {
                    for (var j = 0; j < medial_table.length; j++) {
                        if (medial_table[j] === alphabet) {
                            code_holder = String.fromCharCode(i * 588 + j * 28 + 44032);
                            replace_selection(input, code_holder, true);
                            return;
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < jaso_table.length; i++) {
                if (jaso_table[i] === alphabet) {
                    release_selection(input);
                    code_holder = String.fromCharCode(12593 + i);
                    replace_selection(input, code_holder, true);
                    return;
                }
            }
        }
    } else {
        for (let i = 0; i < jaso_table.length; i++) {
            if (jaso_table[i] === alphabet) {
                release_selection(input);
                code_holder = String.fromCharCode(12593 + i);
                replace_selection(input, code_holder, true);
                return;
            }
        }
    }
}


function key_down_korean(e, key, input_ctrl) {
    switch (key) {
        case 8:
            if (code_holder !== '') {
                if (code_holder.charCodeAt(0) >= 44032 && code_holder.charCodeAt(0) < 44032 + 11172) {
                    var shift = code_holder.charCodeAt(0) - 44032;
                    var final_code = shift % 28;
                    var medial_code = (shift - final_code) / 28 % 21;
                    var initial_code = ((shift - final_code) / 28 - medial_code) / 21;
                    if (final_code !== 0) {
                        for (let i = 0; i < final_table.length; i++) {
                            if (final_table[i] === final_table[final_code].substring(0, final_table[final_code].length - 1)) {
                                code_holder = String.fromCharCode(initial_code * 588 + medial_code * 28 + i + 44032);
                                replace_selection(input_ctrl, code_holder, true);
                                return return_false();
                            }
                        }
                    } else if (medial_table[medial_code].length > 1) {
                        for (let i = 0; i < medial_table.length; i++) {
                            if (medial_table[i] === medial_table[medial_code].substring(0, medial_table[medial_code].length - 1)) {
                                code_holder = String.fromCharCode(initial_code * 588 + i * 28 + 44032);
                                replace_selection(input_ctrl, code_holder, true);
                                return return_false();
                            }
                        }
                    } else {
                        for (let i = 0; i < jaso_table.length; i++) {
                            if (jaso_table[i] === initial_table[initial_code]) {
                                code_holder = String.fromCharCode(12593 + i);
                                replace_selection(input_ctrl, code_holder, true);
                                return return_false();
                            }
                        }
                    }
                }
                release_selection(input_ctrl);
            }
            return true;
        case 9:
            release_selection(input_ctrl);
            replace_selection(input_ctrl, '    ', false);
            return return_false();
        case 27:
            clear_all(input_ctrl);
            return return_false();
        case 81:
            compose_korean_char(input_ctrl, e.shiftKey ? 'Q' : 'q');
            return return_false();
        case 87:
            compose_korean_char(input_ctrl, e.shiftKey ? 'W' : 'w');
            return return_false();
        case 69:
            compose_korean_char(input_ctrl, e.shiftKey ? 'E' : 'e');
            return return_false();
        case 82:
            compose_korean_char(input_ctrl, e.shiftKey ? 'R' : 'r');
            return return_false();
        case 84:
            compose_korean_char(input_ctrl, e.shiftKey ? 'T' : 't');
            return return_false();
        case 89:
            compose_korean_char(input_ctrl, 'y');
            return return_false();
        case 85:
            compose_korean_char(input_ctrl, 'u');
            return return_false();
        case 73:
            compose_korean_char(input_ctrl, 'i');
            return return_false();
        case 79:
            compose_korean_char(input_ctrl, e.shiftKey ? 'O' : 'o');
            return return_false();
        case 80:
            compose_korean_char(input_ctrl, e.shiftKey ? 'P' : 'p');
            return return_false();
        case 220:
            if (!e.shiftKey) {
                replace_selection(input_ctrl, '￦', false);
                return return_false();
            }
            return true;
        case 65:
            compose_korean_char(input_ctrl, 'a');
            return return_false();
        case 83:
            compose_korean_char(input_ctrl, 's');
            return return_false();
        case 68:
            compose_korean_char(input_ctrl, 'd');
            return return_false();
        case 70:
            compose_korean_char(input_ctrl, 'f');
            return return_false();
        case 71:
            compose_korean_char(input_ctrl, 'g');
            return return_false();
        case 72:
            compose_korean_char(input_ctrl, 'h');
            return return_false();
        case 74:
            compose_korean_char(input_ctrl, 'j');
            return return_false();
        case 75:
            compose_korean_char(input_ctrl, 'k');
            return return_false();
        case 76:
            compose_korean_char(input_ctrl, 'l');
            return return_false();
        case 90:
            compose_korean_char(input_ctrl, 'z');
            return return_false();
        case 88:
            compose_korean_char(input_ctrl, 'x');
            return return_false();
        case 67:
            compose_korean_char(input_ctrl, 'c');
            return return_false();
        case 86:
            compose_korean_char(input_ctrl, 'v');
            return return_false();
        case 66:
            compose_korean_char(input_ctrl, 'b');
            return return_false();
        case 78:
            compose_korean_char(input_ctrl, 'n');
            return return_false();
        case 77:
            compose_korean_char(input_ctrl, 'm');
            return return_false();
        case 16:
            return true;
        default:
            release_selection(input_ctrl);
    }
}

function key_down(e, input_ctrl) {
   var key = e.which ? e.which : e.keyCode;
   return key_down_korean(e, key, input_ctrl)
}

export {key_down}