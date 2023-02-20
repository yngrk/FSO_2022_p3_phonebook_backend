const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;

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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const genRandomID = () => {
  let random;
  do {
    random = Math.random() * 1000;
  } while (persons.find((p) => p.id === random));
  return Number(random.toFixed(0));
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  console.log(body);

  if (!body.name) return response.status(400).json({ error: "name missing" });
  if (persons.find((p) => p.name === body.name))
    return response.status(400).json({ error: "name must be unique" });

  const newPerson = {
    id: genRandomID(),
    name: body.name,
    number: body.number || "",
  };

  persons = [...persons, newPerson];
  response.status(201).json(newPerson);
});

app.get("/info", (request, response) => {
  const date = new Date();
  const len = persons.length;
  response.send(`
    <p>Phonebook has info for ${len} people</p>
    <p>${date}</p>
  `);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (person) response.json(person);
  else response.status(404).end();
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const index = persons.findIndex((p) => p.id === id);

  if (index === -1) response.status(404).end();

  persons.splice(index, 1);
  response.status(204).end();
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
