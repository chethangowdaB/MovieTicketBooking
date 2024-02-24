const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {User,Products}  = require('./database/mongodb');

const app = express();
const PORT = process.env.PORT || 8000;
const sec_key = process.env.JWT_SECRET || 'xxxxxxxxxxxxxxxxxxaaaaaaaaaaaaaaaaaaaaaaxxxxxxxxxxxxxxxxxxx';

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/myangular').then(() => {
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
}
);

app.post('/upload', async (req, res) => {
  try {
    const { userdata, productId, productName, productImagelink, productDescription ,rate} = req.body;
    const user = await User.findOne({ email: userdata });

    if (!user) {
      throw new Error('User not found');
    }

    const productData = {
      productId,
      productName,
      productImagelink,
      productDescription,
      rate
    };

    const productExists = user.uploadeditem.some(item => item.productId === productId);

    if (productExists) {
      // Update product in the user's uploadeditem array
      await User.findOneAndUpdate(
        { email: userdata, 'uploadeditem.productId': productId },
        {
          $set: {
            'uploadeditem.$.productName': productName,
            'uploadeditem.$.productImagelink': productImagelink,
            'uploadeditem.$.productDescription': productDescription,
            'uploadeditem.$.rate':rate
          },
        }
      );

      // Update product in the main Product folder if it exists
      const productExistsInMain = await Products.exists({ name: 'uni', 'items.userdata': userdata, 'items.productId': productId });

      if (productExistsInMain) {
        await Products.findOneAndUpdate(
          { name: 'uni', 'items.userdata': userdata, 'items.productId': productId },
          {
            $set: {
              'items.$.productName': productName,
              'items.$.productImagelink': productImagelink,
              'items.$.productDescription': productDescription,
              'items.$.rate':rate
            },
          }
        );
      }
    } else {
      await User.findOneAndUpdate(
        { email: userdata },
        { $push: { uploadeditem: productData } }
      );

      let products = await Products.findOne({ name: 'uni' });
      
      if (!products) {
        products = new Products({ name: 'uni', items: [] });
      }

      const productDataWithEmail = { userdata, ...productData };
      products.items.push(productDataWithEmail);
      await products.save();
    }

    res.json({ message: 'Product uploaded successfully!' });
  } catch (error) {
    console.error('Error uploading product:', error);
    res.status(500).json({ message: 'Error uploading product' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await Products.findOne({name:"uni"});

    if (!products) {
      throw new Error('No products found');
    }

    const items = products.items;

          res.json(items);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
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


})
app.post('/cart',async(req,res)=>{
  try {
    const { email, productId, productName, productImagelink, productDescription,rate } = req.body;
    
    const userdata=email
    const user = await User.findOne({ email: userdata });

    if (!user) {
      throw new Error('User not found');
    }
    const productData = {
      productId,
      productName,
      productImagelink,
      productDescription,
      rate
    };
    const productExists = user.usercart.some(item => item.productId === productId);

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


})
app.post('/cart/:email/:pid', async (req, res) => {
  const { email, pid } = req.params;

  try {

    const user = await User.findOne({  email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const productIndex = user.usercart.findIndex(item => item.productId === pid);

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
