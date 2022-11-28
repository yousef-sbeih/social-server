const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { deleteFromArray } = require("../helper");
const jwt = require("jsonwebtoken");
router.get("/", async (req, res) => {
  const token = req.body.token;
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (e) {
    res.status(400).json({ message: "something went wrong" });
  }
});
router.get("/:username", getUserByUsername, async (req, res, next) => {
  res.send(res.user);
});

router.post("/register", async (req, res) => {
  try {
    const { email, username, fullname, password, description, profilePicture } =
      req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      fullname,
      username,
      profilePicture,
      description,
      hashedPassword,
    });
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (isMatch === true) {
      const { hashedPassword, ...rest } = user;
      jwt.sign({ user: user }, "secretKey", (err, token) => {
        res.json({ token: token });
      });
    } else {
      res.status(403).json({ message: "wrong  password" });
    }
  } else {
    res.status(403).json({ message: "wrong email " });
  }
});
router.post(
  "/unfollow/:username",
  getUserByUsername,
  async (req, res, next) => {
    try {
      let follower = await User.findOne({
        username: req.body.username,
      }).populate("following followers");
      res.user.followers = deleteFromArray(
        res.user.followers,
        "username",
        req.body.username
      );

      follower.following = deleteFromArray(
        follower.following,
        "username",
        res.user.username
      );
      await res.user.save();
      await follower.save();
      res.status(200).json(res.user);
    } catch (e) {
      res.status(403).json({ message: "something went wrong" });
    }
  }
);
router.post("/follow/:username", getUserByUsername, async (req, res, next) => {
  try {
    let follower = await User.findOne({ username: req.body.username });
    res.user.followers.push(follower);
    follower.following.push(res.user);
    await res.user.save();
    await follower.save();
    res.status(200).json(res.user);
  } catch (e) {
    res.status(403).json({ message: "something went wrong" });
  }
});

async function getUserByUsername(req, res, next) {
  let user;
  try {
    user = await User.findOne({ username: req.params.username }).populate(
      "following followers posts"
    );

    if (user == null) {
      return res.status(404).json({ message: "cannot find image" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.user = user;
  next();
}
module.exports = router;
