const express = require("express");
const router = express.Router();
const validations = require("./validations");

const userController = require("../controllers/userController");

router.get("/users/sign_up", userController.signUp);
router.post("/users", validations.validateUsers, userController.create);
router.get("/users/sign_in", userController.signInForm);
router.post("/users/sign_in", validations.validateUsers, userController.signIn);
router.get("/users/sign_out", userController.signOut);

module.exports = router;
