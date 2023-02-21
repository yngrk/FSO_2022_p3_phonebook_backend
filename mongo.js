const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("err: require password");
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://yngrk:${password}@cluster0.aeqrq6y.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

// GET ALL ENTRIES
if (process.argv.length < 4) {
  Person.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
    process.exit(0);
  });
} else {
  // ADD NEW PERSON
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4] || "",
  });

  person.save().then((result) => {
    console.log(
      `added ${process.argv[3]} number ${process.argv[4] || "N/A"} to phonebook`
    );
    mongoose.connection.close();
  });
}
