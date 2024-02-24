import React, { useState } from 'react';
import axios from 'axios';
import { Link,useNavigate} from 'react-router-dom';

const Login = () => {
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const [invalid, setinvalid] = useState(false);
  const history = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/login', { email, password });

      if (response.status === 250) {
        setinvalid(true);
      } else if (response.status === 200) {
        setinvalid(false);
        history("/home",{state:{id:email}})
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className='back'>
      <div className='form'>
      <h2>Login</h2>
      <div>
        <label>Username:</label>
        <input type="text" value={email} onChange={(e) => setemail(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {invalid && <p>Incorrect Email or password</p>}
      <button onClick={handleLogin}>Login</button>
      <Link to="/signup" >signup</Link>
    </div>
    </div>
   
  );
};

export default Login;