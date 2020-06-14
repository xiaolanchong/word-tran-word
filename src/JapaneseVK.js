import $ from 'jquery';
import { createPopper } from '@popperjs/core';


const disp_number = 10;  // 10 words a page

let code_holder = '';  //  symbols yet input
let left_yinhao1 = false; // ' quotes
let left_yinhao2 = false; // " quotes

function return_false() {
    return false;
}

//New
function release_selection(input) {
   input.release_selection();
   input.callback.hide_popup();
   code_holder = '';
}

function clear_all(input) {
   input.clear_all();
   input.callback.hide_popup();
   code_holder = '';
}

function replace_selection(input, str, highlight) {
   input.replace_selection(str, highlight);
}


/*
const InputMode = Object.freeze({
   HIRAGANA: 1,
   KATAKANA: 2,
   ENGLISH_FULLWIDTH: 3,
   ENGLISH_HALFWIDHT: 4
});*/

function display_words(direction) {
    alert('Not implemented');
}

class Callback {
   constructor(input_ctrl) {
      this.word_lists = undefined; // 2D array
      this.splits = undefined; // 1D array
      this.page_number = undefined;
      this.list_index = 0;
      this.input = input_ctrl.input;
      this.input_ctrl = input_ctrl;
      this.show_hiragana = true;
   }
   // have a selection
   is_word_div_visible() {  // $('.word_div:visible').length > 0
      return this.words_in_list() > 0;
   }
   // get the currently selected word
   get_word_div_visible() {
      return $('.word', this.menu).index($('.active'))
   }
   // get the number of words in the popup (current page)
   words_in_list() {
      return $('.word', this.menu).length;
   }
   
   insert_word(index) {
      const text = $('.word').eq(index).data('text');
      replace_selection(this.input_ctrl, text, false);
      code_holder = code_holder.substr(this.splits[this.list_index].length);
      replace_selection(this.input_ctrl, code_holder, true);
      ++this.list_index;
      if (this.list_index < this.word_lists.length) {
         display_words("next");
      } else {
         this.hide_popup();
      }
   }

   prev_page() {
      if(this.menu === undefined)
         return;
      if(this.page_number === 0)
         return;
      --this.page_number;
      $('.dropdown-item', this.menu).remove();
      this.populateMenu(this.menu);
      this.highlight_word("first");
   }
   next_page() {
      if(this.menu === undefined)
         return;
      if((this.page_number + 1) * disp_number > this.word_lists[this.list_index].length)
         return;
      $('.dropdown-item', this.menu).remove();
      ++this.page_number;
      this.populateMenu(this.menu);
      this.highlight_word("first");
   }

   show_popup(word) {
      fetch("https://www.inputking.com/ime/getwords.php?&p1=japanese&p2=" + word + "&is_vip=",
         {
            method: 'GET',
            cors: 'no-cors',
            referrerPolicy: "no-referrer",
            headers: {
               'Content-Type': 'application/x-javascript',
            }
         }
      )
      .then(response => { 
         return response.text();
      })
      .then(data => {
          const reWords = /words\[\d+\]=\[(.*?)\]/g;
          const reSplits = /splits=\[(.*?)\]/;
          let word_lists = [];
          for(let word of data.matchAll(reWords)) {
             const words = word[1].split(",").map( w => w.substr(1, w.length - 2) );
             //console.log(words);
             word_lists.push(words);
          }
          const splitWord = data.match(reSplits);
          const splits = splitWord[1].split(",").map( w => w.substr(1, w.length - 2) );
        //  console.log(`splits: ${splits}`);
          this.createMenu(word_lists, typeof splits == String ? [splits] : splits);
      });
   }
   hide_popup() {
      if(this.menu)
         this.menu.remove();
      this.menu = undefined;
      this.splits = undefined;
      this.word_lists = undefined;
      this.list_index = undefined;
   }

   highlight_word(which) {
      switch(which) {
      case "first":
         $('.word', this.menu).removeClass('active');
         $('.word', this.menu).eq(0).addClass('active');
         break;
      case "last":
      case "prev": {
            const all = $('.word, .active', this.menu);
            const index = all.index();
            $('.word', this.menu).removeClass('active');
            if(index > 0)
               all.eq(index-1).addClass('active');
            else
               this.prev_page();
         }
         break;
      case "next": {
            const all = $('.word, .active', this.menu);
            const index = all.index();
            $('.word', this.menu).removeClass('active');
            if(index < all.length - 1)
               $('.word', this.menu).eq(index+1).addClass('active');
            else
               this.next_page();
         }
         break;
      default:
      }
   }
   
   ////  internals  
   populateMenu(menu) {
      const startWordIndex = this.page_number * disp_number;
      const endWordIndex = Math.min((this.page_number + 1) * disp_number,
                                    this.word_lists[this.list_index].length);
      if(this.page_number > 0) {
         const pageUp = $(`<button class="pageup">&#x2BC5;<span class="border rounded ml-1"><kbd>PgUp</<kbd></span></button>`);
         pageUp.addClass('dropdown-item')
               .css('padding', '0.25rem 0.5rem');
         menu.append(pageUp);
      }
      for(let i = startWordIndex; i < endWordIndex; ++i) {
         const index = (i - startWordIndex + 1) % disp_number;
         const itemText = this.word_lists[this.list_index][i];
         const link = $(`<a href='#'><small>${index}. </small>${itemText}</a>`);
         link.addClass('dropdown-item')
             .addClass('word')
             .data('text', itemText)
             .css('padding', '0.25rem 0.5rem');
         link.click( (e) => {
            $(menu).remove();
         });
         menu.append(link);
      }
      if((this.page_number + 1) * disp_number < this.word_lists[this.list_index].length) {
         const pageDn = $(`<button class="pagedown">&#x2BC6;<span class="border rounded ml-1"><kbd>PgDn</<kbd></span></button>`);
         pageDn.addClass('dropdown-item')
               .css('padding', '0.25rem 0.5rem');
         menu.append(pageDn);
      }
      $(".pageup", menu).click(e => {
         this.prev_page();
      });
      $(".pagedown", menu).click(e => {
         this.next_page();
      });
   }
   
   createMenu(word_lists, splits) {
      this.word_lists = word_lists;
      this.splits = splits;
      this.page_number = 0;
      this.list_index = 0;

      let menu = $('<div/>');
      menu.addClass('bg-white').addClass('border');
      menu.css('z-index', 3000);
      this.populateMenu(menu);
      
      $(this.input).after(menu);
      this.menu = menu;
      this.highlight_word("first");

      createPopper($(this.input)[0], $(menu)[0], {
         placement: 'bottom',
      });
   }
}


//------------------------------------

const key_en = "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./";
const key_char_quan = "｀１２３４５６７８９０－＝ｑｗｅｒｔｙｕｉｏｐ［］＼ａｓｄｆｇｈｊｋｌ；＇ｚｘｃｖｂｎｍ，．／";
const romaji_array = [
    ['ａ', 'あ', 'ア'],
    ['ｉ', 'い', 'イ'],
    ['ｙｉ', 'い', 'イ'],
    ['ｕ', 'う', 'ウ'],
    ['ｗｕ', 'う', 'ウ'],
    ['ｗｈｕ', 'う', 'ウ'],
    ['ｅ', 'え', 'エ'],
    ['ｏ', 'お', 'オ'],
    ['ｘａ', 'ぁ', 'ァ'],
    ['ｌａ', 'ぁ', 'ァ'],
    ['ｘｉ', 'ぃ', 'ィ'],
    ['ｌｉ', 'ぃ', 'ィ'],
    ['ｌｙｉ', 'ぃ', 'ィ'],
    ['ｘｙｉ', 'ぃ', 'ィ'],
    ['ｘｕ', 'ぅ', 'ゥ'],
    ['ｌｕ', 'ぅ', 'ゥ'],
    ['ｘｅ', 'ぇ', 'ェ'],
    ['ｌｅ', 'ぇ', 'ェ'],
    ['ｌｙｅ', 'ぇ', 'ェ'],
    ['ｘｙｅ', 'ぇ', 'ェ'],
    ['ｘｏ', 'ぉ', 'ォ'],
    ['ｌｏ', 'ぉ', 'ォ'],
    ['ｗｉ', 'うぃ', 'ウィ'],
    ['ｗｅ', 'うぇ', 'ウェ'],
    ['ｖｕ', 'ヴ', 'ヴ'],
    ['ｖａ', 'ヴぁ', 'ヴァ'],
    ['ｖｉ', 'ヴぃ', 'ヴィ'],
    ['ｖｙｉ', 'ヴぃ', 'ヴィ'],
    ['ｖｅ', 'ヴぇ', 'ヴェ'],
    ['ｖｙｅ', 'ヴぇ', 'ヴェ'],
    ['ｖｏ', 'ヴぉ', 'ヴォ'],
    ['ｋａ', 'か', 'カ'],
    ['ｃａ', 'か', 'カ'],
    ['ｋｉ', 'き', 'キ'],
    ['ｋｕ', 'く', 'ク'],
    ['ｃｕ', 'く', 'ク'],
    ['ｑｕ', 'く', 'ク'],
    ['ｋｅ', 'け', 'ケ'],
    ['ｋｏ', 'こ', 'コ'],
    ['ｃｏ', 'こ', 'コ'],
    ['ｋｙａ', 'きゃ', 'キャ'],
    ['ｋｙｉ', 'きぃ', 'キィ'],
    ['ｋｙｕ', 'きゅ', 'キュ'],
    ['ｋｙｅ', 'きぇ', 'キェ'],
    ['ｋｙｏ', 'きょ', 'キョ'],
    ['ｇａ', 'が', 'ガ'],
    ['ｇｉ', 'ぎ', 'ギ'],
    ['ｇｕ', 'ぐ', 'グ'],
    ['ｇｅ', 'げ', 'ゲ'],
    ['ｇｏ', 'ご', 'ゴ'],
    ['ｇｙａ', 'ぎゃ', 'ギャ'],
    ['ｇｙｉ', 'ぎぃ', 'ギィ'],
    ['ｇｙｕ', 'ぎゅ', 'ギュ'],
    ['ｇｙｅ', 'ぎぇ', 'ギェ'],
    ['ｇｙｏ', 'ぎょ', 'ギョ'],
    ['ｓａ', 'さ', 'サ'],
    ['ｓｉ', 'し', 'シ'],
    ['ｃｉ', 'し', 'シ'],
    ['ｓｈｉ', 'し', 'シ'],
    ['ｓｕ', 'す', 'ス'],
    ['ｓｅ', 'せ', 'セ'],
    ['ｃｅ', 'せ', 'セ'],
    ['ｓｏ', 'そ', 'ソ'],
    ['ｓｙａ', 'しゃ', 'シャ'],
    ['ｓｈａ', 'しゃ', 'シャ'],
    ['ｓｙｉ', 'しぃ', 'シィ'],
    ['ｓｙｕ', 'しゅ', 'シュ'],
    ['ｓｈｕ', 'しゅ', 'シュ'],
    ['ｓｙｅ', 'しぇ', 'シェ'],
    ['ｓｈｅ', 'しぇ', 'シェ'],
    ['ｓｙｏ', 'しょ', 'ショ'],
    ['ｓｈｏ', 'しょ', 'ショ'],
    ['ｚａ', 'ざ', 'ザ'],
    ['ｚｉ', 'じ', 'ジ'],
    ['ｊｉ', 'じ', 'ジ'],
    ['ｚｕ', 'ず', 'ズ'],
    ['ｚｅ', 'ぜ', 'ゼ'],
    ['ｚｏ', 'ぞ', 'ゾ'],
    ['ｚｙａ', 'じゃ', 'ジャ'],
    ['ｊａ', 'じゃ', 'ジャ'],
    ['ｊｙａ', 'じゃ', 'ジャ'],
    ['ｚｙｉ', 'じぃ', 'ジィ'],
    ['ｊｙｉ', 'じぃ', 'ジィ'],
    ['ｚｙｕ', 'じゅ', 'ジュ'],
    ['ｊｕ', 'じゅ', 'ジュ'],
    ['ｊｙｕ', 'じゅ', 'ジュ'],
    ['ｚｙｅ', 'じぇ', 'ジェ'],
    ['ｊｅ', 'じぇ', 'ジェ'],
    ['ｊｙｅ', 'じぇ', 'ジェ'],
    ['ｚｙｏ', 'じょ', 'ジョ'],
    ['ｊｏ', 'じょ', 'ジョ'],
    ['ｊｙｏ', 'じょ', 'ジョ'],
    ['ｔａ', 'た', 'タ'],
    ['ｔｉ', 'ち', 'チ'],
    ['ｃｈｉ', 'ち', 'チ'],
    ['ｔｕ', 'つ', 'ツ'],
    ['ｔｓｕ', 'つ', 'ツ'],
    ['ｔｅ', 'て', 'テ'],
    ['ｔｏ', 'と', 'ト'],
    ['ｔｙａ', 'ちゃ', 'チャ'],
    ['ｃｈａ', 'ちゃ', 'チャ'],
    ['ｃｙａ', 'ちゃ', 'チャ'],
    ['ｔｙｉ', 'ちぃ', 'チィ'],
    ['ｃｙｉ', 'ちぃ', 'チィ'],
    ['ｔｙｕ', 'ちゅ', 'チュ'],
    ['ｃｈｕ', 'ちゅ', 'チュ'],
    ['ｃｙｕ', 'ちゅ', 'チュ'],
    ['ｔｙｅ', 'ちぇ', 'チェ'],
    ['ｃｈｅ', 'ちぇ', 'チェ'],
    ['ｃｙｅ', 'ちぇ', 'チェ'],
    ['ｔｙｏ', 'ちょ', 'チョ'],
    ['ｃｈｏ', 'ちょ', 'チョ'],
    ['ｃｙｏ', 'ちょ', 'チョ'],
    ['ｘｔｕ', 'っ', 'ッ'],
    ['ｌｔｕ', 'っ', 'ッ'],
    ['ｌｔｓｕ', 'っ', 'ッ'],
    ['ｔｈｉ', 'てぃ', 'ティ'],
    ['ｔｈｕ', 'てゅ', 'テュ'],
    ['ｔｈｅ', 'てぇ', 'テェ'],
    ['ｔｈｏ', 'てょ', 'テョ'],
    ['ｄａ', 'だ', 'ダ'],
    ['ｄｉ', 'ぢ', 'ヂ'],
    ['ｄｕ', 'づ', 'ヅ'],
    ['ｄｅ', 'で', 'デ'],
    ['ｄｏ', 'ど', 'ド'],
    ['ｄｙａ', 'ぢゃ', 'ヂャ'],
    ['ｄｙｉ', 'ぢぃ', 'ヂィ'],
    ['ｄｙｕ', 'ぢゅ', 'ヂュ'],
    ['ｄｙｅ', 'ぢぇ', 'ヂェ'],
    ['ｄｙｏ', 'ぢょ', 'ヂョ'],
    ['ｄｈａ', 'でゃ', 'デャ'],
    ['ｄｈｉ', 'でぃ', 'ディ'],
    ['ｄｈｕ', 'でゅ', 'デュ'],
    ['ｄｈｅ', 'でぇ', 'デェ'],
    ['ｄｈｏ', 'でょ', 'デョ'],
    ['ｎａ', 'な', 'ナ'],
    ['ｎｉ', 'に', 'ニ'],
    ['ｎｕ', 'ぬ', 'ヌ'],
    ['ｎｅ', 'ね', 'ネ'],
    ['ｎｏ', 'の', 'ノ'],
    ['ｎｙａ', 'にゃ', 'ニャ'],
    ['ｎｙｉ', 'にぃ', 'ニィ'],
    ['ｎｙｕ', 'にゅ', 'ニュ'],
    ['ｎｙｅ', 'にぇ', 'ニェ'],
    ['ｎｙｏ', 'にょ', 'ニョ'],
    ['ｈａ', 'は', 'ハ'],
    ['ｈｉ', 'ひ', 'ヒ'],
    ['ｈｕ', 'ふ', 'フ'],
    ['ｆｕ', 'ふ', 'フ'],
    ['ｈｅ', 'へ', 'ヘ'],
    ['ｈｏ', 'ほ', 'ホ'],
    ['ｈｙａ', 'ひゃ', 'ヒャ'],
    ['ｈｙｉ', 'ひぃ', 'ヒィ'],
    ['ｈｙｕ', 'ひゅ', 'ヒュ'],
    ['ｈｙｅ', 'ひぇ', 'ヒェ'],
    ['ｈｙｏ', 'ひょ', 'ヒョ'],
    ['ｆｙａ', 'ふゃ', 'フャ'],
    ['ｆｙｕ', 'ふゅ', 'フュ'],
    ['ｆｙｏ', 'ふょ', 'フョ'],
    ['ｆａ', 'ふぁ', 'ファ'],
    ['ｆｉ', 'ふぃ', 'フィ'],
    ['ｆｙｉ', 'ふぃ', 'フィ'],
    ['ｆｅ', 'ふぇ', 'フェ'],
    ['ｆｙｅ', 'ふぇ', 'フェ'],
    ['ｆｏ', 'ふぉ', 'フォ'],
    ['ｂａ', 'ば', 'バ'],
    ['ｂｉ', 'び', 'ビ'],
    ['ｂｕ', 'ぶ', 'ブ'],
    ['ｂｅ', 'べ', 'ベ'],
    ['ｂｏ', 'ぼ', 'ボ'],
    ['ｂｙａ', 'びゃ', 'ビャ'],
    ['ｂｙｉ', 'びぃ', 'ビィ'],
    ['ｂｙｕ', 'びゅ', 'ビュ'],
    ['ｂｙｅ', 'びぇ', 'ビェ'],
    ['ｂｙｏ', 'びょ', 'ビョ'],
    ['ｖａ', 'ヴぁ', 'ヴァ'],
    ['ｖｉ', 'ヴぃ', 'ヴィ'],
    ['ｖｕ', 'ヴ', 'ヴ'],
    ['ｖｅ', 'ヴぇ', 'ヴェ'],
    ['ｖｏ', 'ヴぉ', 'ヴォ'],
    ['ｐａ', 'ぱ', 'パ'],
    ['ｐｉ', 'ぴ', 'ピ'],
    ['ｐｕ', 'ぷ', 'プ'],
    ['ｐｅ', 'ぺ', 'ペ'],
    ['ｐｏ', 'ぽ', 'ポ'],
    ['ｐｙａ', 'ぴゃ', 'ピャ'],
    ['ｐｙｉ', 'ぴぃ', 'ピィ'],
    ['ｐｙｕ', 'ぴゅ', 'ピュ'],
    ['ｐｙｅ', 'ぴぇ', 'ピェ'],
    ['ｐｙｏ', 'ぴょ', 'ピョ'],
    ['ｍａ', 'ま', 'マ'],
    ['ｍｉ', 'み', 'ミ'],
    ['ｍｕ', 'む', 'ム'],
    ['ｍｅ', 'め', 'メ'],
    ['ｍｏ', 'も', 'モ'],
    ['ｍｙａ', 'みゃ', 'ミャ'],
    ['ｍｙｉ', 'みぃ', 'ミィ'],
    ['ｍｙｕ', 'みゅ', 'ミュ'],
    ['ｍｙｅ', 'みぇ', 'ミェ'],
    ['ｍｙｏ', 'みょ', 'ミョ'],
    ['ｙａ', 'や', 'ヤ'],
    ['ｙｕ', 'ゆ', 'ユ'],
    ['ｙｏ', 'よ', 'ヨ'],
    ['ｘｙａ', 'ゃ', 'ャ'],
    ['ｌｙａ', 'ゃ', 'ャ'],
    ['ｘｙｕ', 'ゅ', 'ュ'],
    ['ｌｙｕ', 'ゅ', 'ュ'],
    ['ｘｙｏ', 'ょ', 'ョ'],
    ['ｌｙｏ', 'ょ', 'ョ'],
    ['ｒａ', 'ら', 'ラ'],
    ['ｒｉ', 'り', 'リ'],
    ['ｒｕ', 'る', 'ル'],
    ['ｒｅ', 'れ', 'レ'],
    ['ｒｏ', 'ろ', 'ロ'],
    ['ｒｙａ', 'りゃ', 'リャ'],
    ['ｒｙｉ', 'りぃ', 'リィ'],
    ['ｒｙｕ', 'りゅ', 'リュ'],
    ['ｒｙｅ', 'りぇ', 'リェ'],
    ['ｒｙｏ', 'りょ', 'リョ'],
    ['ｗａ', 'わ', 'ワ'],
    ['ｗｏ', 'を', 'ヲ'],
    ['ｎｎ', 'ん', 'ン'],
    ['ｎ＇', 'ん', 'ン'],
    ['ｘｎ', 'ん', 'ン'],
    ['ｘｗａ', 'ゎ', 'ヮ'],
    ['ｌｗａ', 'ゎ', 'ヮ']
];

function alphabet_to_kana(input, char, show_hiragana) {
    if(show_hiragana === undefined) alert("No kana parameter defined");
    const show_katakana = !show_hiragana;
    let i = 0;
    for (; i < code_holder.length; i++) {
        if (key_char_quan.indexOf(code_holder.substr(i, 1)) !== -1) break;
    }
    if (show_katakana && char === "ー" && i === code_holder.length) {
        code_holder += "ー";
        replace_selection(input, code_holder, true);
        return;
    } else {
        if (i < code_holder.length) {
            var head_str = code_holder.substr(0, i);
            var rear_str = code_holder.substr(i);
            if (rear_str === char && char !== "ｎ") {
                code_holder += char;
                replace_selection(input, code_holder, true);
                return;
            }
            if (rear_str === "ｎ" && char !== "ａ" && char !== "ｉ" && char !== "ｕ" && char !== "ｅ" && char !== "ｏ" && char !== "ｙ" && char !== "ｎ") {
                code_holder = head_str + (show_hiragana ? "ん" : "ン") + char;
                replace_selection(input, code_holder, true);
                return;
            } else if (rear_str.length >= 2 && rear_str.substr(0, 1) === rear_str.substr(1, 1)) {
                const kana = find_hiragana(rear_str.substr(1) + char, show_hiragana);
                if (kana != "") {
                    code_holder = head_str + (show_hiragana ? "っ" : "ッ") + kana;
                    replace_selection(input, code_holder, true);
                } else check_romaji(input, rear_str.substr(1) + char);
                return;
            } else {
                const kana = find_hiragana(rear_str + char, show_hiragana);
                if (kana != "") {
                    code_holder = head_str + kana;
                    replace_selection(input, code_holder, true);
                } else check_romaji(input, rear_str + char);
            }
        } else {
            const kana = find_hiragana(char, show_hiragana);
            if (kana != "") code_holder += kana;
            else code_holder += char;
            replace_selection(input, code_holder, true);
        }
    }
}

function find_hiragana(str, show_hiragana) {
    if(show_hiragana==undefined) alert("No kana parameter defined");
    if (show_hiragana) {
        for (let i = 0; i < romaji_array.length; i++) {
            if (romaji_array[i][0] == str) return romaji_array[i][1];
        }
    } else { // katakana
        for (let i = 0; i < romaji_array.length; i++) {
            if (romaji_array[i][0] == str) return romaji_array[i][2];
        }
    }
    return "";
}

function check_romaji(input, str) {
    for (var i = 0; i < romaji_array.length; i++) {
        if (romaji_array[i][0].indexOf(str) == 0) {
            code_holder += str.substr(str.length - 1, 1);
            replace_selection(input, code_holder, true);
            return;
        }
    }
    $('#key_error').show(); // error romaji symbol
}


function key_down_japanese(e, key, input_ctrl, callback) {
    const show_hiragana = callback.show_hiragana;
    switch (key) {
        case 8:
            if (code_holder != '') {
                code_holder = code_holder.substr(0, code_holder.length - 1);
                replace_selection(input_ctrl, code_holder, true);
                //$('#word_list').hide();
                callback.hide_popup();
                return return_false();
            }
            return true;
        case 9:
            if (code_holder == '') replace_selection(input_ctrl, '    ', false);
            return return_false();
        case 27:
            clear_all(input_ctrl);
            return return_false();
        case 33:  // page up
            if (code_holder != '') {
                //if ($('#last_list').is(':visible')) last_page();
                callback.prev_page();
                return return_false();
            }
            return true;
        case 34:  // page down
            if (code_holder != '') {
                //if ($('#next_list').is(':visible')) next_page();
                callback.next_page();
                return return_false();
            }
            return true;
        case 32:  // space
            if (code_holder != '') {
                if (!callback.is_word_div_visible()) {
                    if (show_hiragana) {
                        var str = "";
                        for (let i = 0; i < code_holder.length; i++) {
                            for (let j = 0; j < romaji_array.length; j++) {
                                if (romaji_array[j][1] == code_holder.substr(i, 1)) {
                                    str += romaji_array[j][0];
                                    break;
                                }
                            }
                        }
                        let p2 = "";
                        for (let i = 0; i < str.length; i++) {
                            p2 += key_en.substr(key_char_quan.indexOf(str.substr(i, 1)), 1);
                        }
                        callback.show_popup(p2);
                    }
                } else {
                    callback.highlight_word('next');
                }
            } else replace_selection(input_ctrl, '　', false);
            return return_false();
        case 13:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
                return return_false();
            } else if (code_holder != '') {
                release_selection(input_ctrl);
                return return_false();
            }
            return true;
        case 17:
            return true;
        case 38:  // up arrow
            if (callback.is_word_div_visible()) {
                callback.highlight_word('last');
                return return_false();
            }
            return true;
        case 40:  // down arrow
            if (callback.is_word_div_visible()) {
                callback.highlight_word('next');
                return return_false();
            }
            return true;
        case 37:
        case 39:
        case 46:
        case 36:
        case 35:
            if (code_holder != '') return return_false();
            return true;
        case 192:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (code_holder == '') replace_selection(input_ctrl, e.shiftKey ? '～' : '‘', false);
            return return_false();
        case 49:
            if (e.shiftKey) {
                if (callback.is_word_div_visible()) {
                    callback.insert_word(callback.get_word_div_visible());
                }
                if (code_holder == '') replace_selection(input_ctrl, '！', false);
            } else {
                if (callback.is_word_div_visible()) callback.insert_word(0);
                else if (code_holder == '') replace_selection(input_ctrl, '１', false);
            }
            return return_false();
        case 50:
            if (e.shiftKey) {
                if (callback.is_word_div_visible()) {
                    callback.insert_word(callback.get_word_div_visible());
                }
                if (code_holder == '') replace_selection(input_ctrl, '＠', false);
            } else {
                if (callback.words_in_list() > 1) callback.insert_word(1);
                else if (code_holder == '') replace_selection(input_ctrl, '２', false);
            }
            return return_false();
        case 51:
            if (e.shiftKey) {
                if (callback.is_word_div_visible()) {
                    callback.insert_word(callback.get_word_div_visible());
                }
                if (code_holder == '') replace_selection(input_ctrl, '＃', false);
            } else {
                if (callback.words_in_list() > 2) callback.insert_word(2);
                else if (code_holder == '') replace_selection(input_ctrl, '３', false);
            }
            return return_false();
        case 52:
            if (e.shiftKey) {
                if (callback.is_word_div_visible()) {
                    callback.insert_word(callback.get_word_div_visible());
                }
                if (code_holder == '') replace_selection(input_ctrl, '＄', false);
            } else {
                if (callback.words_in_list() > 3) callback.insert_word(3);
                else if (code_holder == '') replace_selection(input_ctrl, '４', false);
            }
            return return_false();
        case 53:
            if (e.shiftKey) {
                if (callback.is_word_div_visible()) {
                    callback.insert_word(callback.get_word_div_visible());
                }
                if (code_holder == '') replace_selection(input_ctrl, '％', false);
            } else {
                if (callback.words_in_list() > 4) callback.insert_word(4);
                else if (code_holder == '') replace_selection(input_ctrl, '５', false);
            }
            return return_false();
        case 54:
            if (e.shiftKey) {
                if (callback.is_word_div_visible()) {
                    callback.insert_word(callback.get_word_div_visible());
                }
                if (code_holder == '') replace_selection(input_ctrl, '＾', false);
            } else {
                if (callback.words_in_list() > 5) callback.insert_word(5);
                else if (code_holder == '') replace_selection(input_ctrl, '６', false);
            }
            return return_false();
        case 55:
            if (e.shiftKey) {
                if (callback.is_word_div_visible()) {
                    callback.insert_word(callback.get_word_div_visible());
                }
                if (code_holder == '') replace_selection(input_ctrl, '＆', false);
            } else {
                if (callback.words_in_list() > 6) callback.insert_word(6);
                else if (code_holder == '') replace_selection(input_ctrl, '７', false);
            }
            return return_false();
        case 56:
            if (e.shiftKey) {
                if (callback.is_word_div_visible()) {
                    callback.insert_word(callback.get_word_div_visible());
                }
                if (code_holder == '') replace_selection(input_ctrl, '＊', false);
            } else {
                if (callback.words_in_list() > 7) callback.insert_word(7);
                else if (code_holder == '') replace_selection(input_ctrl, '８', false);
            }
            return return_false();
        case 57:
            if (e.shiftKey) {
                if (callback.is_word_div_visible()) {
                    callback.insert_word(callback.get_word_div_visible());
                }
                if (code_holder == '') replace_selection(input_ctrl, '（', false);
            } else {
                if (callback.words_in_list() > 8) callback.insert_word(8);
                else if (code_holder == '') replace_selection(input_ctrl, '９', false);
            }
            return return_false();
        case 48:
            if (e.shiftKey) {
                if (callback.is_word_div_visible()) {
                    callback.insert_word(callback.get_word_div_visible());
                }
                if (code_holder == '') replace_selection(input_ctrl, '）', false);
            } else {
                if (callback.words_in_list() > 9) callback.insert_word(9);
                else if (code_holder == '') replace_selection(input_ctrl, '０', false);
            }
            return return_false();
        case 109:
        case 189:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (code_holder == '') replace_selection(input_ctrl, e.shiftKey ? '＿' : 'ー', false);
            else if (!e.shiftKey) alphabet_to_kana(input_ctrl, 'ー', show_hiragana);
            return return_false();
        case 107:
        case 187:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (code_holder == '') replace_selection(input_ctrl, e.shiftKey ? '＋' : '＝', false);
            return return_false();
        case 81:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｑ', show_hiragana);
            }
            return return_false();
        case 87:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｗ', show_hiragana);
            }
            return return_false();
        case 69:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｅ', show_hiragana);
            }
            return return_false();
        case 82:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｒ', show_hiragana);
            }
            return return_false();
        case 84:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｔ', show_hiragana);
            }
            return return_false();
        case 89:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｙ', show_hiragana);
            }
            return return_false();
        case 85:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｕ', show_hiragana);
            }
            return return_false();
        case 73:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｉ', show_hiragana);
            }
            return return_false();
        case 79:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｏ', show_hiragana);
            }
            return return_false();
        case 80:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｐ', show_hiragana);
            }
            return return_false();
        case 219:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (code_holder == '') replace_selection(input_ctrl, e.shiftKey ? '｛' : '「', false);
            return return_false();
        case 221:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (code_holder == '') replace_selection(input_ctrl, e.shiftKey ? '｝' : '」', false);
            return return_false();
        case 220:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (code_holder == '') replace_selection(input_ctrl, e.shiftKey ? '｜' : '￥', false);
            return return_false();
        case 65:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ａ', show_hiragana);
            }
            return return_false();
        case 83:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｓ', show_hiragana);
            }
            return return_false();
        case 68:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｄ', show_hiragana);
            }
            return return_false();
        case 70:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｆ', show_hiragana);
            }
            return return_false();
        case 71:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｇ', show_hiragana);
            }
            return return_false();
        case 72:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｈ', show_hiragana);
            }
            return return_false();
        case 74:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｊ', show_hiragana);
            }
            return return_false();
        case 75:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｋ', show_hiragana);
            }
            return return_false();
        case 76:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｌ', show_hiragana);
            }
            return return_false();
        case 59:
        case 186:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (code_holder == '') replace_selection(input_ctrl, e.shiftKey ? '：' : '；', false);
            return return_false();
        case 222:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (code_holder == '') {
                if (e.shiftKey) {
                   left_yinhao2 = !left_yinhao2;
                   replace_selection(input_ctrl, left_yinhao2 ? '“' : '”', false);
                }
                else {
                   left_yinhao1 = !left_yinhao1;
                   replace_selection(input_ctrl, left_yinhao1 ? '‘' : '’', false);
                }
            }
            return return_false();
        case 90:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｚ', show_hiragana);
            }
            return return_false();
        case 88:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｘ', show_hiragana);
            }
            return return_false();
        case 67:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｃ', show_hiragana);
            }
            return return_false();
        case 86:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｖ', show_hiragana);
            }
            return return_false();
        case 66:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｂ', show_hiragana);
            }
            return return_false();
        case 78:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｎ', show_hiragana);
            }
            return return_false();
        case 77:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (!callback.is_word_div_visible()) {
                alphabet_to_kana(input_ctrl, 'ｍ', show_hiragana);
            }
            return return_false();
        case 188:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (code_holder == '') replace_selection(input_ctrl, e.shiftKey ? '＜' : '、', false);
            return return_false();
        case 190:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (code_holder == '') replace_selection(input_ctrl, e.shiftKey ? '＞' : '。', false);
            return return_false();
        case 191:
            if (callback.is_word_div_visible()) {
                callback.insert_word(callback.get_word_div_visible());
            }
            if (code_holder == '') replace_selection(input_ctrl, e.shiftKey ? '？' : '・', false);
            return return_false();
        default:
            return undefined;
    }
}

function key_down(e, input_ctrl) {
      // $('#show_area').html('');
  //  $('.message').hide();
   if (e.ctrlKey) return true;
   var key = e.which ? e.which : e.keyCode;

   var callback = input_ctrl.callback ?? new Callback(input_ctrl);
   input_ctrl.callback = callback;
   
   if(e.key === '`' && e.ctrlKey) {  // ` + Ctrl -> Hiragana/Katakana
      callback.show_hiragana = !callback.show_hiragana;
      return true;
   }
   if(e.key === '-') // onbiki
      key = 189;

   if(e.key === '`') // quotes
      key = 220;
   
   return key_down_japanese(e, key, input_ctrl, callback)
}

export {key_down}