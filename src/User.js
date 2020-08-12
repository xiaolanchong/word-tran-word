import Coca from './deck/Coca.json';
import Topik1 from './deck/Topik1.json';
import JapaneseWords from './deck/JapaneseWords.json';
import TextDecks from './deck/TextDecks.json' 


async function* makeTextFileLineIterator(fileURL) {
  const utf8Decoder = new TextDecoder('utf-8');
  const response = await fetch(fileURL);
  const reader = response.body.getReader();
  let { value: chunk, done: readerDone } = await reader.read();
  chunk = chunk ? utf8Decoder.decode(chunk) : '';

  const re = /\n|\r|\r\n/gm;
  let startIndex = 0;

  for (;;) {
    let result = re.exec(chunk);
    if (!result) {
      if (readerDone) {
        break;
      }
      let remainder = chunk.substr(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read());
      chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : '');
      startIndex = re.lastIndex = 0;
      continue;
    }
    yield chunk.substring(startIndex, result.index);
    startIndex = re.lastIndex;
  }
  if (startIndex < chunk.length) {
    // last line didn't end in a newline char
    yield chunk.substr(startIndex);
  }
}

/// Utils
function getWordId(deckId, wordNumberInDeck) {
  const MAX_WORDS_IN_DECK = 100000
  return deckId * MAX_WORDS_IN_DECK + wordNumberInDeck;
}

function getWordScore(wordId) {
  return +getProperty("word", wordId, "translation_score")
}

/// --------- Local ----------------

const localStorage = window.localStorage;


/*  
  Format: array of records:
{    "Id" : 1001,
      "Name" : "Пинбол-1973",
      "Description" : "Слова из Пинбол-1973",
      "Language": "ko",
      "Rows" : [
        ["가게",  "магазин, лавка"],
        ...
      ]
 */
function getAllLocalData() {
   return [].concat(Topik1)
            .concat(Coca)
            .concat(JapaneseWords)
            ;
}

/*
  Format:
  {
      "Id" : 2000,
      "Name" : "Pinball 1973",
      "Language": "ko",
      "File": "Pinball1973.txt"
      contents of Pinball1973.txt
        닥치다	приблизиться
        word \t meaning
  }
*/

function getTextData() {
  return TextDecks
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
      const jsonDecks = getAllLocalData().map( (item, index) => {
         return {
            id: item.Id,
            name: item.Name,
            description: item.Description,
            language: item.Language,
            rowNumber: item.Rows.length
         }
      })
      const textDecks = getTextData().map( (item) => {
        return {
           id: item.Id,
           name: item.Name,
           description: item.Description,
           language: item.Language,
           rowNumber: undefined,
        }
      })
      return jsonDecks.concat(textDecks)
   }
   
   async getDeck(id, fromRow, number) {
      await setTimeout(100);
      const data = getAllLocalData();
      const deckData = data.find( (deck) => deck.Id === +id );
      if (deckData === undefined) {
        const deckDesc = getTextData().find( (deck) => deck.Id === +id )
        if (deckDesc !== undefined) {
          return this.getTextDeck(deckDesc)
        }
        else
          return undefined
      }
      
      const rowsWithId = deckData.Rows.map((item, index) => {
         const wordId = getWordId(id, index)
         const transScore = getWordScore(wordId)
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
   
   async getTextDeck(deckDesc) {
     const url = `${process.env.PUBLIC_URL}/deck/${deckDesc.FileName}`
     const rows = []
     let index = 0
     for await (let line of makeTextFileLineIterator(url)) {
       if (line.length === 0 )
         continue
       const parts = line.split('\t')
       const wordId = getWordId(deckDesc.Id, index)
       const newRecord = {
         id: wordId,
         score: getWordScore(wordId)
       }

       switch (parts.length) {
         case 1:
           newRecord.word = parts[0]
           break
         case 2:
           newRecord.word = parts[0]
           newRecord.meaning = parts[1]
           break
         case 3:
           newRecord.word = parts[0]
           newRecord.extra = parts[1]
           newRecord.meaning = parts[2]
           break
         default:
           break
       }

       rows.push(newRecord)
       ++index
     }
     return {
       id: deckDesc.Id,
       name: deckDesc.Name,
       description: deckDesc.Description,
       language: deckDesc.Language,
       rows: rows
     }
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