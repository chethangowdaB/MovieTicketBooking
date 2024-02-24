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
  uploadeditem :{
    type: Array
  }
});
const Product= new mongoose.Schema({
  name:{
    type: String,
    required:true
  },
  items:{
    type:Array
  }
})
const User = mongoose.model('Login', userSchema);
const Products= mongoose.model('Product', Product);
module.exports = {User, Products};
