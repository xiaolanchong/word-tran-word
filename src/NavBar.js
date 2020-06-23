import React, { useState, useEffect } from 'react'
import {Modal, Button, Form} from 'react-bootstrap'
import { NavLink, useHistory } from 'react-router-dom'
import { getUser } from './User.js'

const UserControl = () => {
   const [username, setUsername] = useState(undefined);
   const history = useHistory();
   
   useEffect(() => {
      userGetter();
   });

   const userGetter = async () => {
      const username = await getUser().getName();
      setUsername(username);
   }
   
   const onLogout = () => {
      getUser().logout();
      setUsername(undefined);
      history.push('/');
   }
   
   return (username === undefined)
            ? (
               <span className="float-right text-center ">
                  <Login />
                  <Button variant="secondary ml-2">Регистрация</Button>
               </span>
            )
            : (
               <span className="float-right">
                  <Button variant="link">{username}</Button>
                  <Button variant="secondary ml-1" onClick={onLogout}>Выход</Button>
               </span>
            );
}

function Login() {
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [rememberMe, setRememberMe] = useState(true);
  //const history = useHistory();
  
   useEffect(() => {
      if(username === undefined){
         //deckGetter();
      }
   });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const login = () => {
     getUser().login(username, password, rememberMe).then(() => {
        setUsername(username);
        //history.push('/');
     });
  }

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Вход
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Вход в систему</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         <Form>
           <Form.Group controlId="formBasicName">
             <Form.Control type="input" placeholder="Имя" onChange={ (e) => setUsername(e.target.value) } />
           </Form.Group>

           <Form.Group controlId="formBasicPassword">
             <Form.Control type="password" placeholder="Пароль" onChange={ (e) => setPassword(e.target.value) } />
           </Form.Group>
           <Form.Group controlId="formBasicCheckbox">
             <Form.Check type="checkbox" label="Запомнить" onChange={(e) => setRememberMe(e.target.checked)} />
           </Form.Group>
         </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={ () => { handleClose(); login(); } }>
            Вход
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

class NavBar extends React.Component {
   render() {
      return (
         <header>
            <nav className='p-1 bg-dark'>
               <img className=' m-2' src='/mind_icon_src.png' alt='logo' width='32' height='32' />
               <NavLink to='/' className=' ml-2'>Все списки</NavLink>
               <NavLink to='/about' className=' ml-3'>О программе</NavLink>
               <UserControl />
            </nav>
         </header>
      );
   }
}

export { NavBar };