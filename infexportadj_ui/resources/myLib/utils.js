"use strict";
sap.ui.define([], function () {
	"use strict";

	return {
		formatDatePt: function(date){
			return new Date(date.substring(0,4),date.substring(4,6) - 1,date.substring(6,8));
		},
		excelDateToJSDate: function(date) {
  return new Date(Math.round((date - 25569)*86400*1000));
},
		pad: function (n) {
	return n < 10 ? '0' + n : n;
},
		fixDate: function (date) {
			if(!date) { return ""; }
			const newdate = date;
			const datemodified = newdate.getFullYear() + this.pad(newdate.getMonth() + 1).toString() + this.pad(newdate.getDate()).toString();
			return datemodified;
		},
		deepClone: function (obj, hash = new WeakMap()) {
			if (Object(obj) !== obj) {
				return obj;
			} // primitives
			if (hash.has(obj)) {
				return hash.get(obj);
			} // cyclic reference
			const result = obj instanceof Set ? new Set(obj) // See note about this!
				: obj instanceof Map ? new Map(Array.from(obj, ([key, val]) => [key, this.deepClone(val, hash)])) : obj instanceof Date ? new Date(
					obj) : obj instanceof RegExp ? new RegExp(obj.source, obj.flags)
				// ... add here any specific treatment for other classes ...
				// and finally a catch-all:
				: obj.constructor ? new obj.constructor() : Object.create(null);
			hash.set(obj, result);
			return Object.assign(result, ...Object.keys(obj).map(
				key => ({
					[key]: this.deepClone(obj[key], hash)
				})));
		},
		find: function (index, data) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].Id == index) {
					return data[i].Name;
				}
			}
			return "";
		}
	};

});