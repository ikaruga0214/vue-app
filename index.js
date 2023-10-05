import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "./model/User.js";
import Item from "./model/Item.js";

import subscriberRouter from "./routes/subscribers.js";
import protectRouter from "./routes/protect.js";



const app = express();
app.use(cors());

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }).then(() => {
  // Item.insertMany(data1);
});
const db = mongoose.connection;

db.on("error", (error) => console.error(error));

db.once("open", () => console.log("Connected to Database"));

app.use(express.json());

app.use("/subscribers", subscriberRouter);

app.use("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.use("/protect", protectRouter);

// app.use("/login", async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     const deUser = await bcrypt.compare(req.body.password, user.password);
//     if (!deUser) {
//       return res.status(400).json({ message: "Passwords does not match" });
//     }

//     const token = jwt.sign(
//       { userId: user._id, userEmail: user.email },
//       "secrets"
//     );

//     res
//       .status(200)
//       .send({ message: "Login successful", email: user.email, token });
//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// });

app.use("/login", async (req, res) => {
  try {
    const userIsExisted = await User.findOne({ email: req.body.email });
    if (!userIsExisted) {
      try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
          email: req.body.email,
          password: hashedPassword,
        });
        await user.save();
        res.status(201).json(user);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    } else {
      const existedUser = await bcrypt.compare(
        req.body.password,
        userIsExisted.password
      );
      if (!existedUser) {
        return res.status(400).json({ message: "Passwords does not match" });
      }

      const token = jwt.sign(
        { userId: userIsExisted._id, userEmail: userIsExisted.email },
        "secrets"
      );

      res.status(200).json({
        message: "Login successful",
        email: userIsExisted.email,
        token,
      });
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

app.listen(3001, () => console.log("Server is started!"));

// app.get("/", (req, res) => {
//   res.send("HELLO WORLD!");
// });

// app.get("/go", (req, res) => {
//   res.send("GOOOO!!!!");
// });

// app.use(express.static("public"));
