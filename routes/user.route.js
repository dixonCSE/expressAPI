const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

const { auth, roleCheck } = require("../middlewares/auth.middleware.js");


router.use(auth);
router.use(roleCheck('user'));

router.get("/", userController.userData);


module.exports = router;
