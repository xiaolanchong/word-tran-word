import Data from './deck/Data.json';
import Coca from './deck/Coca.json';
import Topik1 from './deck/Topik1.json';
import JapaneseWords from './deck/JapaneseWords.json';


/// --------- Local ----------------

const localStorage = window.localStorage;

function getAllLocalData() {
   return Data.concat(Topik1).concat(Coca).concat(JapaneseWords);
}

function getProperty(entity, id, propertyName) {
   const path = `${entity}/${id}/${propertyName}`;
   return localStorage.getItem(path);
}

function setProperty(entity, id, propertyName, value) {
   const path = `${entity}/${id}/${propertyName}`;
   localStorage.setItem(path, value);
}

class LocalUser {
   async getName() {
      await setTimeout(200);
      let name = localStorage.getItem('name');
      return name === null ? undefined : name;
   }

   async login(name, password, rememberMe) {
      console.log(`Login: ${name}, ${password}, ${rememberMe}`);
      await setTimeout(500);
      localStorage.setItem('name', name);
      localStorage.setItem('rememberMe', rememberMe);
      return true;
   }
   
   logout() {
      console.log('Logout');
      localStorage.removeItem('name');
      localStorage.removeItem('rememberMe');
      return true;
   }
   
   async register(name, email, password) {
      console.log(`Register: ${name}, ${email}, ${password}`);
      await setTimeout(500);
      localStorage.setItem('name', name);
      localStorage.setItem('email', email);
      return true;
   }
   delete() {
      console.log(`Deleted`);
      localStorage.removeItem('name');
      localStorage.removeItem('rememberMe');
      return true;
   }
   
   async getDeckList() {
      await setTimeout(100);
      return getAllLocalData().map( (item, index) => {
         return {
            id: item.Id,
            name: item.Name,
            description: item.Description,
            language: item.Language,
            row_number: item.Rows.length
         }
      })
   }
   
   async getDeck(id, fromRow, number) {
      await setTimeout(100);
      const data = getAllLocalData();
      const deckData = data.find( (deck) => deck.Id === +id );
      if (deckData === undefined)
         return null;
      
      const rowsWithId = deckData.Rows.map((item, index) => {
         const wordId = id * 100000 + index;
         const transScore = +getProperty(`word`, wordId, `translation_score`);
         return {
         id: wordId,
         word: item[0],
         meaning: item[1],
         extra: item[2],
         score: Math.floor(transScore) // + getProperty(`word`, wordId, `word_score`) ?? 0) / 2,
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

class LocalDeck {
   async changeInfo(deckId, name, description, language) {
   }
   
   async addWord(deckId, word, translation, extra) {
   }
   
   async changeWord(wordId, word, translation, extra) {
   }
   
   async deleteWord(wordId) {
   }
}

function getScoreAfterTest(prevScore, succeeded) {
   let newScore = 0;
   console.log(typeof prevScore);
   if (prevScore === 0)
      newScore = prevScore + (succeeded ? 1 : -1);
   else if (prevScore > 0)
      newScore = !succeeded ? Math.trunc(prevScore / 2) : prevScore + 1;
   else
      newScore =  succeeded ? Math.trunc(prevScore / 2) : prevScore - 1;
   return newScore;
}

class LocalTest {
   static setScore(scoreName, wordId, succeeded) {
      const prevScore = getProperty('word', wordId, 'translation_score')?? 0;
      const newScore = getScoreAfterTest(+prevScore, succeeded);
      console.log(`${scoreName}, ${wordId}, ${succeeded}, ${prevScore}, ${newScore}`)
      setProperty('word', wordId, 'translation_score', newScore);
   }
   
   async setTranslationTestResult(wordId, succeeded) {
      LocalTest.setScore('translation_score', wordId, succeeded);
      return true;
   }
   
   async setWordTestResult(wordId, succeeded) {
      LocalTest.setScore('word_score', wordId, succeeded);
      return true;
   }
}

//-------------------

function init() {
   return [new LocalUser(), new LocalDeck(), new LocalTest()];
}

const [user, deck, test] = init();

function getUser() {
   return user;
}

function getTest() {
   return test;
}

function getDeck() {
   return deck;
}


export { getUser, getTest, getDeck };