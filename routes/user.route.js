const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

const { auth, userRoleCheck } = require("../middlewares/auth.middleware.js");
/* 
router.get("/details", authMiddleware, (req, res) => {
	res.status(200).json({
		message: "user authenticated.",
		user: req.user.id,
	});
}); 
*/
router.use(auth);
router.use(userRoleCheck);
// router.use(roleCheck({ type: "user" }));
router.get("/", userController.userData);

// router.post('/', userController.create);

// router.put('/:id', userController.update);

// router.delete('/:id', userController.remove);

module.exports = router;
