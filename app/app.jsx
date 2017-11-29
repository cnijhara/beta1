import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router-dom';
import  Main from './components/Main.jsx';
import history from './history.js';

render((
  <Router history={history}>
    <Main/>
  </Router>), 
document.getElementById('app'));