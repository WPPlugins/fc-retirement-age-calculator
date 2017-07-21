
/*global alert: false, jQuery: false, GUI$: false */

/*jslint vars: true */

/** 
* @preserve Copyright 2016 Pine Grove Software, LLC
* financial-calculators.com
* pine-grove.com
* interface.RETIRE-AGE-WIDGET.js
*/
(function ($, GUI) {
	'use strict';

	// don't try to initialize the wrong calculator
	if (!document.getElementById('retire-age')) {
		return;
	}


	var obj = {}, // interface object to base equations
		// gui controls
		currentAgeInput,		
		pvInput,
		cfInput,
		rateInput,
		fvInput;		


	/**
	* init() -- init or reset GUI's values
	*/
	function initGUI() {
		currentAgeInput.setValue(currentAgeInput.getUSNumber());
		pvInput.setValue(pvInput.getUSNumber());
		cfInput.setValue(cfInput.getUSNumber());
		rateInput.setValue(rateInput.getUSNumber());
		fvInput.setValue(fvInput.getUSNumber());

		document.getElementById("edRetirementAge").value = GUI.formatLocalFloat(0, GUI.numConventions, 0);
		document.getElementById("edNumPmts").value = GUI.formatLocalFloat(0, GUI.numConventions, 0);
		document.getElementById("edTotalInvested").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edInterest").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edFinalValue").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edFVDate").value = GUI.dateConventions.date_mask;

	} // initGUI



	/**
	* clearGUI() -- reset GUI's values
	*/
	function clearGUI() {

		currentAgeInput.setHours(0);
		pvInput.setValue(0.0);
		cfInput.setValue(0.0);
		rateInput.setValue(0.0);
		fvInput.setHours(0.0);

		document.getElementById("edRetirementAge").value = GUI.formatLocalFloat(0, GUI.numConventions, 0);
		document.getElementById("edNumPmts").value = GUI.formatLocalFloat(0, GUI.numConventions, 0);
		document.getElementById("edTotalInvested").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edInterest").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edFinalValue").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edFVDate").value = GUI.dateConventions.date_mask;

	} // clearGUI



	/**
	* getInputs() -- get user inputs and initialize obj equation interface object
	*/
	function getInputs() {
		// all rates are passed as decimal equivalents
		obj = {};
		obj.pv = pvInput.getUSNumber();
		obj.cf = cfInput.getUSNumber();
		obj.nominalRate = rateInput.getUSNumber() / 100;
		obj.fv = fvInput.getUSNumber();


		obj.oDate = GUI.dateMath.getFirstNextMonth(new Date());
		obj.oDate.setHours(0, 0, 0, 0);
		obj.fDate = GUI.dateMath.getFirstNextMonth(new Date(obj.oDate));
		obj.lDate = new Date();

		obj.pmtFreq = 6;
		obj.cmpFreq = 6;
		obj.pmtMthd = 0;

	} // getInputs()



	/** 
	* calc() -- initialize CashInputs data structures for equation classes
	*/
	function calc() {
		var invested, interest, bal, ca, ra;

		ca = currentAgeInput.getUSNumber();
		if (ca <= 0) {
			alert('Current age must be greater than 0.');
			return null;
		}
		if (obj.cf === 0 || obj.nominalRate === 0 || obj.fv === 0) {
			alert('There are unknown values.\nPlease make sure all values are entered.\n\n"Current Retirement Savings" can be 0.');
			return null;
		}

		obj.n = 0;
		obj.n = Math.ceil(GUI.N.calc(obj)); // round up
		ra = ca + (obj.n / 12);
		if (ra > 100) {
			alert('Your retirement age would be after age 100.\n\nIncrease investment amount.\n\nIncrease assumed rate of return.\n\nIncrease current retirement savings.\n\nOr do any combination of all three.');
			document.getElementById("edRetirementAge").value = GUI.formatLocalFloat(0, GUI.numConventions, 0);
			document.getElementById("edNumPmts").value = GUI.formatLocalFloat(0, GUI.numConventions, 0);
			document.getElementById("edTotalInvested").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
			document.getElementById("edInterest").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
			document.getElementById("edFinalValue").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
			document.getElementById("edFVDate").value = GUI.dateConventions.date_mask;
			return null;
		}

		obj.lDate.setTime(GUI.dateMath.addPeriods(obj.oDate, obj.n, obj.pmtFreq));
		GUI.RETIRE_AGE_SCHEDULE.calc(obj);
		invested = GUI.summary.totalPmts[1];
		interest = GUI.summary.totalInterest[1];
		bal = GUI.summary.unadjustedBalance;

		document.getElementById("edRetirementAge").value = GUI.formatLocalFloat(GUI.roundMoney(ra), GUI.numConventions, 0);
		document.getElementById("edNumPmts").value = GUI.formatLocalFloat(obj.n, GUI.numConventions, 0);
		document.getElementById("edTotalInvested").value = GUI.formatLocalFloat(GUI.roundMoney(invested, 2), GUI.moneyConventions, 2);
		document.getElementById("edInterest").value = GUI.formatLocalFloat(GUI.roundMoney(interest, 2), GUI.moneyConventions, 2);
		document.getElementById("edFinalValue").value = GUI.formatLocalFloat(GUI.roundMoney(bal, 2), GUI.moneyConventions, 2);
		document.getElementById('edFVDate').value = GUI.dateMath.dateToDateStr(obj.lDate, GUI.dateConventions);
		return 1;
	} // function calc()




	$(document).ready(function () {

		//
		// initialize GUI controls & dialog / modal controls here
		// attach
		//


		// main window
		currentAgeInput = new GUI.NE('edCurrentAge', GUI.numConventions, 0);
		pvInput = new GUI.NE('edPV', GUI.moneyConventions, 2);
		cfInput = new GUI.NE('edCF', GUI.moneyConventions, 2);
		rateInput = new GUI.NE('edRate', GUI.rateConventions, 4);
		fvInput = new GUI.NE('edFV', GUI.moneyConventions, 2);

		initGUI();


		$('#btnCalc').click(function () {
			getInputs();
			calc();
		});


		$('#btnClear').click(function () {
			clearGUI();
		});


		$('#btnPrint').click(function () {
			getInputs();
			calc();
			GUI.print_calc();
		});


		$('#btnSchedule').click(function () {
			getInputs();
			if (calc() !== null) {
				GUI.showSavingsSchedule(GUI.RETIRE_AGE_SCHEDULE.calc(obj));
			}
		});


		$('#btnCharts').click(function () {
			getInputs();
			if (calc() !== null) {
				GUI.showSavingsCharts(GUI.RETIRE_AGE_SCHEDULE.calc(obj));
			}
		});


		$('#btnHelp').click(function () {
			GUI.show_help();
		});


		$('#btnCcyDate, #btnCcyDate2, #CCY').click(function () {
			GUI$.init_CURRENCYDATE_Dlg();
		});

	}); // $(document).ready

}(jQuery, GUI$));
