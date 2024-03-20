import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams ,Link} from 'react-router-dom';
import './shows.css'
const BookNow = () => {
  const { movieId } = useParams();
  const [theatres, setTheatres] = useState([]);

  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/theatres/${movieId}`);
        const theatreData = response.data;

        const theatreDetailsPromises = theatreData.map(async (theatre) => {
          const theatreId = theatre.tid;
          const theatreDetailsResponse = await axios.get(`http://localhost:8000/theatre-details/${theatreId}`);
          return theatreDetailsResponse.data;
        });

        const theatreDetails = await Promise.all(theatreDetailsPromises);

        setTheatres(theatreDetails);
      } catch (error) {
        console.error('Error fetching theatres:', error);
      }
    };

    fetchTheatres();
  }, [movieId]);

  const handleBookSeats = (theatreId) => {
    // Implement the functionality to book seats for the selected theatre
    console.log(`Booking seats for theatre ID:,${theatreId}`);
  };

  return (
    <div>
      <h2>Theatres List</h2>
      <ol>
        {theatres.map((theatre, index) => (
          <div key={index} className="theatre">
            <li>{theatre.tid} - {theatre.name}</li>
            <br></br>
            <Link className="book-button" to={`/seats/${theatre.tid}`}>Select Seats</Link>
          </div>
        ))}
      </ol>
    </div>
  );
};

export default BookNow;
