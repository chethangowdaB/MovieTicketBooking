import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Cart.css'
const Cart = () => {
  const location = useLocation();
  const { data } = location.state || {};
  const [userCart, setUserCart] = useState(null);

  const fetchUserCart = async () => {
    try {
      if (data) {
        const response = await axios.get(`http://localhost:8000/cart/${data}`);
        setUserCart(response.data);
      }
    } catch (error) {
      console.error('Error fetching user cart:', error);
    }
  };

  useEffect(() => {
    fetchUserCart();

    return () => {
      setUserCart(null);
    };
  }, [data]);

 

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.post(`http://localhost:8000/cart/${data}/${productId}`);
      fetchUserCart(); // Call fetchUserCart after deleting the product
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div>
      <h2>Watch later</h2>
      {userCart ? (
        <>
          <table>
            <thead>
              <tr>
                <th>MovieName</th>
                <th>Movie Image</th>
                <th>Movie language</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userCart.map((item, index) => (
                <tr key={index}>
                  <td>{item.title}</td>
                  <td><img src={item.productImagelink} alt={item.name} /></td>
                  <td>{item.productDescription}</td>
                  <td>{item.rate}</td>
                  <td>
                    <button onClick={() => handleDeleteProduct(item.productId)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
           
          </div>
        </>
      ) : (
        <p>Loading user cart...</p>
      )}
    </div>
  );
};

export default Cart;
