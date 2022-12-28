sap.ui.define([
	"infexportadj_ui/controllers/BaseController",
	"infexportadj_ui/myLib/oData",
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageBox",
	"infexportadj_ui/myLib/utils",
	'sap/m/MessageToast',
	'sap/ui/core/format/NumberFormat'
], function (BaseController, oData, JSONModel, MessageBox, utils, MessageToast, NumberFormat) {
	"use strict";
	const oData2 = utils.deepClone(oData);
	return BaseController.extend("infexportadj_ui.controllers.Cfop", {
		onInit: function () {

			var xhttp = new XMLHttpRequest();
			var view = this;

			xhttp.open("GET", "/infexport/cfop/alldata", true);
			xhttp.send();
			xhttp.onreadystatechange = function () {
				//	console.log(this.responseText);
				if (this.readyState === 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);

					var cfop = {
						CFOP: response.cfop
					};
					var oModelCfop = new JSONModel(cfop);
					view.byId('tableCfop').setModel(oModelCfop);

					var oModel = new JSONModel(oData2);
					view.byId('CfopAddDialog').setModel(oModel);

				} else {
					if (this.status === 401) {
						window.location.reload();
					} else if (this.readyState === 3 && this.status >= 500) {
						MessageBox.error(this.response);
					}

				}
			};

			var oModel = new JSONModel(oData2);
			this.getView().byId('CfopAddDialog').setModel(oModel);
		},
		save: function () {
			var viewTable = this.getView();
			var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
			var view = this.getView().byId('CfopAddDialog');

			if (oData2.Cfop == "") {
				MessageBox.warning("Campo obrigatório sem preenchimento ou inválido");
				return;
			}
			
				if (oData2.SelectedNatExp < 0) {
				MessageBox.warning("Campo obrigatório sem preenchimento ou inválido");
				return;
			}


			var xhttp = new XMLHttpRequest();
			xhttp.open("POST", "/infexport/cfop/add", true);
			xhttp.setRequestHeader('content-type', 'application/json');

	
			var content = {
				cfop: oData2.Cfop,
				nat_exp: oData2.SelectedNatExp,
			};

			xhttp.send(JSON.stringify(content));
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);

					if (response.result == 'Ok') {
						view.close();
						MessageToast.show('Adicionado com sucesso!');
						updateTable(viewTable);
					}
					console.log(response.result);
				} else {

					if (this.status === 401) {
						window.location.reload();
					} else if (this.readyState === 3 && this.status >= 500) {
						MessageBox.error(this.response);
					}

				}

			};
		},
		save2: function () {
			var viewTable = this.getView();
			var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
			var view = this.getView().byId('CfopEditDialog');
			var data = this.getView().byId('CfopEditDialog').getModel().getData();
			if (data.SelectedNatExp < 0) {
				MessageBox.warning("Campo obrigatório sem preenchimento ou inválido");
				return;
			}

			var xhttp = new XMLHttpRequest();
			xhttp.open("PATCH", "/infexport/cfop/edit", true);
			xhttp.setRequestHeader('content-type', 'application/json');

		
			var content = {
					cfop: data.Cfop,
				nat_exp: data.SelectedNatExp
			};

			xhttp.send(JSON.stringify(content));
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);

					if (response.result == 'Ok') {
						view.close();
						MessageToast.show('Atualizado com sucesso!');
						updateTable(viewTable);
					}
					console.log(response.result);
				} else {

					if (this.status === 401) {
						window.location.reload();
					} else if (this.readyState === 3 && this.status >= 500) {
						MessageBox.error(this.response);
					}

				}

			};
		},
		onDelete: function (e) {
			var view = this.getView();
			var sPath = e.getSource('CFOP').getBindingContext();
			var oModel = this.getView().byId('tableCfop').getModel();
			var oRowData = oModel.getProperty(sPath.sPath);
			console.log(oRowData);
			var xhttp = new XMLHttpRequest();
			xhttp.open("DELETE", "/infexport/cfop/delete", true);
			xhttp.setRequestHeader('content-type', 'application/json');

			var content = {
				cfop: oRowData.CFOP,
				nat_exp: oRowData.NAT_EXP
			};
			xhttp.send(JSON.stringify(content));
			xhttp.onreadystatechange = function () {
				if (this.readyState == 4 && this.status === 200) {
					var response = JSON.parse(this.responseText);

					if (response.result == 'Ok') {
						MessageToast.show('Removido com sucesso!');
						updateTable(view);

					}
				}
			};
		},
		add: function () {
	
			oData2.Cfop = "";
			oData2.SelectedNatExp = -1;


			var oModel = new JSONModel(oData2);
			this.getView().byId('CfopAddDialog').setModel(oModel);

			var oDialog = this.byId("CfopAddDialog");
			oDialog.open();
		},
		onEdit: function (e) {
			var view = this.getView();
			var sPath = e.getSource('CFOP').getBindingContext();
			var oModel = this.getView().byId('tableCfop').getModel();
			var oRowData = oModel.getProperty(sPath.sPath);
	
			
			var obj = {
				Cfop: oRowData.CFOP,
				SelectedNatExp: oRowData.NAT_EXP,
				NatExpCollection: oData2.NatExpCollection
			};

			let oModel1 = new JSONModel(obj);
			this.getView().byId('CfopEditDialog').setModel(oModel1);

			var oDialog = this.byId("CfopEditDialog");
			oDialog.open();
		},
		onClose: function () {
			var oDialog = this.byId("CfopAddDialog");
			oDialog.close();
		},
		onClose2: function () {
			var oDialog = this.byId("CfopEditDialog");
			oDialog.close();
		}

	});


	function updateTable(view) {
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", "/infexport/cfop/alldata", true);
		xhttp.send();
		xhttp.onreadystatechange = function () {
			//console.log(this.responseText);
			if (this.readyState === 4 && this.status === 200) {
				var response = JSON.parse(this.responseText);

				var cfop = {
					CFOP: response.cfop
				};
				var oModelCfop = new JSONModel(cfop);
				view.byId('tableCfop').setModel(oModelCfop);

				//console.log(response.result);
			} else {

				if (this.status === 401) {
					window.location.reload();
				} else if (this.readyState === 3 && this.status >= 500) {
					MessageBox.error(this.response);
				}
			}

		};
	}
});