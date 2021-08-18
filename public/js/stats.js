import { stats } from './game.js';
import { unlocks } from './unlock.js';
import { capitalize, displayNum, displayTime, prettyStr } from './util.js';

function updateStatsDisplay() {
	displayTime('.stats-ticks', stats.ticks);
	displayNum('.stats-food-purchased', stats.food.purchased);
	displayNum('.stats-food-eaten', stats.food.eaten);
	displayNum('.stats-food-farmed', stats.food.farmed);

	let types = ['small', 'medium', 'big'];
	let stat_names = ['purchased', 'eaten', 'sold', 'hatched', 'income'];
	for (let type of types) {
		for (let stat_name of stat_names) {
			displayNum(
				`.stats-${type}-fish-${stat_name}`,
				stats.fish[type][stat_name]
			);
		}
	}

	displayNum('.stats-buildings-purchased', stats.buildings.purchased);
	displayNum('.stats-buildings-sold', stats.buildings.sold);
}

// @todo: display total stats for all fish (of all types, eaten, hatched, etc)
// @todo collapse elements (like details summary) for food, fish, buildings, etc (categories)
// @bug: if they unlock something while the tab is open, it won't be shown. given them unlock classes?
// @note: unlock classes won't work for content generated after page load
//   because that's when unlocks are hidden
function getStatsHTML() {
	// @todo: move charts from insights to stats tabs. only draw charts for the stats that are open

	let tmpHTML = `<ul class="nav nav-tabs" role="tablist">`;
	let stat_names = [
		'food',
		'small-fish',
		'medium-fish',
		'big-fish',
		'buildings',
	];
	let icons = ['capsules', 'fish', 'fish', 'fish', 'store-alt'];

	let active_set = false;
	for (let idx in stat_names) {
		let name = stat_names[idx];
		if (!unlocks[name]) continue;
		tmpHTML += `<li class="nav-item">
			<a class="nav-link ${onlyIf(
				'active',
				!active_set
			)}" id="stats-${name}-tab" data-toggle="tab" href="#stats-${name}" role="tab" aria-controls="stats-${name}" aria-selected="${
			idx == 0
		}">
				<i class="fas fa-${icons[idx]}"></i> ${prettyStr(name)}
			</a>
		</li>`;
		active_set = true;
	}

	tmpHTML += `</ul><div class="tab-content">`;

	for (let idx in stat_names) {
		let name = stat_names[idx];
		if (!unlocks[name]) continue;

		tmpHTML += `<div class="tab-pane show ${onlyIf(
			'active',
			idx == 0
		)}" id="stats-${name}" role="tabpanel" aria-labelledby="stats-${name}-tab">`;

		if (name == 'food') {
			tmpHTML += `Purchased: <span class="stats-food-purchased"></span><br>
				Eaten: <span class="stats-food-eaten"></span><br>
				${onlyIf(
					'Farmed: <span class="stats-food-farmed"></span><br>',
					unlocks['food-farm']
				)}`;
		} else if (name == 'buildings') {
			tmpHTML += `Purchased: <span class="stats-buildings-purchased"></span><br>
				Sold: <span class="stats-buildings-sold"></span><br>`;
			// console.log(onlyIf(`Purchased: <span class="stats-buildings-purchased"></span><br>
			// 	Sold: <span class="stats-buildings-sold"></span><br>`, unlocks['buildings']) );
			// console.log(unlocks['buildings']);
		} else {
			// fish
			let type = name.split('-')[0];
			let fish_stats = [
				'purchased',
				'eaten',
				'sold',
				'hatched',
				'income',
			];
			for (let fish_stat of fish_stats) {
				if (fish_stat == 'hatched' && !unlocks[type + '-hatchery'])
					continue;
				if (fish_stat == 'sold' && !unlocks['sell-' + type + '-fish'])
					continue;
				if (fish_stat == 'eaten' && !unlocks['medium-fish']) continue;
				tmpHTML += `${capitalize(
					fish_stat
				)}: <span class="stats-${type}-fish-${fish_stat}"></span><br>`;
			}
		}

		tmpHTML += `</div>`;
	}

	tmpHTML += `</div>`;

	return tmpHTML;

	// let tmpHTML = '';

	// let types = ['small', 'medium', 'big'];
	// let stat_names = ['purchased', 'eaten', 'sold', 'hatched', 'income'];
	// for(let type of types) {
	// 	if(!unlocks[type+'-fish']) continue;
	// 	tmpHTML += `<br><p><b>${capitalize(type)}</b></p>`;
	// 	for(let stat_name of stat_names) {
	// 		if(stat_name=='hatched' && !unlocks[type+'-hatchery']) continue;
	// 		if(stat_name=='sold' && !unlocks['sell-'+type+'-fish']) continue;
	// 		if(stat_name=='eaten' && !unlocks['medium-fish']) continue;
	// 		tmpHTML += `${capitalize(stat_name)}: <span class="stats-${type}-fish-${stat_name}"></span><br>`;
	// 	}
	// }

	// return `
	// 	<p><i class="fas fa-clock"></i> <span class="stats-ticks"></span></p>
	// 	<br><p><b>Food</b></p>
	// 	Purchased: <span class="stats-food-purchased"></span><br>
	// 	Eaten: <span class="stats-food-eaten"></span><br>
	// 	${onlyIf('Farmed: <span class="stats-food-farmed"></span><br>',unlocks['food-farm'])}
	// 	<br><p><b>Fish</b></p>
	// 	${tmpHTML}
	// 	${onlyIf(`<br><p><b>Buildings</b></p>
	// 	Purchased: <span class="stats-buildings-purchased"></span><br>
	// 	Sold: <span class="stats-buildings-sold"></span><br>`, unlocks['buildings'])}
	// `;
}

const onlyIf = (val, condition) => (condition ? val : '');

export { updateStatsDisplay, getStatsHTML };
