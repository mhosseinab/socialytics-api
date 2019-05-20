const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:17017/socialytics', {
  useCreateIndex: true,
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('mongoose connected!'));

module.exports = mongoose;