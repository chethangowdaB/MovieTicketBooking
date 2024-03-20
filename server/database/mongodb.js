const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  usercart:{
    type: Array
  },
 
});

const User = mongoose.model('Login', userSchema);
module.exports = {User};
