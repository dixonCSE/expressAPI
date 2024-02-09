const db = require("../services/db.service");
const helper = require("../utils/dbHelper.util");

const userBalance = async (req, res, next) => {
	try {
		res.json(await user.get(req.user.id));
	} catch (err) {
		next(err);
	}
};


module.exports = {
	userBalance
};
