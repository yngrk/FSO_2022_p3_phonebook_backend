const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const Person = require('./models/person');

app.use(express.static('build'));
app.use(express.json());
app.use(
  morgan((tokens, req, res) => [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
    JSON.stringify(req.body),
  ].join(' ')),
);
app.use(cors());

// GET INFO PAGE
app.get('/info', (request, response) => {
  const date = new Date();
  Person.find({}).then((persons) => {
    const len = persons.length;
    response.send(`
    <p>Phonebook has info for ${len} people</p>
    <p>${date}</p>
  `);
  });
});

// GET PERSONS LIST
app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

// GET PERSON ID
app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

// ADD PERSON
app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body;
  if (name === undefined) {
    return response.status(400).json({ error: 'name is missing' });
  }

  const person = new Person({
    name,
    number,
  });

  return person
    .save()
    .then((savedPerson) => response.json(savedPerson))
    .catch((error) => next(error));
});

// DELETE PERSON BY ID
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => response.status(204).end())
    .catch((error) => next(error));
});

// UPDATE PERSON
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }

  next(error);
  return null;
};
app.use(errorHandler);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
