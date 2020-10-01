require('dotenv').config();
//express moduuli käyttöön:
const express = require('express');
const app = express();
// sallitaan yhteys eri domaineihin:
const cors = require('cors');
// loggeri nodeen:
const morgan = require('morgan');
// mongoosen model tietokantayhteyttä varten:
const Record = require('./models/record');

const { response, request } = require('express');

/*
let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1,
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2,
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3,
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4,
  },
];
*/
app.use(express.json());

app.use(cors());
app.use(express.static('build'));

morgan.token('req_body', (req, res) => JSON.stringify(req.body));

app.use(morgan('tiny', { skip: (req, res) => req.method === 'POST' }));

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :req_body',
    { skip: (req, res) => req.method !== 'POST' }
  )
);

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (request, response) => {
  // res.json(persons);
  Record.find({}).then((persons) => {
    response.json(persons);

    //result.forEach((note) => {
    //  console.log(`${note.name} ${note.number}`);
    //mongoose.connection.close();
  });
});

app.get('/api/persons/info', (req, res) => {
  res.send(
    `<div>Phonebook has info for ${persons.length} people</div>
        <div>${new Date()}</div>
        `
  );
});

app.get('/api/persons/:id', (request, response, next) => {
  Record.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
  // request on string, Notes-taulukon id on numero,
  // siksi muutetaan id numeroksi
  /*
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
  */
});

app.delete('/api/persons/:id', (request, response, next) => {
  Record.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
  //const id = Number(request.params.id);
  //persons = persons.filter((person) => person.id !== id);
  //response.status(204).end();
});

// Ei tarvita enää Mongon kanssa, joka generoi automaattisesti id:n
/*
const generateId = () => {
  const randomNumber = Math.floor(Math.random() * 10000);
  if (persons.find((person) => person.id === randomNumber)) {
    generateId();
  } else {
    return randomNumber;
  }
};
*/

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = new Record({
    name: body.name,
    number: body.number,
    // id: generateId(),
  });
  console.log(person);
  console.log(request.params.id);

  Record.findByIdAndUpdate(
    request.params.id,
    { number: person.number },
    { new: true }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response) => {
  const body = request.body;
  console.log('laittamassa uutta nimeä tietokantaan...');

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' });
  }
  /*
  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({ error: 'name must be unique' });
  }
*/
  const person = new Record({
    name: body.name,
    number: body.number,
    // id: generateId(),
  });
  console.log(person);
  //person.save((err, doc) => {
  //  err ? console.error(err) : console.log('Document inserted');
  //});

  person.save().then((newPerson) => {
    response.json(newPerson);
    console.log(newPerson);
    console.log('Name and number inserted into phonebook');

    //mongoose.connection.close();
  });

  //persons = persons.concat(person);
  //console.log(person);
  //response.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
