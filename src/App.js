import './App.css';

import { MatrixList } from './MatrixList.js'
import { Matrix } from './Matrix.js'
import { NavBar } from './NavBar.js'
import { TestPage } from './TestPage.js'
import AboutPage from './AboutPage';

const Error = () => (
            <div className='text-center'>
               <h1>404</h1>
               <h2>Нет такой страницы (Page not found)</h2>
            </div>
          )

const MainPage = () => {
  const urlParams = new URLSearchParams(window.location.search)
  if(!urlParams.has('mode'))
    return (<MatrixList />)
  
  switch(urlParams.get('mode')) {
    case 'deck': return <Matrix />
    case 'test': return <TestPage />
    case 'about': return <AboutPage/>
    default: return <Error />
  }
}

const App = () => <><NavBar/><MainPage data-bs-theme="dark" /></>

export default App;
