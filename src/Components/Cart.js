import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
  const location = useLocation();
  const { data } = location.state || {};
  const [userCart, setUserCart] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

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

  useEffect(() => {
    if (userCart) {
      // Calculate total amount
      let total = 0;
      userCart.forEach(item => {
        total += Number(item.rate);
      });
      setTotalAmount(total);
    }
  }, [userCart]);

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
      <h2>User Cart</h2>
      {userCart ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Product Image</th>
                <th>Product Description</th>
                <th>Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userCart.map((item, index) => (
                <tr key={index}>
                  <td>{item.productName}</td>
                  <td><img src={item.productImagelink} alt={item.productName} /></td>
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
            <p>Total: {totalAmount}</p>
          </div>
        </>
      ) : (
        <p>Loading user cart...</p>
      )}
    </div>
  );
};

export default Cart;
