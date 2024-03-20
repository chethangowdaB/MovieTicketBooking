const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {User}  = require('./mongodb');

const app = express();
const PORT = process.env.PORT || 8000;
const sec_key = process.env.JWT_SECRET || 'xxxxxxxxxxxxxxxxxxaaaaaaaaaaaaaaaaaaaaaaxxxxxxxxxxxxxxxxxxx';

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/dbms').then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(250).json({ message: 'Invalid email or password'});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(250).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, sec_key, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/cart/:email',async (req,res)=>{
  try {
    const { email } = req.params;
    const user = await User.findOne({email}); 
    res.json(user.usercart);
  } catch (error) {
    console.error('Error fetching user cart items:', error);
    res.status(500).json({ message: 'Error fetching user cart items' });
  }
});

app.post('/cart',async(req,res)=>{
  try {
    const { email, movie } = req.body;
    const userdata=email
    const user = await User.findOne({ email: userdata });

    if (!user) {
      throw new Error('User not found');
    }

    const productData = {
      productId: movie.id,
      title: movie.original_title,
      productImagelink: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
      productDescription: movie.overview,
      rate: movie.vote_average
    };

    const productExists = user.usercart.some(item => item.productId === productData.productId);

    if (productExists) {
      res.status(900).json("Item already exists")
    } else {
      await User.findOneAndUpdate(
        { email: userdata },
        { $push: { usercart: productData } }
      );
      res.json({ message: 'Product added to cart successfully!' }); 
    }  
  } catch (error) {
    console.error('Error uploading product:', error);
    res.status(500).json({ message: 'Error uploading product' });
  }
});

app.post('/cart/:email/:pid', async (req, res) => {
  const { email, pid } = req.params;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const productIndex = user.usercart.findIndex(item => item.productId == pid);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in user cart' });
    }

    user.usercart.splice(productIndex, 1);
    await user.save();

    res.json({ message: 'Product removed from user cart' });
  } catch (error) {
    console.error('Error deleting product from user cart:', error);
    res.status(500).json({ message: 'Error deleting product from user cart' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
