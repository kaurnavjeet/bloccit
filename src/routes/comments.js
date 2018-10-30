const express = require("express");
const router = express.Router();

const commentController = require("../controllers/commentController");
const validations = require("./validations");

router.post(
  "/topics/:topicId/posts/:postId/comments/create",
  validations.validateComments,
  commentController.create
);

router.post(
  "/topics/:topicId/posts/:postId/comments/:id/destroy",
  commentController.destroy
);

module.exports = router;
