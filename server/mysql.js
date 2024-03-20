const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;
const sec_key = process.env.JWT_SECRET || 'xxxxxxxxxxxxxxxxxxaaaaaaaaaaaaaaaaaaaaaaxxxxxxxxxxxxxxxxxxx';

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'movie_dbms_pro'
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  ws.on('message', message => {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
      if (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = results[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: user.id }, sec_key, { expiresIn: '1h' });

      res.status(200).json({ token });
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
          console.error('Error checking existing user:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
  
        if (results.length > 0) {
          return res.status(400).json({ message: 'User already exists' });
        }
  
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (error, results) => {
          if (error) {
            console.error('Error creating new user:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
          }
  
          res.status(201).json({ message: 'User created successfully' });
        });
      });
    } catch (error) {
      console.error('Error signing up user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  app.post('/cart', async (req, res) => {
    try {
      const { email, movie } = req.body;
  
      // Retrieve user's cart items from the database
      db.query('SELECT usercart FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
          console.error('Error retrieving user cart:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
  
        const userCart = JSON.parse(results[0].usercart || '[]');
  
        const productExists = userCart.some(item => item.productId === movie.id);
  
        if (productExists) {
          return res.status(400).json({ message: 'Product already exists in cart' }); // Return status 400
        }
  
        // If product doesn't exist, add it to the cart and update the database
        const productData = {
          productId: movie.id,
          title: movie.title,
          productImagelink: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
          productDescription: movie.original_language,
          rate: movie.vote_average
        };
  
        userCart.push(productData);
  
        db.query('UPDATE users SET usercart = ? WHERE email = ?', [JSON.stringify(userCart), email], (error, results) => {
          if (error) {
            console.error('Error updating user cart:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
          }
  
          res.json({ message: 'Product added to cart successfully!' });
  
        });
      });
    } catch (error) {
      console.error('Error uploading product:', error);
      res.status(500).json({ message: 'Error uploading product' });
    }
  });
  
  
  app.get('/cart/:email', async (req, res) => {
    try {
      const { email } = req.params;
  
      db.query('SELECT usercart FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
          console.error('Error fetching user cart items:', error);
          return res.status(500).json({ message: 'Error fetching user cart items' });
        }
  
        if (results.length === 0 || !results[0].usercart) {
          return res.status(404).json({ message: 'User not found or cart is empty' });
        }
  
        const userCart = JSON.parse(results[0].usercart);
  
        res.json(userCart);
      });
    } catch (error) {
      console.error('Error fetching user cart items:', error);
      res.status(500).json({ message: 'Error fetching user cart items' });
    }
  });

  app.post('/cart/:email/:pid', (req, res) => {
    const { email, pid } = req.params;
  
    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
      if (error) {
        console.error('Error retrieving user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const user = results[0];
      const userCart = JSON.parse(user.usercart);
  
      const productIndex = userCart.findIndex(item => item.productId == pid);
      if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found in user cart' });
      }
  
      userCart.splice(productIndex, 1);
      const updatedCart = JSON.stringify(userCart);
  
      db.query('UPDATE users SET usercart = ? WHERE email = ?', [updatedCart, email], (error, results) => {
        if (error) {
          console.error('Error updating user cart:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
  
        res.json({ message: 'Product removed from user cart' });
      });
    });
  });

  app.get('/movies', (req, res) => {
    const query = 'SELECT * FROM Movie';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching movies:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.status(200).json(results);
      }
    });
  });
  app.get('/theatres/:movieId', async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
       db.query('SELECT * FROM theatre_movie WHERE movie_id = ?', [movieId],(error,result)=>{
        res.json(result);
        if(error){
          console.log(error.message);
        }
       });
     
    } catch (error) {
      console.error('Error fetching theatres:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/theatre-details/:tid', (req, res) => {
    const tid = req.params.tid;
    const sql = 'SELECT * FROM theatre WHERE tid = ?';
    db.query(sql, [tid], (err, result) => {
      if (err) {
        console.error('Error fetching theater details:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (result.length > 0) {
          res.json(result[0]); // Send the first theater detail (assuming tid is unique)
        } else {
          res.status(404).json({ message: 'Theater not found' });
        }
      }
    });
  });
  
  app.get('/seats/:tid', (req, res) => {
    const tid = req.params.tid;
    const sql = 'SELECT * FROM room WHERE tid = ?';
    db.query(sql, [tid], (err, result) => {
      if (err) {
        console.error('Error fetching theater details:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        if (result.length > 0) {
          res.json(result[0]); 
        } else {
          res.status(404).json({ message: 'Theater not found' });
        }
      }
    });
  });
  
  app.post('/bookings', (req, res) => {
    try {
      const { theatreId, seats } = req.body;
  
      // Insert the booking details into the database
      const query = `INSERT INTO bookings (theatreId, seats) VALUES (?, ?)`;
      db.query(query, [theatreId, JSON.stringify(seats)], (err, result) => {
        if (err) {
          console.error('Error inserting booking into database:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        res.json({ message: 'Booking successful' });
      });
    } catch (error) {
      console.error('Error handling booking request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.post('/update-seat/:tid', (req, res) => {
    const { seat_row_index, seat_index } = req.body;
    const tid = req.params.tid;

    // Fetch the current JSON data from the database
    const selectSql = `
        SELECT available_seats
        FROM room
        WHERE tid = ?
    `;

    db.query(selectSql, [tid], (selectErr, selectResult) => {
        if (selectErr) {
            console.error('Error fetching available seats:', selectErr);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Check if any rows were returned
        if (selectResult.length === 0) {
            console.error('No rows returned for tid:', tid);
            res.status(404).json({ error: 'Theater not found' });
            return;
        }

        // Extract the JSON data from the result
        const jsonPath = `$.seats[${seat_row_index}][${seat_index}][1].available`;

        // Update the room table
        const updateSql = `
            UPDATE room
            SET available_seats = JSON_SET(
                available_seats, 
                '${jsonPath}', 
                false
            )
            WHERE tid = ?
        `;

        // Modify the availability of the specified seat in the JSON data
        // Update the modified JSON data back into the database
        db.query(updateSql, [parseInt(tid)], (updateErr, updateResult) => {
            if (updateErr) {
                console.error('Error updating seat availability:', updateErr);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }

            console.log('Seat availability updated successfully');

            // Notify all WebSocket clients about the seat booking
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ action: 'seat_booked', seatId: tid }));
                }
            });

            res.json({ message: 'Seat availability updated successfully' });
        });
    });
});





  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });