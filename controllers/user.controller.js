const db = require("../services/db.service");
const helper = require("../utils/dbHelper.util");

const get = async (req, res, next) => {
	try {
		res.json(await user.get(req.user.id));
	} catch (err) {
		next(err);
	}
};

/* const xuserData = async (req, res, next) => {
	id = req.user.id;
	const rows = await db.query(
		`
			SELECT 
				user.id AS id,
				user.user_name AS user_name,
				user.last_name AS last_name,
				user.first_name AS first_name,
				user.email AS email,
				user.phone AS phone,
				user.image AS image,
				user.image_thumb AS image_thumb,
				user.city AS city,
				user.state AS state,
				user.zip AS zip,
				user.address_1 AS address_1,
				user.address_2 AS address_2,

				country.id AS country__id,
				country.iso3 AS country__iso3,
				country.flag_image AS country__flag_image,
				country.currency AS country__currency,

				user.user_role__id AS user_role__id,
				user_role.name AS user_role__name,
				user_role.key_code AS user_role__key_code,
				user_role.view_panel AS user_role__view_panel,

				user_extend.placement AS user_extend__placement, 

				reference.id AS reference__id, 
				reference.last_name AS reference__last_name,  
				reference.first_name AS reference__first_name,  
				reference.user_name AS reference__user_name,  
				reference.email AS reference__email,  
				reference.phone AS reference__phone, 
				reference.image_thumb AS reference__image_thumb, 

				parent.id AS parent__id, 
				parent.last_name AS parent__last_name,  
				parent.first_name AS parent__first_name,  
				parent.user_name AS parent__user_name,  
				parent.email AS parent__email,  
				parent.phone AS parent__phone, 
				parent.image_thumb AS parent__image_thumb,  

				agent.id AS agent__id, 
				agent.last_name AS agent__last_name,  
				agent.first_name AS agent__first_name,  
				agent.user_name AS agent__user_name,  
				agent.email AS agent__email,  
				agent.phone AS agent__phone, 
				agent.image_thumb AS agent__image_thumb, 

				(
					SELECT COUNT(*) FROM user_extend WHERE user_extend.reference__id = user.id
				) AS refer_count,
				(
					SELECT COUNT(*) FROM user_extend WHERE user_extend.parent__id = user.id
				) AS child_count
			FROM 
				user AS user
			LEFT JOIN
				country AS country ON country.id = user.country__id
			LEFT JOIN
				user_role AS user_role ON user_role.id = user.user_role__id
			LEFT JOIN
				user_extend AS user_extend ON user_extend.user__id = user.id
			LEFT JOIN
				user AS reference ON reference.id = user_extend.reference__id
			LEFT JOIN
				user AS parent ON parent.id = user_extend.parent__id
			LEFT JOIN
				user AS agent ON agent.id = user_extend.agent__id
			WHERE
			user.id = ?
		`,
		[id],
	);
	const data = await rows[0];

	try {
		// res.json(await data);

		res.status(200).json({
			error: false,
			logout: false,
			data: await data,
			message: "Access granted",
		});
	} catch (err) {
		next(err);
	}
}; */

const userData = async (req, res, next) => {
	id = req.user.id;
	const rows = await db.query(
		`
			SELECT 
				user.id AS id,
				user.user_name AS user_name,
				user.last_name AS last_name,
				user.first_name AS first_name,
				user.email AS email,
				user.phone AS phone,
				user.image AS image,

				user.user_role__id AS user_role__id,
				user_role.name AS user_role__name,
				user_role.key_code AS user_role__key_code,
				user_role.view_panel AS user_role__view_panel
			FROM 
				user AS user
				LEFT JOIN
				user_role AS user_role ON user_role.id = user.user_role__id
			WHERE
				user.id = ?
		`,
		[id],
	);
	const data = await rows[0];

	try {
		// res.json(await data);

		res.status(200).json({
			error: false,
			logout: false,
			data: await data,
			message: "Access granted",
		});
	} catch (err) {
		next(err);
	}
};

const gets = async (req, res, next) => {
	try {
		res.json(await user.gets(req.query.page));
	} catch (err) {
		next(err);
	}
};

async function create(req, res, next) {
	try {
		res.json(await user.insert(req.body));
	} catch (err) {
		next(err);
	}
}

async function update(req, res, next) {
	try {
		res.json(await user.update(req.params.id, req.body));
	} catch (err) {
		next(err);
	}
}

async function remove(req, res, next) {
	try {
		res.json(await user.remove(req.params.id));
	} catch (err) {
		next(err);
	}
}

module.exports = {
	get,
	userData,
	gets,
	create,
	update,
	remove,
};
