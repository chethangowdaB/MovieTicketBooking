import React from 'react';
import axios from 'axios';

const ItemPic = ({ itempi, email }) => {
 

  const addToCart = async () => {
    console.log()
    try {
      const response = await axios.post('http://localhost:8000/cart', {
        email,
        ...itempi
      });

      console.log('Product added to cart:', response.data);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <figure className='fig'>
      <img className='img' src={itempi.productImagelink} alt={itempi.productName} />
      <figcaption className='pa'>
        <p>{itempi.productName}</p>
        <p>{itempi.rate}</p>
      </figcaption>
      <button onClick={addToCart}>Add to cart</button>
    </figure>
  );
};

export default ItemPic;
