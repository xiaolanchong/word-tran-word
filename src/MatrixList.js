import React from 'react';
import { Link } from 'react-router-dom'
import { getUser } from './User.js';

class MatrixList extends React.Component {
   constructor(props) {
      super(props);
      this.state = { decks: [] };
   }
   
   async componentDidMount() {
      const decks = await getUser().getDeckList();
      this.setState({ decks: decks })
   }

   render() {
      const rows = this.state.decks.map( (deck, index) =>
         <tr key={index}>
            <td><Link to={`${process.env.PUBLIC_URL}/deck?id=${deck.id}`}>{deck.name}</Link></td>
            <td>{deck.description ?? ''}</td>
            <td>{deck.language}</td>
            <td className="text-right">{deck.rowNumber ?? '?'}</td>
         </tr>
      );
      return (
         <div className='container'>
               <table className="table table-nonfluid ml-1">
                  <thead className="thead-light">
                     <tr>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Язык</th>
                        <th>Кол-во записей</th>
                     </tr>
                  </thead>
                  <tbody>
                     {rows}
                  </tbody>
               </table>
        </div>
      );
   }
}

export { MatrixList };