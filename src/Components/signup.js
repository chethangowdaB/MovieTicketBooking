import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './sign.css'; // Import your CSS file for styling

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const history = useNavigate();

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:8000/signup', { email, password });
      if (response.status === 201) {
        setSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='signup-container'>
      <div className='signup-form'>
        <h2>Signup</h2>
        <div className='form-group'>
          <label htmlFor='email'>Email:</label>
          <input type='email' id='email' value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className='form-group'>
          <label htmlFor='password'>Password:</label>
          <input type='password' id='password' value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className='signup-button' onClick={handleSignup}>Signup</button>
        {success && (
          <>
            <p>You have successfully signed up. You can now login.</p>
            <Link to="/" className='login-link'>Login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupForm;
