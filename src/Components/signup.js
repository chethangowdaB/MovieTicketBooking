// SignupForm.js
import React, { useState } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [Login,succeslogin]=useState(false);
  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:8000/signup', { email, password });
      console.log(response.data);
      console.log(response.status);
      if(response.status==201){
        succeslogin(true)
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button onClick={handleSignup}>Signup</button>
      {Login && <p>You have successfully signed up. You can now login.</p> && <Link to="/" >Login</Link>}
    </div>
  );
};

export default SignupForm;

