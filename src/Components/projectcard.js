import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './stylesheetforpro.css';

const MovieComponent = ({ email }) => {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [added, setAdded] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch only 20 movies initially
        const response = await axios.get('http://localhost:8000/movies?_limit=20&_page=1');
        setMovies(response.data);
        // Assuming API provides total number of pages
        setTotalPages(Math.ceil(response.headers['x-total-count'] / 20));
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/cart/${email}`);
        const userCart = response.data;
        const addedMovies = userCart.map(item => item.productId);
        setAdded(addedMovies);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, [email]);

  const loadMoreMovies = async () => {
    if (currentPage < totalPages) {
      try {
        const nextPage = currentPage + 1;
        const response = await axios.get(`http://localhost:8000/movies?_limit=20&_page=${nextPage}`);
        setMovies(prevMovies => [...prevMovies, ...response.data]);
        setCurrentPage(nextPage);
      } catch (error) {
        console.error('Error loading more movies:', error);
      }
    }
  };

  const addToCart = async (movie) => {
    try {
      const response = await axios.post('http://localhost:8000/cart', {
        email,
        movie,
      });
      if (response.status === 200) { // Check for successful addition
        setAdded(prevAdded => [...prevAdded, movie.id]);
      }
      console.log('Product added to cart:', response.status);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div>
      <center>
        <h2 className='pro'>MOVIES</h2>
      </center>
      <div className="itemgrid">
        {movies.map((movie, index) => (
          <figure key={index} className='fig'>
            <img className='img' src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title} />
            <figcaption className='pa'>
              <p>{movie.title}</p>
              <button
                onClick={() => addToCart(movie)}
                className={added.includes(movie.id) ? 'already-saved' : ''}
              >
                {added.includes(movie.id) ? 'Already Saved' : 'Watch Later'}
              </button><br/><br></br>
              <Link className='button' to={`/shows/${movie.id}`}>BOOK MY SHOW</Link>
            </figcaption>
          </figure>
        ))}
      </div>
      
      {currentPage < totalPages && (
        <button onClick={loadMoreMovies}>Load More</button>
      )}
    </div>
  );
};

export default MovieComponent;
