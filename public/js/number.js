import { settings } from './setting.js';

// https://officespace.zendesk.com/hc/en-us/articles/115000593531-Scientific-Notation-Large-Numbers-Guide
let num_abrev =
	'K M B T Qa Qi Sx Sp Oc No Dc Ud Td Qad Qid Sxd Spd Ocd Nod Vg Uvg'.split(
		' '
	);

const pretty = (num) => (settings.num_abrev ? prettyPrintNum(num) : num);

// Note: goes up to e244 Uvg in O(1) time, after that JS calls the number infinity
function prettyPrintNum(num) {
	let multiplier = num < 0 ? -1 : 1;
	num = Math.abs(num);
	if (num < 1e3) return round(num * multiplier).toString();

	// index of mangnitude of number
	// magnitude of 1 is thousands, 2 is millions, 3 is billions
	let num_mag = Math.floor((numDigits(num) - 1) / 3);

	// max at length of abreviations, so that if above will just divide by smaller number and use that string
	num_mag = Math.min(num_mag, num_abrev.length);

	return (
		addZeros(
			(round(num / Math.pow(10, num_mag * 3)) * multiplier).toString()
		) +
		' ' +
		num_abrev[num_mag - 1]
	);
}

const addZeros = (str) =>
	str.indexOf('.') == -1
		? str
		: str.split('.')[0] + '.' + str.split('.')[1].padEnd(3, '0');

const round = (num, places = 3) =>
	Math.round(num * Math.pow(10, places)) / Math.pow(10, places);

// https://stackoverflow.com/a/28203456/4907950
const numDigits = (num) =>
	Math.max(Math.floor(Math.log10(Math.abs(num))), 0) + 1;

// convert seconds to string of sec, min, hrs
// used for displaying stats.ticks and when achievement was earned
function secToStr(sec) {
	if (sec < 60)
		// < 1m
		return sec + 's';
	else if (sec < 3600)
		// < 1h
		return Math.floor(sec / 60) + 'm ' + (sec % 60) + 's';
	return (
		Math.floor(sec / 3600) +
		'h ' +
		(Math.floor(sec / 60) % 60) +
		'm ' +
		(sec % 60) +
		's'
	);
}

export { pretty, secToStr, round };
