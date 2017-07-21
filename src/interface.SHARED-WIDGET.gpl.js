/*global alert: false, jQuery: false, LIB$: false */
/*jslint vars: true */


/** 
* @preserve Copyright 2016 Pine Grove Software, LLC
* financial-calculators.com
* interface.SHARED.js
*/

/** 
* @const 
* @expose
*/
var GUI$ = (function ($, LIB) {
	'use strict';

	// object wrappers to expose shared constants, variables & routines
	/** @const */
	var GUI = LIB || {};


	// add generic class for styling specificity for calcultor's modal fade in / fade out on body
	$(document.body).addClass("fc-calculator");


	// [KT] 12/31/2016 - initialize help text, already defined in HTML
	// $('#hShow').addClass("init");

	// [KT] 01/01/2017 - modal must be appended to body tag for z-index to work with background
	$("#fc-modals").appendTo("body");

	/**
	* Lightbox help event handler.
	*/
	GUI.show_help = function () {
		$.featherlight('#hText', {beforeOpen: function () {$("body").css({"overflow-y" : "hidden"}); }, afterClose : function () {$("body").css({"overflow-y": "scroll"}); } });
		$(".featherlight-content").css("overflow-y", "auto");
	};


	/**
	* Scale a calculator - with limits
	*/
	var updateZoom = function (zoom) {

		if (zoom === undefined || zoom === null) {
			LIB.zoomLevel = 1;
		} else {
			LIB.zoomLevel = (LIB.zoomLevel + zoom > 0.50 && LIB.zoomLevel + zoom < 1.50) ? LIB.zoomLevel + zoom : LIB.zoomLevel;
		}

		$('#calc-wrap').css({
			//transform-origin: top left,
			//zoom: zoomLevel,
			'-webkit-transform': 'scale(' + LIB.zoomLevel + ')',
			'-moz-transform': 'scale(' + LIB.zoomLevel + ')',
			'-ms-transform': 'scale(' + LIB.zoomLevel + ')',
			'-o-transform': 'scale(' + LIB.zoomLevel + ')',
			'transform': 'scale(' + LIB.zoomLevel + ')'
		});
	}; // updateZoom = function (zoom)


	$('#grow').click(function () {
		updateZoom(0.1);
	});

	$('#shrink').click(function () {
		updateZoom(-0.1);
	});

	$('#original').click(function () {
		updateZoom(); // no parameter - resets to original size
	});


	//
	// modal event handlers
	//

	/**
	* initialize CURRENCYDATE -- currency / date dialog
	*/
	GUI.init_CURRENCYDATE_Dlg = function () {

		switch (LIB.moneyConventions.ccy_format) {
		case 0:
			document.getElementById("ccyUSD").checked = true;
			break;
		case 1:
			document.getElementById("ccyUSD2").checked = true;
			break;
		case 2:
			document.getElementById("ccyGBH").checked = true;
			break;
		case 3:
			document.getElementById("ccyNone").checked = true;
			break;
		case 4:
			document.getElementById("ccyEUR1").checked = true;
			break;
		case 5:
			document.getElementById("ccyEUR2").checked = true;
			break;
		case 6:
			document.getElementById("ccyEUR3").checked = true;
			break;
		case 7:
			document.getElementById("ccyEUR4").checked = true;
			break;
		}


	/**
	* save CURRENCYDATE -- currency / date dialog
	*/
		switch (LIB.dateConventions.date_format) {
		case 0:
			document.getElementById("MMDDYY").checked = true;
			break;
		case 1:
			document.getElementById("DDMMYY").checked = true;
			break;
		case 2:
			document.getElementById("YYMMDD").checked = true;
			break;
		}
		$('#CURRENCYDATE').modal();
	};


	$('#CURRENCYDATE_save').click(function (e) {
		e.preventDefault();

		if (document.getElementById("ccyUSD").checked) {
			LIB.resetNumConventions(LIB.CCY_FORMATS.USD1);
		} else if (document.getElementById("ccyUSD2").checked) {
			LIB.resetNumConventions(LIB.CCY_FORMATS.USD2);
		} else if (document.getElementById("ccyGBH").checked) {
			LIB.resetNumConventions(LIB.CCY_FORMATS.GBH);
		} else if (document.getElementById("ccyNone").checked) {
			LIB.resetNumConventions(LIB.CCY_FORMATS.NON);
		} else if (document.getElementById("ccyEUR1").checked) {
			LIB.resetNumConventions(LIB.CCY_FORMATS.EUR1);
		} else if (document.getElementById("ccyEUR2").checked) {
			LIB.resetNumConventions(LIB.CCY_FORMATS.EUR2);
		} else if (document.getElementById("ccyEUR3").checked) {
			LIB.resetNumConventions(LIB.CCY_FORMATS.EUR3);
		} else if (document.getElementById("ccyEUR4").checked) {
			LIB.resetNumConventions(LIB.CCY_FORMATS.EUR4);
		}

		if (document.getElementById("MMDDYY").checked) {
			LIB.resetDateConventions(LIB.DATE_FORMATS.MDY);
		} else if (document.getElementById("DDMMYY").checked) {
			LIB.resetDateConventions(LIB.DATE_FORMATS.DMY);
		} else if (document.getElementById("YYMMDD").checked) {
			LIB.resetDateConventions(LIB.DATE_FORMATS.YMD);
		}

		// force page reload
		// http://stackoverflow.com/questions/3715047/how-to-reload-a-page-using-javascript
		window.location.reload(false);
	});


	// initialize Bootstrap tooltips
	$(function () {
		$('[data-toggle="tooltip"]').tooltip();
	});


	// resolves a focus() event problem on iOS devices
	$("input").focus(
		// [KT] 06/11/2016 - added check for checkbox, radio, is a check for "button" type needed?
		function () {if (this.type === "checkbox" || this.type === "radio") {return false; } this.setSelectionRange(0, 999); return false; }
	).mouseup(
		function () { return false; }
	);


	if (document.getElementById("pop-up-help")) {
		$('#pop-up-help').addClass('pop-up');
	}

//	$(document).ready(function () {
//		// [KT] 01/01/2017 - modal must be appended to body tag for z-index to work with background
//		$("#fc-modals").appendTo("body");
//	}); // $(document).ready

	return GUI;

}(jQuery, LIB$));

