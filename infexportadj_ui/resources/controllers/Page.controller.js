sap.ui.define([
	"infexportadj_ui/controllers/BaseController",
	'sap/ui/model/json/JSONModel',
	'infexportadj_ui/myLib/oData',
	'infexportadj_ui/myLib/utils',
	'sap/m/MessageToast',
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet",
	"sap/ui/core/format/NumberFormat",
	'infexportadj_ui/myLib/xlsx.mini.min',
	"sap/m/Dialog"
], function (BaseController, JSONModel, oData, utils, MessageToast, MessageBox, Spreadsheet, NumberFormat, XLXS, Dialog) {
	"use strict";
	var planilha1 = [];
	var planilha2 = [];
	var metadata = "";
	var sKey = "Report";
	return BaseController.extend("infexportadj_ui.controllers.Page", {
		onFilterSelect: function (oEvent) {
			sKey = oEvent.getParameter("key");
		},

		onCfop: function () {
			this.getRouter().navTo("appCfop");
		},
		onExcel1: function () {
			this._onDataExport(planilha1, 1);
		},
		onExcel2: function () {
			this._onDataExport(planilha2, 2);
		},
		_onDataExport: function (result, planilha_numero) {
			var oExportConfiguration, oExportPromise, oSpreadsheet;

			oExportConfiguration = this._createExportConfiguration(result, planilha_numero);
			oSpreadsheet = new Spreadsheet(oExportConfiguration);

			/* Starts the export and returns a Promise */
			oExportPromise = oSpreadsheet.build();

			oExportPromise.then(function () {
				// Here you can perform additional steps after the export has finished
			});
		},
		_createExportConfiguration: function (result, planilha_numero) {
			const oFormatOptions6 = {
				groupingSeparator: ',',
				decimalSeparator: '.',
				minFractionDigits: 6,
				maxFractionDigits: 6
			};
			const oFormatOptions4 = {
				groupingSeparator: ',',
				decimalSeparator: '.',
				minFractionDigits: 4,
				maxFractionDigits: 4
			};
			const oFormatOptions2 = {
				groupingSeparator: ',',
				decimalSeparator: '.',
				minFractionDigits: 2,
				maxFractionDigits: 2
			};
			let oFloatFormat6 = NumberFormat.getFloatInstance(oFormatOptions6);
			let oFloatFormat4 = NumberFormat.getFloatInstance(oFormatOptions4);
			let oFloatFormat2 = NumberFormat.getFloatInstance(oFormatOptions2);

			if (planilha_numero == 1) {
				const resultFinal = result;
				resultFinal.forEach(a=>{
					if(a.DT_DE?.length == 8)a.DT_DE = utils.formatDatePt(a.DT_DE);
					if(a.DT_RE?.length == 8)a.DT_RE = utils.formatDatePt(a.DT_RE);
					if(a.DT_CHC?.length == 8)a.DT_CHC = utils.formatDatePt(a.DT_CHC);
					if(a.DT_AVB?.length == 8)a.DT_AVB = utils.formatDatePt(a.DT_AVB);
				})

				var oConfiguration = {
					fileName: "INFEXPORT_" + metadata,
					workbook: {
								inputFormat: 'dd/mm/yyyy',
						columns: [{
								property: "MANDT",
								label: "Mandante",
								width: 15
							}, {
								property: "EMPRESA",
								label: "Empresa",
								width: 15
							}, {
								property: "FILIAL",
								label: "Ramo",
								width: 15
							}, {
								property: "NF_ID",
								label: "ID Nota Fiscal",
								width: 15
							}, {
								property: "NRO_DE",
								label: "N° documento exportação",
								width: 15
							}, {
								property: "NRO_RE",
								label: "N° de registro de exportação",
								width: 15
							}, {
								property: "COD_ITEM",
								label: "Código de item",
								width: 15
							}, {
								property: "IND_DOC",
								label: "Tipo de Documento",
								width: 15
							}, {
								property: "DT_DE",
								label: "Data Declaração de Exportação",
								width: 15,
								type: 'Date'
							}, {
								property: "NAT_EXP",
								label: "Natureza da Exportação",
								width: 15
							}, {
								property: "DT_RE",
								label: "Data Registro de Exportação",
								width: 15,
								type: 'Date'
							}, {
								property: "CHC_EMB",
								label: "Conhecimento de Embarque",
								width: 15
							}, {
								property: "DT_CHC",
								label: "Data Conhecimento de Embarque",
								width: 15,
								type: 'Date'
							}, {
								property: "DT_AVB",
								label: "Data averberação Declaração Exportação",
								width: 15,
								type: 'Date'
							}, {
								property: "TP_CHC",
								label: "Tipo Conhecimento de Embarque",
								width: 15
							}, {
								property: "PAIS",
								label: "País Destino",
								width: 15
							}, {
								property: "COD_PART",
								label: "Código de participante",
								width: 15
							}, {
								property: "NOME",
								label: "Nome",
								width: 15
							}, {
								property: "DT_DOC",
								label: "Data do documento",
								width: 15
							}, {
								property: "DT_E_S",
								label: "Data entrada/saída de mercadorias",
								width: 15
							}, {
								property: "NUM_DOC",
								label: "N° do documento fiscal",
								width: 15
							}, {
								property: "SER",
								label: "Série do documento fiscal",
								width: 15
							}, {
								property: "CHV_NFE",
								label: "Chave de acesso documento fiscal",
								width: 15
							}

						]

					},
					dataSource: resultFinal
				};
			}

			return oConfiguration;
		},
		handleUploadPress: function (e) {
			var view = this.getView();
			var oFileUploader = this.byId("fileUploader").oFileUpload;
			var file = oFileUploader.files && oFileUploader.files[0];
			if (file && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function (evn) {

				};
				reader.onloadend = async function (evn) {
					let company = utils.find(oData.SelectedCompany, oData.CompanyCollection);
					let branch = utils.find(oData.SelectedBranch, oData.BranchCollection);
					let branch2 = utils.find(oData.SelectedBranch2, oData.BranchCollection);
					//const data = evn.target.readAsArrayBuffer(evn.target.result); //string in CSV 
					let workbook;
					const data = await file.arrayBuffer();
					workbook = XLSX.read(data, {
						type: 'binary',
						cellDates: true,
						cellNF: false,
						cellText: false
					});
					var wsnames = workbook.SheetNames;

					/* generate HTML from the corresponding worksheets */
					const worksheet = workbook.Sheets[wsnames[0]];
					console.log("aqui", worksheet)
					const json = XLSX.utils.sheet_to_json(worksheet, {
						defval: ""
					});
					console.log(json)
					oData.CSV = [];
					if (json) {
						json.forEach(a => {
							let line = Object.values(a);
							if (line[3] && line[4] && line[1] == company && parseInt(line[2]) >= parseInt(branch) && parseInt(line[2]) <= parseInt(
									branch2)) {
								oData.CSV.push({
									MANDT: line[0],
									EMPRESA: line[1],
									FILIAL: line[2],
									NF_ID: line[3],
									NRO_DE: line[4],
									NRO_RE: line[5],
									COD_ITEM: line[6],
									IND_DOC: line[7],
									DT_DE: utils.fixDate(line[8]),
									NAT_EXP: line[9],
									DT_RE: utils.fixDate(line[10]),
									CHC_EMB: line[11],
									DT_CHC: utils.fixDate(line[12]),
									DT_AVB: utils.fixDate(line[13]),
									TP_CHC: line[14],
									PAIS: line[15]
										// COD_PART: line[16],
										// NOME: line[17],
										// DT_DOC: line[18],
										// DT_E_S: line[19],
										//   NUM_DOC: line[20],
										// SER: line[21],
										// CHV_NFE: line[22]
								});
							}
						});
						if (oData.CSV.length !== 0) {
							var oModel = new JSONModel(oData);
							view.setModel(oModel);
						} else {
							MessageBox.warning("Certifique-se de que os filtros selecionados estão de acordo com os dados da tabela");
						}
					}

				}
				reader.readAsText(file);
			}
		},
		onPress: function () {
			if (sKey == 'Upload' && oData.CSV.length == 0) {
				MessageBox.warning("Você precisa primeiro fazer o Upload da planilha excel!");
				return
			}
			planilha1 = [];
			planilha2 = [];
			var bt1 = this.getView().byId('BtnExcel1');

			bt1.setEnabled(false);

			var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
			var view = this.getView();
			if (oData.SelectedCompany == 0 || oData.SelectedBranch == 0) {
				MessageBox.warning("Campo obrigatório sem preenchimento ou inválido");
				return;
			}

			if (!oData.SelectedPeriod.match(dateReg)) {
				MessageBox.warning("Formato de período incorreto, use o seletor para definir o período");
				return;
			}
			oData.Results = [];
			var oModel = new JSONModel(oData);
			view.setModel(oModel);

			var oDialog = this.byId("BusyDialog");
			oDialog.open();

			var company = utils.find(oData.SelectedCompany, oData.CompanyCollection);
			var branch = utils.find(oData.SelectedBranch, oData.BranchCollection);
			var branch2 = utils.find(oData.SelectedBranch2, oData.BranchCollection);

			var xhttp = new XMLHttpRequest();
			var pathchange = "/infexport/change";
			var CSV = [];
			if (sKey == 'Upload') {
				pathchange = "/infexport/insert";
				CSV = oData.CSV
			}
			xhttp.open("POST", pathchange, true);
			xhttp.setRequestHeader('content-type', 'application/json');

			var content = {
				company: company,
				branch: branch,
				branch2: branch2,
				period: oData.SelectedPeriod,
				csv: CSV
			};
			xhttp.send(JSON.stringify(content));
			var msg = '';
			var that = this;
			xhttp.onreadystatechange = function () {
				if (this.readyState === 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);
					oDialog.close();
					//console.log(response.result, response.resultSum);

					if (response.result.length > 0) {
						msg = 'Processado com sucesso!!';
					} else {
						msg = 'Nenhum registro encontrado';
					}

					if (sKey == 'Report') {
						var alv1 = {
							ALV1: response.result
						};
						var oModelAlv1 = new JSONModel(alv1);
						view.byId('tableAlv1').setModel(oModelAlv1);

						MessageToast.show(msg);
						planilha1 = response.result;
						//planilha2 = Object.values(response.resultSum);
						metadata = content.company + '_' + content.branch + '_' + content.period.slice(3, 5) + content.period.slice(6);
						if (planilha1 && planilha1.length > 0) bt1.setEnabled(true);
					}
					if (sKey == 'Upload') {
						if (response.result.length > 0) {
							var oTableStatus = that.byId("tableStatus");
							let Id = ''
							let status = 0;
							let results = [];
							response.result.sort(function (a, b) {
								if (a.NF_ID > b.NF_ID) {
									return 1;
								}
								if (a.NF_ID < b.NF_ID) {
									return -1;
								}
								// a must be equal to b
								return 0;
							});
							response.result.forEach((a, i) => {
								if ((Id !== '' && Id !== a.NF_ID) || i == response.result.length - 1) {
									if (!status) status = 'Erro';
									results.push({
										NF_ID: Id,
										STATUS: status
									});
								}
								Id = a.NF_ID;
								if (a.update) status = 'Processado';
								if (a.insert) status = 'Processado';

							})
							oTableStatus.setModel(new JSONModel({
								STATUS: results
							}));

							var oDialog1 = that.byId("TableDialog");
							oDialog1.open();

						}
					}

				} else {
					oDialog.close();
					if (this.status === 401) {
						window.location.reload();
					} else if (this.readyState === 3 && this.status >= 500) {
						MessageBox.error(this.response);
					}
				}
			};

		},

		changeCompany: function () {
			var allData = this.getView().getModel().getData();

			oData.SelectedBranch = 0;
			oData.SelectedBranch2 = 0;
			oData.BranchCollection = [];

			oData.BranchCollection = allData.Branchs.filter(function (a) {
				if (a.IdCompany == oData.SelectedCompany || a.Id == 0) {
					return true;
				} else {
					return false;
				}
			});

		},
		onClose: function (e) {
			var oDialog = this.byId("TableDialog");
			oDialog.close();
		}

	});

});