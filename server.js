import express from "express";
import bcrypt from "bcrypt-nodejs";
import cors from "cors";
import knex from "knex"; // using Knex.js to connect our server to our DB

// Configuration Obj for Knex
const db = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABSE_URL,
    ssl: true,
  },
});

const app = express();
const PORT2 = 3001;

// Middleware
app.use(express.json());
app.use(cors()); // handles CORS error

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Success!");
});
// SIGN IN
app.post("/signin", (req, res) => {
  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then((data) => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(400).json("Unable to get user"));
      } else {
        res.status(400).json("Wrong credentials");
      }
    })
    .catch((err) => res.status(400).json("Wrong credentials"));
});
// REGISTER
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password); //hashing password

  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            name: name,
            email: loginEmail[0],
            joined: new Date(),
          })
          .then((user) => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("unable to register"));
});

// PROFILE/ID
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;

  db.select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("User not found..");
      }
    })
    .catch((err) => res.status(400).json("Error getting user.."));
});
// IMAGE
app.put("/image", (req, res) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => res.json(entries[0]))
    .catch((err) => res.status(400).json("Unable to get entries"));
});

app.listen(process.env.PORT || PORT2, () => {
  console.log(`App is running on Port: ${process.env.PORT}`);
});
