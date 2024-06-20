import React, { useState, useEffect } from 'react'
import {Modal, Button, Form} from 'react-bootstrap'

const NavBar = () =>
   <header>
      <nav className='p-1 bg-dark'>
         <img src={`${process.env.PUBLIC_URL}/mind_icon_src.png`} className='m-2' alt='logo' width='32' height='32' />
         <a href={`${process.env.PUBLIC_URL}/`} className=' ms-2'>Все списки</a>
         <a href={`${process.env.PUBLIC_URL}?mode=test`} className=' ms-3'>Тест-страница</a>
         <a href={`${process.env.PUBLIC_URL}?mode=about`} className=' ms-3'>О программе</a>
      </nav>
   </header>

export { NavBar };