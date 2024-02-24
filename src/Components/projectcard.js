import React, { useState, useEffect } from 'react';
import Items from './Items';
import axios from 'axios';

const ProjectCard = ({email}) => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/products');
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <center>
        <h2 className='pro'>Items</h2>
      </center>
      <Items projects={items} email={email}/>
    </div>
  );
};

export default ProjectCard;
