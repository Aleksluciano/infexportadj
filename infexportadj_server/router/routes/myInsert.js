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
			period,
			csv
		} = req.body;
		const period1 = period.slice(6) + period.slice(3, 5) + '01';
		const newdate = new Date(period.slice(6), parseInt(period.slice(3, 5)), 0);
		const period2 = period.slice(6) + period.slice(3, 5) + newdate.getDate().toString();

		//validações
		if (!company) return res.type("text/plain").status(500).send(`ERROR: Filtro de empresa faltando`);
		if (!branch) return res.type("text/plain").status(500).send(`ERROR: Filtro de filial faltando`);
		if (period1.slice(4, 6) !== period2.slice(4, 6)) return res.type("text/plain").status(500).send(
			`ERROR: Filtro de data maior que um mês`);

		for (let csv_row of csv) {
			if (!csv_row.MANDT || !csv_row.NF_ID || !csv_row.NRO_DE) {
				return res.type("text/plain").status(500).send(`ERROR: Formato de arquivo incorreto`);
			}
		}

		let client = req.db;

		//QUERIES
		const query_select_v_emp_fed = `select "MANDT_TDF" from "adejo.view::/TMF/V_EMP_FED" WHERE EMPRESA = ? AND EH_MATRIZ = 'X'`;

		const resultAll = [];
		let item = 0;

		try {
			let v_emp_fed_table = await client.exec(query_select_v_emp_fed, [company]);
			const query_select_efd_1110 =
				`SELECT *
FROM "CV_EFD_1110"
	(placeholder."$$P_EMP$$"=> '${company}', 
	placeholder."$$P_DT_INI$$"=> '${period1}', 
	placeholder."$$P_DT_FIN$$"=> '${period2}',
	placeholder."$$P_MANDT_TDF$$"=> '${v_emp_fed_table[0].MANDT_TDF}')
	where FILIAL between ${branch} and ${branch2}  ORDER BY "NF_ID"`;

			let array_d_exp_ind_m = [];
			let array_d_exportaca = [];
			let array_d_export_nf = [];

			let v_efd_1110_table = await client.exec(query_select_efd_1110);
			for (let csv_row of csv) {

			
				let d_exportaca = inicia_estrutura("d_exportaca");
				let d_export_nf = inicia_estrutura("d_export_nf");

				if (csv_row.NAT_EXP = "1") {
					let data = busca_registros_iguais(v_efd_1110_table, csv_row);
					if (registros_existem(data)) {
						for (let data_line of data) {
							let d_exp_ind_m = inicia_estrutura("d_exp_ind_m");
							d_exp_ind_m = atribui_valores_para_estrutura(d_exp_ind_m, data_line);
							d_exp_ind_m = atribui_valores_para_estrutura(d_exp_ind_m, csv_row);
							let item_igual = acha_um_igual(array_d_exp_ind_m, d_exp_ind_m);
							if (item_igual) d_exp_ind_m.QTD = parseFloat(parseFloat(d_exp_ind_m.QTD) + parseFloat(item_igual.QTD)).toFixed(6);
							else array_d_exp_ind_m.push(d_exp_ind_m);

						}

					}

				}
				if (csv_row.DT_DE && csv_row.DT_DE.length == 8) {
					d_exportaca = atribui_valores_para_estrutura(d_exportaca, csv_row);
					array_d_exportaca.push(d_exportaca);
				}
				d_export_nf = atribui_valores_para_estrutura(d_export_nf, csv_row);
				array_d_export_nf.push(d_export_nf);
			}
			//UPDATE INSERT array_d_exp_ind_m

			for (const linha of array_d_exp_ind_m) {
				let updated_d_exp_ind_m;
				let inserted_d_exp_ind_m;
				const query_update_d_exp_ind_m =
					`UPDATE "adejo.table::/TMF/D_EXP_IND_M" SET COD_PART = ?, COD_MOD = ?, SER = ?, NUM_DOC = ?, DT_DOC = ?, CHV_NFE = ?, NR_MEMO = ?, QTD = ?, UNID = ?
						WHERE MANDT = ? AND EMPRESA = ? AND FILIAL = ? AND NF_ID = ? AND NRO_DE = ? AND NRO_RE = ? AND NF_ID_3RD = ? AND COD_ITEM = ?`

				updated_d_exp_ind_m = await client.exec(query_update_d_exp_ind_m, [linha.COD_PART, linha.COD_MOD, linha.SER, linha.NUM_DOC,
					linha.DT_DOC, linha.CHV_NFE, linha.NR_MEMO, linha.QTD, linha.UNID,
					linha.MANDT, linha.EMPRESA, linha.FILIAL, linha.NF_ID, linha.NRO_DE, linha.NRO_RE, linha.NF_ID_3RD, linha.COD_ITEM
				]);
			
				if (updated_d_exp_ind_m !== 1) {
					const query_insert_d_exp_ind_m =
						`INSERT INTO "adejo.table::/TMF/D_EXP_IND_M"
			COLUMNS( "MANDT", "EMPRESA", "FILIAL", "NF_ID", "NRO_DE", "NRO_RE", "NF_ID_3RD", "COD_ITEM", "COD_PART", "COD_MOD", "SER", "NUM_DOC", "DT_DOC", "CHV_NFE", "NR_MEMO", "QTD", "UNID" ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
					inserted_d_exp_ind_m = await client.exec(query_insert_d_exp_ind_m, [linha.MANDT, linha.EMPRESA, linha.FILIAL, linha.NF_ID, linha.NRO_DE,
						linha.NRO_RE, linha.NF_ID_3RD, linha.COD_ITEM,
						linha.COD_PART, linha.COD_MOD, linha.SER, linha.NUM_DOC, linha.DT_DOC, linha.CHV_NFE, linha.NR_MEMO, linha.QTD, linha.UNID
					]);
					
				}
				resultAll.push({
					NF_ID: linha.NF_ID,
					insert: inserted_d_exp_ind_m,
					update: updated_d_exp_ind_m,
					table: "d_exp_ind_m"
				})
			}

			for (const linha of array_d_export_nf) {
				let updated_d_export_nf;
				let inserted_d_export_nf;
				const query_update_d_export_nf =
					`UPDATE "adejo.table::/TMF/D_EXPORT_NF" SET MANDT = ?, EMPRESA = ?, FILIAL = ?, NF_ID = ?, NRO_DE = ?,NRO_RE = ?, COD_ITEM = ?, NAT_EXP = ?
					WHERE MANDT = ? AND  EMPRESA = ?  AND FILIAL = ? AND NF_ID = ? AND NRO_DE = ? AND NRO_RE = ? AND COD_ITEM = ? AND NAT_EXP = ?`;
				updated_d_export_nf = await client.exec(query_update_d_export_nf, [linha.MANDT, linha.EMPRESA, linha.FILIAL, linha.NF_ID, linha.NRO_DE,
					linha.NRO_RE, linha.COD_ITEM, linha.NAT_EXP, linha.MANDT, linha.EMPRESA, linha.FILIAL, linha.NF_ID, linha.NRO_DE,
					linha.NRO_RE, linha.COD_ITEM, linha.NAT_EXP
				]);
				
				if (updated_d_export_nf !== 1) {
					const query_insert_d_export_nf =
						`INSERT INTO "adejo.table::/TMF/D_EXPORT_NF" 
			COLUMNS( "MANDT", "EMPRESA", "FILIAL", "NF_ID", "NRO_DE", "NRO_RE", "COD_ITEM", "NAT_EXP" ) VALUES (?,?,?,?,?,?,?,?)`;
					inserted_d_export_nf = await client.exec(query_insert_d_export_nf, [linha.MANDT, linha.EMPRESA, linha.FILIAL, linha.NF_ID, linha.NRO_DE,
						linha.NRO_RE, linha.COD_ITEM, linha.NAT_EXP
					]);
						
				}

				resultAll.push({
					NF_ID: linha.NF_ID,
					insert: inserted_d_export_nf,
					update: updated_d_export_nf,
					table: "d_export_nf"
				})
			}

			for (const linha of array_d_exportaca) {
				let updated_d_exportaca;
				let inserted_d_exportaca;

				const query_update_d_exportaca =
					`UPDATE "adejo.table::/TMF/D_EXPORTACA" SET IND_DOC = ?, DT_DE = ?, DT_RE = ?, CHC_EMB = ?, DT_CHC = ?, DT_AVB = ?, TP_CHC = ?, PAIS = ?
						 WHERE MANDT = ? AND EMPRESA = ? AND FILIAL = ? AND NRO_DE = ? AND NRO_RE = ? AND NAT_EXP = ?`

				updated_d_exportaca = await client.exec(query_update_d_exportaca, [linha.IND_DOC, linha.DT_DE, linha.DT_RE, linha.CHC_EMB, linha.DT_CHC,
					linha.DT_AVB, linha.TP_CHC,
					linha.PAIS, linha.MANDT, linha.EMPRESA, linha.FILIAL, linha.NRO_DE, linha.NRO_RE, linha.NAT_EXP
				]);

				if (updated_d_exportaca !== 1) {
					const query_insert_d_exportaca =
						`INSERT INTO "adejo.table::/TMF/D_EXPORTACA" 
				COLUMNS( "MANDT", "EMPRESA", "FILIAL", "NRO_DE", "NRO_RE", "NAT_EXP", "IND_DOC", "DT_DE", "DT_RE", "CHC_EMB", "DT_CHC", "DT_AVB", "TP_CHC", "PAIS" ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
					inserted_d_exportaca = await client.exec(query_insert_d_exportaca, [linha.MANDT, linha.EMPRESA, linha.FILIAL, linha.NRO_DE,
						linha.NRO_RE, linha.NAT_EXP, linha.IND_DOC, linha.DT_DE, linha.DT_RE, linha.CHC_EMB, linha.DT_CHC, linha.DT_AVB, linha.TP_CHC,
						linha.PAIS
					]);
						
				}
				resultAll.push({
					NF_ID: linha.NF_ID,
					insert: inserted_d_exportaca,
					update: updated_d_exportaca,
					table: "d_exportaca"
				})
			}

			return res.type("application/json").status(200).send({
				result: resultAll,
			});

		} catch (err) {
			console.log(err)
			return res.type("text/plain").status(500).send(`ERROR: code: ${err.code} message: ${err.message}`);
		}
	});

	return app;
};

const acha_um_igual = function (tabela, estrutura) {
	let item = tabela.find(a => a.MANDT == estrutura.MANDT &&
		a.EMPRESA == estrutura.EMPRESA &&
		a.FILIAL == estrutura.FILIAL &&
		a.NF_ID == estrutura.NF_ID &&
		a.NRO_DE == estrutura.NRO_DE &&
		a.NRO_RE == estrutura.NRO_RE &&
		a.NF_ID_3RD == estrutura.NF_ID_3RD &&
		a.COD_ITEM == estrutura.COD_ITEM &&
		a.COD_PART == estrutura.COD_PART &&
		a.COD_MOD == estrutura.COD_MOD &&
		a.SER == estrutura.SER &&
		a.NUM_DOC == estrutura.NUM_DOC &&
		a.DT_DOC == estrutura.DT_DOC &&
		a.CHV_NFE == estrutura.CHV_NFE &&
		a.NR_MEMO == estrutura.NR_MEMO &&
		a.UNID == estrutura.UNID);
	return item;
}

const busca_registros_iguais = function (table, row) {
	return table.filter(a => a.MANDT == row.MANDT && a.EMPRESA == row.EMPRESA && a.FILIAL == row.FILIAL && a.NF_ID == row.NF_ID && a.NF_ID_3RD !== "");
}

const registros_existem = function (registros) {
	return registros && registros.length > 0;
}

const atribui_valores_para_estrutura = function (estrutura, linha) {
	for (const [key, value] of Object.entries(linha)) {
		if (estrutura.hasOwnProperty(key)) {
			if (key == 'QTD') estrutura[key] = parseFloat(value).toFixed(6);
			else estrutura[key] = value;
		}
	}
	return estrutura;
}

const inicia_estrutura = function (nome_estrutura) {
	if (nome_estrutura == "d_exp_ind_m") {
		return {
			MANDT: "",
			EMPRESA: "",
			FILIAL: "",
			NF_ID: "",
			NRO_DE: "",
			NRO_RE: "",
			NF_ID_3RD: "",
			COD_ITEM: "",
			COD_PART: "",
			COD_MOD: "",
			SER: "",
			NUM_DOC: "",
			DT_DOC: "",
			CHV_NFE: "",
			NR_MEMO: "",
			QTD: 0,
			UNID: ""
		}
	}

	if (nome_estrutura == "d_exportaca") {
		return {
			MANDT: "",
			EMPRESA: "",
			FILIAL: "",
			NRO_DE: "",
			NRO_RE: "",
			NAT_EXP: "",
			IND_DOC: "",
			DT_DE: "",
			DT_RE: "",
			CHC_EMB: "",
			DT_CHC: "",
			DT_AVB: "",
			TP_CHC: "",
			PAIS: "",
			NF_ID: ""
		}
	}
	if (nome_estrutura == "d_export_nf") {
		return {
			MANDT: "",
			EMPRESA: "",
			FILIAL: "",
			NF_ID: "",
			NRO_DE: "",
			NRO_RE: "",
			COD_ITEM: "",
			NAT_EXP: ""
		}
	}
	return null;
}