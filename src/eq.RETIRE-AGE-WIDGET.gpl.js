
/** 
* @preserve Copyright 2016 Pine Grove Software, LLC
* financial-calculators.com
* pine-grove.com
* equations.js
*/

/** @const */
var EQ$ = (function (LIB) {
	'use strict';

	var EQ = LIB || {},
		// PPY = 12, // periods per year
		periodicRate,
		schedule1 = [],
		yearEnd = 12, // last month of year, NOT 0 based. 1..12
		// index (columns) values for 2 dimensional schedule array
		EVENT_DATE = 0,
		LOAN_NO = 1,
		ROW_TYPE = 2,
		PER_STR = 3,
		DATE_STR = 4,
		CF = 5, // cash flow
		CREDIT = 6,
		INT = 8,
		PRIN = 9,
		NET = 10, // net change
		BAL = 11,
		MONTH = 12,
		YEAR = 13;

	/** @expose */
	EQ.roundingMethod = 0; // last

	// local amortization methods
	EQ.AMORT_MTHD_EXT = {NORMAL: 0};

	EQ.AMORT_MTHD_STRS_EXT = ['Normal'];


	EQ.schedule = {
		schedule1: 1
	};


	/**
	* details about current cash flow
	* exported values for schedule & charts
	*/
	EQ.summary = {
		cf: [], // cash flow amount, payment, deposit etc
		firstDebitDateStr: "",
		firstCreditDateStr: "",
		lastDebitDateStr: [],
		lastCreditDateStr: [],
		totalNDebits: [],
		totalNCredits: [],
		totalInterest: [],
		totalPmts: [],
		nominalRate: [],
		NYears: 0,
		pointsPct: 0,
		pointsMoney: 0,
		amortMthd: 0,
		DIY: 0,
		unadjustedBalance: 0,
		roundingMethod: EQ.roundingMethod,
		cashFlowType: 1,
		xPmtTotal: 0
	};

	/**
	* Parameter object to initialize all financial equations
	* @constructor
	* @param {Object=} obj (optional)
	*/
	EQ.fin_params = function (obj) {
		var o = obj || {};
		this.nominalRate = (o.nominalRate !== undefined) ? o.nominalRate : null;
		this.n = o.n || null; // number of cash flows
		this.cf = o.cf || 0.0;
		this.pv = o.pv || 0.0;
		this.fv = o.fv || 0.0;
		this.pmtMthd = (o.pmtMthd !== undefined) ? o.pmtMthd : null; // Excel's "type" advance = 0 / arrears = 1
		this.amortMthd = (o.amortMthd !== undefined) ? o.amortMthd : EQ.AMORT_MTHD_EXT.NORMAL;
		this.oDate = o.oDate || new Date(0); // uninitialized origination date obj
		this.fDate = o.fDate || new Date(0); // first cash flow date
		this.lDate = o.lDate || new Date(0); // last cash flow date
	};

	// deep clone the initialization object
	EQ.fin_params.prototype.clone = function () {
		var o = {
			nominalRate: this.nominalRate,
			n: this.n,
			cf: this.cf,
			pv: this.pv,
			fv: this.fv,
			pmtFreq: this.pmtFreq,
			cmpFreq: this.cmpFreq,
			daysPerYear: this.daysPerYear,
			pmtMthd: this.pmtMthd,
			amortMthd: this.amortMthd,
			oDate: new Date(this.oDate.valueOf()),
			fDate: new Date(this.fDate.valueOf()),
			lDate: new Date(this.lDate.valueOf())
		};
		return new EQ.fin_params(o);
	};


	/**
	* calcRates(obj)
	* periodic rate is nominalRate / periods per year
	* @param {Object} obj (required)
	*/
	function calcRates(obj) {
		periodicRate = obj.nominalRate / LIB.PPY[obj.cmpFreq];
		return periodicRate;
	}


	/**
	* calcInt_periodicRate
	* calculate interest on an amount (pv) for X periods
	*/
	function calcInt_periodicRate(pv, periods) {
		var s, fv;
		fv = pv;
		if (periodicRate !== 0) {
			// regular periods of the cash flow from fDate
			s = Math.pow(1 + periodicRate, periods);
			fv = fv * s; // * (s - 1.0) * (1.0 + periodicRate) / periodicRate; // note negative result

		}
		return fv - pv; // interest

	}


	/**
	* isValid(obj)
	* Validate the inputs common to all equations
	* @param {Object} obj (required)
	*/
	function isValid(obj) {
		// set default dates
		// start date default to 1st of next month
		if (obj.oDate.valueOf() === 0) {
			obj.oDate.setTime(LIB.dateMath.getFirstNextMonth(new Date()));
		}

		// if first cash flow date not initialized then set 1 pmtFreq unit after start date
		if (obj.fDate.valueOf() === 0 && obj.pmtMthd === LIB.PMT_METHOD.ARREARS) {
			obj.fDate.setTime(LIB.dateMath.addPeriods(obj.oDate, 1, obj.pmtFreq));
		} else if (obj.fDate.valueOf() === 0) {
			obj.fDate.setTime(obj.oDate.getTime());
		}

		// dates out of sequence
		if (obj.oDate.valueOf() > obj.fDate.valueOf()) {
			return false;
		}

		// oDate and fDate are assigned or set to default - therefore pmtMthd can be set if still null
		if ((obj.pmtMthd === null || isNaN(obj.pmtMthd)) && obj.oDate.valueOf() === obj.fDate.valueOf()) {
			obj.pmtMthd = LIB.PMT_METHOD.ADVANCE;
		} else if (obj.pmtMthd === null || isNaN(obj.pmtMthd)) {
			obj.pmtMthd = LIB.PMT_METHOD.ARREARS;
		}
		return true;
	}



	/**
	* Calc number of periods - nPeriods
	*/
	EQ.N = {

		/**
		* EQ.N.calc()
		* Validates the user inputs
		* Calculates number of periods
		* @param {Object} obj (required)
		*/
		calc: function (obj) {
			var n;

			obj.n = 0; // required to pass generic validation

			// call generic validation for all finance equations
			if (isValid(obj)) {
				calcRates(obj);
				n = Math.log((periodicRate * obj.fv + obj.cf) / (periodicRate * obj.pv + obj.cf)) / Math.log(1.0 + periodicRate);
			}
			return n;
		}
	};  // EQ.N



////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////// END EQUATIONS - BUILD SCHEDULE ARRAY
////////////////////////////////////////////////////////////////////////////////////////


	/**
	* insertSubTotals()
	* Insert subtotals into schedule based on declared year end
	* Last month of year, i.e. before total rows 1..12
	*/
	function insertSubTotals(schedule, whichSchedule) {
		var i, ytdCF = 0.0, ytdCredit = 0.0, ytdInterest = 0.0, ytdPrincipal = 0.0, ytdNetChange = 0.0, runningCF = 0.0, runningCredit = 0.0, runningInterest = 0.0, runningPrincipal = 0.0, runningNetChange = 0.0, totals = [];

		if (whichSchedule === undefined || whichSchedule === null) {
			whichSchedule = LIB.schedule.schedule1;
		}

		i = 0;
		do {

			i += 1; // totals can only be inserted after array row 1
			ytdCF = LIB.roundMoney(schedule[i - 1][CF] + ytdCF);
			ytdCredit = LIB.roundMoney(schedule[i - 1][CREDIT] + ytdCredit);
			ytdInterest = LIB.roundMoney(schedule[i - 1][INT] + ytdInterest);
			ytdPrincipal = LIB.roundMoney(schedule[i - 1][PRIN] + ytdPrincipal);
			ytdNetChange = LIB.roundMoney(schedule[i - 1][NET] + ytdNetChange);
			runningCF = LIB.roundMoney(schedule[i - 1][CF] + runningCF);
			runningCredit = LIB.roundMoney(schedule[i - 1][CREDIT] + runningCredit);
			runningInterest = LIB.roundMoney(schedule[i - 1][INT] + runningInterest);
			runningPrincipal = LIB.roundMoney(schedule[i - 1][PRIN] + runningPrincipal);
			runningNetChange = LIB.roundMoney(schedule[i - 1][NET] + runningNetChange);

			// one test for when consecutive cash flows are in different calendar year and another test when cash flows are in same calendar year
			if (((schedule[i - 1][YEAR] !== schedule[i][YEAR] && (schedule[i - 1][MONTH] <= yearEnd || schedule[i][MONTH] > yearEnd))) || ((schedule[i - 1][YEAR] === schedule[i][YEAR] && (schedule[i - 1][MONTH] <= yearEnd && yearEnd < schedule[i][MONTH])))) {

				// insert the 2 total rows into schedule at year end
				totals = [];
				totals[EVENT_DATE] = schedule[i - 1][EVENT_DATE];
				totals[EVENT_DATE] = totals[EVENT_DATE].substr(0, totals[EVENT_DATE].length - 3) + '-99';
				totals[LOAN_NO] = whichSchedule;
				totals[ROW_TYPE] = LIB.ROW_TYPES.ANNUAL_TOTALS; // YTD total row marker
				totals[PER_STR] = schedule[i - 1][YEAR] + ' YTD:';
				totals[DATE_STR] = null;
				totals[CF] = ytdCF;
				totals[CREDIT] = ytdCredit;
				totals[INT] = ytdInterest;
				totals[NET] = ytdNetChange;
				totals[PRIN] = ytdPrincipal;
				totals[BAL] = null;
				totals[MONTH] = yearEnd;
				totals[YEAR] = schedule[i - 1][YEAR];

				// reset year-to-date
				ytdCF = 0;
				ytdCredit = 0.0;
				ytdInterest = 0.0;
				ytdPrincipal = 0.0;
				ytdNetChange = 0.0;
				// ytdXPmt = 0.0;

				schedule.splice(i, 0, totals);
				i += 1; // increment for row just insert

				totals = [];
				totals[EVENT_DATE] = schedule[i - 1][EVENT_DATE];
				totals[EVENT_DATE] = totals[EVENT_DATE].substr(0, totals[EVENT_DATE].length - 3) + '-99';
				totals[LOAN_NO] = whichSchedule;
				totals[ROW_TYPE] = LIB.ROW_TYPES.RUNNING_TOTALS; // running total row marker
				totals[PER_STR] = 'Running Totals:';
				totals[DATE_STR] = null;
				totals[CF] = runningCF;
				totals[CREDIT] = runningCredit;
				totals[INT] = runningInterest;
				totals[NET] = runningNetChange;
				totals[PRIN] = runningPrincipal;
				totals[BAL] = null;
				totals[MONTH] = yearEnd; // schedule[i - 1][MONTH];
				totals[YEAR] = schedule[i - 1][YEAR];

				schedule.splice(i, 0, totals);
				i += 1; // increment for row just insert
			}
		} while (i < schedule.length - 1);

		if (schedule[schedule.length - 1][ROW_TYPE] !== LIB.ROW_TYPES.RUNNING_TOTALS) {
			// pick up the values from the last row
			ytdCF = LIB.roundMoney(schedule[schedule.length - 1][CF] + ytdCF);
			ytdCredit = LIB.roundMoney(schedule[schedule.length - 1][CREDIT] + ytdCredit);
			ytdInterest = LIB.roundMoney(schedule[schedule.length - 1][INT] + ytdInterest);
			ytdPrincipal = LIB.roundMoney(schedule[schedule.length - 1][PRIN] + ytdPrincipal);
			ytdNetChange = LIB.roundMoney(schedule[schedule.length - 1][NET] + ytdNetChange);
			runningCF = LIB.roundMoney(schedule[schedule.length - 1][CF] + runningCF);
			runningCredit = LIB.roundMoney(schedule[schedule.length - 1][CREDIT] + runningCredit);
			runningInterest = LIB.roundMoney(schedule[schedule.length - 1][INT] + runningInterest);
			runningPrincipal = LIB.roundMoney(schedule[schedule.length - 1][PRIN] + runningPrincipal);
			runningNetChange = LIB.roundMoney(schedule[schedule.length - 1][NET] + runningNetChange);

			// add final set of total rows
			totals = [];
			totals[EVENT_DATE] = schedule[i][EVENT_DATE];
			totals[EVENT_DATE] = totals[EVENT_DATE].substr(0, totals[EVENT_DATE].length - 3) + '-99';
			totals[LOAN_NO] = whichSchedule;
			totals[ROW_TYPE] = LIB.ROW_TYPES.ANNUAL_TOTALS; // YTD total row marker
			totals[PER_STR] = schedule[schedule.length - 1][YEAR] + ' YTD:';
			totals[DATE_STR] = null;
			totals[CF] = ytdCF;
			totals[CREDIT] = ytdCredit;
			totals[INT] = ytdInterest;
			totals[PRIN] = ytdPrincipal;
			totals[NET] = ytdNetChange;
			totals[BAL] = null;
			totals[MONTH] = yearEnd;
			totals[YEAR] = schedule[schedule.length - 1][YEAR];
			schedule.push(totals);

			totals = [];
			totals[EVENT_DATE] = schedule[i][EVENT_DATE];
			totals[EVENT_DATE] = totals[EVENT_DATE].substr(0, totals[EVENT_DATE].length - 3) + '-99';
			totals[LOAN_NO] = whichSchedule;
			totals[ROW_TYPE] = LIB.ROW_TYPES.RUNNING_TOTALS; // running total row marker
			totals[PER_STR] = 'Running Totals:';
			totals[DATE_STR] = null;
			totals[CF] = runningCF;
			totals[CREDIT] = runningCredit;
			totals[INT] = runningInterest;
			totals[PRIN] = runningPrincipal;
			totals[NET] = runningNetChange;
			totals[BAL] = null;
			totals[MONTH] = yearEnd;
			totals[YEAR] = schedule[schedule.length - 1][YEAR];
			schedule.push(totals);
		}

		EQ.summary.totalInterest[whichSchedule] = runningInterest;
		EQ.summary.totalPmts[whichSchedule] = runningCF;
		return null;

	} // insertSubTotals()


	/**
	* initSavingsScheduleArray()
	* Initialize 2 dimension result array "schedule"
	* @param {Object} obj (required)
	*/
	function initSavingsScheduleArray(obj, whichSchedule) {
		var L, balance, cf, scheduledDateStr, periodYearString, nYears = 1, deposit, withdrawal, interestAccrued = 0.0, netChange = 0.0, trans = [], priorDate = new Date(0), transDate = new Date(0), schedule = [];

		if (whichSchedule === undefined || whichSchedule === null) {
			whichSchedule = LIB.schedule.schedule1;
		}
		if (isValid(obj)) {
			EQ.summary.totalNDebits[whichSchedule] = 0; // withdrawal
			EQ.summary.totalNCredits[whichSchedule] = 0;
			EQ.summary.NYears = 0;
			EQ.summary.nominalRate[whichSchedule] = obj.nominalRate;
			EQ.summary.pmtFreq = obj.pmtFreq;
			EQ.summary.cmpFreq = obj.cmpFreq;
			EQ.summary.amortMthd = obj.amortMthd;
			calcRates(obj);

			obj.n = Math.ceil(obj.n);
			balance = obj.pv;
			netChange = obj.pv;
			if (balance > 0) {
				deposit = balance;
				withdrawal = 0.0;
				EQ.summary.totalNCredits[whichSchedule] += 1;
			} else if (balance < 0) {
				withdrawal = balance;
				deposit = 0.0;
				EQ.summary.totalNDebits[whichSchedule] += 1;
			} else {
				deposit = 0.0;
				withdrawal = 0.0;
			}
			// process origination
			priorDate.setTime(obj.oDate.getTime());
			scheduledDateStr = LIB.dateMath.dateToDateStr(priorDate, LIB.dateConventions);
			L = 0;
			// periodYearString = L + ':' + nYears;
			periodYearString = 'Initial';

			// array index 0, record type 1, detail schedule row
			schedule.push(["", "", LIB.ROW_TYPES.DETAIL, periodYearString, scheduledDateStr, balance, deposit, withdrawal, interestAccrued, null, netChange, balance, priorDate.getMonth() + 1, priorDate.getFullYear(), priorDate, priorDate.valueOf()]);

			// process 1st cash flow
			L = 1;
			transDate.setTime(obj.fDate.getTime());
			scheduledDateStr = LIB.dateMath.dateToDateStr(transDate, LIB.dateConventions);

			cf = obj.cf; // cf may be credit (deposits) OR debits (withdrawals)
			if (cf > 0) {
				deposit = cf;
				withdrawal = 0.0;
				EQ.summary.totalNCredits[whichSchedule] += 1;
			} else if (cf < 0) {
				withdrawal = cf;
				deposit = 0.0;
				EQ.summary.totalNDebits[whichSchedule] += 1;
			} else {
				deposit = 0.0;
				withdrawal = 0.0;
			}
			interestAccrued = LIB.roundMoney(calcInt_periodicRate(balance, 1));
			netChange = LIB.roundMoney(cf + interestAccrued);
			balance = LIB.roundMoney(balance + interestAccrued + obj.cf);
			periodYearString = L + ':' + nYears;

			// array index 1, record type 1, detail schedule row
			schedule.push(["", "", LIB.ROW_TYPES.DETAIL, periodYearString, scheduledDateStr, cf, deposit, withdrawal, interestAccrued, null, netChange, balance, transDate.getMonth() + 1, transDate.getFullYear(), transDate, transDate.valueOf()]);

			// all remaining periods have to be pmtFreq length
			L = 2;
			do {
				priorDate.setTime(transDate.getTime());
				transDate.setTime(LIB.dateMath.addPeriods(transDate, 1, obj.pmtFreq));
				interestAccrued = LIB.roundMoney(calcInt_periodicRate(balance, 1));
				netChange = LIB.roundMoney(cf + interestAccrued);
				balance = LIB.roundMoney(balance + interestAccrued + obj.cf);
				scheduledDateStr = LIB.dateMath.dateToDateStr(transDate, LIB.dateConventions);

				if (withdrawal !== 0.0) {
					EQ.summary.totalNDebits[whichSchedule] += 1;
				}

				if (deposit !== 0.0) {
					EQ.summary.totalNCredits[whichSchedule] += 1;
				}

				if (L % LIB.PPY[obj.pmtFreq] === 1) {
					nYears += 1;
					EQ.summary.NYears = nYears;
				}
				periodYearString = L + ':' + nYears;
				// record type 1, detail schedule row
				schedule.push(["", "", LIB.ROW_TYPES.DETAIL, periodYearString, scheduledDateStr, cf, deposit, withdrawal, interestAccrued, null, netChange, balance, transDate.getMonth() + 1, transDate.getFullYear(), transDate, transDate.valueOf()]);
				L += 1;
			} while (L <= obj.n);


			trans = schedule[schedule.length - 1];
			EQ.summary.lastDebitDateStr[whichSchedule] = schedule[0][DATE_STR]; // loan date
			EQ.summary.lastCreditDateStr[whichSchedule] = trans[DATE_STR];
			EQ.summary.unadjustedBalance = balance;

			insertSubTotals(schedule);
			schedule1 = schedule;
			return schedule1;


		} // (isValid(obj))

		return null; // should never get here

	} // initSavingsScheduleArray(obj)


	/**
	* Calc savings schedule
	*/
	EQ.RETIRE_AGE_SCHEDULE = {

		/**
		* EQ.RETIRE_AGE_SCHEDULE.calc()
		* Validates the user inputs
		* Calculates number of periods
		* @param {Object} obj (required)
		*/
		calc: function (obj) {
			initSavingsScheduleArray(obj);
			return schedule1;
		}

	};

	return EQ;

}(LIB$));
