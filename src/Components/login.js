import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invalid, setInvalid] = useState(false);
  const history = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/login', { email, password });

      if (response.status === 250) {
        setInvalid(true);
      } else if (response.status === 200) {
        setInvalid(false);
        history("/home", { state: { id: email } });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-form'>
        <h2>Login</h2>
        <div className='form-group'>
          <label htmlFor='email'>Email:</label>
          <input type='email' id='email' value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className='form-group'>
          <label htmlFor='password'>Password:</label>
          <input type='password' id='password' value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {invalid && <p className='error-message'>Incorrect Email or Password</p>}
        <button className='login-button' onClick={handleLogin}>Login</button>
        <Link to="/signup" className='signup-link'>Sign Up</Link>
      </div>
    </div>
  );
};

export default Login;
