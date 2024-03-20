import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './Home';
import Login from './login';
import SignupForm from './signup';
import Cart from './Cart';
import Shows from './Shows';
import Seats from './Seats'
function Main() {
  return (
    
        <Router>
       <Routes>
       <Route path="/" element={<Login/>}/>
       <Route path="/home" element={<Home />} /> 
       <Route path="/home/cart" element={<Cart />} /> 
       <Route path="/signup" element={<SignupForm />} />
       <Route path="/shows/:movieId" element={<Shows/>} />
       <Route path='/seats/:tid' element={<Seats/>} />
       </Routes>
       </Router>
  );
}

export default Main;
