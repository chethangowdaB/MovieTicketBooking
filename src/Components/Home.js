import React from 'react';
import './home.css'; // Import the CSS file
import Projects from './projectcard';
import { useLocation, useNavigate } from 'react-router-dom';

const Title = (props) => {
  const history = useNavigate();
  const location = useLocation();
  const userId = location.state.id;

  const handleCartClick = () => {
    history('./cart', { state: { data: userId } });
  };

  const upload = () => {
    history('./upload', { state: { data: userId } });
  };

  return (
    <div>
      <nav className="navbar">
        <h1>Movie Ticket Booking System</h1>
        <h1>Welocome <br />{userId}</h1>
        <div className="nav-buttons">
          <button onClick={handleCartClick}>Watch Later</button>
        </div>
      </nav>
      <Projects email={userId} />
    </div>
  );
};

export default Title;
