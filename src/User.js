import Data from './Data.json';

const delta = 10;

async function getDeckList() {
   await setTimeout(100);
   return Data.map( (item, index) => {
      return {
         id: index + delta,
         name: item.Name,
         language: item.Language,
         row_number: item.Rows.length
      }
   })
}

async function getDeck(id, fromRow, number) {
   await setTimeout(100);
   const deckData = Data[id - delta];
   return {
      rows: deckData.Rows,
      name: deckData.Name,
      language: deckData.Language
   };
}

export { getDeckList, getDeck };