const express = require("express");
const router = express.Router();

const postController = require("../controllers/postController");
const validations = require("./validations");

router.get("/topics/:topicId/posts/new", postController.new);
router.post(
  "/topics/:topicId/posts/create",
  validations.validatePosts,
  postController.create
);
router.get("/topics/:topicId/posts/:id", postController.show);
router.post("/topics/:topicId/posts/:id/destroy", postController.destroy);
router.get("/topics/:topicId/posts/:id/edit", postController.edit);
router.post(
  "/topics/:topicId/posts/:id/update",
  validations.validatePosts,
  postController.update
);

module.exports = router;
