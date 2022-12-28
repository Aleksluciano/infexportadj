/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
/*eslint-env node, es6 */
"use strict";
var express = require("express");

function pad(n) {
	return n < 10 ? '0' + n : n;
}

module.exports = () => {
	var app = express.Router();

	//HANA DB Client 
	app.patch("/", async(req, res) => {

		const {
				cfop,
				nat_exp
		} = req.body;
		
	
		let client = req.db;

		const query_edit_cfop =
			`UPDATE "infexportadj.infexportadj_db.data::CFOP" SET NAT_EXP = ?
				where CFOP = ?`;
		try {
			let cfop_edited = await client.exec(query_edit_cfop, [nat_exp, cfop]);
			let msg = '';
			console.log(cfop_edited);
			if (cfop_edited == 1) {
				msg = 'Ok'
			} else {
				msg = 'Error'
			}
			return res.type("application/json").status(200).send({
				result: msg
			});
		} catch (err) {
			console.log(err)
			return res.type("text/plain").status(500).send(`ERROR: code${err.code} message:${err.message}`);
		}

	});

	return app;
};