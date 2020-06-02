import React from 'react';
import { Link } from 'react-router-dom'
import Data from './Data.json';

class MatrixList extends React.Component {
   constructor(props) {
      super(props);
      this.matrices = Data;
   }

   render() {
      const rows = this.matrices.map( (item, index) =>
         <tr key={index}>
            <td><Link to={'/matrix?id=' + index}>{item.Name}</Link></td>
            <td>{item.Language}</td>
            <td>{item.Rows.length}</td>
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