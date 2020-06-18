import Data from './deck/Data.json';
import Coca from './deck/Coca.json';
import Topik1 from './deck/Topik1.json';
import JapaneseWords from './deck/JapaneseWords.json';

const delta = 10;

function getAllLocalData() {
   return Data.concat(Topik1).concat(Coca).concat(JapaneseWords);
}

class User {
   static async getName() {
      return undefined;
   //   return "Bob Miller";
   }

   static async login(name, password, rememberMe) {
   }
   
   static async logout() {
   }
   
   static async register(name, email, password) {
   }
   static async delete() {
      
   }
   
   static async getDeckList() {
      await setTimeout(100);
      return getAllLocalData().map( (item, index) => {
         const deckId = index + delta;
         return {
            id: deckId,
            name: item.Name,
            description: item.Description,
            language: item.Language,
            row_number: item.Rows.length
         }
      })
   }
   
   static async getDeck(id, fromRow, number) {
      await setTimeout(100);
      const data = getAllLocalData();
      const deckData = data[id - delta];
      const rowsWithId = deckData.Rows.map((item, index) => {
         const wordId = id * 100000 + index;
         return {
         id: wordId,
         word: item[0],
         meaning: item[1],
         extra: item[2]
         }
      });
      return {
         id: id,
         name: deckData.Name,
         description: deckData.Description,
         language: deckData.Language,
         rows: rowsWithId
      };
   }
   

}

class Deck {
   constructor(deckId) {
      this.deckId = deckId;
   }
   async addWord(word, translation, extra) {
   }
   
   async changeWord(wordId, word, translation, extra) {
   }
   
   async deleteWord(wordId) {
   }
}

class Test {
   constructor(deckId) {
      this.deckId = deckId;
   }
   
   static async setTranslationTestResult(wordId, succeeded) {
      return true;
   }
   
   static async setWordTestResult(wordId, succeeded) {
      return true;
   }
}


export { User, Test };