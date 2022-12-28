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
	app.post("/", async(req, res) => {

		const {
			company,
			branch,
			branch2,
			period
		} = req.body;
		const period1 = period.slice(6) + period.slice(3, 5) + '01';
		const newdate = new Date(period.slice(6), parseInt(period.slice(3, 5)), 0);
		const period2 = period.slice(6) + period.slice(3, 5) + newdate.getDate().toString();

		//validações
		if (!company) return res.type("text/plain").status(500).send(`ERROR: Filtro de empresa faltando`);
		if (!branch) return res.type("text/plain").status(500).send(`ERROR: Filtro de filial faltando`);
		if (period1.slice(4, 6) !== period2.slice(4, 6)) return res.type("text/plain").status(500).send(
			`ERROR: Filtro de data maior que um mês`);
	
		let client = req.db;

		//QUERIES
		const query_select_v_emp_fed = `select "MANDT_TDF" from "adejo.view::/TMF/V_EMP_FED" WHERE EMPRESA = ? AND EH_MATRIZ = 'X'`;
		const resultAll = [];
		let item = 0;

		try {
			let v_emp_fed_table = await client.exec(query_select_v_emp_fed, [company]);
			const query_select_efd_1100 =
				`SELECT *
FROM "CV_EFD_1100_1105"
	(placeholder."$$P_EMP$$"=> '${company}', 
	placeholder."$$P_DT_INI$$"=> '${period1}', 
	placeholder."$$P_DT_FIN$$"=> '${period2}',
	placeholder."$$P_MANDT_TDF$$"=> '${v_emp_fed_table[0].MANDT_TDF}')
	where FILIAL between ${branch} and ${branch2}  ORDER BY "NF_ID"`;

			console.log(query_select_efd_1100);
			let v_efd_1100_table = await client.exec(query_select_efd_1100);
			console.log(v_efd_1100_table);

			return res.type("application/json").status(200).send({
				result: v_efd_1100_table,
			});

		} catch (err) {
			console.log(err)
			return res.type("text/plain").status(500).send(`ERROR: code: ${err.code} message: ${err.message}`);
		}
	});

	return app;
};