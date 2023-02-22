require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
const url = process.env.MONGODB_URI;
console.log('connecting to MongoDB');

mongoose
  .connect(url)
  .then(() => console.log('successfully connected to MongoDB'))
  .catch((error) => console.log(`error connecting to MongoDB: ${error}`));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  number: {
    type: String,
    minlength: 8,
    validate: {
      validator: (v) => /^(\d*-?)*\d+$/.test(v),
    },
  },
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Person', personSchema);
