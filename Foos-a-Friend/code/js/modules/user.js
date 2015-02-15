var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  firstName : String,
  lastName : String,
  nickName : String,
  avatar : String,
  email : String,
  wins : Number,
  loses : Number,
  gamesPlayed : Number
});

var User = module.exports = mongoose.model('User', userSchema);