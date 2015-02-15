var mongoose = require('mongoose');
var async = require('async');
var connect = require('./../modules/connect');

var User = mongoose.model('User');

module.exports = function(data) {
  console.log(data);
  var db = mongoose.connection;

  db.once('open', function(callback) {
    var user = new User(data);

    user.save(function(err) {
      if(err) return console.error(err);
    });
  });
};