import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
//import logo from './logo.svg';
import './App.css';
import { MatrixList } from './MatrixList.js'
import { Matrix } from './Matrix.js'
import { NavBar } from './NavBar.js'

function Error() {
   return (
            <div className='text-center'>
               <h1>404</h1>
               <h2>Нет такой страницы</h2>
            </div>
          );
}

function App() {
  return (
      <BrowserRouter>
         <NavBar />
            <Switch>
             <Route path="/" component={MatrixList} exact/>
             <Route path="/matrix" component={Matrix}/>
             <Route component={Error}/>
           </Switch>
      </BrowserRouter>
  );
}

export default App;
