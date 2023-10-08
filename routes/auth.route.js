const express = require("express");
const CryptoJS = require("crypto-js");
const { check, body, validationResult } = require("express-validator");

const authService = require("../services/auth.service");
const db = require("../services/db.service");

const router = express.Router();

// login
router.post(
	"/login",
	///////////////////////////////////////////////// begin middleware /////////////////////////////////////////////////
	body("loginId").trim(),
	body("password").trim(),
	check("loginId").notEmpty().withMessage("Login ID required"),
	check("password").notEmpty().withMessage("Password ID required"),
	////////////////////////////////////////////////// end middleware //////////////////////////////////////////////////

	async (req, res) => {
		///////////////////////////////////////////// begin validation /////////////////////////////////////////////
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// return res
			// 	.status(200)
			// 	.json({ error: true, message: errors.array() });

			return res.status(200).json({
				error: true,
				message: "Login Falied, user ID or password error",
				devMsg: errors.array(),
			});
		}
		////////////////////////////////////////////// end validation //////////////////////////////////////////////

		try {
			//console.log(req.body);
			let user = await authService.login(
				req.body.loginId,
				req.body.password,
			);

			//console.log(user);
		
			if (user.error) {
				res.status(200).json({
					error: true,
					message: "Login Falied, user ID or password error",
					devMsg: [{ msg: user.message }],
				});
			} else {
				res.status(200).json({
					error: false,
					accessToken: user.accessToken,
					refreshToken: user.refreshToken,
					redirectUrl: user.redirect,
					message: "Login Successful",
					devMsg: [{ msg: "Login Successful" }],
				});
			}
		} catch (err) {
			res.status(200).json({
				error: true,
				message: "Login Falied, user ID or password error",
				devMsg: [{ msg: err }],
			});
		}
	},
);

// signup
router.post(
	"/signup",

	///////////////////////////////////////////////// begin middleware /////////////////////////////////////////////////
	body("user_name").trim(),
	body("email").trim().normalizeEmail(),
	body("password").trim(),
	check("user_name").notEmpty().withMessage("User name required"),
	check("email").notEmpty().withMessage("Email required"),
	check("email").isEmail().withMessage("Email formate is not valid"),
	check("password").notEmpty().withMessage("Password required"),
	////////////////////////////////////////////////// end middleware //////////////////////////////////////////////////
	async (req, res) => {
		let tmpRes;
		let user;

		const errors = validationResult(req);
		let validationErr = Array.from(errors.array(), (x) => {
			return { value: x.value, msg: x.msg, param: x.param };
		});

		///////////////////////////////////////////// begin validation /////////////////////////////////////////////

		/* if (!errors.isEmpty()) {
			return res.status(200).json({
				error: true,
				message: "SignUp Falied",
				validationErr:validationErr,
				devMsg: errors.array(),
			});
		} */

		tmpRes = await db.rowCount({
			table: "user",
			filter: { login_id: req.body.user_name },
		});

		if (tmpRes > 0) {
			validationErr.push({
				value: req.body.user_name,
				msg: "User ID already exist",
				param: "user_name",
			});
			/* return res.status(200).json({
				error: true,
				message: "User ID already exist",
				validationErr:validationErr,
				devMsg: [{ msg: "Login ID already exist" }],
			}); */
		}

		if (validationErr.length > 0) {
			return res.status(200).json({
				error: true,
				message: "SignUp Falied, validation error",
				validationErr: validationErr,
				devMsg: validationErr,
			});
		}
		////////////////////////////////////////////// end validation //////////////////////////////////////////////

		user = {
			login_id: req.body.user_name,
			user_name: req.body.user_name,
			email: req.body.email,
			password: req.body.password,
		};

		try {
			const result = await authService.signup(user);
			/* res.status(200).json({
				error: result.error,
				message: result.message,
			}); */
			if (result.error) {
				res.status(200).json({
					error: false,
					message: "SignUp failed",
					devMsg: [{ msg: result.message }],
				});
			} else {
				res.status(200).json({
					error: false,
					message: "SignUp Successful",
					devMsg: [{ msg: result.message }],
				});
			}
		} catch (err) {
			res.status(200).json({
				error: true,
				message: "SignUp Falied",
				devMsg: [{ msg: err }],
			});
		}
	},
);

// recover_password
router.post(
	"/recover_password",

	///////////////////////////////////////////////// begin middleware /////////////////////////////////////////////////
	body("login_id").trim(),
	body("email").trim().normalizeEmail(),
	check("login_id").notEmpty().withMessage("User name required"),
	check("email").notEmpty().withMessage("Email required"),
	check("email").isEmail().withMessage("Email formate is not valid"),
	////////////////////////////////////////////////// end middleware //////////////////////////////////////////////////
	async (req, res) => {
		let tmpRes;
		let user;

		const errors = validationResult(req);
		let validationErr = Array.from(errors.array(), (x) => {
			return { value: x.value, msg: x.msg, param: x.param };
		});

		///////////////////////////////////////////// begin validation /////////////////////////////////////////////

		tmpRes = await db.rowCount({
			table: "user",
			filter: {
				login_id: req.body.login_id,
				email: req.body.email,
				is_active: 1,
				is_delete: 0,
			},
		});

		if (tmpRes == 0) {
			validationErr.push({
				value: req.body.login_id,
				msg: "Login ID Not exist",
				param: "login_id",
			});
		}

		if (validationErr.length > 0) {
			return res.status(200).json({
				error: true,
				message: "Recover password Falied, validation error",
				validationErr: validationErr,
				devMsg: validationErr,
			});
		}

		////////////////////////////////////////////// end validation //////////////////////////////////////////////

		user = await db.getRow({
			table: "user",
			filter: {
				login_id: req.body.login_id,
				email: req.body.email,
				is_active: 1,
				is_delete: 0,
			},
		});

		try {
			const result = await authService.recoverPasswordEmailLink(user);
			if (result.error) {
				res.status(200).json({
					error: false,
					message: "Recover password failed",
					devMsg: [{ msg: result.message }],
				});
			} else {
				res.status(200).json({
					error: false,
					message: "recover password Successful, check your email",
					devMsg: [{ msg: result.message }],
				});
			}
		} catch (err) {
			res.status(200).json({
				error: true,
				message: "Recover password falied",
				devMsg: [{ msg: err }],
			});
		}
	},
);

// reset_password
router.post(
	"/reset_password",

	///////////////////////////////////////////////// begin middleware /////////////////////////////////////////////////
	body("new_password").trim(),
	check("new_password").notEmpty().withMessage("New password required"),
	body("confirm_new_password").trim(),
	check("confirm_new_password")
		.notEmpty()
		.withMessage("Confirm new password required"),
	////////////////////////////////////////////////// end middleware //////////////////////////////////////////////////
	async (req, res) => {
		let tmpRes;

		const errors = validationResult(req);
		let validationErr = Array.from(errors.array(), (x) => {
			return { value: x.value, msg: x.msg, param: x.param };
		});

		///////////////////////////////////////////// begin validation /////////////////////////////////////////////

		const token = CryptoJS.AES.decrypt(
			req.body.token,
			process.env.SECURITY_PRIVATE_KEY,
		).toString(CryptoJS.enc.Utf8);

		const tokenJSON = JSON.parse(token);
		const userId = tokenJSON.userId;

		tmpRes = await db.rowCount({
			table: "user",
			filter: {
				id: userId,
				is_active: 1,
				is_delete: 0,
			},
		});

		if (tmpRes == 0) {
			validationErr.push({
				value: req.body.token,
				msg: "User Not exist",
				param: "token",
			});
		}

		if (validationErr.length > 0) {
			return res.status(200).json({
				error: true,
				message: "Reset password Falied, validation error",
				validationErr: validationErr,
				devMsg: validationErr,
			});
		}

		////////////////////////////////////////////// end validation //////////////////////////////////////////////

		const new_password = req.body.new_password;

		try {
			const result = await authService.changePassword(userId, new_password);
			if (result.error) {
				res.status(200).json({
					error: false,
					message: "Reset password failed",
					devMsg: [{ msg: result.message }],
				});
			} else {
				res.status(200).json({
					error: false,
					message: "Reset password Successful",
					devMsg: [{ msg: result.message }],
				});
			}
		} catch (err) {
			res.status(200).json({
				error: true,
				message: "Reset password falied",
				devMsg: [{ msg: err }],
			});
		} 
	},
);

// test
router.get(
	"/test",
	///////////////////////////////////////////////// begin middleware /////////////////////////////////////////////////

	////////////////////////////////////////////////// end middleware //////////////////////////////////////////////////

	async (req, res) => {
		///////////////////////////////////////////// begin validation /////////////////////////////////////////////

		////////////////////////////////////////////// end validation //////////////////////////////////////////////

		try {
			let obj = {
				table: "user",
				filter: {
					"id >": 11,
					"id <=": 111111,
				},
			};

			const result = await db.getRows(obj);
			if (result) {
				res.status(200).json(result);
			} else {
				res.status(200).json({
					error: true,
					message: "error 1",
					devMsg: [{ msg: "authService return false" }],
				});
			}
		} catch (err) {
			res.status(200).json({
				error: true,
				message: "error 2",
				devMsg: [{ msg: err }],
			});
		}
	},
);

module.exports = router;
