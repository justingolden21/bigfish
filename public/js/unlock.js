import { openModal } from './modal.js';
import { stats, getAquariumsUsed, VALS } from './game.js';
import { showSnackbar } from './notify.js';
import { secToStr } from './number.js';
import { prettyStr, pluralize } from './util.js';

// note: use snackbar for achievements as well and similar system
// to populate achievements in modal as with notifications and stats etc

$( ()=> {
	$('.unlock').hide();
})


// later: penguins, penguin hatchery, snow bank, sell penguins
let unlocks = {
	'buildings': false, // generic for any building
	'food-farm': false,
	'small-hatchery': false,
	'medium-hatchery': false,
	'big-hatchery': false,
	'aquarium': false,
	'aquarium-factory': false,
	'bank': false,
	'bank-fish': false,
	'big-banking': false,

	// 'sell-fish': false, // generic for any fish // removed to shorten save data space
	'sell-small-fish': false,
	'sell-medium-fish': false,
	'sell-big-fish': false,

	'food': true, // for modular code elsewhere
	'small-fish': true, // for modular code elsewhere
	'medium-fish': false,
	'big-fish': false,


	'volume': false,
	'fullscreen': false,
	'fullscreen-aquarium': false,
	'stats': false,
	// 'insights': false,
};

// enums for indices
const DESCRIPTION = 0;
const COMPLETED = 1;
const HIDDEN = 2;

// @todo: change hidden from bool to how many stages until you can see it

// @todo: make some of them hidden, some of them visible
// name, description, ticks when completed, -1 if incomplete
// next var is isHidden, true if secret achievement
// hook line and sinker, i'm hooked, gone fishin
let achievements = {
	'One Fish, Two Fish': ['Purchase your first fish', -1, false],
	'Fish Sticks': ['Purchase a medium fish', -1, false],
	'Bigger Fish to Fry': ['Purchase a big fish', -1, false],
	'Always More Fish in the Sea': ['Have 1,000 total fish', -1, false],
	'Big Fish': ['Have 1,000,000 big fish', -1, true],
	'There\'s an Achievement for That!?': ['Have 1,000,000,000,000,000 big fish', -1, true],

	'Financially Responsible': ['Purchase a hatchery', -1, false],
	'Collector': ['Have at least 1 small, medium, and big hatchery', -1, false],
	'Something Smells Fishy': ['Have 100 hatcheries', -1, true],
	'Eggcellent': ['Have 100,000 hatcheries', -1, true],

	'Deep Sea Diving': ['Purchase another aquarium', -1, false],
	'Sea the World': ['Have 1,000 aquariums', -1, true],
	'Sea World': ['Have 1,000,000 aquariums', -1, true],
	'Olympic Sized': ['Have 1,000,000,000 aquariums', -1, true],

	'Disrupt the Food Chain': ['Run out of small fish', -1, true],

	'Lemonade Stand': ['Have 100 coins', -1, false],
	'Minimum Wage': ['Have 10,000 coins', -1, false],
	'A Small Loan': ['Have 1,000,000 coins', -1, true],
	'Monopoly Man': ['Have 1,000,000,000,000 coins', -1, true],

	'Foody': ['Have 1,000 food', -1, false],
	'Farming': ['Have 1,000 food farms', -1, false],
	'Food, Glorious Food': ['Have your small fish eat 100,000 food', -1, true],

	'So Long and Thanks for all the Fish': ['Sell 1,000 fish', -1, true],

	'Fried Fish': ['Have 1,000 small fish eaten', -1, true],
	'Fish and Chips': ['Have 1,000 medium fish eaten', -1, true],
	// 'Seafood': ['Have 1,000 big fish eaten', -1, true],

	'Small Banking': ['Buy your first bank', -1, false],
	'Making Bank': ['Have 1,000 banks', -1, false],
	'Big Banking': ['Unlock Big Banking', -1, false],
	'Fishy Business': ['Have 10,000,000 banks', -1, true],
	'Water You Waiting For?': ['Have 100 aquarium factories', -1, true],
	'Watergate': ['Have 100,000 aquarium factories', -1, true],

	// 'Wasted Time': ['Play for 1 hour', -1, true],
	// 'Time Well Spent': ['Play for 10 hours', -1, true],
	// 'Go Outside': ['Refrain from playing for 8 hours in a row', -1, true],
	// 'Seriously?': ['View your notification history', -1, true],
	'Scales': ['Turn on the sound, you nerd', -1, false],
	// 'Scaley Beats': ['Keep the music running for an hour in a row', -1, true],
	'Over Achiever': ['Complete 25 achievements', -1, false],

	// 'Waddle Time': ['Unlock penguins!', -1, true],
	// 'Special Snowflake': ['Have 10 snowflakes', -1, true],
	// 'Penguin Perfection': ['Have 100 penguins', -1, true],
	// 'Need More Cuddles': ['Have 100 penguin hatcheries', -1, true],
	// 'Cold Cash': ['Have 100 snow banks', -1, true],
};

// ==== import previous save ====

function importUnlocks(ul) {
	// currently the bools are converted to 1s or 0s in a string (not the most efficient but good enough)
	ul = ul.split('').map(x => x == 1 ? true : false);

	// an array of values
	let i=0;
	for(let key in unlocks) {
		unlocks[key] = ul[i++];
	}	

	// formerly just the unlocks object
	// unlocks = ul;

	// give them access to everything they had before, without notifications
	// @note: not performant
	for(let key in unlocks) {
		if(unlocks[key]) {
			unlock($(`.${key}-unlock`) );
		}
	}
}

// @todo should populate the achievement modal
function importAchievements(ac) {
	// currently only the COMPLETED property
	// the only property that changes, as exported by exportAchievements
	let i=0;
	for(let key in achievements) {
		achievements[key][COMPLETED] = ac[i++];
	}

	// more recently an array of values
	// let i=0;
	// for(let key in achievements) {
	// 	achievements[key] = ac[i++];
	// }

	// formerly just the achievements object
	// achievements = ac;

	if(getCompletedAchievementSize()>=1) unlock($('.achievement-unlock') );

	// support legacy export codes here in future
}

// a unique export procedure for just achievements to safe space
// so we don't export every description, only need index 1 (COMPLETED)
function exportAchievements() {
	let rtn = [];
	for(let key in achievements) {
		rtn.push(achievements[key][COMPLETED]);
	}
	return rtn;
}

function exportUnlocks() {
	return Object.values(unlocks).map(x => x ? 1 : 0).join('');
}

// ==== check for new unlocks and achievements ====

function checkUnlocks(inventory) {

	// notes:
	// own 1b big fish to unlock penguins
	// own 10 penguins to unlock penguin hatchery
	// own 25 penguin hatchery to unlock snow bank

	let aquariums_used = getAquariumsUsed();

	let types = ['small', 'medium', 'big'];
	for(let type of types) {
		if(inventory.fish[type] >= 200 || (inventory.fish[type] >= 40 && aquariums_used >= 0.75) ) {
			// checkUnlock(`sell-fish`);
			checkUnlock(`sell-${type}-fish`);
		}
		if(stats.fish[type].purchased >= 150) {
			checkUnlock('buildings');
			checkUnlock(`${type}-hatchery`);
		}
	}

	if(stats.food.purchased >= 250) {
		checkUnlock('buildings');
		checkUnlock('food-farm');
	}

	if(aquariums_used > 0.4) {
		checkUnlock('buildings');
		checkUnlock('aquarium');
	}



	if(inventory.fish.small >= 125) {
		checkUnlock('medium-fish');
	}
	if(inventory.fish.medium >= 125) {
		checkUnlock('big-fish');
	}

	let total_hatcheries = inventory.buildings.small_hatchery + inventory.buildings.medium_hatchery + inventory.buildings.big_hatchery;
	if(total_hatcheries >= 1e4) {
		checkUnlock('bank');
		checkUnlock('buildings');
	}

	if(inventory.buildings.aquarium >= 1e4) {
		checkUnlock('aquarium-factory');
		checkUnlock('buildings');
	}

	let total_fish = inventory.fish.small + inventory.fish.medium + inventory.fish.big;

	if(total_fish > 1e6) {
		checkUnlock('bank-fish', 'banking with fish');
	}

	if(inventory.food >= 20 || total_fish >= 10) {
		checkUnlock('volume');
	}
	if(total_fish >= 5) {
		checkUnlock('fullscreen');
	}
	if(total_fish >= 20) {
		checkUnlock('stats');
	}
	if(total_fish >= 100) {
		checkUnlock('fullscreen-aquarium');
	}
	// if(total_fish >= 5e4) {
	// 	checkUnlock('insights');
	// }


	// checks for unlocks that require player own at least one
	let own_unlocks = ['small-hatchery', 'medium-hatchery', 'big-hatchery', 'aquarium-factory'];
	for(let own_unlock of own_unlocks) {	
		if(inventory.buildings[own_unlock.replace(/\-/g,'_') ] >= 1) {
			unlock($(`.${own_unlock}-own-unlock`) );
		}
	}

	// // achievements
	if(inventory.fish.small > 1) checkAchievement('One Fish, Two Fish');
	if(inventory.fish.medium >= 1) checkAchievement('Fish Sticks');
	if(inventory.fish.big >= 1) checkAchievement('Bigger Fish to Fry');
	if(total_fish >= 1e3) checkAchievement('Always More Fish in the Sea');
	if(inventory.fish.big >= 1e6) checkAchievement('Big Fish');
	if(inventory.fish.big >= 1e15) checkAchievement('There\'s an Achievement for That!?');

	if(total_hatcheries >= 1) checkAchievement('Financially Responsible');
	if(inventory.buildings.small_hatchery >= 1 && inventory.buildings.medium_hatchery >= 1 && inventory.buildings.big_hatchery >= 1) checkAchievement('Collector');
	if(total_hatcheries >= 1e2) checkAchievement('Something Smells Fishy');
	if(total_hatcheries >= 1e5) checkAchievement('Eggcellent');

	if(inventory.buildings.aquarium > 1) checkAchievement('Deep Sea Diving');
	if(inventory.buildings.aquarium > 1e3) checkAchievement('Sea the World');
	if(inventory.buildings.aquarium > 1e6) checkAchievement('Sea World');
	if(inventory.buildings.aquarium > 1e9) checkAchievement('Olympic Sized');

	if(inventory.fish.small == 0) checkAchievement('Disrupt the Food Chain');

	if(inventory.coins >= 1e2) {
		checkAchievement('Lemonade Stand');
		if(inventory.coins >= 1e4) {
			checkAchievement('Minimum Wage');
			if(inventory.coins >= 1e6) {
				checkAchievement('A Small Loan');
				if(inventory.coins >= 1e12) {
					checkAchievement('Monopoly Man');
				}
			}
		}
	}

	if(inventory.food >= 1e3) checkAchievement('Foody');
	if(inventory.buildings.food_farm >= 1e3) checkAchievement('Farming');
	if(stats.food.eaten >= 1e5) checkAchievement('Food, Glorious Food');
	
	let fish_sold = stats.fish.small.sold + stats.fish.medium.sold + stats.fish.big.sold;
	if(fish_sold >= 1e3) checkAchievement('So Long and Thanks for all the Fish');

	if(stats.fish.small.eaten >= 1e3) checkAchievement('Fried Fish');
	if(stats.fish.medium.eaten >= 1e3) checkAchievement('Fish and Chips');
	if(stats.fish.big.eaten >= 1e3) checkAchievement('Seafood');

	if(inventory.buildings.bank >= 1) checkAchievement('Small Banking');
	if(inventory.buildings.bank >= 1e3) checkAchievement('Making Bank');
	if(inventory.buildings.bank >= 1e5) {
		checkUnlock('big-banking');
		checkAchievement('Big Banking');
	}
	if(inventory.buildings.bank >= 1e7) checkAchievement('Fishy Business');

	if(inventory.buildings.aquarium_factory >= 1e2) checkAchievement('Water You Waiting For?');
	if(inventory.buildings.aquarium_factory >= 1e5) checkAchievement('Watergate');

	if(getCompletedAchievementSize() >= 25) checkAchievement('Over Achiever');
}


// params: unlock_name is str idx in unlock object of the unlock bool
// parts are parts to unlock (html elements)
// message is displayed message in snackbar (will say "Unlocked " before it)
// function checkUnlock(unlock_name, parts, message) {
function checkUnlock(unlock_name, pretty_name='') {
	if(!unlocks[unlock_name]) {
		unlocks[unlock_name] = true;

		unlock($(`.${unlock_name}-unlock`) ); // html class

		// if(pretty_name=='') pretty_name = unlock_name.replace(/-/g,' ');
		if(pretty_name=='') pretty_name = prettyStr(pluralize(unlock_name) );
		showSnackbar(`Unlocked ${pretty_name}`, 'unlock');

		// note: commenting out for now, as players often close it immedatly on accident, may uncomment later
		// // maybe: make function for pause sequence and then resume on close (resume on close as url param)
		// if(unlock_name=='medium-fish') {
		// 	openModal('<i class="fas fa-newspaper"></i> Extra! Extra! Read All About It!',
		// 		'<p class="text-center"><b>Local Player Unlocks Medium Fish</b></p>' +
		// 		'<p><i class="fas fa-coins"></i> Medium fish cost ' + VALS.costs.fish.medium + ' coins</p>' +
		// 		'<p><i class="fas fa-coins"></i> Medium fish make ' + VALS.rates.fish.medium + ' coin/s</p>' +
		// 		'<p><i class="fas fa-fish"></i> Medium fish eat ' + 1 + ' small fish/s</p>' +
		// 		(unlocks['aquarium'] ? '<p><i class="fas fa-water"></i> Medium Fish take up ' + VALS.space.fish.medium + ' Space</p>' : '') +
		// 		'<p><i class="fas fa-arrow-left"></i> Check them out in the <b>Fish</b> tab!</p>', '', true);
		// }
		// if(unlock_name=='big-fish') {
		// 	openModal('<i class="fas fa-newspaper"></i> Extra! Extra! Read All About It!',
		// 		'<p class="text-center"><b>Local Player Unlocks Big Fish</b></p>' +
		// 		'<p><i class="fas fa-coins"></i> Big fish cost ' + VALS.costs.fish.big + ' coins</p>' +
		// 		'<p><i class="fas fa-coins"></i> Big fish make ' + VALS.rates.fish.big + ' coin/s</p>' +
		// 		'<p><i class="fas fa-fish"></i> Big fish eat ' + 1 + ' medium fish/s</p>' +
		// 		(unlocks['aquarium'] ? '<p><i class="fas fa-water"></i> Big Fish take up ' + VALS.space.fish.big + ' Space</p>' : '') +
		// 		'<p><i class="fas fa-arrow-left"></i> Check them out in the <b>Fish</b> tab!</p>', '', true);
		// }
	}
}

function checkAchievement(achievement_name) {
	if(achievements[achievement_name][COMPLETED] == -1) {
		achievements[achievement_name][COMPLETED] = stats.ticks;

		unlock($('.achievement-unlock') );

		showSnackbar(`Achievement Unlocked: ${achievement_name}<br><small>${achievements[achievement_name][DESCRIPTION]}</small>`, 'achievement');

		if(allAchievementsComplete() ) {
			openModal('<i class="fas fa-crown"></i> Congrats!',
				`<p class="text-center">You completed the game in <b>${secToStr(stats.ticks)}</b></p>
				<p class="text-center">(by completing all achievements)</p>
				<p>You're awesome <i class="fas fa-heart"></i></p>
				<p>Thank you for playing. I hope you enjoyed my game. Why stop now? Keep playing if you'd like.</p>
				<p>Any feedback, positive or negative, can be sent to contact@justingolden.me. I'm always looking to improve the game.</p>
				<p>Feel free to take a brief <b><a href="https://forms.gle/guabuoaT8DRck96dA" target="_blank">Survey</a></b> on the game to provide your input.</p>`,

				`<p><i>Special thank you to everyone testing this early version of the game 
				and giving your feedback. Your feedback matters. 
				Feel free to show this game to a just a few friends or family members if you'd like, 
				but I'd like to keep this current round of testing rather small, so please don't share too much at the moment.
				<br><br>And of course, feel free to contact me and tell me you won, and give me any feedback on what was fun or frustrating, intuitive or confusing, pretty or ugly, etc. I've got a lot of updates planned, so stay tuned. I really appreciate your support. Thank you again for testing :)</i></p>
				`,true);
		}

		// @todo: check if modal is open and if so update it
	}
}

// ==== displaying achievements ====

function getAchievementHTML() {
	let tmpHTML = '';
	for(let name in achievements) {
		if(achievements[name][COMPLETED] != -1) {
			tmpHTML += `<p><i class="fas fa-award"></i> <b>${name}</b> : ${achievements[name][DESCRIPTION]} ( ${secToStr(achievements[name][COMPLETED])} )</p>`;
		}
	}
	tmpHTML += '<hr>';
	for(let name in achievements) {
		if(achievements[name][COMPLETED] == -1) {
			if(achievements[name][HIDDEN]) {
				tmpHTML += `<p class="text-muted"><i class="fas fa-eye-slash"></i> <b>${name}</b> (hidden) </p>`;
			} else {
				tmpHTML += `<p class="text-muted"><i class="fas fa-lock-alt"></i> <b>${name}</b> : ${achievements[name][DESCRIPTION]}</p>`;
			}
		}
	}
	return tmpHTML;
}

const getAchievementSize = ()=> Object.keys(achievements).length;

const getCompletedAchievementSize = ()=> Object.keys(achievements).filter(a => achievements[a][COMPLETED] != -1).length;

const allAchievementsComplete = ()=> getCompletedAchievementSize() == getAchievementSize()

// const getVisibleAchievements = ()=> Object.keys(achievements).filter(a => achievements[a][COMPLETED] != -1 || achievements[a][HIDDEN] == false);

// ==== util ====

function unlock(elm) {
	elm.fadeIn().css('display','');
}

export { unlocks, achievements, checkUnlocks, importUnlocks, importAchievements, exportUnlocks, exportAchievements,
	getAchievementHTML, getAchievementSize, getCompletedAchievementSize, checkAchievement };