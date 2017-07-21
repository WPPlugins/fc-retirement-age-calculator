/**
* -----------------------------------------------------------------------------
* (c) 2005-2014 Pine Grove Software, LLC -- All rights reserved.
* Contact: webmaster@financial-calculators.com
* License: GPL2
* www.financial-calculators.com
* -----------------------------------------------------------------------------
* Common code and global variables.
* -----------------------------------------------------------------------------
* compiled at: http://closure-compiler.appspot.com/home
*/

/* required for JSLint processing */
/*global alert: false, Cookies: false */

/*jslint nomen: true, vars: true, sub: true */


/** 
* @preserve Copyright 2016 Pine Grove Software, LLC
* financial-calculators.com
* common.LIB.js
*/


/** @typedef {{fltNominalRate: (number|undefined|null)}} */
var inputType;

/** 
* @expose
* @const
* @return {Object}
*/
var LIB$ = (function () {
	'use strict';

	// object wrappers to expose shared constants, variables & routines
	/** @const */
	var LIB = {};
	var calcRates = {};

	/**
	* Error messages for numeric text input
	*/
	LIB.ERR_MSGS = {
		noDelKey: "Please use the backspace key to delete.",
		noCurKeys: "Left, up & down arrow keys are disabled. So are the home, end, pgup and pgdn keys.\n\nUse backspace to delete.\n\nIf value is selected, just start typing new value to clear prior value.\n\nWhen a number is selected (value shown in inverse), use right arrow key to clear selection without clearing value. Then backspace to edit.\n\nTIP: Generally it is best to use the TAB or SHIFT-TAB keys to move from one input to the next or previous input.\n\nTIP 2: Generally, editing a value is inefficient. Since values are auto selected, just type the number you want.",
		noSeparators: "Do not type the thousand separator character.\n\n(If using US convention, that would be the comma.)\n\nI'm smart enough to enter them for you!"
	};

	// error strings
	var esInvalidDateMath = "An unknown date calculation error occured.\nPlease provide us with your inputs and settings so that we can fix this. Thank you.";
	var esInvalidMonth = "Date is not valid - bad month.";
	var esInvalidDay = "Date is not valid - bad day.";
	var esInvalidYear = "Date is not valid - bad year.";
	var esNoDateSep = "There is no need to type the date separators (\"/\" or \"-\"). I'll enter it for you.";
	var esInvalidCompounding1 = "When compounding is set to a month based frequency (monthly, quarterly, etc.) cash flow frequency (deposit, payment) must also be set to month based frequency.";
	var esInvalidCompounding2 = "When compounding is set to a week based frequency (weekly, biweekly, etc.) cash flow frequency (deposit, payment) must also be set to week based frequency.";

	// errors
	var erInvalidDateMath = new Error(esInvalidDateMath);
	var erInvalidMonth = new Error(esInvalidMonth);
	var erInvalidDay = new Error(esInvalidDay);
	var erInvalidYear = new Error(esInvalidYear);
	var erInvalidDateKey = new Error(esNoDateSep);
	var erInvalidCompounding1 = new Error(esInvalidCompounding1);
	var erInvalidCompounding2 = new Error(esInvalidCompounding2);

	// KEY CODES
	var BACKSPACE = 8;
	var TAB = 9;
	var PAGE_UP = 33;
	var PAGE_DN = 34;
	var END = 35;
	var HOME = 36;
	var ARROW_LEFT = 37;
	var ARROW_UP = 38;
	var ARROW_RIGHT = 39;
	var ARROW_DOWN = 40;
	var DELETE = 46;

	/**
	* A calculator's zoom size - used for CSS scaling
	* @type {number}
	* @expose
	*/
	LIB.zoomLevel = 1;

	/**
	* @enum {number}
	* @expose
	*/
	LIB.AMORT_MTHD = {
		AM_NORMAL: 0
	};


	/**
	* Currency formats
	*/
	LIB.CCY_FORMATS = {
		USD1: 0,
		USD2: 1,
		GBH: 2,
		NON: 3,
		EUR1: 4,
		EUR2: 5,
		EUR3: 6,
		EUR4: 7
	};

	/**
	* Currency, number and rate conventions
	*/
	LIB.CCY_CONVENTIONS = [{"sep": ',', "dPnt": '.', "ccy": '$', "ccy_r": ''},
							{"sep": '.', "dPnt": ',', "ccy": '$', "ccy_r": ''},
							{"sep": ',', "dPnt": '.', "ccy": '£', "ccy_r": ''}, // CCY_FORMATS.GBH
							{"sep": ',', "dPnt": '.', "ccy": '', "ccy_r": ''}, // CCY_FORMATS.NON
							{"sep": ',', "dPnt": '.', "ccy": '€', "ccy_r": ''}, // CCY_FORMATS.EUR1
							{"sep": '.', "dPnt": ',', "ccy": '€', "ccy_r": ''}, // CCY_FORMATS.EUR2
							{"sep": ' ', "dPnt": ',', "ccy": '', "ccy_r": '€'}, // CCY_FORMATS.EUR3
							{"sep": '.', "dPnt": ',', "ccy": '', "ccy_r": '€'}]; // CCY_FORMATS.EUR4

	/**
	* Date formats - ordinal value for selecting a date_mask
	*/
	LIB.DATE_FORMATS = {
		MDY: 0,
		DMY: 1,
		YMD: 2
	};


	/**
	* Date formats
	*/
	LIB.DATE_FORMAT_STRS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

	LIB.DATE_CONVENTIONS = [{"date_mask": 'MM/DD/YYYY', "date_sep": '/', "sep_pos1": 2, "sep_pos2": 5},
							 {"date_mask": 'DD/MM/YYYY', "date_sep": '/', "sep_pos1": 2, "sep_pos2": 5},
							 {"date_mask": 'YYYY-MM-DD', "date_sep": '-', "sep_pos1": 4, "sep_pos2": 7}];

	/**
	* @enum {number}
	* @expose
	*/
	LIB.ROW_TYPES = {
		DETAIL: 0,
		ANNUAL_TOTALS: 1,
		RUNNING_TOTALS: 2
	};


	/** @expose */
	LIB.STR_FREQUENCIES = [];
	LIB.STR_FREQUENCIES[6] = "Monthly";


	/**
	* Currency symbols see: http://www.xe.com/symbols.php
	* @expose
	*/
	LIB.CURRENCIES = {
		"EUR": "\u20ac", // Euro  Optionally: " \u20AC" note initial space for right aligned symbol.
		"GBP": "\u00a3", // Pound
		"INR": "\u20a8", // Indian Rupee - sometimes Rs
		"JPY": "\u00a5", // Yen
		"KPW": "\u20a9", // North Korea Won
		"USD": "$"
	};


	/**
	 * Enum for Initial Period Types. Cash flow at start is a "regular" type.
	 * @enum {number}
	 * @expose
	 */
	LIB.INITIAL_PERIOD_TYPE = {
		REGULAR: 1
	};


	/**
	* global default values, constants
	*/
	LIB.EMPTY_STR = "";  // eliminate JSLint warnings
	LIB.PCT = "%";
	LIB.US_DECIMAL = ".";
	LIB.MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
	//Date objects are based on a time value that is the number of milliseconds since 1 January, 1970 UTC.
	LIB.MIN_YEAR = 1970;
	LIB.MIN_DATE = new Date(LIB.MIN_YEAR, 0, 1, 0, 0, 0, 0);
	LIB.MAX_YEAR = 2099;
	LIB.MAX_DATE = new Date(LIB.MAX_YEAR, 11, 31, 0, 0, 0, 0);
	LIB.INITIAL_CASH_FLOWS = 500;
	LIB.DIY = 0; // LIB.DAYS_IN_YEAR.THREE_SIXTY;
	LIB.PPY = [];
	LIB.PPY[6] = 12; // periods per year


	// global default long initial period interest payment method
	LIB.LIPM = 2;  // with first LIB.LONG_INTEREST_PMT_MTHD.AMORTIZED;
	// global default short initial period interest payment method
	LIB.SIPM = 2; // LIB.SHORT_INTEREST_PMT_MTHD.REDUCEALL;
	// LIB.UNKNOWN_STR = "";



	/**
	* global shared methods
	*/
	LIB.displayExceptionMsg = function (e) {
		alert(e);
	};


	/**
	* Simple Print Routine
	*/
	LIB.print_calc = function () {
		window.print();
	};

	/**
	* Select text in element. Usually <textarea>
	* http://stackoverflow.com/questions/5797539/jquery-select-all-text-from-a-textarea
	*/
	LIB.focusSelect = function (el) {
		el.onfocus = function () {
			el.select();
			//console.log("focus");
			// Work around Chrome's little problem
			el.onmouseup = function () {
				// Prevent further mouseup intervention
				el.onmouseup = null;
				return false;
			};
		};
	};



	LIB.stripCharsInBag = function (s, bag) {
		var i, c, returnString = "";

		// Search through string's characters one by one.
		// If character is not in bag, append to returnString.
		for (i = 0; i < s.length; i += 1) {
			c = s.charAt(i);
			if (bag.indexOf(c) === -1) {
				returnString += c;
			}
		}
		return returnString;
	}; // stripCharsInBag


	//!!.02 [BJ] 09/28/2010 - string buffer for string management.
	/**
	* StringBuffer is a wrapper around an array.
	* @constructor
	* @expose
	*/
	LIB.StringBuffer = function () {
		this.buffer = [];
	};


	/**
	* @expose
	*/
	LIB.StringBuffer.prototype.append = function append(string) {
		this.buffer.push(string);
		return this;
	};


	/**
	* @expose
	*/
	LIB.StringBuffer.prototype.toString = function toString() {
		return this.buffer.join("");
	};


	/**
	* @constructor
	* @expose
	* @param {number=} ccy_format
	*/
	LIB.LocalConventions = function (ccy_format) {
		if (!ccy_format) {
			ccy_format = LIB.CCY_FORMATS.USD1;
		}
		/** @expose */
		this.ccy_format = ccy_format;
		/** @expose */
		this.sep = LIB.CCY_CONVENTIONS[ccy_format].sep;
		/** @expose */
		this.dPnt = LIB.CCY_CONVENTIONS[ccy_format].dPnt;
		/** @expose */
		this.ccy = LIB.CCY_CONVENTIONS[ccy_format].ccy;
		/** @expose */
		this.ccy_r = LIB.CCY_CONVENTIONS[ccy_format].ccy_r;
	};


	/**
	* Allocate and initialize numeric conventions without currency 
	* based on local currency conventions.
	* @expose
	*/
	LIB.LocalConventions.prototype.numConvention = function () {
		var c = new LIB.LocalConventions(this.ccy_format);
		c.ccy = '';
		c.ccy_r = '';
		return c;
	};


	/**
	* Allocate and initialize rate conventions without currency 
	* based on local currency conventions.
	* @expose
	*/
	LIB.LocalConventions.prototype.rateConvention = function () {
		var c = new LIB.LocalConventions(this.ccy_format);
		c.ccy = '';
		c.ccy_r = '%';
		return c;
	};


	/**
	* @constructor
	* @expose
	* @param {number=} date_format
	*/
	LIB.LocalDateConventions = function (date_format) {
		if (!date_format || date_format === null) {
			date_format = LIB.DATE_FORMATS.MDY;
		}

		/** @expose */
		this.date_format = date_format;
		/** @expose */
		this.date_mask = LIB.DATE_CONVENTIONS[date_format].date_mask;
		/** @expose */
		this.date_sep = LIB.DATE_CONVENTIONS[date_format].date_sep;
		/** @expose */
		this.sep_pos1 = LIB.DATE_CONVENTIONS[date_format].sep_pos1;
		/** @expose */
		this.sep_pos2 = LIB.DATE_CONVENTIONS[date_format].sep_pos2;
	};


	/**
	* global default values, "now" string variables for building a guaranteed valid date string, NOT '0' based month.
	*/
	LIB.dateNow = new Date();
	LIB.yearNow = LIB.dateNow.getFullYear().toString();
	// when no date parameter, date defaults to 1, valid date is always 1st of next month
	//LIB.dateNow = new Date(LIB.dateNow.getFullYear(), LIB.dateNow.getMonth() + 1);
	// guarantees leading 0 if needed, used to always return valid date string by DE
	LIB.monthNowName = LIB.MONTHS[LIB.dateNow.getMonth()];
	LIB.monthNow = ("0" + (LIB.dateNow.getMonth() + 1)).slice(-2);
	LIB.dayNow = "01";
	LIB.pmt_method = 0; // end-of-period
	LIB.pmt_frequency = 6; // monthly
	LIB.cmp_frequency = 6; // monthly
	LIB.ppy = LIB.PPY[LIB.pmt_frequency];
	LIB.cmpPPY = LIB.PPY[LIB.cmp_frequency];


	/**
	* object for localized currency conventions
	* @expose
	*/
	LIB.moneyConventions = new LIB.LocalConventions(); // set defaults


	/**
	* object for localized rate/percentage conventions
	* @expose
	*/
	LIB.rateConventions = LIB.moneyConventions.rateConvention();  // clones moneyConventions and sets percent sign


	/**
	* object for localized number conventions (no currency symbol)
	* @expose
	*/
	LIB.numConventions = LIB.moneyConventions.numConvention(); // clones moneyConventions and removes currency symbol


	/**
	* When user changes conventions, attributes of money, rate and number have to be updated
	* @expose
	*/
	LIB.resetNumConventions = function (ccy_format) {
		if (ccy_format !== LIB.moneyConventions.ccy_format) {
			LIB.moneyConventions = new LIB.LocalConventions(parseInt(Cookies.get('ccy_format'), 10));
			LIB.rateConventions = LIB.moneyConventions.rateConvention(); // clones currency conventions with '%' symbol
			LIB.numConventions = LIB.moneyConventions.numConvention(); // clones currency conventions without currency
			Cookies.set('ccy_format', parseInt(ccy_format, 10), {expires: Infinity});
		}
	};


	/**
	* object for localized date conventions
	* @expose
	*/
	LIB.dateConventions = new LIB.LocalDateConventions();

	/**
	* YYYY-MM-DD date convention for sorting
	* @expose
	*/
	LIB.sortConventions = new LIB.LocalDateConventions(LIB.DATE_FORMATS.YMD);


	/**
	* When user changes conventions, attributes of money, rate and number have to be updated
	* @expose
	*/
	LIB.resetDateConventions = function (date_format) {
		if (date_format !== LIB.dateConventions.date_format) {
			LIB.dateConventions = new LIB.LocalDateConventions(date_format);
			Cookies.set('date_format', parseInt(date_format, 10), {expires: Infinity});
		}
	};



	/**
	* Banker's rounding
	* src: http://stackoverflow.com/questions/3108986/gaussian-bankers-rounding-in-javascript
	* Google search: "javascript bankers rounding example" -- lots of info function evenRound(num, decimalPlaces) {
	*/
	LIB.evenRound = function (num, decimalPlaces) {
		var d = decimalPlaces || 0,
			m = Math.pow(10, d),
			n = +(d ? num * m : num).toFixed(8), // Avoid rounding errors
			i = Math.floor(n),
			f = n - i,
			e = 1e-8, // Allow for rounding errors in f
			r = (f > 0.5 - e && f < 0.5 + e) ? ((i % 2 === 0) ? i : i + 1) : Math.round(n);
		return d ? r / m : r;
	};



	/** @expose */
	LIB.roundMoney = function (n, digits, isBankersRounding) {
		// TODO: raise an exception if digits > 10

		var precision = Math.pow(10, digits || 2);

		if (n === undefined || n === null || typeof n !== 'number') {
			return "";  // So that display shows an empty value.
		}
		if (isBankersRounding === undefined || !isBankersRounding) {
			return Math.round(n * precision) / precision;
		}
		return LIB.evenRound(n, digits);
	};


	/**
	* Is a string an integer?
	* See also: http://surf11.com/entry/157/javascript-isinteger-function
	* @param {string} s
	* @return {boolean}
	*/
	function isInteger(s) {
		return (s.toString().search(/^-?[0-9]+$/) === 0);
	}


	/**
	* Add new formatting
	* @param {string} nStr
	* @param {string} sep
	* @param {string} dPnt
	* @param {number} precision
	* @return {string}
	*/
	LIB.addSeparators = function (nStr, sep, dPnt, precision) {
		var dpos = nStr.indexOf(dPnt),
			rgx = /(\d+)(\d{3})/,
			numText = "",
			n,
			i;

		// remove formatting
		for (i = 0;	i < nStr.length; i += 1) {
			if (nStr.charAt(i) !== sep) {
				numText += nStr.charAt(i);
			}
		}

		// [KT] 04/20/2012 if no decimal & precision !== 0, add decimal char
		if ((dpos === -1) && (precision > 0)) {
			// remove possible leading zeros
			while (((numText.length > 1) && (numText.charAt(0) === "0")) || ((numText.charAt(0) === '-') && (numText.length > 2) && (numText.charAt(1) === "0"))) {
				numText = numText.substr(1, numText.length - 1);
			}
			while (rgx.test(numText)) {
				numText = numText.replace(rgx, "$1" + sep + "$2");
			}
			return numText;
		// [KT] 04/20/2012 new condition, don't add decimal char if 0 precision
		}
		if ((dpos === -1) && (precision === 0)) {
			// [KT] 05/28/2012 - was only adding one separator
			while (rgx.test(numText)) {
				numText = numText.replace(rgx, "$1" + sep + "$2");
			}
			return numText;
		}
		n = numText.split(dPnt);
		while (rgx.test(n[0])) {
			n[0] = n[0].replace(rgx, "$1" + sep + "$2");
		}
		// [KT] 04/20/2012 added 0 precision checks
		if ((precision !== 0) && (n[1].length <= precision)) {
			return n[0] + dPnt + n[1]; //.substr(0, n[1].length-1);
		}
		if (precision !== 0) {
			return n[0] + dPnt + n[1].substr(0, precision);
		}
		return n[0];
	}; // LIB.addSeparators


	/**
	* number to conform to local conventions.
	* @param {?number} nNum
	* @param {string} dPnt
	* @return {string}
	* @expose
	*/
	LIB.getLocalNumStr = function (nNum, dPnt) {
		if (nNum === null) {
			return "";
		}
		var strNum = nNum + LIB.EMPTY_STR; // convert number to string
		if (dPnt !== LIB.US_DECIMAL) {
			strNum = strNum.replace(/\./, dPnt); // escape US decimal point
		}
		return strNum;
	};



	/**
	* formatFloat(value, sep, dPnt, precision)
	* Called by the form when it is being initialized.
	* Generic numeric format w/o currency or '%'.
	* @param {number} value
	* @param {string} sep
	* @param {string} dPnt
	* @param {number} precision
	* @return {string}
	* @expose
	*/
	LIB.formatFloat = function (value, sep, dPnt, precision) {
		var numText = LIB.getLocalNumStr(value, dPnt),
			dpos = numText.indexOf(dPnt);


		if (numText === null || numText.length === 0) {
			return LIB.EMPTY_STR;
		}

		if ((dpos === -1) && (precision !== 0)) {
			numText += dPnt;
			dpos = numText.length - 1;
		}

		while ((((numText.length - 1) - dpos) < precision) && (precision > 0)) {
			// we need to pad
			numText += "0";
		}

		return LIB.addSeparators(numText, sep, dPnt, precision);
	}; // LIB.formatFloat


	/**
	* Formats float with local currency conventions or PCT if ccy_r = PCT
	* @param {number} value
	* @param {Object} conventions
	* @param {number} precision
	* @param {(number|undefined)} maxLength
	* @return {string}
	* @expose
	*/
	LIB.formatLocalFloat = function (value, conventions, precision, maxLength) {
		// value, as a number, will always have US decimal, convert to a local number string
		var numText = LIB.getLocalNumStr(value, conventions.dPnt),
			dpos = numText.indexOf(conventions.dPnt),
			ml = (maxLength !== undefined) ? maxLength : 100;

		if (numText === null || numText.length === 0) {
			return LIB.EMPTY_STR;
		}

		if (numText.charAt(0) === "u" || numText.charAt(0) === "U") {
			return LIB.UNKNOWN_STR;
		}

		if ((dpos === -1) && (precision !== 0)) {
			numText += conventions.dPnt;
			dpos = numText.length - 1;
		}

		if (precision > 0) {
			while ((((numText.length - 1) - dpos) < precision)) {
				// we need to pad
				numText += "0";
			}
		}

		numText = LIB.addSeparators(numText, conventions.sep, conventions.dPnt, precision);

		if ((conventions.ccy !== "") && (numText.charAt(0) !== conventions.ccy) && (numText.length < ml)) {
			numText = conventions.ccy + numText;
		} else if ((conventions.ccy_r !== "") && (numText.charAt(numText.length - 1) !== conventions.ccy_r) && (numText.length < ml)) {
			numText = numText + conventions.ccy_r;
		}
		return numText;

	};



	/**
	* Converts any valid number string to a US numeric string
	* @expose
	* @return {string}
	*/
	LIB.getUSNumStr = function (sNum, sep, dPnt, ccy, ccy_r) {
		if (sNum !== LIB.UNKNOWN_STR) {
			var regExp, Separator;

			Separator = (sep !== '.') ? sep : '\\.';
			regExp = (ccy !== "") ? new RegExp("\\" + ccy + "|" + ccy + "|" + Separator, "g") : new RegExp("\\" + ccy_r + "|" + ccy_r + "|" + Separator, "g");
			sNum = sNum.replace(regExp, LIB.EMPTY_STR); // strip 1000s separator & CCY symbol
			if (dPnt !== LIB.US_DECIMAL) {
				sNum = sNum.replace(dPnt, LIB.US_DECIMAL); // must use US decimal point convention
			}
			if (sNum.charAt(sNum.length - 1) === LIB.PCT) {
				sNum = sNum.slice(0, -1);  // remove percent sign
			}
		} else {
			sNum = '0';
		}
		return sNum;
	};



	/**
	* Converts numeric string to number.
	* @return {number}
	*/
	LIB.getUSNum = function (sNum, conventions, precision) {
		var n = LIB.getUSNumStr(sNum, conventions.sep, conventions.dPnt, conventions.ccy, conventions.ccy_r);
		if (precision) {
			return parseFloat(n);
		}
		return parseInt(n, 10);
	};


	/**
	* Numeric Editor - custom text input
	* @constructor
	* @param {string} id
	* @param {Object} conventions
	* @param {number} precision
	* @param {boolean} isTableEditor
	* @return {Object}
	* @expose
	*/
	var NE = function (id, conventions, precision) {
		var num;

		// assume not a valid object
		this.isValid = false;
		this.element = document.getElementById(id);
		if (this.element !== null) {
			this.id = id;
			if (!conventions || conventions === null) {
				this.conventions = LIB.moneyConventions;
			} else {
				this.conventions = conventions;
			}
			this.ccy_format = conventions.ccy_format;
			this.precision = (precision !== undefined) ? precision : 2;
			this.sep = conventions.sep;
			this.dPnt = conventions.dPnt;
			this.ccy = conventions.ccy;
			this.ccy_r = conventions.ccy_r;
			this.PCT = '%';
			this.customBlurHandler = null;
			this.customKeyPressHandler = null;
			this.customKeyDownHandler = null;
			this.customMouseUpHandler = null;
			this.customTouchEndHandler = null;
			this.UNKNOWN_STR = LIB.UNKNOWN_STR;
			// if editor is contained in a DataTable, then allow up/down keys etc. Don't show instruction message.
			// and disable focus and blur events
			this.isTableEditor = false;
			this.init();
			this.isValid = true;
		}
	};
	LIB["NE"] = NE;


	/**
	* Numeric Editor - change field to interest rate editor
	* this preserves the local setting for sep & dPnt
	*/
	NE.prototype.initRateEditor = function () {
		this.ccy = '';
		this.ccy_r = '%';
	};

	/**
	* change field to be a plain number editor
	* preserves the local setting for sep & dPnt
	*/
	NE.prototype.initNumEditor = function () {
		this.ccy = '';
		this.ccy_r = '';
	};


	/**
	* Initialize an event listener
	*/
	NE.prototype.addEvent = function (event, callback, caller) {
		// check for modern browsers first
		var handler;
		if (typeof window.addEventListener === 'function') {
			handler = function (event) {callback.call(caller, event); };
			this.element.addEventListener(event, handler, false);
		} else {
			// then for older versions of IE
			handler = function (e) {callback.call(caller, window.event); };
			this.element.attachEvent('on' + event, handler);
		}
		return handler;
	};


	/**
	* init object
	*/
	NE.prototype.init = function () {
		if (!this.isTableEditor) {
			this.customBlurHandler = this.addEvent('blur', this.onCustomBlur, this);
		}
		this.customKeyPressHandler = this.addEvent('keypress', this.onCustomKeyPress, this);
		this.customKeyDownHandler = this.addEvent('keydown', this.onCustomKeyDown, this);
		this.customMouseUpHandler = this.addEvent('mouseup', this.onCustomMouseUp, this);
		// touchend event listener same as mouseup
		this.customTouchEndHandler = this.addEvent('touchend', this.onCustomMouseUp, this);
	};


	/**
	* detach event
	*/
	NE.prototype.removeEvent = function (event, handler) {
		if (typeof window.addEventListener === 'function') {
			this.element.removeEventListener(event, handler, false);
		} else {
			// old versions of IE only
			this.element.detachEvent('on' + event, handler);
		}
	};


	/**
	* deallocate object 
	*/
	NE.prototype.destroy = function () {
		this.removeEvent('mouseup', this.customMouseUpHandler);
		this.removeEvent('touchend', this.customMouseUpHandler);
		this.customMouseUpHandler = null;
		this.customTouchEndHandler = null;
		this.removeEvent('keydown', this.customKeyDownHandler);
		this.customKeyDownHandler = null;
		this.removeEvent('keypress', this.customKeyPressHandler);
		this.customKeyPressHandler = null;
		if (!this.isTableEditor) {
			this.removeEvent('blur', this.customBlurHandler);
			this.customBlurHandler = null;
		}
		this.element = null;
	};



	/**
	* keydown event handler responds to arrow keys
	*/
	NE.prototype.onCustomKeyDown = function onCustomKeyDown(e) {
		// console.log("keypress event handler");
		// [KT] 12/12/2011 - handling of delete key added.
		if (e.keyCode === 46) { e.preventDefault(); alert(LIB.ERR_MSGS.noDelKey); return false; }
		// this blocks left cursor key, "pgup", "pgdn", "home" or "end" keys
		// in IE but not Mozilla/Firefox
		// note: r. cursor key, #39, can be used to clear a selection without clearing the selected text itself
		// [KT] 12/13/2011 - added block for up(38)/down(40) cursor keys
		if ((e.keyCode === 37) || (e.keyCode === 33) || (e.keyCode === 34) || (e.keyCode === 35) || (e.keyCode === 36) || (e.keyCode === 38) || (e.keyCode === 40)) {
			if (!this.isTableEditor) {
				alert(LIB.ERR_MSGS.noCurKeys);
			}
			if (e.preventDefault) {
				e.preventDefault();
			} else {
				// IE work around, of course!
				e.returnValue = false;
			}
			return false;
		}
		if (((e.keyCode === 188) && (this.sep === ',')) || (((e.keyCode === 110) || (e.keyCode === 190)) && (this.sep === '.'))
				|| ((e.keyCode === 32) && (this.sep === " "))) {
			// [KT] 04/22/2012 -- new message. NOTE: period key and decimal point key on numeric keypad return different keycode values
			alert(LIB.ERR_MSGS.noSeparators);
			if (e.preventDefault) {
				e.preventDefault();
			} else {
				// IE work around, of course!
				e.returnValue = false;
			}
			return false;
		}
		return true;
	}; // onCustomKeyDown


	/**
	* onKeypress event handler -- allows only digits and decimal
	*/
	NE.prototype.onCustomKeyPress = function onCustomKeyPress(e) {
		// alert("keypress event handler");
		var key,
			keychar,
			reg,
			isValid,
			isSelected = false,
			numText = "",
			strText = this.element.value,
			pos = strText.indexOf(this.dPnt),
			hasDecimal = (pos >= 0),
			rng = null;

		// setCaretToEnd(maskControl);
		// sequence of test conditions important so that it works in Chrome
		if (e.which) {
			// for Mozilla Firefox, Netscape, Chrome see if a range is selected
			isSelected = ((this.element.selectionEnd - this.element.selectionStart) !== 0);
			key = e.which;
		} else if (window.event) {
			// for IE, see if a range is selected
			rng = document.selection.createRange();
			isSelected = (rng.text !== "");
			// for IE, e.keyCode or window.event.keyCode can be used
			key = e.keyCode;
		} else {
			// no event raised in Mozilla/Firefox for l. cursor key "pgup", "pgdn", "home" or "end" keys
			// r. cursor key, #39, can be used to clear a selection without clearing the selected text itself
			if ((e.keyCode === 37) || (e.keyCode === 33) || (e.keyCode === 34) || (e.keyCode === 35) || (e.keyCode === 36)) {
				if (e.preventDefault) {
					e.preventDefault();
				} else {
					// IE work around, of course!
					e.returnValue = false;
				}
				return false;
			} else {
				return true;
			}
		}
		keychar = String.fromCharCode(key);
		reg = /\d/; // test for digits

		// if a number, negative sign (-), backspace or decimal char, then we are good
		// for decimal char to be valid, precision has to be > 0
		isValid = (reg.test(keychar) || key === 8 || (keychar === this.dPnt && !hasDecimal && this.precision > 0)
			|| ((key === 45) && ((this.element.value.length === 0) || isSelected)));

		//[KT] 2009-03-07, special handling for "u" or "U"
		if (isValid && !isSelected && (key !== 8) && (this.element.value.length < this.element.maxLength) && (key !== 85) && (key !== 117)) {
			numText = this.element.value + keychar;
			// [KT] 2010-02-19 - handle minus sign, only first char of string.
			if (key === 45) {
				// if negative sign, clear entry so minus is always first char.
				this.element.value = "";
			} else if ((numText.length > 1) && (this.element.value !== this.UNKNOWN_STR)) {
				// remove the char just typed - it will be added by system
				this.element.value = numText.substr(0, numText.length - 1);
			} else {
				// required to eliminate leading zeros
				this.element.value = keychar;
				isValid = false;  // block further events
			}
		}


		if (!isValid) {
			if (e.preventDefault) {
				e.preventDefault();
			} else {
				// IE work around, of course!
				e.returnValue = false;
			}
		}
		return isValid;

	}; // onCustomKeyPress


	/**
	* onblur event handler -- format number, append currency symbol
	*/
	NE.prototype.onCustomBlur = function onCustomBlur(e) {
		if (this.element.value.length === 0) {
			this.element.value = 0; // so edit control is never left with null value
		} else if (this.element.value === LIB.UNKNOWN_STR) {
			return;
		}
		// convert to string with local decimal
		this.element.value = LIB.formatLocalFloat(LIB.getUSNum(this.element.value, this.conventions, this.precision), this.conventions, this.precision, this.element.maxLength);
		return true;
	}; // onCustomBlur


	/**
	* mouseup event hander - select content of input
	*/
	NE.prototype.onCustomMouseUp = function onCustomMouseUp(e) {
		//console.log("mouseup event handler");
		// value in editor is selected
		if (e.preventDefault) {
			this.element.selectionStart = 0;
			this.element.selectionEnd = this.element.value.length;
			e.preventDefault();
		} else {
			// IE work around, of course!
			this.element.select();
			e.returnValue = false;
		}
		return false;
	}; // onCustomMouseUp


	/**
	* Converts a US number to local number.
	* @param {number} v
	*/
	NE.prototype.setValue = function (v) {
		this.element.value = LIB.formatLocalFloat(v, this.conventions, this.precision, this.element.maxLength);
	};



	/**
	* Remove local conventions from input's value. Return number with US decimal ('.').
	* @return {number}
	*/
	NE.prototype.getUSNumber = function () {
		var n = LIB.getUSNumStr(this.element.value, this.sep, this.dPnt, this.ccy, this.ccy_r);
		if (this.precision !== 0) {
			return parseFloat(n);
		}
		return parseInt(n, 10);
	};


	/**
	* Date routines.
	* @expose
	*/
	LIB.dateMath = (function () {
		var FEB = 1, // JavaScript ordinal value for Feb.
			// refDate is used by addPeriods_() to implement rules for determining next month in cash flow if day is >= 28
			// Used to answer question is one month from April 30th May 30th or May 31st.
			/** @expose */
			refDate = new Date(), // refDate earliest date of a regular cash flow
			// number of days between 2 dates
			days = 0,
			periods = 0,
			oddDays = 0,
			LDOM = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], // Last Day Of Month, note 0 based array
			isForceLastDay = false,
			isForce29th = false,
			isForce30th = false,
			isLastDayFeb = false,
			term = {
				/** @expose */
				days: null,
				/** @expose */
				periods: null,
				/** @expose */
				oddDays: null
			},


			// rewritten to add months to d(ate).
			addMonths_ = function (d, months) {
				var d1 = d.getDate();
				d.setMonth(d.getMonth() + months);
				return d.getTime();
			};


			/**
			* @param {Date} aDate
			* @param {number} n periods
			*/
		var addPeriods_ = function (aDate, n) {
				// preserve value of 'aDate'
				var d = new Date();
				d.setTime(aDate.getTime());
				d.setHours(0, 0, 0, 0);
				addMonths_(d, n);
				return d.getTime();
			}; // addPeriods_


		// call to addPeriods_() resets 'dat' member
		var countMonthBasePeriods = function (fDate, lDate, frequency) {
				// temp dates are used to preserve fDate, lDate values
				var tempDate = new Date(),
					fTempDate = new Date(),
					lTempDate = new Date(),
					indx = 0;  // used to avoid infinite loops - should not be needed

				fTempDate.setTime(fDate.getTime());
				lTempDate.setTime(lDate.getTime());

				//alert(fTempDate.toDateString() + "\n" + lTempDate.toDateString() + "\n lTempDate - fTempDate = " + (lTempDate.getTime() - fTempDate.getTime()) + "\nDays = " + ((lTempDate.getTime() - fTempDate.getTime()) / ONE_DAY) +"\nOne day = "+ONE_DAY);
				days = Math.round((lTempDate.getTime() - fTempDate.getTime()) / LIB.ONE_DAY); //round() required due to daylight savings time
				do {
					periods += 1;
					// Needs to preserve last date. If we go too far, for example, from Dec 31 and went to Nov 30th, then when adding back below, we end up on Dec 30th and one too few odd days
					tempDate.setTime(lTempDate.getTime());  // save current date
					lTempDate.setTime(addMonths_(lTempDate, -1));
 
					indx += 1;
					if (indx === 10000) {
						throw erInvalidDateMath;
					}
				} while ((lTempDate.getTime() > fTempDate.getTime()) && indx < 10000);

				if (lTempDate.getTime() < fTempDate.getTime()) {
					// Went too far. There are odd days
					periods -= 1;
					lTempDate.setTime(tempDate.getTime());
					oddDays = Math.round((lTempDate.getTime() - fTempDate.getTime()) / LIB.ONE_DAY); //round() required due to daylight savings time
				}
				//alert('lTempDate = ' + lTempDate.toDateString() + "\n" + fTempDate.toDateString());
				return true;
			},

			// first cash flow date, last cash flow date
			countPeriods_ = function (fDate, lDate) {
				// Note, members, not local
				days = 0;
				periods = 0;
				oddDays = 0;

				if (fDate.getTime() > lDate.getTime()) {
					alert("Error: dates out of sequence.");
					return false;
				} else if (fDate.getTime() === lDate.getTime()) {
					term.days = days;
					term.periods = periods;
					term.oddDays = oddDays;

					// return object with results
					return term;
				}

				countMonthBasePeriods(fDate, lDate);
				term.days = days;
				term.periods = periods;
				term.oddDays = oddDays;

				// return object with results
				return term;

			}, // countPeriods_


			/**
			* isValidDate - given a year, month, day
			* month is not a JavaScript month, month range 1..12
			* @expose
			*/
			isValidDate = function (y, m, d) {
				var isValid = true;

				if (m < 1 || m > 12 || isNaN(m)) {
					//throw erInvalidMonth;
					isValid = false;
				}
				if (y < LIB.MIN_YEAR || y > LIB.MAX_YEAR || isNaN(y)) {
					//throw erInvalidYear;
					isValid = false;
				}
				if ((m === 9 || m === 4 || m === 6 || m === 11) && (d < 1 || d > 30)) {
					//throw erInvalidDay;
					isValid = false;
				} else if (m === 2) {
					// Feb. logic -- need check for leap year
					if (d < 1 || d > 29) {
						//throw erInvalidDay;
						isValid = false;
					}
				} else if (d < 1 || d > 31 || isNaN(d)) {
					//throw erInvalidDay;
					isValid = false;
				}
				return isValid;
			};

		/**
		* dateStrToDate
		* If successful, returns Date obj otherwise returns null.
		* @expose
		*/
		var dateStrToDate = function (dateStr, dateConventions) {
				var sep, date_format, datePartsStr = [], dateParts = [], dt = new Date();

				if (dateConventions) {
					date_format = dateConventions.date_format;
					sep = dateConventions.date_sep;
				} else {
					date_format = LIB.dateConventions.date_format;
					sep = LIB.dateConventions.date_sep;
				}

				// Note: not a 0 based month
				datePartsStr = dateStr.split(sep);
				dateParts[0] = parseInt(datePartsStr[0], 10);
				dateParts[1] = parseInt(datePartsStr[1], 10);
				dateParts[2] = parseInt(datePartsStr[2], 10);

				// isValidDate takes month range 1..12
				switch (date_format) {
				//		case "MM/DD/YYYY":
				case LIB.DATE_FORMATS.MDY:
					if (isValidDate(dateParts[2], dateParts[0], dateParts[1])) {
						dt = new Date(dateParts[2], dateParts[0] - 1, dateParts[1], 0, 0, 0, 0);
					}
					break;
				//		case "DD/MM/YYYY":
				case LIB.DATE_FORMATS.DMY:
					if (isValidDate(dateParts[2], dateParts[1], dateParts[0])) {
						dt = new Date(dateParts[2], dateParts[1] - 1, dateParts[0], 0, 0, 0, 0);
					}
					break;
				//		case "YYYY-MM-DD":
				case LIB.DATE_FORMATS.YMD:
					if (isValidDate(dateParts[0], dateParts[1], dateParts[2])) {
						dt = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 0, 0, 0, 0);
					}
					break;
				}
				return dt;
			},


			/**
			* dateToDateStr
			* Validate date within range and return string based on date_format.
			* TODO: If invalid, return today's date as string?
			* @expose
			*/
			dateToDateStr = function (date, dateConventions) {
				var sep, date_format, dateStr, d, m, y = date.getFullYear();

				if (y < LIB.MIN_YEAR || y > LIB.MAX_YEAR) {
					throw erInvalidYear;
				}

				if (dateConventions) {
					date_format = dateConventions.date_format;
					sep = dateConventions.date_sep;
				} else {
					date_format = LIB.dateConventions.date_format;
					sep = LIB.dateConventions.date_sep;
				}

				// guarantees leading 0 if needed
				m = ("0" + (date.getMonth() + 1)).slice(-2);
				d = ("0" + date.getDate()).slice(-2);

				switch (date_format) {
				case LIB.DATE_FORMATS.MDY:
					dateStr = m + sep + d + sep + y;
					break;
				case LIB.DATE_FORMATS.DMY:
					dateStr = d + sep + m + sep + y;
					break;
				case LIB.DATE_FORMATS.YMD:
					dateStr = y + sep + m + sep + d;
					break;
				}
				return dateStr;
			}; // dateToDateStr

		// returns first of next month
		var getFirstNextMonth_ = function (aDate) {
			// when no date parameter, date defaults to 1
			return new Date(aDate.getFullYear(), aDate.getMonth() + 1);
		};

		return {
			/** @expose */
			addPeriods: addPeriods_,
			/** @expose */
			countPeriods: countPeriods_,
			/** @expose */
			isValidDate: isValidDate,
			/** @expose */
			dateStrToDate: dateStrToDate,
			/** @expose */
			dateToDateStr: dateToDateStr,
			/** @expose */
			getFirstNextMonth: getFirstNextMonth_
		};

	}()); // dateMath


	// Read cookies
	if (Cookies.get('ccy_format') || Cookies.get('date_format')) {
		LIB.moneyConventions = new LIB.LocalConventions(parseInt(Cookies.get('ccy_format'), 10));
		LIB.dateConventions = new LIB.LocalDateConventions(parseInt(Cookies.get('date_format'), 10));
		// clones moneyConventions and sets ccy_r = '%'
		LIB.rateConventions = LIB.moneyConventions.rateConvention(); // clones currency conventions with'%' symbol
		LIB.numConventions = LIB.moneyConventions.numConvention(); // clones currency conventions without currency
	} else if (Cookies.enabled) {
		Cookies.set('ccy_format', LIB.moneyConventions.ccy_format, {expires: Infinity}).set('date_format', LIB.dateConventions.date_format, {expires: Infinity});
	}


	/**
	* Constructs the object
	* @constructor
	* @param {number} inc
	* @return {Object}
	*/
	var Vector = function (inc) {
		if (inc === undefined || inc === 0) {
			inc = 100;
		}

		/* Properties */
		this.data = [];
		this.increment = inc;
		this.size = 0; // misnomer, actually after trimToSize() this is the last index, BUG: property changes meaning

	};
	LIB["Vector"] = Vector;
	LIB.Vector = Vector;


	// Number of elements the vector can hold
	Vector.prototype.getCapacity = function () {
		return this.data.length;
	};

	// Current size of the vector
	/** @expose */
	Vector.prototype.getSize = function () {
		return this.size;
	};


	// Checks to see if the Vector has any elements
	Vector.prototype.isEmpty = function () {
		return this.getSize() === 0;
	};


	// Returns the last element
	Vector.prototype.getLastElement = function () {
		if (this.data[this.getSize() - 1] !== null) {
			return this.data[this.getSize() - 1];
		}
	};


	// Returns the first element
	Vector.prototype.getFirstElement = function () {
		if (this.data[0] !== null) {
			return this.data[0];
		}
	};



	/** @expose @type {function(number):(Object|string)} */
	Vector.prototype.getElementAt = function (i) {
		try {
			return this.data[i];
		} catch (e) {
			// exception
			return "Exception " + e + " occured when accessing " + i;
		}
	};


	/** @expose */
	Vector.prototype.addElement = function (obj) {
		this.data[this.size] = obj; // 2 line construct replaces original to eliminate JSLint error
		this.size += 1;
	};


	// Inserts an element at a given position
	Vector.prototype.insertElementAt = function (obj, index) {
		var i;
		try {
			// 11/09/14 - corrected bug in original code. No 'capacity' property.
			if (this.size === this.getCapacity()) {
				this.resize();
			}

			for (i = this.getSize(); i > index; i -= 1) {
				this.data[i] = this.data[i - 1];
			}
			this.data[index] = obj;
			this.size += 1;
		} catch (e) {
			// exception
			return "Invalid index " + i;
		}
	};


	// Removes an element at a specific index
	Vector.prototype.removeElementAt = function (index) {
		var i, element;

		try {
			element = this.data[index];

			for (i = index; i < (this.getSize() - 1); i += 1) {
				this.data[i] = this.data[i + 1];
			}

			this.data[this.getSize() - 1] = null;
			this.size -= 1;
			return element;
		} catch (e) {
			// exception
			return "Invalid index " + index;
		}
	};


	// Removes all elements in the Vector
	Vector.prototype.removeAllElements = function () {
		var i;

		this.size = 0;

		for (i = 0; i < this.data.length; i += 1) {
			this.data[i] = null;
		}
	};


	// Get the index of a searched element
	Vector.prototype.indexOf = function (obj) {
		var i;

		for (i = 0; i < this.getSize(); i += 1) {
			if (this.data[i] === obj) {
				return i;
			}
		}
		return -1;
	};


	// true if the element is in the Vector
	Vector.prototype.contains = function (obj) {
		var i;
		for (i = 0; i < this.getSize(); i += 1) {
			if (this.data[i] === obj) {
				return true;
			}
		}
		return false;
	};


	// resize() -- increases the size of the Vector
	Vector.prototype.resize = function () {
		var i,
			newData = [];

		for  (i = 0; i < this.data.length; i += 1) {
			newData[i] = this.data[i];
		}

		this.data = newData;
	};


	// trimToSize() -- trims the vector down to it's size
	Vector.prototype.trimToSize = function () {
		var i,
			// temp = new Array(this.getSize());
			temp = [];

		for (i = 0; i < this.getSize(); i += 1) {
			temp[i] = this.data[i];
		}
		// [KT] 11/13/2015, bug fix, schedule_and_charts will have to have calls to getSize() adjusted by one
		this.size = temp.length;
		this.data = temp;
	};


	// sort() - sorts the collection based on a field name - f
	Vector.prototype.sort = function (f) {
		var i, j,
			currentValue,
			currentObj,
			compareObj,
			compareValue;

		for (i = 1; i < this.getSize(); i += 1) {
			currentObj = this.data[i];
			currentValue = currentObj[f];

			j = i - 1;
			compareObj = this.data[j];
			compareValue = compareObj[f];

			while (j >= 0 && compareValue > currentValue) {
				this.data[j + 1] = this.data[j];
				j -= 1;
				if (j >= 0) {
					compareObj = this.data[j];
					compareValue = compareObj[f];
				}
			}
			this.data[j + 1] = currentObj;
		}
	};


	/**
	* A deep cloning
	*/
	Vector.prototype.clone = function () {
		var i, newVector = new LIB.Vector(this.size);

		for (i = 0; i < this.size; i += 1) {
			if (typeof this.data[i].clone === 'function') {
				newVector.addElement(this.data[i].clone());
			} else {
				newVector.addElement(this.data[i]); // warning: potentially not a clone!
			}
		}
		return newVector;
	};


	// toString() -- returns a string rep. of the Vector
	Vector.prototype.toString = function () {
		var i, prop, obj = {},
			str = "Vector Object properties:\n" +
			"Increment: " + this.increment + "\n" +
			"Size: " + this.size + "\n" +
			"Elements:\n";

		for (i = 0; i < this.getSize(); i += 1) {
			for (prop in this.data[i]) {
				if (this.data[i].hasOwnProperty(prop)) {
					obj = this.data[i];
					str += "\tObject." + prop + " = " + obj[prop] + "\n";
				}
			}
		}
		return str;
	};


	// overwriteElementAt() - overwrites the element with an object at the specific index.
	Vector.prototype.overwriteElementAt = function (obj, index) {
		this.data[index] = obj;
	};

	return LIB;
}());


