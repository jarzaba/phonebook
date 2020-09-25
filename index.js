//express moduuli käyttöön:
const express = require('express');
const app = express();
const cors = require('cors');

const morgan = require('morgan');

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

app.use(express.json());

app.use(cors());

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
app.get('/api/persons', (req, res) => {
  res.json(persons);
});
app.get('/api/persons/info', (req, res) => {
  res.send(
    `<div>Phonebook has info for ${persons.length} people</div>
        <div>${new Date()}</div>
        `
  );
});

app.get('/api/persons/:id', (request, response) => {
  // request on string, Notes-taulukon id on numero,
  // siksi muutetaan id numeroksi
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

const generateId = () => {
  const randomNumber = Math.floor(Math.random() * 10000);
  if (persons.find((person) => person.id === randomNumber)) {
    generateId();
  } else {
    return randomNumber;
  }
};

app.post('/api/persons', (request, response) => {
  const body = request.body;
  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' });
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({ error: 'name must be unique' });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);
  console.log(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
