const mysql_promise = require("mysql2/promise");
const mysql2 = require("mysql2");
const dbConfig = require("../configs/db.config");

let filter = false;
let searchKey = false;
let searchCol = false;
let sortCol = "id";
let sortDir = "desc";
let offset = 0;
let limit = 100;

const query = async (sql, params) => {
	const connection = await mysql_promise.createConnection(dbConfig);
	const [results] = await connection.execute(sql, params);

	return results;
};

const dbTransaction = (sqlArr) => {
	return new Promise((resolve, reject) => {
		const connection = mysql2.createConnection(dbConfig);
		connection.connect();
		if (sqlArr.length > 0) {
			let sqltxt = "START TRANSACTION; " + sqlArr.join(" ") + " COMMIT;";
			connection.query(sqltxt, function (error, results, fields) {
				if (error) {
					connection.end();
					reject(false);
				} else {
					connection.end();
					resolve(true);
				}
			});
		} else {
			connection.end();
			resolve(true);
		}
	});
};

const getRow = async (config) => {  // table:string, filter:obj , searchKey:string , searchCol:obj 
	let sqlStr = "";
	let i = 0;
	let fType;
	fType = typeof config.filter;

	sqlStr += `SELECT * FROM \`${config.table}\` `;

	if (fType == "number" || fType == "string") {
		sqlStr += ` WHERE `;
		sqlStr += ` \`id\` = '${config.filter}' `;
	} else {
		if (config.filter && Object.keys(config.filter).length > 0) {
			sqlStr += ` WHERE `;
			i = 0;
			for (const [key, value] of Object.entries(config.filter)) {
				if (i == 0) {
				} else {
					sqlStr += ` AND `;
				}

				tmpType = typeof value;
				if (tmpType == "object" && Array.isArray(value)) {
					if (Array.isArray(value)) {
						sqlStr += ` \`${key}\` IN ( `;
						value.forEach((element, index) => {
							if (index == 0) {
								sqlStr += `'${element}' `;
							} else {
								sqlStr += `, '${element}' `;
							}
						});
						sqlStr += ` ) `;
					}
				} else {
					const con = key.split(' ');
					if ( con[1] == undefined ) {
						sqlStr += ` \`${key}\` = '${value}' `;
					} else {
						sqlStr += ` \`${con[0]}\` ${con[1]} '${value}' `;
					}
				}
				i++;
			}
		}

		if (config.searchKey && config.searchCol && config.searchCol.length > 0) {
			if (config.filter && Object.keys(config.filter).length > 0) {
				sqlStr += ` AND ( `;
			} else {
				sqlStr += ` WHERE `;
			}

			i = 0;
			config.searchCol.forEach((value, key) => {
				if (i == 0) {
					sqlStr += ` \`${value}\` LIKE '%${config.searchKey}$%' `;
				} else {
					sqlStr += ` OR \`${value}\` LIKE '%${config.searchKey}$%' `;
				}
				i++;
			});

			if (config.filter && Object.keys(config.filter).length > 0) {
				sqlStr += ` ) `;
			}
		}
	}

	sqlStr += ` LIMIT 1 OFFSET 0 `;

	const connection = await mysql_promise.createConnection(dbConfig);
	const [results] = await connection.execute(sqlStr, []);

	if (results.length > 0) {
		return results[0];
	} else {
		return false;
	}
};

const getRows = async (config) => {   // table:string, filter:obj, searchKey:string, searchCol:obj, sortCol:string, sortDir:string, offset:num, limit:num 
	let sqlStr = "";
	let i = 0;
	let fType;
	let tmpType;
	fType = typeof config.filter;

	filter = config.filter || false;
	searchKey = config.searchKey || false;
	searchCol = config.searchCol || false;
	sortCol = config.sortCol || sortCol;
	sortDir = config.sortDir || sortDir;
	offset = config.offset || offset;
	limit = config.limit || limit;

	sqlStr += `SELECT * FROM \`${config.table}\` `;

	if (fType == "number" || fType == "string") {
		sqlStr += ` WHERE `;
		sqlStr += ` \`id\` = '${config.filter}' `;
	} else {
		if (filter && Object.keys(filter).length > 0) {
			sqlStr += ` WHERE `;
			i = 0;
			for (const [key, value] of Object.entries(filter)) {
				if (i == 0) {
				} else {
					sqlStr += ` AND `;
				}

				tmpType = typeof value;
				if (tmpType == "object" && Array.isArray(value)) {
					if (Array.isArray(value)) {
						sqlStr += ` \`${key}\` IN ( `;
						value.forEach((element, index) => {
							if (index == 0) {
								sqlStr += `'${element}' `;
							} else {
								sqlStr += `, '${element}' `;
							}
						});
						sqlStr += ` ) `;
					}
				} else {
					const con = key.split(' ');
					if ( con[1] == undefined ) {
						sqlStr += ` \`${key}\` = '${value}' `;
					} else {
						sqlStr += ` \`${con[0]}\` ${con[1]} '${value}' `;
					}
				}
				i++;
			}
		}

		if (searchKey && searchCol && searchCol.length > 0) {
			if (filter && Object.keys(filter).length > 0) {
				sqlStr += ` AND ( `;
			} else {
				sqlStr += ` WHERE `;
			}

			i = 0;
			searchCol.forEach((value, key) => {
				if (i == 0) {
					sqlStr += ` \`${value}\` LIKE '%${searchKey}$%' `;
				} else {
					sqlStr += ` OR \`${value}\` LIKE '%${searchKey}$%' `;
				}
				i++;
			});

			if (filter && Object.keys(filter).length > 0) {
				sqlStr += ` ) `;
			} else {
			}
		}
	}

	sqlStr += ` ORDER BY ${sortCol} ${sortDir} `;

	sqlStr += ` LIMIT ${limit} OFFSET ${offset} `;

	const connection = await mysql_promise.createConnection(dbConfig);
	const [results] = await connection.execute(sqlStr, []);

	return results;
};

const insertRow = async (config) => {
	let sqlStr = "";
	let i = 0;

	sqlStr += `INSERT INTO \`${config.table}\` ( `;

	if (config.data && Object.keys(config.data).length > 0) {
		i = 0;
		for (const [key, value] of Object.entries(config.data)) {
			if (i == 0) {
				sqlStr += ` \`${key}\``;
			} else {
				sqlStr += `, \`${key}\``;
			}
			i++;
		}
	}
	sqlStr += ` ) VALUES ( `;

	if (config.data && Object.keys(config.data).length > 0) {
		i = 0;
		for (const [key, value] of Object.entries(config.data)) {
			if (i == 0) {
				sqlStr += `'${value}'`;
			} else {
				sqlStr += `, '${value}'`;
			}
			i++;
		}
	}
	sqlStr += ` ) `;


	const connection = await mysql_promise.createConnection(dbConfig);
	const [results] = await connection.execute(sqlStr, []);

	if (results.affectedRows > 0) return true;
	return false;
};

const updateRow = async (config) => {
	let sqlStr = "";
	let i = 0;
	let fType;
	fType = typeof config.filter;

	sqlStr += `UPDATE \`${config.table}\` SET `;

	if (config.col && Object.keys(config.col).length > 0) {
		i = 0;
		for (const [key, value] of Object.entries(config.col)) {
			if (i == 0) {
				sqlStr += ` \`${key}\` = '${value}' `;
			} else {
				sqlStr += ` , \`${key}\` = '${value}' `;
			}
			i++;
		}
	}

	if (fType == "number" || fType == "string") {
		sqlStr += ` WHERE `;
		sqlStr += ` \`id\` = '${config.filter}' `;
	} else {
		if (config.filter && Object.keys(config.filter).length > 0) {
			sqlStr += ` WHERE `;
			i = 0;
			for (const [key, value] of Object.entries(config.filter)) {
				if (i == 0) {
				} else {
					sqlStr += ` AND `;
				}

				tmpType = typeof value;
				if (tmpType == "object" && Array.isArray(value)) {
					if (Array.isArray(value)) {
						sqlStr += ` \`${key}\` IN ( `;
						value.forEach((element, index) => {
							if (index == 0) {
								sqlStr += `'${element}' `;
							} else {
								sqlStr += `, '${element}' `;
							}
						});
						sqlStr += ` ) `;
					}
				} else {
					const con = key.split(' ');
					if ( con[1] == undefined ) {
						sqlStr += ` \`${key}\` = '${value}' `;
					} else {
						sqlStr += ` \`${con[0]}\` ${con[1]} '${value}' `;
					}
				}
				i++;
			}
		}

		if (config.searchKey && config.searchCol && config.searchCol.length > 0) {
			if (config.filter && Object.keys(config.filter).length > 0) {
				sqlStr += ` AND ( `;
			} else {
				sqlStr += ` WHERE `;
			}

			i = 0;
			config.searchCol.forEach((value, key) => {
				if (i == 0) {
					sqlStr += ` \`${value}\` LIKE '%${config.searchKey}$%' `;
				} else {
					sqlStr += ` OR \`${value}\` LIKE '%${config.searchKey}$%' `;
				}
				i++;
			});

			if (config.filter && Object.keys(config.filter).length > 0) {
				sqlStr += ` ) `;
			}
		}
	}

	const connection = await mysql_promise.createConnection(dbConfig);
	const [results] = await connection.execute(sqlStr, []);

	if (results.affectedRows > 0) return true;
	return false;
};

const deleteRow = async (config) => {
	let sqlStr = "";
	let i = 0;
	let fType;
	fType = typeof config.filter;

	sqlStr += `DELETE FROM \`${config.table}\` `;

	if (fType == "number" || fType == "string") {
		sqlStr += ` WHERE `;
		sqlStr += ` \`id\` = '${config.filter}' `;
	} else {
		if (config.filter && Object.keys(config.filter).length > 0) {
			sqlStr += ` WHERE `;
			i = 0;
			for (const [key, value] of Object.entries(config.filter)) {
				if (i == 0) {
				} else {
					sqlStr += ` AND `;
				}

				tmpType = typeof value;
				if (tmpType == "object" && Array.isArray(value)) {
					if (Array.isArray(value)) {
						sqlStr += ` \`${key}\` IN ( `;
						value.forEach((element, index) => {
							if (index == 0) {
								sqlStr += `'${element}' `;
							} else {
								sqlStr += `, '${element}' `;
							}
						});
						sqlStr += ` ) `;
					}
				} else {
					const con = key.split(' ');
					if ( con[1] == undefined ) {
						sqlStr += ` \`${key}\` = '${value}' `;
					} else {
						sqlStr += ` \`${con[0]}\` ${con[1]} '${value}' `;
					}
				}
				i++;
			}
		}

		if (config.searchKey && config.searchCol && config.searchCol.length > 0) {
			if (config.filter && Object.keys(config.filter).length > 0) {
				sqlStr += ` AND ( `;
			} else {
				sqlStr += ` WHERE `;
			}

			i = 0;
			config.searchCol.forEach((value, key) => {
				if (i == 0) {
					sqlStr += ` \`${value}\` LIKE '%${config.searchKey}$%' `;
				} else {
					sqlStr += ` OR \`${value}\` LIKE '%${config.searchKey}$%' `;
				}
				i++;
			});

			if (config.filter && Object.keys(config.filter).length > 0) {
				sqlStr += ` ) `;
			}
		}
	}

	const connection = await mysql_promise.createConnection(dbConfig);
	const [results] = await connection.execute(sqlStr, []);

	if (results.affectedRows > 0) return true;
	return false;
};

const rowCount = async (config) => {
	let sqlStr = "";
	let i = 0;
	let fType;
	fType = typeof config.filter;

	sqlStr += `SELECT IFNULL(COUNT(*), 0) AS \`count\` FROM \`${config.table}\` `;

	if (fType == "number" || fType == "string") {
		sqlStr += ` WHERE `;
		sqlStr += ` \`id\` = '${config.filter}' `;
	} else {
		if (config.filter && Object.keys(config.filter).length > 0) {
			sqlStr += ` WHERE `;
			i = 0;
			for (const [key, value] of Object.entries(config.filter)) {
				if (i == 0) {
				} else {
					sqlStr += ` AND `;
				}

				tmpType = typeof value;
				if (tmpType == "object" && Array.isArray(value)) {
					if (Array.isArray(value)) {
						sqlStr += ` \`${key}\` IN ( `;
						value.forEach((element, index) => {
							if (index == 0) {
								sqlStr += `'${element}' `;
							} else {
								sqlStr += `, '${element}' `;
							}
						});
						sqlStr += ` ) `;
					}
				} else {
					const con = key.split(' ');
					if ( con[1] == undefined ) {
						sqlStr += ` \`${key}\` = '${value}' `;
					} else {
						sqlStr += ` \`${con[0]}\` ${con[1]} '${value}' `;
					}
				}
				i++;
			}
		}

		if (config.searchKey && config.searchCol && config.searchCol.length > 0) {
			if (config.filter && Object.keys(config.filter).length > 0) {
				sqlStr += ` AND ( `;
			} else {
				sqlStr += ` WHERE `;
			}

			i = 0;
			config.searchCol.forEach((value, key) => {
				if (i == 0) {
					sqlStr += ` \`${value}\` LIKE '%${config.searchKey}$%' `;
				} else {
					sqlStr += ` OR \`${value}\` LIKE '%${config.searchKey}$%' `;
				}
				i++;
			});

			if (config.filter && Object.keys(config.filter).length > 0) {
				sqlStr += ` ) `;
			}
		}
	}


	const connection = await mysql_promise.createConnection(dbConfig);
	const [results] = await connection.execute(sqlStr, []);

	return parseInt(results[0].count);
};

const colSum = async (config) => {
	let sqlStr = "";
	let i = 0;
	let fType;
	fType = typeof config.filter;

	sqlStr += `SELECT IFNULL(SUM(\`${config.col}\`), 0) AS \`sum\` FROM \`${config.table}\` `;

	if (fType == "number" || fType == "string") {
		sqlStr += ` WHERE `;
		sqlStr += ` \`id\` = '${config.filter}' `;
	} else {
		if (config.filter && Object.keys(config.filter).length > 0) {
			sqlStr += ` WHERE `;
			i = 0;
			for (const [key, value] of Object.entries(config.filter)) {
				if (i == 0) {
				} else {
					sqlStr += ` AND `;
				}

				tmpType = typeof value;
				if (tmpType == "object" && Array.isArray(value)) {
					if (Array.isArray(value)) {
						sqlStr += ` \`${key}\` IN ( `;
						value.forEach((element, index) => {
							if (index == 0) {
								sqlStr += `'${element}' `;
							} else {
								sqlStr += `, '${element}' `;
							}
						});
						sqlStr += ` ) `;
					}
				} else {
					const con = key.split(' ');
					if ( con[1] == undefined ) {
						sqlStr += ` \`${key}\` = '${value}' `;
					} else {
						sqlStr += ` \`${con[0]}\` ${con[1]} '${value}' `;
					}
				}
				i++;
			}
		}

		if (config.searchKey && config.searchCol && config.searchCol.length > 0) {
			if (config.filter && Object.keys(config.filter).length > 0) {
				sqlStr += ` AND ( `;
			} else {
				sqlStr += ` WHERE `;
			}

			i = 0;
			config.searchCol.forEach((value, key) => {
				if (i == 0) {
					sqlStr += ` \`${value}\` LIKE '%${config.searchKey}$%' `;
				} else {
					sqlStr += ` OR \`${value}\` LIKE '%${config.searchKey}$%' `;
				}
				i++;
			});

			if (config.filter && Object.keys(config.filter).length > 0) {
				sqlStr += ` ) `;
			}
		}
	}

	const connection = await mysql_promise.createConnection(dbConfig);
	const [results] = await connection.execute(sqlStr, []);

	return parseFloat(results[0].sum);
};

module.exports = {
	query,
	dbTransaction,
	rowCount,
	colSum,
	getRow,
	getRows,
	insertRow,
	updateRow,
	deleteRow,
};
