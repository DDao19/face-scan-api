import express from "express";
import bcrypt from "bcrypt-nodejs";
import cors from "cors";

const app = express();
const PORT = 3001;

const database = {
  users: [
    {
      id: "1",
      name: "John",
      email: "john@email.com",
      password: "john",
      entries: 0,
      joined: new Date(),
    },
    {
      id: "2",
      name: "Sally",
      email: "sally@email.com",
      password: "sally",
      entries: 0,
      joined: new Date(),
    },
  ],
};

// Middleware
app.use(express.json());
app.use(cors()); // handles CORS error
// ROOT ROUTE
app.get("/", (req, res) => {
  res.send(database.users);
});
// SIGN IN
app.post("/signin", (req, res) => {
  if (
    req.body.email === database.users[0].email &&
    req.body.password === database.users[0].password
  ) {
    res.json("success");
  } else {
    res.status(400).json("error logging in");
  }
});
// REGISTER
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  database.users.push({
    id: 3,
    name,
    email,
    entries: 0,
    joined: new Date(),
  });
  const allUsers = database.users.length;
  res.json(database.users[allUsers - 1]);
});

// PROFILE/ID
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  let found = false;
  database.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  });
  if (!found) {
    return res.status(400).json("Sorry, user not found...");
  }
});
// IMAGE
app.put("/image", (req, res) => {
  const { id } = req.body;
  let found = false;
  database.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) {
    return res.status(400).json("not found...");
  }
});

app.listen(PORT, () => {
  console.log(`App is running on Port: ${PORT}`);
});
