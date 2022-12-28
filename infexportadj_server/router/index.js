/*eslint no-console: 0, no-unused-vars: 0, no-undef:0, no-process-exit:0*/
/*eslint-env node, es6 */
"use strict";

module.exports = (app, server) => {
	app.use("/node", require("./routes/myNode")());
	app.use("/data", require("./routes/myData")());
	app.use("/change", require("./routes/myChange")());
		app.use("/insert", require("./routes/myInsert")());
	app.use("/cfop/add", require("./routes/cfop/add")());
	app.use("/cfop/alldata", require("./routes/cfop/alldata")());
	app.use("/cfop/delete", require("./routes/cfop/delete")());
	app.use("/cfop/edit", require("./routes/cfop/edit")());
	app.use((err, req, res, next) => {
		console.error(JSON.stringify(err));
		res.status(500).send(`System Error ${JSON.stringify(err)}`);
	});

};