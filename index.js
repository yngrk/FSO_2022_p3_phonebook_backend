const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/person");

app.use(express.json());
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body),
    ].join(" ");
  })
);
app.use(cors());
app.use(express.static("build"));

// GET INFO PAGE
app.get("/info", (request, response) => {
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
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

// GET PERSON ID
app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

// POST PERSON
app.post("/api/persons", (request, response) => {
  const body = request.body;
  if (body.name === undefined)
    return response.status(400).json({ error: "name is missing" });

  const person = new Person({
    name: body.name,
    number: body.number || "",
  });

  person.save().then((savedPerson) => response.json(savedPerson));
});

// DELETE PERSON BY ID
app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndRemove(request.params.id).then((removedPerson) => {
    response.json(removedPerson);
  });
});

// app.post("/api/persons", (request, response) => {
//   const body = request.body;
//   console.log(body);

//   if (!body.name) return response.status(400).json({ error: "name missing" });
//   if (persons.find((p) => p.name === body.name))
//     return response.status(400).json({ error: "name must be unique" });

//   const newPerson = {
//     id: genRandomID(),
//     name: body.name,
//     number: body.number || "",
//   };

//   persons = [...persons, newPerson];
//   response.status(201).json(newPerson);
// });

// app.get("/info", (request, response) => {
//   const date = new Date();
//   const len = persons.length;
//   response.send(`
//     <p>Phonebook has info for ${len} people</p>
//     <p>${date}</p>
//   `);
// });

// app.get("/api/persons/:id", (request, response) => {
//   const id = Number(request.params.id);
//   const person = persons.find((p) => p.id === id);
//   if (person) response.json(person);
//   else response.status(404).end();
// });

// app.get("/api/persons", (request, response) => {
//   response.json(persons);
// });

// app.delete("/api/persons/:id", (request, response) => {
//   const id = Number(request.params.id);
//   const index = persons.findIndex((p) => p.id === id);

//   if (index === -1) response.status(404).end();

//   persons.splice(index, 1);
//   response.status(204).end();
// });

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
