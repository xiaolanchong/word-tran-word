import React from 'react'
import $ from 'jquery';


class KoreanInput extends React.Component {
   constructor(props) {
      super(props);
      this.inputDiv = React.createRef();
   }
   
   componentDidMount() {
     this.vkEdit = new VirtuakKeyboardEdit({
        input: this.inputDiv.current,
        input_text: this.props.input_text,
        ethalon: this.props.ethalon,
        onChange: this.props.onChange,
        language: this.props.language,
     });
     this.inputDiv.current.focus();
  }

   render() {
      const styles = { minWidth: '6em', display: 'inline-block' };
      return (
         <span  style={styles} className="border border-primary"
               contentEditable="true" 
               ref={this.inputDiv}
               >
         </span>
      );
   }
}

class VirtuakKeyboardEdit {
   constructor(props){
      this.input = $(props.input);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleMouseDown = this.handleMouseDown.bind(this);
      this.handleOnInput = this.handleOnInput.bind(this);
      $(this.input).keydown(this.handleKeyDown);
      $(this.input).mousedown(this.handleMouseDown);
      $(this.input).on("input", this.handleOnInput);
      $(this.input).text(props.input_text || '');
      //$(this.input).html('Te<span class="bg-secondary">ee</span>st of input');
      this.ethalon = props.ethalon || '';
      this.activeNode = null;
      this.afterNode = null;
      this.onChange = props.onChange || ((text) => {});
      if(props.language == 'ko')
         this.key_down_handler = key_down_korean;
      else
         this.key_down_handler = key_down_native;
   }
   
   // full key code list
   // http://gcctech.org/csc/javascript/javascript_keycodes.htm
   handleKeyDown(e) {
      const curElement = document.activeElement;
      var key = e.which ? e.which : e.keyCode;
      cancel_key_event = false;
      $("#hint").remove();
      if(key == 32 && e.ctrlKey) {
         this.show_hint();
      }
      const inEdit = this.activeNode != null;
      const ret_value = this.key_down_handler(e, key, this);
      if (key == 13) {
         if(!inEdit)
            this.input.blur();
         cancel_key_event = true;  // enter
      }
      if (this.activeNode == null) {
         //this.remove_empty_elements(); // can lose focus!
      }
      if(cancel_key_event) return false;
      return ret_value;
   }
   
   handleMouseDown(e) {
   }
   
   handleOnInput() {
      const text = $(this.input).text();
      this.onChange(text);
   }

   handleMouseDownDiv(e) {
     if ((!document.all && e.button == 0) || (document.all && e.button == 1)) {
        //release_code();
        this.release_selection();
     }
   }
   
   getActiveNodeAndOffset() { 
     if (window.getSelection) {
        const sel = window.getSelection();
        return [sel.focusNode, sel.focusOffset];
     }
     return [null, 0]
   }
   
   setActiveNodeCaretPos(newPos) { setCaretPosition(this.activeNode, newPos); }
   
   get_text_before(stopElem) {
      let text = '';
      $(this.input).contents().each((index, elem) => {
         text += elem.textContent;
         if(elem == stopElem)
            return false;
      });
      return text;
   }
   
   remove_empty_elements() {
      $(this.input).children().each(function() {
          if ($(this).text().length == 0) {
              $(this).remove();
          }
      });
   }
   
   get_text_before_caret() {
      const [focusedNode, textOffset] = this.getActiveNodeAndOffset();
      let text_before_caret = $(this.activeNode).text().substr(textOffset);
      text_before_caret += this.get_text_before(focusedNode);
      return text_before_caret;
   }
   
   show_hint() {
      if(this.ethalon == '')
         return;
       const text_before = this.get_text_before_caret();
       let hint = this.ethalon.substr(text_before.length, 2);
       //if (hint != '') {
       hint = hint != '' ? hint : '\u20E0'; // no symbol
       {
          const hintElem = $('<span id="hint" class="text-info">').text(hint);
          const [focusedNode, textOffset] = this.getActiveNodeAndOffset();
          this.append_elem_after_caret(focusedNode, hintElem);
       }
   }
   
   finish_input(str, after_elem) {
      const full_text = this.get_text_before(after_elem);
      const correct_text = this.ethalon.substr(full_text.length, str.length);
      const isCorrect = (this.ethalon == '') || (correct_text == str);
      let newNode = null;
      if (isCorrect) {
         newNode = document.createTextNode(str); // TODO: merge text nodes
      } else {
         newNode = $('<span class="text-danger">').text(str);
      }

      if (after_elem == this.input[0])
         $(after_elem).append(newNode);
      else
         $(after_elem).after(newNode);

      if(this.afterNode != null)
         setCaretPosition(this.afterNode, 0);
      else if (newNode.nodeType == Node.TEXT_NODE)
         setCaretPosition(newNode, str.length);
      else
         setCaretPosition(newNode[0].firstChild, str.length);
      this.onChange(this.get_input_text());
   }
   
   append_elem_after_caret(after_node, new_elem) {
      if (after_node == this.input[0]) {
         $(after_node).append(new_elem);  // the input is empty
         return after_node;
      }
      else if (after_node.parentNode != null && 
               after_node.parentNode != this.input[0]) {
         $(after_node.parentNode).after(new_elem);   // #TEXT of a child of the input
         return after_node.parentNode;
      } else
         $(after_node).after(new_elem);   // #TEXT of the input
      return after_node;
   }
   
   get_input_text() {
      //let textAndCorrectness = [];
      let text = '';
      $(this.input).contents().each((index, node) => {
         const incorrect = $(node).hasClass('text-danger');
         //textAndCorrectness.push( [node.textContent, incorrect]);
         text += node.textContent;
      });
      //return textAndCorrectness;
      return text;
   }
   
   // pressed Esc
   clear_all() {
      console.log('CLR ' + code_holder);
      if(this.activeNode == null)
         return;
      $("#highlighted").remove();
      if (this.activeNode.nodeValue != null)
         this.setActiveNodeCaretPos(this.activeNode.nodeValue.length);
      this.activeNode = null;
      this.afterNode = null
   }

   release_selection() {
      console.log('Rel ' + code_holder);
      if(this.activeNode == null)
         return;
      const added_text = $("#highlighted").text();
      $("#highlighted").remove();
      this.finish_input(added_text, this.activeNode);
      this.activeNode = null;
      this.afterNode = null;
      

   }
   
   replace_selection(str, highlight) {
      console.log('RS:' + str + ' ' + highlight);
      if(!highlight) {
         if(this.activeNode == null) {
            const [focusedNode, textOffset] = this.getActiveNodeAndOffset(); // instant input
            this.finish_input(str, focusedNode);
            return;
         }
         $("#highlighted").remove();
         this.finish_input(str, this.activeNode);
         this.activeNode = null;
      }
      else if(this.activeNode == null){
         const [focusedNode, textOffset] = this.getActiveNodeAndOffset();
         this.activeNode = focusedNode;
         const initialText = $(this.activeNode).text();
         this.activeNode.nodeValue = initialText.substr(0, textOffset);
         const newSpan = $('<span id="highlighted" class="text-white bg-dark">').text(str);
         if (this.activeNode == this.input[0])
            $(this.activeNode).append(newSpan);  // the input is empty
         else if (this.activeNode.parentNode != null && 
                  this.activeNode.parentNode != this.input[0]) {
            this.activeNode = this.activeNode.parentNode;  // #TEXT of a child of the input
            $(this.activeNode).after(newSpan);
         } else
            $(this.activeNode).after(newSpan);   // #TEXT of the input
         const after_text = initialText.substr(textOffset);
         if(after_text != '') {
            this.afterNode = document.createTextNode(after_text);
            $(newSpan).after(this.afterNode);
         } else 
            this.afterNode = null;
         newSpan.focus(); // is this needed??
         setCaretPosition(newSpan[0].firstChild, 0);
      }
      else {
         this.selected_text = str;
         $("#highlighted").text(str);
      }
   }
}

function key_down_native(e, key, input) {
   if (e.key.length !== 1) {
       return true;
   }
   replace_selection(input, e.key, false);
   return return_false();
}

function getCaretPosition(elem) {
  var caretPos = 0,
    sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (true || range.commonAncestorContainer.parentNode == elem) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() == elem) {
      var tempEl = document.createElement("span");
      elem.insertBefore(tempEl, elem.firstChild);
      var tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
}

function setCaretPosition(elem, caretPos) {
   var range = document.createRange();
   var sel = window.getSelection();
   range.setStart(elem, caretPos);
   range.collapse(true);
   sel.removeAllRanges();
   sel.addRange(range);
}

export default KoreanInput;


//------------------------
let code_holder = '';
let cancel_key_event = false;


function return_false() {
    cancel_key_event = true;
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

// JQuery ----------------
/*
function rawHandleKeyDown(e, input) {
      
      var key = e.which ? e.which : e.keyCode;
      cancel_key_event = false;
      key_down_korean(e, key, input);
      if(!cancel_key_event) return;
      e.preventDefault();
   }

function release_selection(input) {
    input =input[0];
    if (input.setSelectionRange) {
        input.setSelectionRange(input.selectionEnd, input.selectionEnd);
    } else if (document.selection) {
        var range = document.selection.createRange();
        range.text = range.text;
        range.select();
    }
    code_holder = '';
}

function clear_all(input) {
    if (code_holder != '') {
        code_holder = '';
        replace_selection(input, '', false);
    }
    //$('#word_list').hide();
}

// common.js
function replace_selection(input, str, highlight) {
    input =input[0];
    input.focus();
    if (input.setSelectionRange) {
        var selectionStart = input.selectionStart;
        var selectionEnd = input.selectionEnd;
        var oldScrollTop = input.scrollTop;
        var oldScrollHeight = input.scrollHeight;
        var oldLen = input.value.length;
        input.value = input.value.substring(0, selectionStart) + str + input.value.substring(selectionEnd);
        if (highlight) {
            input.setSelectionRange(selectionStart, selectionStart + str.length)
        } else {
            input.selectionStart = selectionStart + str.length;
            input.selectionEnd = input.selectionStart
        }
        if (input.value.length == oldLen) {
            input.scrollTop = oldScrollTop
        } else if (input.scrollHeight > oldScrollHeight) {
            input.scrollTop = oldScrollTop + input.scrollHeight - oldScrollHeight
        } else {
            input.scrollTop = oldScrollTop
        }
    } else if (document.selection) {
        var range = document.selection.createRange();
        if (range.parentElement() == input) {
            range.text = str;
            if (highlight) range.moveStart('character', -str.length);
            range.select()
        }
    }
}
*/


//--------------

const initial_table = new Array("r", "R", "s", "e", "E", "f", "a", "q", "Q", "t", "T", "d", "w", "W", "c", "z", "x", "v", "g");
const medial_table = new Array("k", "o", "i", "O", "j", "p", "u", "P", "h", "hk", "ho", "hl", "y", "n", "nj", "np", "nl", "b", "m", "ml", "l");
const final_table = new Array("", "r", "R", "rt", "s", "sw", "sg", "e", "f", "fr", "fa", "fq", "ft", "fx", "fv", "fg", "a", "q", "qt", "t", "T", "d", "w", "c", "z", "x", "v", "g");
const jaso_table = new Array("r", "R", "rt", "s", "sw", "sg", "e", "E", "f", "fr", "fa", "fq", "ft", "fx", "fv", "fg", "a", "q", "Q", "qt", "t", "T", "d", "w", "W", "c", "z", "x", "v", "g", "k", "o", "i", "O", "j", "p", "u", "P", "h", "hk", "ho", "hl", "y", "n", "nj", "np", "nl", "b", "m", "ml", "l");


function compose_korean_char(input, alphabet) {
    if (code_holder == '') {
        for (var i = 0; i < jaso_table.length; i++) {
            if (jaso_table[i] == alphabet) {
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
        if ("rRseEfaqQtTdwWczxvg".indexOf(alphabet) != -1) {
            for (var i = 0; i < final_table.length; i++) {
                if (final_table[i] == final_table[final_code] + alphabet) {
                    code_holder = String.fromCharCode(initial_code * 588 + medial_code * 28 + i + 44032);
                    replace_selection(input, code_holder, true);
                    return;
                }
            }
            replace_selection(input, code_holder, false);
            for (var i = 0; i < jaso_table.length; i++) {
                if (jaso_table[i] == alphabet) {
                    code_holder = String.fromCharCode(12593 + i);
                    replace_selection(input, code_holder, true);
                    return;
                }
            }
        } else if ("koiOjpuPhynbml".indexOf(alphabet) != -1) {
            if (final_table[final_code].length == 2) {
                for (var i = 0; i < initial_table.length; i++) {
                    if (initial_table[i] == final_table[final_code].charAt(1)) {
                        for (var j = 0; j < medial_table.length; j++) {
                            if (medial_table[j] == alphabet) {
                                for (var k = 0; k < final_table.length; k++) {
                                    if (final_table[k] == final_table[final_code].charAt(0)) {
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
            } else if (final_table[final_code].length == 1) {
                for (var i = 0; i < initial_table.length; i++) {
                    if (initial_table[i] == final_table[final_code]) {
                        for (var j = 0; j < medial_table.length; j++) {
                            if (medial_table[j] == alphabet) {
                                replace_selection(input, String.fromCharCode(initial_code * 588 + medial_code * 28 + 0 + 44032), false);
                                code_holder = String.fromCharCode(i * 588 + j * 28 + 44032);
                                replace_selection(input, code_holder, true);
                                return;
                            }
                        }
                    }
                }
            } else {
                for (var i = 0; i < medial_table.length; i++) {
                    if (medial_table[i] == medial_table[medial_code] + alphabet) {
                        code_holder = String.fromCharCode(initial_code * 588 + i * 28 + 44032);
                        replace_selection(input, code_holder, true);
                        return;
                    }
                }
                for (var i = 0; i < jaso_table.length; i++) {
                    if (jaso_table[i] == alphabet) {
                        release_selection(input);
                        code_holder = String.fromCharCode(12593 + i);
                        replace_selection(input, code_holder, true);
                        return;
                    }
                }
            }
        }
    } else if (code_holder.charCodeAt(0) >= 12593 && code_holder.charCodeAt(0) < 12644) {
        if ("koiOjpuPhynbml".indexOf(alphabet) != -1 && code_holder.charCodeAt(0) >= 12593 && code_holder.charCodeAt(0) < 12593 + 30) {
            var tmp = jaso_table[code_holder.charCodeAt(0) - 12593];
            for (var i = 0; i < initial_table.length; i++) {
                if (initial_table[i] == tmp) {
                    for (var j = 0; j < medial_table.length; j++) {
                        if (medial_table[j] == alphabet) {
                            code_holder = String.fromCharCode(i * 588 + j * 28 + 44032);
                            replace_selection(input, code_holder, true);
                            return;
                        }
                    }
                }
            }
        } else {
            for (var i = 0; i < jaso_table.length; i++) {
                if (jaso_table[i] == alphabet) {
                    release_selection(input);
                    code_holder = String.fromCharCode(12593 + i);
                    replace_selection(input, code_holder, true);
                    return;
                }
            }
        }
    } else {
        for (var i = 0; i < jaso_table.length; i++) {
            if (jaso_table[i] == alphabet) {
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
            if (code_holder != '') {
                if (code_holder.charCodeAt(0) >= 44032 && code_holder.charCodeAt(0) < 44032 + 11172) {
                    var shift = code_holder.charCodeAt(0) - 44032;
                    var final_code = shift % 28;
                    var medial_code = (shift - final_code) / 28 % 21;
                    var initial_code = ((shift - final_code) / 28 - medial_code) / 21;
                    if (final_code != 0) {
                        for (var i = 0; i < final_table.length; i++) {
                            if (final_table[i] == final_table[final_code].substring(0, final_table[final_code].length - 1)) {
                                code_holder = String.fromCharCode(initial_code * 588 + medial_code * 28 + i + 44032);
                                replace_selection(input_ctrl, code_holder, true);
                                return return_false();
                            }
                        }
                    } else if (medial_table[medial_code].length > 1) {
                        for (var i = 0; i < medial_table.length; i++) {
                            if (medial_table[i] == medial_table[medial_code].substring(0, medial_table[medial_code].length - 1)) {
                                code_holder = String.fromCharCode(initial_code * 588 + i * 28 + 44032);
                                replace_selection(input_ctrl, code_holder, true);
                                return return_false();
                            }
                        }
                    } else {
                        for (var i = 0; i < jaso_table.length; i++) {
                            if (jaso_table[i] == initial_table[initial_code]) {
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