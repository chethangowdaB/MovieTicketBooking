import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './seat.css';
import C from './curved';
import { io } from 'socket.io-client';

const Available = () => {
  const { tid } = useParams();
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingStatus, setBookingStatus] = useState(null);
  const socket = io('http://localhost:8080');

  useEffect(() => {
    socket.on('seat_booked', handleSeatBooked);
    return () => {
      socket.off('seat_booked', handleSeatBooked);
    };
  }, [socket]);

  useEffect(() => {
    const fetchAvailableSeats = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/seats/${tid}`);
        const availableSeatsData = JSON.parse(response.data.available_seats);
        setAvailableSeats(availableSeatsData.seats);
      } catch (error) {
        console.error('Error fetching available seats:', error);
      }
    };

    fetchAvailableSeats();
  }, [tid]);

  const handleSeatSelection = (rowIndex, seatIndex) => {
    const seat = availableSeats[rowIndex][seatIndex];
    if (seat && seat[1].available) {
      const isSelected = selectedSeats.some(seat => seat.row === rowIndex && seat.seat === seatIndex);
      if (isSelected) {
        setSelectedSeats(selectedSeats.filter(seat => !(seat.row === rowIndex && seat.seat === seatIndex)));
      } else {
        setSelectedSeats([...selectedSeats, { row: rowIndex, seat: seatIndex }]);
      }
    }
  };

  const book = async () => {
    try {
      const updatePromises = selectedSeats.map(async seat => {
        const { row: rowIndex, seat: seatIndex } = seat;
        await axios.post(`http://localhost:8000/update-seat/${tid}`, { seat_row_index: rowIndex, seat_index: seatIndex });
      });

      await Promise.all(updatePromises);

      const response = await axios.post('http://localhost:8000/bookings', { theatreId: tid, seats: selectedSeats });

      // Emit a 'seat_booked' event to the server
      socket.emit('seat_booked', { action: 'seat_booked', seats: selectedSeats });

      setAvailableSeats(prevSeats => {
        const updatedSeats = [...prevSeats];
        selectedSeats.forEach(seat => {
          const { row: rowIndex, seat: seatIndex } = seat;
          updatedSeats[rowIndex][seatIndex][1].available = false;
        });
        return updatedSeats;
      });
      setSelectedSeats([]);
      setBookingStatus(response.data.message);
    } catch (error) {
      console.error('Error booking seats:', error);
      setBookingStatus('Failed to book seats. Please try again later.');
    }
  };

  const handleSeatBooked = (data) => {
    // Update UI or perform any necessary actions
    console.log('Seat booked:', data);
  };

  return (
    <div>
      <h2>Available Seats</h2>
      <div className="seat-grid">
        {availableSeats.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {row.map((seat, seatIndex) => (
              <button
                key={seatIndex}
                className={`seat ${seat[1].available ? (selectedSeats.some(seat => seat.row === rowIndex && seat.seat === seatIndex) ? 'selected' : 'available') : 'unavailable'}`}
                onClick={() => handleSeatSelection(rowIndex, seatIndex)}
                disabled={!seat[1].available}
              >
                {String.fromCharCode(65 + rowIndex)}{seatIndex + 1}
              </button>
            ))}
          </div>
        ))}
      </div>
      <h2>SCREEN</h2>
      <C />
      <h2>ALL EYES HERE</h2>
      <div className="selected-seat-info">
        <h3>Selected Seats:</h3>
        <ul>
          {selectedSeats.map((seat, index) => (
            <li key={index}>
              Row: {String.fromCharCode(65 + seat.row)}, Seat: {seat.seat + 1}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={book}>Book Seats</button>
      {bookingStatus && <p>{bookingStatus}</p>}
    </div>
  );
};

export default Available;
