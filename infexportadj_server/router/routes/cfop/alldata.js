/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");

module.exports = () => {
	var app = express.Router();

	//HANA DB Client 
	app.get("/", (req, res) => {

		let client = req.db;

		client.exec(
			`select CFOP, NAT_EXP from "infexportadj.infexportadj_db.data::CFOP"
             order by "CFOP"`,
			(err, result) => {
				if (err) {
					return res.type("text/plain").status(500).send(`ERROR: code: ${err.code} message: ${err.message}`);
				} else {

					let cfoparray = [];
					let idCount = 0;

					result.forEach((a) => {
						cfoparray.push({
							Id: idCount++,
							...a
						});
					});
					return res.type("application/json").status(200).send({
						cfop: cfoparray
					});
				}
			}
		)

	});
	return app;
};