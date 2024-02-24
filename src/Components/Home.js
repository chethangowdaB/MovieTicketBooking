import React from 'react'
import './home.css'
import Projects from'./projectcard';
import Footer from './foot'
import {useLocation,useNavigate} from 'react-router-dom';
const Title =(props)=>{
  const history = useNavigate();
  const location=useLocation();
   const x=location.state.id;
   const handleCartClick = () => {
    history("./cart",{state:{data:x}})
  };
  const upload=()=>{
    history('./upload',{state:{data:x}})
  };
  return (
   <div>
    <nav>
    <h1>Ecommerce Website</h1>
    <h1> Heloooo {location.state.id}</h1>
    <button onClick={handleCartClick}>Cart</button>
    <button onClick={upload}>uploaditem</button>
    </nav>
    <Projects  email={location.state.id}/>
    <Footer/>
    </div>
    
    )
}


export default Title
