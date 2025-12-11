import React from 'react'
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'flag-icons/css/flag-icons.min.css';
import './index.css'
import './bootstrap-theme.scss'
import App from './App'
import * as serviceWorker from './serviceWorker'

const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
