require('dotenv').config();
const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

/*
if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}
const password = process.argv[2];
const url = `mongodb+srv://jarkko:${password}@klusteri.b8frz.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`;
*/

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  date: Date,
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Record = mongoose.model('Record', personSchema);

if (process.argv.length === 5) {
  const record = new Record({
    name: process.argv[3],
    number: process.argv[4],
    date: new Date(),
  });

  record.save().then((response) => {
    console.log('note saved');
    mongoose.connection.close();
  });
}

if (process.argv.length === 3) {
  Record.find({}).then((result) => {
    console.log('Phonebook:');

    result.forEach((note) => {
      console.log(`${note.name} ${note.number}`);
    });
    mongoose.connection.close();
  });
}
