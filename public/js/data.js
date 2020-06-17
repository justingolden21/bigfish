import { inventory, stats, importInventory, importStats } from './game.js';
import { settings, importSettings, updateSetting } from './setting.js';
import { unlocks, achievements, importUnlocks, importAchievements, exportUnlocks, exportAchievements } from './unlock.js';

// https://stackoverflow.com/a/38134374/4907950
function encode(original) {
	return btoa(JSON.stringify(original) );
}
function decode(encoded) {
	return JSON.parse(atob(encoded) );
}

// name, val, isSell
const getBankVals = ()=> 
	$('#manage-bank-collapse .sortable input[type=number]').map( (idx, elm)=> 
		([$(elm).attr('id').replace('bank-buy-','').replace('-input',''), parseInt($(elm).val() ), Number($(elm).parent().siblings().find('input[type=checkbox]').is(':checked') ) ])
	);

function exportData() {
	// only need to do this before export
	updateSetting('bank_inputs', getBankVals() );
	// then have to handle import todo @TODO

	return encode([
		Object.values(inventory),
		Object.values(stats),
		settings,
		exportUnlocks(), // formerly just unlocks object or Object.values(unlocks)
		exportAchievements() // formerly just achievements object or Object.values(achievements)
	]);
}

const LOG_TIMES = false;

function importData(data) {
	if(data=='') return;
	if(LOG_TIMES) console.time('import');
	let decoded = decode(data);
	if(LOG_TIMES) console.timeLog('import');
	importSettings(decoded[2]); // settings first (less bugs)
	if(LOG_TIMES) console.timeLog('import');
	importInventory(decoded[0]);
	if(LOG_TIMES) console.timeLog('import');
	importStats(decoded[1]);
	if(LOG_TIMES) console.timeLog('import');
	importUnlocks(decoded[3]);
	if(LOG_TIMES) console.timeLog('import');
	importAchievements(decoded[4]);
	if(LOG_TIMES) console.timeEnd('import');
}

// tests
// setTimeout( ()=> {
// 	console.log(JSON.stringify(stats) );
// 	console.log(encode(stats) );
// 	console.log(JSON.stringify(decode(encode(stats) ) ) );
// }, 5000);


// ----

function getPlayerData() {
	// @todo
}

function setPlayerData(player_data) {
	// @todo
}

function getEmptyPlayerData() {
	// @todo
}

function deletePlayerData() {
	// @todo
}

export { exportData, importData };