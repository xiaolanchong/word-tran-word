import React from 'react'
import { NavLink } from 'react-router-dom'

class NavBar extends React.Component {
   render() {
      return (
         <header>
            <nav className='bg-dark'>
               <img className='m-2' src='/mind_icon_src.png' alt='logo' width='32' height='32' />
               <NavLink to='/' className='font-weight-bold ml-2'>Все списки</NavLink>
               <NavLink to='/about' className='font-weight-bold ml-3'>О программе</NavLink>
            </nav>
         </header>
      );
   }
}

export { NavBar };