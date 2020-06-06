import { pretty, secToStr } from './number.js';

const displayNum = (selector, num) => $(selector).html(pretty(num) );

const displayTime = (selector, num) => $(selector).html(secToStr(num) );



const check = (val, min, max) => Math.max(Math.min(val, max),min);

const verify = num => isNaN(num) || num < 0 ? 0 : num;

// @TODO move random functions from sprite.js to util

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const prettyStr = str => str.split('_').join('-').split('-').map( s => capitalize(s) ).join(' ');

const pluralize = str => str.endsWith('fish') ? str : str[str.length-1] == 'y' ? str.substring(0, str.length-1) + 'ies' : str + 's';

// console.log(pluralize('small-fish') );
// console.log(pluralize('small fish') );

// const copyText = (str)=> {
// 	console.log(str);
// 	let tmp = $('<input type="text">').appendTo(document.body).val(str).select();
// 	document.execCommand('copy');
// 	tmp.remove();
// };

// test
// setTimeout( ()=>(copyText('dogs') ), 1000);

export { displayNum, displayTime, check, verify, capitalize, prettyStr, pluralize };