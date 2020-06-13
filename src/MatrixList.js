import React from 'react';
import { Link } from 'react-router-dom'
import {getDeckList} from './User.js';

class MatrixList extends React.Component {
   constructor(props) {
      super(props);
      this.state = { decks: [] };
   }
   
   async componentDidMount() {
      const decks = await getDeckList();
      this.setState({ decks: decks })
   }

   render() {
      const rows = this.state.decks.map( (deck, index) =>
         <tr key={index}>
            <td><Link to={`/matrix?id=${deck.id}`}>{deck.name}</Link></td>
            <td>{deck.language}</td>
            <td>{deck.row_number}</td>
         </tr>
      );
      return (
         <table className="table table-nonfluid ml-1">
            <thead className="thead-light">
               <tr>
                  <th>Название</th>
                  <th>Язык</th>
                  <th>Кол-во записей</th>
               </tr>
            </thead>
            <tbody>
               {rows}
            </tbody>
         </table>
      );
   }
}

export { MatrixList };