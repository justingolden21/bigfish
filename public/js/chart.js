import { prettyStr } from './util.js';

google.charts.load('current', {packages:['corechart','line']});
google.charts.setOnLoadCallback( ()=> loaded = true);

let loaded = false;

class ChartManager {
	constructor(chartTitle, chartXTitle, chartYTitle, maxSize=100, chartColors=['#000'], gridColor='transparent') {
		this.title = chartTitle;
		this.chartX = chartXTitle; // can be array for multi charts
		this.chartY = chartYTitle;
		this.maxSize = maxSize;
		this.colors = chartColors
		this.gridColor = gridColor;
		this.data = [];
	}
	addData(newData) { // can be array for multi charts
		if(this.data.length < this.maxSize) {
			this.data.push(newData); // push to end
		}
		else {
			this.data.shift(); // cut from the beginning
			this.data.push(newData);
		}
		// console.log(this.data);
	}
	clearData() {
		this.data = [];
	}
	drawChart(elm) {
		if(!loaded) return false;
		let data = new google.visualization.DataTable();

		data.addColumn('number', this.chartY);
		if(typeof this.chartX == 'string') { // simple chart
			data.addColumn('number', this.chartX);
		}
		else { // multi chart
			for(let i=0; i<this.chartX.length; i++) {
				data.addColumn('number', this.chartX[i]);
			}
		}

		let rows = [];
		if(typeof this.data[0] == 'object') { // multi chart
			for(let i=0; i<this.data.length; i++) {
				let tmp = [ i+1 ];
				for(let j=0; j<this.data[i].length; j++) {
					tmp.push(this.data[i][j]);
				}
				rows.push(tmp);
			}
		}
		else {
			for(let i=0; i<this.data.length; i++) {
				rows.push([ i+1, this.data[i] ]);
			}
		}
		// console.log(rows);
		data.addRows(rows);

		let options = {
			title: this.title,
			hAxis: {
				title: this.chartX
			},
			vAxis: {
				title: this.chartY
			},
			colors: this.colors,
			backgroundColor: 'transparent',
			gridlineColor: this.gridColor,
			// chartArea: {
			// 	width: '50%',
			// 	height: '70%',
			// },
		};

		let chart = new google.visualization.LineChart(elm);
		chart.draw(data, options);
		return true;
	}
}

class PieChartManager {
	// dataTitles, chartColors, and data shoud all be arrays with same length
	constructor(chartTitle, dataTitles, data, chartColors=null, color='#000') {
		this.title = chartTitle;
		this.dataTitles = dataTitles;
		this.colors = chartColors;
		this.color = color;
		this.data = data;
	}
	updateData(newData) {
		this.data = newData;
	}
	updateDataTitles(newDataTitles) {
		this.dataTitles = newDataTitles;
	}
	drawChart(elm) {
		if(!loaded) return false;

		let vals = [ ['',''] ];
		for(let i=0; i<this.data.length; i++) {
			vals.push([ this.dataTitles[i], this.data[i] ]);
		}
		let data = google.visualization.arrayToDataTable(vals);

		let options = {
			title: this.title,
			legend: {textStyle: {color: this.color} },
			titleTextStyle: {color: this.color},
			backgroundColor: { fill: 'transparent'},
		};

		if(this.colors) {
			options.colors = this.colors;
		}

		let chart = new google.visualization.PieChart(elm);
		chart.draw(data, options);
		return true;
	}
}

const getProgressBar = (amount_full) => 
	`<div class="progress"><div class="progress-bar" role="progressbar"
	style="width: ${amount_full*100}%" aria-valuenow="${amount_full*100}"
	aria-valuemin="0" aria-valuemax="100"></div></div>`;

const getMultiBar = (amounts_full, colors) => {
	let tmp = '<div class="progress">';
	for(let idx in amounts_full) {
		tmp += `<div class="progress-bar" role="progressbar"
			style="width: ${amounts_full[idx]*100}%; background-color: ${colors[idx]}"
			aria-valuenow="${amounts_full[idx]*100}" aria-valuemin="0" aria-valuemax="100"></div>`;
	}
	return tmp + '</div>';
}

/* examples:
let cm = new ChartManager('chartTitle', 'chartXTitle', 'chartYTitle');
let x = 0;
setInterval( ()=> {
	cm.addData(x++ * Math.random() );
	cm.drawChart(document.getElementById('linechart') );
}, 1000);

// ----

let cm2 = new ChartManager('stuff vs time', ['food','money','fish'], 'time', 10, ['red','green','orange']);
let x2 = 0;
setInterval( ()=> {
	cm2.addData([x2*Math.random(), x2*Math.random(), x2++*Math.random()]);
	cm2.drawChart(document.getElementById('linechart2') );
}, 1000);

// ----

let pcm = new PieChartManager('percentages of things', ['thing 1','thing 2','thing 3'], [60,30,10], ['green','blue','purple'], 'grey');
setTimeout(drawMyPieChart, 1000);

function drawMyPieChart() {
	let result = pcm.drawChart(document.getElementById('piechart') );
	if(!result) {
		setTimeout(drawMyPieChart, 1000);
	}
}

// ----

$('body').append(getProgressBar(.75) );

// <div id="linechart"></div>
// <div id="linechart2"></div>
// <div id="piechart"></div>
*/

// @todo: each one should be their own chart, one building or fish could dwarf the size of others
// test efficiency with console.time

// @todo: split charts into tabs for buildings, fish, etc
// option for displaying all in one chart or each on their own? eh, maybe later

let cm_fish;
// let cm_fish, cm_buildings;

let cms = {};

let cms_setup = false;

function setupCharts(inventory) {
	// hsl(220, 90%, 10/30/50%)
	cm_fish = new ChartManager('Fish vs Time', ['small','medium','big'], 'Fish', 25, ['#0D59F2','#083691','#031230']);
	// cm_buildings = new ChartManager('Buildings vs Time', Object.keys(inventory.buildings).map(x => x.replace(/_/g, ' ') ), 'Buildings', 25, ['#0D59F2','#083691','#031230']);

	for(let building in inventory.buildings) {
		let buildingName = prettyStr(building);
		cms[building] = new ChartManager(`${buildingName} vs Time`, buildingName, 'Amount', 25, ['#0D59F2']);
	}

	cms_setup = true;
}

function updateChartData(inventory) {
	if(cm_fish) cm_fish.addData([inventory.fish.small, inventory.fish.medium, inventory.fish.big]);
	// if(cm_buildings) cm_buildings.addData(Object.values(inventory.buildings) );

	if(cms_setup) {
		for(let building in inventory.buildings) {
			cms[building].addData(inventory.buildings[building]);
		}
	}
}

function updateInsightsDisplay(inventory) {
	console.time('update insights');
	if(cm_fish) cm_fish.drawChart(document.getElementById('chart-fish-linechart') );
	// if(cm_buildings) cm_buildings.drawChart(document.getElementById('chart-building-linechart') );
	console.timeLog('update insights');
	for(let building in inventory.buildings) {
		cms[building].drawChart(document.getElementById(`chart-${building}-linechart`) );
	}

	console.timeEnd('update insights');
}

function getInsightsHTML(inventory) {
	let tmpHTML = `<div id="chart-fish-linechart"></div>`;
		// <div id="chart-building-linechart"></div>`;
	
	for(let building in inventory.buildings) {
		tmpHTML += `<div id="chart-${building}-linechart"></div>`;
	}

	return tmpHTML;
}

export { ChartManager, PieChartManager, getProgressBar, getMultiBar,
	setupCharts, updateChartData, updateInsightsDisplay, getInsightsHTML };