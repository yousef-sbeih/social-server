const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const { deleteFromArray } = require("../helper");
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: "author likes comments",
      })
      .populate({
        path: "comments",
        populate: { path: "author" },
      });

    res.status(200).json(posts);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
router.post("/", async (req, res) => {
  const { authorId, image, text } = req.body;
  const author = authorId;
  try {
    const post = new Post({ author, image, text });
    Post.populate(post, { path: "author" });
    const newPost = await post.save();
    const postedUser = await User.findOne({ _id: authorId });
    postedUser.posts.push(newPost);
    await postedUser.save();
    res.status(200).json(newPost);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
router.post("/like/:id", getPostById, async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    res.post.likes.unshift(user);
    await res.post.save();
    res.status(200).json(res.post);
  } catch {
    res.status(400).json({ message: "something went wrong" });
  }
});
router.post("/unlike/:id", getPostById, async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    res.post.likes = deleteFromArray(res.post.likes, "username", user.username);
    await res.post.save();
    res.status(200).json(res.post);
  } catch (e) {
    res.status(400).json({ message: "something went wrong" });
  }
});
router.post("/comment/:id", getPostById, async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    const comment = new Comment({ author: user, text: req.body.text });
    Comment.populate(comment, { path: "author" });
    let newComment = await comment.save();
    res.post.comments.unshift(newComment);
    await res.post.save();
    res.status(200).json(res.post);
  } catch (e) {
    res.status(400).json({ message: "something went wrong" });
  }
});
router.post("/:id/comment", getPostById, async (req, res, next) => {
  try {
    const comment = await Comment.findOne({ _id: req.body.commentId });
    res.post.comments = deleteFromArray(
      res.post.comments,
      "id",
      req.body.commentId
    );
    await res.post.save();
    await comment.delete();
    res.status(200).json(res.post);
  } catch (e) {
    res.status(400).json({ message: "something went wrong" });
  }
});
router.delete("/:id", getPostById, async (req, res, next) => {
  try {
    const post = await res.post.delete();
    res.status(200).json(post);
  } catch {
    res.status(400).json({ message: "something went wrong" });
  }
});
async function getPostById(req, res, next) {
  let post;
  try {
    post = await Post.findOne({ _id: req.params.id })
      .populate("likes comments author")
      .populate({
        path: "comments",
        populate: { path: "author" },
      });

    if (post == null) {
      return res.status(404).json({ message: "cannot find post" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.post = post;
  next();
}

module.exports = router;
