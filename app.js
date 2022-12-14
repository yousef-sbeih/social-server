require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ServerApiVersion = require("mongoose");
const PORT = process.env.PORT || 3000;

const cors = require("cors");
// require("dotenv").config();
// console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(cors());
const User = require("./models/user");
const session = require("express-session");
app.use(express.json());
app.use(express.urlencoded());

app.use(
  session({
    secret: "bla bla bla",
  })
);

const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
app.use("/user", userRouter);
app.use("/post", postRouter);
app.listen(PORT, () => {
  console.log("done");
});
