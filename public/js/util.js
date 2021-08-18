import { pretty, secToStr } from './number.js';

// display functions

const displayNum = (selector, num) => $(selector).html(pretty(num));

const displayTime = (selector, num) => $(selector).html(secToStr(num));

// verification functions

const check = (val, min, max) => Math.max(Math.min(val, max), min);

const verify = (num) => (isNaN(num) || num < 0 ? 0 : num);

// string formating functions

const capitalize = (str) =>
	str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const prettyStr = (str) =>
	str
		.split('_')
		.join('-')
		.split('-')
		.map((s) => capitalize(s))
		.join(' ');

const pluralize = (str) =>
	str.endsWith('fish')
		? str
		: str[str.length - 1] == 'y'
		? str.substring(0, str.length - 1) + 'ies'
		: str[str.length - 1] == 's'
		? str
		: str + 's';

export {
	displayNum,
	displayTime,
	check,
	verify,
	capitalize,
	prettyStr,
	pluralize,
};
