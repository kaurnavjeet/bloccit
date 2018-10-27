const express = require("express");
const router = express.Router();
const topicController = require("../controllers/topicController");
const validations = require("./validations");

router.get("/topics", topicController.index);
router.get("/topics/new", topicController.new);
router.post(
  "/topics/create",
  validations.validateTopics,
  topicController.create
);
router.get("/topics/:id", topicController.show);
router.post("/topics/:id/destroy", topicController.destroy);
router.get("/topics/:id/edit", topicController.edit);
router.post(
  "/topics/:id/update",
  validations.validateTopics,
  topicController.update
);

module.exports = router;
