
/*global EQ$, jQuery, Chart, setTimeout */
/*jslint vars: true */

/** 
* @preserve Copyright 2016 Pine Grove Software, LLC
* financial-calculators.com
* pine-grove.com
* interface.schedules_and_charts.js
*/

/* GPL License for Widget & Plugins */


/**
* Schedules and Charts
* @const
*/
var SC$ = (function (EQ, $) {
	'use strict';

	var SC = EQ || {};

	// For print preview
	var strOpenTag = '<!DOCTYPE html>';
	var strHTMLHead = '<html lang="en"><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">';

	var strHTMLTitle = '<title>Your Personalized Loan Schedule</title>';

	// Note, no style sheet is loaded from disk - build dynamically

	var strStyleScreen = '<style type="text/css" media=\"screen\">';

// production for Featherlight - difference is on the HTML/Body {} tags due to scrolling requirements in iframe, removed min-height:700px; changed padding:0 0 38px; changed overflow-x: hidden;overflow-y: scroll;
	strStyleScreen = strStyleScreen + 'html,body{margin:0;padding:0;color:#333;height:100%;width:100%;min-width:320px;font-family:\"Source Code Pro\",monospace; font-size:8px; font-weight:400; overflow: hidden;} body{overflow-y: scroll} tr {line-height: 1.2} @media (min-width: 569px) {html,body{font-size:12px}} @media (min-width: 768px) {html,body{font-size:14px}} .label {font-family: \"Roboto\", sans-serif;} .medium {font-weight: 600; font-style: italic} .bold {font-weight: 700} .center {text-align: center} .left {text-align: left} .right {text-align: right} .wrapper {padding:1px; width:100%; height: 100%} table {width: 100%; border-collapse:collapse; margin-bottom: 20px;} #rpt tbody tr.totals, #rpt tbody tr:nth-child(even).totals {background-color: transparent;} #rpt tbody tr:nth-child(even) {background: #FCFFFF;} #rpt tbody tr:hover, #rpt tbody tr:hover.totals {background: #303E64; color: #fff; font-weight:400} #rpt tbody::after {content: ""; display: block; height: 29px;} .cHead {background: #303E64; color: #fff} td {padding: 5px 5px;} .spcr {width: 2%} .hCell {width: 24%} .rpt_title {width: 100%; font-size: 120%} .rpt_footer {width: 100%; font-style: italic; font-size: 90%;}  .btn {display: inline-block; margin-bottom: 0; font-weight: normal; vertical-align: middle; touch-action: manipulation; cursor: pointer; background-image: none; border: 1px solid transparent; white-space: nowrap; padding: 6px 12px; font-size: 100%; line-height: 1.42857143; border-radius: 4px; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; } td.brder {border-top: 1px solid #303E64} #btnPrint {margin-right:15px} #btnCopy {margin-left:15px} tr.empty {background-color: transparent !important; color:#333 !important;} .i {font-style: italic} .altColor{color:#00c} .rpt6col {width: 19%;} .rpt6colvnarrow {width: 7%;} .rpt6colnarrow {width: 15%;} .rpt6colwide {width: 21%;}  ';

	strStyleScreen = strStyleScreen + '</style></head>';

	var strBodyOpen = '<body><div class=\"wrapper\">';

	// closing div is for .wrapper
	var strCloseTags = '</div></body></html>';


	// End for print preview


	var ROW_TYPE = 2,
		PER_STR = 3,
		DATE_STR = 4,
		CREDIT = 6,
		INT = 8,
		PRIN = 9,
		NET = 10, // net change
		BAL = 11,
		YEAR = 13;



	//
	// build string and create HTML schedule
	// use HTML table elements for layout and style those
	// FancyBox removed. Replaced with Featherlight (MIT license)
	//
	var createSavingsScheduleTable = function (schedule) {
		var L, i, strReportPage, strSchedule, rate, dep, interest, netChange, bal, totalCredits, totalNCredits, strDate, strDateFirst, strDateLast, periodYear, totalInterest, transaction, years, summary = {};

		strReportPage = new EQ.StringBuffer();
		strSchedule = new EQ.StringBuffer();
		L = schedule.length - 1;
		summary = EQ.summary;
		strHTMLTitle = '<title>Your Personalized Cash Flow Schedule</title>';

		if (L !== 0) {
			transaction = schedule[0];
			strDate = transaction[DATE_STR];
			bal = EQ.formatLocalFloat(transaction[BAL], EQ.moneyConventions, 2);
			rate = EQ.formatLocalFloat(EQ.summary.nominalRate[1] * 100, EQ.rateConventions, 4);

			// [KT] - 11/11/2016 - array index = 1 may not be first payment. Might be total rows after initial loan event in Dec.
			i = 1;
			do {
				transaction = schedule[i]; // first cash flow
				strDateFirst = transaction[DATE_STR];
				i += 1;
			} while (strDateFirst === null && i < schedule.length);

			// pmt = EQ.formatLocalFloat(transaction[CF], EQ.moneyConventions, 2);
			// freq = EQ.STR_FREQUENCIES[transaction.pmtFreq];

			transaction = schedule[L]; // running total details
			totalCredits = EQ.formatLocalFloat(transaction[CREDIT], EQ.moneyConventions, 2);
			// totalDebits = EQ.formatLocalFloat(-transaction[DEBIT], EQ.moneyConventions, 2); // note negative sign, display value in header as positive
			totalInterest = EQ.formatLocalFloat(transaction[INT], EQ.moneyConventions, 2);

			// last cash flow details
			strDateLast = summary.lastCreditDateStr[1];
			// totalNDebits  = EQ.formatLocalFloat(summary.totalNDebits[1], EQ.numConventions, 0);
			totalNCredits = EQ.formatLocalFloat(summary.totalNCredits[1], EQ.numConventions, 0);

			// last detail row - first row
			years = schedule[L - 2][YEAR] - schedule[0][YEAR] + 1;

			strSchedule.append('<table>');
			strSchedule.append('<thead>');
			strSchedule.append('<tr class=\"label rpt_title center bold i\"><td colspan="6">Retirement Plan Summary</td></tr>');
			strSchedule.append('<tr class=\"empty\"><td colspan="6"></td></tr>');
			strSchedule.append('</thead>');

			strSchedule.append('<tbody>');
			strSchedule.append('<tr><td class=\"label hCell\">Total Investmented:</td><td class=\"right\">' + totalCredits + '</td><td class=\"spcr\">&nbsp;</td><td class=\"spcr\">&nbsp;</td><td class=\"label hCell\">Number of Investments:</td><td class=\"right\">' + totalNCredits + '</td></tr>');
			strSchedule.append('<tr><td class=\"label hCell\">Return on Investment (ROI):</td><td class=\"right\">' + rate + '</td><td class=\"spcr\">&nbsp;</td><td class=\"spcr\">&nbsp;</td><td class=\"label hCell\">Total Gain:</td><td class=\"right\">' + totalInterest + '</td></tr>');
			strSchedule.append('<tr><td class=\"label hCell\">Last Cash Flow Date:</td><td class=\"right\">' + strDateLast + '</td><td class=\"spcr\">&nbsp;</td><td class=\"spcr\">&nbsp;</td><td class=\"label hCell\">Years:</td><td class=\"right\">' + years + '</td></tr>');

			strSchedule.append('</tbody>');
			strSchedule.append('</table>');

			//c: cell
			strSchedule.append('<table id=\"rpt\">');
			strSchedule.append('<thead>');
			strSchedule.append('<tr class=\"label rpt_title center bold\"><td colspan="7">Investment Schedule</td></tr>');
			strSchedule.append('<tr class=\"empty\"><td colspan="7"></td></tr>');
			strSchedule.append('<tr class=\"label cHead\"><td class=\"rpt6colvnarrow\">#/Year</td><td class=\"rpt6colnarrow center\">Date</td><td class=\"rpt6col right\">Investment</td><td class=\"rpt6col right\">Investment Gain</td><td class=\"rpt6col right\">Net Change</td><td class=\"rpt6colwide right\">Balance</td></tr>');
			strSchedule.append('</thead>');

			strSchedule.append('<tfoot>');
			strSchedule.append('<tr class=\"label rpt_footer\"><td colspan="5">&quot;Net Change&quot; is change from prior period i.e. prior balance plus investment, plus gain on investment (interest).</td><td colspan="2" class="right">financial-calculators.com</td></tr>');
			strSchedule.append('</tfoot>');

			strSchedule.append('<tbody>');


			// start schedule
			// don't skip header row
			for (i = 0; i <= L; i += 1) {
				transaction = schedule[i];

				periodYear = transaction[PER_STR];
				strDate = transaction[DATE_STR];
				dep = EQ.formatLocalFloat(transaction[CREDIT], EQ.numConventions, 2);
				// withdrawal = EQ.formatLocalFloat(transaction[DEBIT], EQ.numConventions, 2);
				interest = EQ.formatLocalFloat(transaction[INT], EQ.numConventions, 2);
				// prin = EQ.formatLocalFloat(transaction[PRIN], EQ.numConventions, 2);
				netChange = EQ.formatLocalFloat(transaction[NET], EQ.numConventions, 2);
				bal = EQ.formatLocalFloat(transaction[BAL], EQ.numConventions, 2);
 
				if (transaction[ROW_TYPE] === EQ.ROW_TYPES.DETAIL) {
					strSchedule.append('<tr><td>' + periodYear + '</td><td class=\"center\">' + strDate + '</td><td class=\"right\">' + dep + '</td><td class=\"right\">' + interest + '</td><td class=\"right\">' + netChange + '</td><td class=\"right\">' + bal + '</td></tr>');
				} else if (transaction[ROW_TYPE] === EQ.ROW_TYPES.ANNUAL_TOTALS) {
					// with line
					strSchedule.append('<tr class=\"totals medium\"><td class=\"right\" colspan=\"2\">' + periodYear + '</td><td class=\"right brder\">' + dep + '</td><td class=\"right brder\">' + interest + '</td><td class=\"right brder\">' + netChange + '</td><td></td></tr>');
				} else {
					strSchedule.append('<tr class=\"totals medium\"><td class=\"right\" colspan=\"2\">' + periodYear + '</td><td class=\"right\">' + dep + '</td><td class=\"right\">' + interest + '</td><td class=\"right\"></td><td></td></tr>');
					strSchedule.append('<tr class=\"empty\"><td colspan=\"7\"></td></tr>');
				}
			} // for
			strSchedule.append('</tbody>');
			strSchedule.append('</table>');
		} // L !== 0


		// build report
		strReportPage.append(strOpenTag);
		strReportPage.append(strHTMLHead);
		strReportPage.append(strHTMLTitle);
		strReportPage.append(strStyleScreen);
		strReportPage.append(strBodyOpen);
		strReportPage.append(strSchedule.toString());
		strReportPage.append(strCloseTags);

		// this works, using the iframe's id, no jQuery. Modification to Featherlight code required to add element id.
		// Note: style iframe with this css selector .featherlight iframe {..}
		$.featherlight({iframe: 'about:blank', beforeOpen: function () {$("body").css({"overflow-y" : "hidden"}); }, afterClose : function () {$("body").css({"overflow-y": "scroll"}); } });
		var oIframe = document.getElementById('featherlight-id-fc');  // Featherlight's iframe
		var iframeDoc = (oIframe.contentWindow.document || oIframe.contentDocument);
		iframeDoc.open();
		iframeDoc.write(strReportPage.toString());
		iframeDoc.close();
	}; // createSavingsScheduleTable



	////////////////////////////////////////////////////////////////////////
	/////////////////////// CHARTS /////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////
	var createChartsMIT = {

		// page with 3 charts
		html3: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Financial Calculators Charts</title><style type="text/css" media=\"screen\">html,body{margin:0;padding:0;color:#333;height:100%;width:100%;overflow: hidden;} body{overflow-y: scroll} #container{width: 95%; margin: 10px auto;} canvas {margin-bottom:25px;}</style></head><body><div id="container"><canvas id="canvas1"></canvas><canvas id="canvas2"></canvas><canvas id="canvas3"></canvas></div></body></html>',
		L: 0,
		annualTotals: null,
		runningTotals: null,
		totalsPie: null,
		years: null,
		chart0Title: 'Annual Investment and Interest Totals',
		chart1Title: 'Accumulated Investment and Interest',
		chart2Title: 'Amount Invested & Interest as Percentage of Total Value',
		// Bootstrap 3.0 colors
		bs_primary_blue: '#337ab7', // basic blue, primary
		bs_info_blue: '#5bc0de', // light blue, info
		bs_success_green: '#5cb85c', // green, success
		bs_orange_warning: '#f0ad4e', // orange, warning
		bs_red_danger: '#d9534f', // red, danger
		// index (columns) values for 2 dimensional schedule array
		EVENT_DATE: 0,
		LOAN_NO: 1,
		ROW_TYPE: 2,
		PER_STR: 3,
		DATE_STR: 4,
		CF: 5, // cash flow
		CREDIT: 6,
		DEBIT: 7,
		INT: 8,
		PRIN: 9,
		NET: 10, // net change
		BAL: 11,
		MONTH: 12,
		YEAR: 13,
		annual_int: [],
		annual_prin: [],
		annual_pmt: [],
		annual_credit: [],
		running_int: [],
		running_prin: [],
		running_pmt: [],
		net_change: [],
		bal: [],
		d8: [],
		d9: [],
		d10: [],
		d11: [],
		category: [],
		interest: 0,
		prin: 0,
		rate: 0,
		payments: 0,
		balance: 0,
		strDate: '01/01/1999',
		strDate2: '01/01/1999',
		strDate2bi: '01/01/1999',
		kStr: EQ.moneyConventions.ccy_r === '' ? 'k' : ' k',


		// reset data arrays
		clear: function () {
			createChartsMIT.L =  0;
			createChartsMIT.annual_int =  [];  // d1 =  [],
			createChartsMIT.annual_prin =  []; // d2 =  [],
			createChartsMIT.annual_pmt =  []; // d3 =  [],
			createChartsMIT.annual_credit =  [];
			createChartsMIT.net_change =  [];

			createChartsMIT.running_int =  []; // d4 =  [],
			createChartsMIT.running_prin =  []; // d5 =  [],
			createChartsMIT.running_pmt =  []; // d6 =  [],
			createChartsMIT.d9 =  [];
			createChartsMIT.bal =  []; // d7 =  [],
			createChartsMIT.category =  [];
		},


		/////////////////////////////////////////
		initAnnualSavingsTotalChart: function (iframeDoc) {
			// stacked bar showing annual totals, line show annual payments
			var barChartData = {
				labels: createChartsMIT.category, // year labels for x-axis
				datasets: [{
					type: 'bar',
					label: 'Annual Investment',
					backgroundColor: "rgba(217,83,79,0.75)",
					data: createChartsMIT.annual_credit
				}, {
					type: 'bar',
					label: 'Annual Interest',
					backgroundColor: "rgba(92,184,92,0.75)",
					data: createChartsMIT.annual_int // annual interest totals
				}, {
					type: 'line',
					label: 'Change in Balance',
					borderWidth: 1, // width in pixels
					borderColor: "rgba(51,51,51,0.5)", // line color
					pointBackgroundColor: "rgba(0,0,0,0.75)",
					//fill: false, // these can be set once in the global object
					//lineTension: 0,
					data: createChartsMIT.net_change // change in value
				}]
			};


			// get a canvas to draw on
			var ctx = iframeDoc.getElementById("canvas1").getContext("2d");
			// allocate and initialize a chart
			createChartsMIT.runningTotals = new Chart(ctx, {
				type: 'bar',
				data: barChartData,
				options: {
					title: {
						display: true,
						text: createChartsMIT.chart0Title  // "Chart.js Bar Chart - Stacked"
					},
					tooltips: {
						mode: 'label',
						callbacks: {
							label: function (tooltipItems) {
								return EQ.formatLocalFloat(tooltipItems.yLabel, EQ.moneyConventions, 0);
							}
						}
					},
					responsive: true,
					scales: {
						xAxes: [{
							stacked: true
						}],
						yAxes: [{
							stacked: true,
							ticks: {
								callback: function (label) {
									return EQ.formatLocalFloat(label / 1000, EQ.moneyConventions, 0) + createChartsMIT.kStr;
								}
							}
						}]
					}
				}
			});


		}, // initAnnualSavingsTotalChart()



		initAccumulatedSavingsTotalChart: function (iframeDoc) {
			// stacked bar showing annual totals, line show annual payments
			var barChartData = {
				labels: createChartsMIT.category, // year labels for x-axis
				datasets: [{
					type: 'bar',
					label: 'Running Investment',
					backgroundColor: "rgba(217,83,79,0.75)",
					data: createChartsMIT.d9
				}, {
					type: 'bar',
					label: 'Running Interest',
					backgroundColor: "rgba(92,184,92,0.75)",
					data: createChartsMIT.running_int // annual interest totals
				}, {
					type: 'line',
					label: 'Balance',
					borderWidth: 1, // width in pixels
					borderColor: "rgba(51,51,51,0.5)", // line color
					pointBackgroundColor: "rgba(0,0,0,0.75)",
					//fill: false, // these can be set once in the global object
					//lineTension: 0,
					data: createChartsMIT.bal // change in value
				}]
			};


			// get a canvas to draw on
			var ctx = iframeDoc.getElementById("canvas2").getContext("2d");
			// allocate and initialize a chart
			createChartsMIT.annualTotals = new Chart(ctx, {
				type: 'bar',
				data: barChartData,
				options: {
					title: {
						display: true,
						text: createChartsMIT.chart1Title 
					},
					tooltips: {
						mode: 'label',
						callbacks: {
							label: function (tooltipItems) {
								return EQ.formatLocalFloat(tooltipItems.yLabel, EQ.moneyConventions, 0);
							}
						}
					},
					responsive: true,
					scales: {
						xAxes: [{
							stacked: true
						}],
						yAxes: [{
							stacked: true,
							ticks: {
								callback: function (label) {
									return EQ.formatLocalFloat(label / 1000, EQ.moneyConventions, 0) + createChartsMIT.kStr;
								}
							}
						}]
					}
				}
			});
		}, // initAccumulatedSavingsTotalChart



		/////////////////////////////////////////
		initSavingsPIPieChart: function (iframeDoc) {
			var config = {
					type: 'pie',
					data: {
						datasets: [{
							data: [
								createChartsMIT.prin,
								createChartsMIT.interest
							],
							backgroundColor: [
								"rgba(92,184,92,0.75)",
								"rgba(217,83,79,0.75)"
							]
						}],
						labels: [
							"Total Deposits",
							"Total Interest Earned"
						]
					},
					options: {
						tooltips: {
							mode: 'label',
							callbacks: {
								label: function (tooltipItems, data) {
									var allData = data.datasets[tooltipItems.datasetIndex].data;
									var tooltipData = allData[tooltipItems.index];
									var label = [];
									label[0] = data.labels[tooltipItems.index] + ': ' + EQ.formatLocalFloat(tooltipData, EQ.moneyConventions, 0);
									label[1] = 'Total Value: ' + EQ.formatLocalFloat(EQ.roundMoney((createChartsMIT.prin + createChartsMIT.interest), 2), EQ.moneyConventions, 0);
									label[2] = 'Pct. of Total: ' + EQ.formatLocalFloat(EQ.roundMoney((tooltipData / (createChartsMIT.prin + createChartsMIT.interest)) * 100, 1), EQ.rateConventions, 1);
									return label;
								}
							}
						},
						responsive: true,
						title: {
							display: true,
							text: createChartsMIT.chart2Title //"Chart.js Bar Chart - Stacked"
						}
					}
				};

			// get a canvas to draw on
			var ctx = iframeDoc.getElementById("canvas3").getContext("2d");
			// allocate and initialize a chart
			createChartsMIT.totalsPie = new Chart(ctx, config);

		}, // initSavingsPIPieChart



		////////////////////////////////////////////////////
		// capture data for charts
		createSavingsCharts: function (schedule) {
			var L, i, j, transaction, bal;

			j = 0;
			L = schedule.length - 1;
			createChartsMIT.years = EQ.summary.NYears;

			for (i = 0; i <= L; i += 1) {
				transaction = schedule[i];

				// if (transaction[ROW_TYPE] === EQ.ROW_TYPES.ANNUAL_TOTALS || (EQ.summary.pmtFreq === EQ.PMT_FREQUENCY.ANNUALLY && transaction[ROW_TYPE] !== EQ.ROW_TYPES.RUNNING_TOTALS)) {
				if (transaction[ROW_TYPE] === EQ.ROW_TYPES.ANNUAL_TOTALS) {
					createChartsMIT.annual_credit.push(transaction[CREDIT]);
					createChartsMIT.annual_int.push(transaction[INT]);
					createChartsMIT.net_change.push(transaction[NET]);
					// if less than or equal to 11 years or divisible by 3, show calendar year label
					if ((createChartsMIT.years <= 11) || (j % 3 === 0) || j === 0) {
						createChartsMIT.category.push(transaction[YEAR]);
					} else {
						createChartsMIT.category.push("");
					}
					j += 1;
				} else if (transaction[ROW_TYPE] === EQ.ROW_TYPES.RUNNING_TOTALS) {
					createChartsMIT.d9.push(transaction[CREDIT]);
					createChartsMIT.running_int.push(transaction[INT]);
					createChartsMIT.running_prin.push(transaction[PRIN]);
					createChartsMIT.bal.push(bal);
				} else {
					// balance from a normal transaction so it can be pushed
					bal = transaction[BAL];
				}
			} // for


			// init data for pie chart
			transaction = schedule[L];
			createChartsMIT.interest = transaction[INT];
			createChartsMIT.prin = transaction[CREDIT];
			// createChartsMIT.payments = transaction[DEBIT];

			transaction = schedule[0];
			createChartsMIT.strDate = transaction[DATE_STR];

			transaction = schedule[L - 1];
			createChartsMIT.strDate2 = transaction[DATE_STR];
			createChartsMIT.balance = transaction[BAL];
			createChartsMIT.rate = EQ.summary.nominalRate[1] * 100;


			// init lightbox with empty iframe, prevent parent page from scrolling while lightbox is open - inserting iframe ID DID NOT WORK WITH IE 11 (of course), tried afterOpen(), afterContent()
			// modified Featherlight source code instead
//			$.featherlight({iframe: 'about:blank', beforeOpen: function () {$("body").css({"overflow-y" : "hidden"}); }, afterOpen : function () {$('.featherlight iframe').attr('id', 'featherlight-id-fc'); }, beforeClose : function () {createChartsMIT.annualTotals.destroy(); createChartsMIT.annualTotals = null; createChartsMIT.runningTotals.destroy(); createChartsMIT.runningTotals = null; createChartsMIT.totalsPie.destroy(); createChartsMIT.totalsPie = null; }, afterClose : function () {$("body").css({"overflow-y": "scroll"}); }});

			$.featherlight({iframe: 'about:blank', beforeOpen: function () {$("body").css({"overflow-y" : "hidden"}); }, beforeClose : function () {createChartsMIT.clear(); createChartsMIT.annualTotals.destroy(); createChartsMIT.annualTotals = null; createChartsMIT.runningTotals.destroy(); createChartsMIT.runningTotals = null; createChartsMIT.totalsPie.destroy(); createChartsMIT.totalsPie = null; }, afterClose : function () {$("body").css({"overflow-y": "scroll"}); }});
			var oIframe = document.getElementById('featherlight-id-fc');  // Featherlight's iframe
			var iframeDoc = (oIframe.contentDocument || oIframe.contentWindow.document);
			iframeDoc.open();
			iframeDoc.write(createChartsMIT.html3); // create an empty page in the iframe with 3 canvases
			iframeDoc.close();


			// initialize and show chart objects, note: setTimeout() is a Firefox work around
			setTimeout(function () {createChartsMIT.initAnnualSavingsTotalChart(iframeDoc); }, 500);
			setTimeout(function () {createChartsMIT.initAccumulatedSavingsTotalChart(iframeDoc); }, 500);
			setTimeout(function () {createChartsMIT.initSavingsPIPieChart(iframeDoc); }, 500);
			// createChartsMIT.createAnnualSavingsTotalChart();
			// createChartsMIT.createAccumulatedSavingsTotalChart();
			// createChartsMIT.createSavingsPIPieChart();

		} // createSavingsCharts

	};  // createChartsMIT


	SC.showSavingsSchedule = function (schedule) {
		createSavingsScheduleTable(schedule);
	};

	SC.showSavingsCharts = function (schedule) {
		createChartsMIT.createSavingsCharts(schedule);
		// createCharts.createSavingsCharts(schedule);
	};
	return SC;

}(EQ$, jQuery));
