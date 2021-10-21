import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';

import { MatrixList } from './MatrixList.js'
import { Matrix } from './Matrix.js'
import { NavBar } from './NavBar.js'
import { TestPage } from './TestPage.js'

function Error() {
   return (
            <div className='text-center'>
               <h1>404</h1>
               <h2>Нет такой страницы (Page not found)</h2>
            </div>
          );
}

function App() {
  return (
      <BrowserRouter>
         <NavBar />
            <Switch>
             <Route path={`${process.env.PUBLIC_URL}/`} component={MatrixList} exact/>
             <Route path={`${process.env.PUBLIC_URL}/deck`} component={Matrix}/>
             <Route path={`${process.env.PUBLIC_URL}/test`} component={TestPage}/>
             <Route component={Error}/>
           </Switch>
      </BrowserRouter>
  );
}

export default App;
