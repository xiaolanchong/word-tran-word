import React from 'react'
import $ from 'jquery';
import {key_down as key_down_korean} from './KoreanVK';
import {key_down as key_down_japanese} from './JapaneseVK';


class VirtualKeyboardInput extends React.Component {
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
      switch(props.language) {
      case 'ko': this.key_down_handler = key_down_korean;
         break;
      case 'ja': this.key_down_handler = key_down_japanese;
         break;
      default:
         this.key_down_handler = key_down_native;
      }
   }
   
   // full key code list
   // http://gcctech.org/csc/javascript/javascript_keycodes.htm
   handleKeyDown(e) {
      var key = e.which ? e.which : e.keyCode;
      $("#hint").remove();
      if(key === 32 && e.ctrlKey) {
         this.show_hint();
      }
      const inEdit = this.activeNode != null;
      const ret_value = this.key_down_handler(e, this);
      if (key === 13) {
         if(!inEdit)
            this.input.blur();
         return true;  // enter
      }
      if (this.activeNode == null) {
         //this.remove_empty_elements(); // can lose focus!
      }
      return ret_value;
   }
   
   handleMouseDown(e) {
   }
   
   handleOnInput() {
      const text = $(this.input).text();
      this.onChange(text);
   }

   handleMouseDownDiv(e) {
     if ((!document.all && e.button === 0) || (document.all && e.button === 1)) {
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
         if(elem === stopElem)
            return false;
      });
      return text;
   }
   
   remove_empty_elements() {
      $(this.input).children().each(function() {
          if ($(this).text().length === 0) {
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
      if(this.ethalon === '')
         return;
       const text_before = this.get_text_before_caret();
       let hint = this.ethalon.substr(text_before.length, 2);
       //if (hint != '') {
       hint = hint !== '' ? hint : '\u20E0'; // no symbol
       {
          const hintElem = $('<span id="hint" class="text-info">').text(hint);
          const [focusedNode, ] = this.getActiveNodeAndOffset();
          this.append_elem_after_caret(focusedNode, hintElem);
       }
   }
   
   finish_input(str, after_elem) {
      const full_text = this.get_text_before(after_elem);
      const correct_text = this.ethalon.substr(full_text.length, str.length);
      const isCorrect = (this.ethalon === '') || (correct_text === str);
      let newNode = null;
      if (isCorrect) {
         newNode = document.createTextNode(str); // TODO: merge text nodes
      } else {
         newNode = $('<span class="text-danger">').text(str);
      }

      if (after_elem === this.input[0])
         $(after_elem).append(newNode);
      else
         $(after_elem).after(newNode);

      if(this.afterNode != null)
         setCaretPosition(this.afterNode, 0);
      else if (newNode.nodeType === Node.TEXT_NODE)
         setCaretPosition(newNode, str.length);
      else
         setCaretPosition(newNode[0].firstChild, str.length);
      this.onChange(this.get_input_text());
   }
   
   append_elem_after_caret(after_node, new_elem) {
      if (after_node === this.input[0]) {
         $(after_node).append(new_elem);  // the input is empty
         return after_node;
      }
      else if (after_node.parentNode !== null && 
               after_node.parentNode !== this.input[0]) {
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
         //textAndCorrectness.push( [node.textContent, incorrect]);
         text += node.textContent;
      });
      return text;
   }
   
   // pressed Esc
   clear_all() {
      console.log('CLR ');
      if(this.activeNode == null)
         return;
      $("#highlighted").remove();
      if (this.activeNode.nodeValue != null)
         this.setActiveNodeCaretPos(this.activeNode.nodeValue.length);
      this.activeNode = null;
      this.afterNode = null
   }

   release_selection() {
      console.log('Rel Sel');
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
            const [focusedNode, ] = this.getActiveNodeAndOffset(); // instant input
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
         if (this.activeNode === this.input[0])
            $(this.activeNode).append(newSpan);  // the input is empty
         else if (this.activeNode.parentNode !== null && 
                  this.activeNode.parentNode !== this.input[0]) {
            this.activeNode = this.activeNode.parentNode;  // #TEXT of a child of the input
            $(this.activeNode).after(newSpan);
         } else
            $(this.activeNode).after(newSpan);   // #TEXT of the input
         const after_text = initialText.substr(textOffset);
         if(after_text !== '') {
            this.afterNode = document.createTextNode(after_text);
            $(newSpan).after(this.afterNode);
         } else 
            this.afterNode = null;
         newSpan.focus(); // is this needed??
         setCaretPosition(newSpan[0].firstChild ?? newSpan[0], 0);
      }
      else {
         this.selected_text = str;
         $("#highlighted").text(str);
      }
   }
}

function key_down_native(e, input) {
   if (e.key.length !== 1) {
       return true;
   }
   input.replace_selection(e.key, false);
   return false;
}

function setCaretPosition(elem, caretPos) {
   var range = document.createRange();
   var sel = window.getSelection();
   range.setStart(elem, caretPos);
   range.collapse(true);
   sel.removeAllRanges();
   sel.addRange(range);
}

export default VirtualKeyboardInput;
