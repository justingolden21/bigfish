import {
	inventory,
	getTotalSpace,
	getSpaceUsed,
	getAquariumsUsed,
	VALS,
	INCREASING_COST_BUILDINGS,
} from './game.js';
import { updateStatsDisplay } from './stats.js';
import { updateDescriptionDisplay } from './description.js';
import { updateMultiplierDisplay } from './multiplier.js';
import { displayNum } from './util.js';
import { pretty } from './number.js';
import { unlocks } from './unlock.js';
import { highlightIf } from './notify.js';
import {
	getProgressBar,
	getMultiBar,
	updateChartData,
	updateInsightsDisplay,
} from './chart.js';
import { getIncreasingCost } from './increasing_cost.js';

const LOG_TIMES = false;

function displayConsts(VALS) {
	displayNum('.data-food-cost', VALS.costs.food);
	displayNum('.data-food-seconds-fed', 1);
	displayNum('.data-food-per-purchase', 1);

	let types = ['small', 'medium', 'big'];
	for (let type of types) {
		displayNum(`.data-${type}-fish-cost`, VALS.costs.fish[type]);
		displayNum(
			`.data-${type}-fish-sell`,
			Math.floor(VALS.costs.fish[type] / 2)
		);
		displayNum(`.data-${type}-fish-coin-rate`, VALS.rates.fish[type]);
		displayNum(`.data-${type}-fish-space`, VALS.space.fish[type]);

		displayNum(`.data-${type}-fish-food-rate`, 1);
		displayNum(`.data-${type}-fish-per-purchase`, 1);
	}

	const buildings = [
		'food-farm',
		'aquarium',
		'bank',
		'aquarium-factory',
		'small-hatchery',
		'medium-hatchery',
		'big-hatchery',
	];

	for (let building of buildings) {
		let key_name = building.replace('-', '_');

		displayNum(`.data-${building}-rate`, VALS.rates.buildings[key_name]);

		displayNum(`.data-${building}-per-purchase`, 1);
		displayNum(`.data-${building}-cost`, VALS.costs.buildings[key_name]);
		displayNum(
			`.data-${building}-sell`,
			Math.floor(VALS.costs.buildings[key_name] / 2)
		);
	}

	const upgrades = ['cost-divider'];
	for (let upgrade of upgrades) {
		let key_name = upgrade.replace('-', '_');
		displayNum(`.data-${upgrade}-per-purchase`, 1);
	}
}

function displayTick(inventory, hungry, rates, VALS) {
	if (LOG_TIMES) console.time('display');
	displayNum('.num-coins', inventory.coins);
	displayNum('.num-food', inventory.food);
	displayNum(
		'.num-fish',
		inventory.fish.small + inventory.fish.medium + inventory.fish.big
	);
	displayNum('.num-hungry-fish', hungry.small + hungry.medium + hungry.big);

	displayNum(
		'.rate-num-coins',
		rates.coins.small +
			rates.coins.medium +
			rates.coins.big +
			rates.coins.bank
	);
	displayNum('.rate-num-food', rates.food);

	// displayNum('.data-food-cost', VALS.costs.food);
	// displayNum('.data-food-seconds-fed', 1);
	// displayNum('.data-food-per-purchase', 1);

	if (LOG_TIMES) console.timeLog('display');
	let types = ['small', 'medium', 'big'];
	for (let type of types) {
		displayNum(`.num-${type}-fish`, inventory.fish[type]);
		displayNum(`.num-hungry-${type}-fish`, hungry[type]);

		// displayNum(`.data-${type}-fish-cost`, VALS.costs.fish[type]);
		// displayNum(`.data-${type}-fish-sell`, Math.floor(VALS.costs.fish[type]/2) );
		// displayNum(`.data-${type}-fish-coin-rate`, VALS.rates.fish[type]);
		displayNum(`.rate-coin-${type}-fish`, rates.coins[type]);
		displayNum(
			`.rate-food-${type}-fish`,
			1 * (inventory.fish[type] - hungry[type])
		);
		// displayNum(`.data-${type}-fish-space`, VALS.space.fish[type]);
		displayNum(
			`.num-${type}-fish-space`,
			VALS.space.fish[type] * inventory.fish[type]
		);

		// displayNum(`.data-${type}-fish-food-rate`, 1);
		// displayNum(`.data-${type}-fish-per-purchase`, 1);
	}

	if (LOG_TIMES) console.timeLog('display');
	let buildings = [
		'food-farm',
		'aquarium',
		'bank',
		'aquarium-factory',
		'small-hatchery',
		'medium-hatchery',
		'big-hatchery',
	];
	for (let building of buildings) {
		let key_name = building.replace('-', '_');

		// @todo rename "rates" in vals to "provided" to be more generic and accurate?

		displayNum(`.num-${building}`, inventory.buildings[key_name]);
		// displayNum(`.data-${building}-rate`, VALS.rates.buildings[key_name]);
		displayNum(
			`.rate-${building}`,
			VALS.rates.buildings[key_name] * inventory.buildings[key_name]
		);

		// displayNum(`.data-${building}-per-purchase`, 1);
		// displayNum(`.data-${building}-cost`, VALS.costs.buildings[key_name]);
		// displayNum(`.data-${building}-sell`, Math.floor(VALS.costs.buildings[key_name]/2) );
	}

	const upgrades = ['cost-divider'];
	for (let upgrade of upgrades) {
		let key_name = upgrade.replace('-', '_');
		displayNum(`.num-${upgrade}`, inventory.upgrades[key_name]);
	}

	// upgrade cost is not constant, hence in displayTick and not displayConsts
	for (let upgrade of upgrades) {
		let key_name = upgrade.replace('-', '_');

		// upgrade cost = base_cost * 10^num_owned
		displayNum(
			`.data-${upgrade}-cost`,
			VALS.costs.upgrades[key_name] *
				Math.pow(10, inventory.upgrades[key_name])
		);
	}

	// could put these in if statement if aquariums are unlocked (and do similar for others)
	// but it's just multiplying by 0 and then returning a value that's not displayed anyway...
	let space_used = getSpaceUsed();
	let space_total = getTotalSpace();
	displayNum('.num-space-used', space_used);
	displayNum('.num-space-total', space_total);

	// $('#v-pills-aquarium .info-toggle-card .card-body .progress').remove();
	// $('#v-pills-aquarium .info-toggle-card .card-body').append('<br>'+getProgressBar(space_used/space_total) );
	$('#v-pills-aquarium .info-toggle-card .card-body .progress').html(
		getProgressBar(space_used / space_total)
	);

	if (unlocks['big-fish']) {
		// multibar
		let sm_space =
			(VALS.space.fish.small * inventory.fish.small) / space_total;
		let md_space =
			(VALS.space.fish.medium * inventory.fish.medium) / space_total;
		let lg_space = (VALS.space.fish.big * inventory.fish.big) / space_total;
		$('#aquarium-multibar').html(
			getMultiBar(
				[sm_space, md_space, lg_space],
				[
					'hsl(205, 90%, 60%)',
					'hsl(205, 90%, 30%)',
					'hsl(220, 90%, 30%)',
				]
			)
		);
		$('#aquarium-multibar').attr(
			'title',
			`${pretty(inventory.fish.small)} small, ${pretty(
				inventory.fish.medium
			)} medium, and ${pretty(inventory.fish.big)} big fish`
		);
	}

	displayNum('.bank-spend-rate', rates.coins.bank);

	highlightIf($('.num-coins'), false);
	highlightIf($('.num-space-total'), space_used == space_total);

	// @todo make function in modal for isModalOpen(modal_name)

	// if stats modal is open
	if (
		$('.modal-title').html().indexOf('Stats') != -1 &&
		$('.modal').hasClass('show')
	) {
		updateStatsDisplay();
	}

	updateChartData(inventory);

	// if insights modal is open
	if (
		$('.modal-title').html().indexOf('Insights') != -1 &&
		$('.modal').hasClass('show')
	) {
		updateInsightsDisplay(inventory);
	}

	// if multiplier modal is open
	if (
		$('.modal-title').html().indexOf('Multiplier') != -1 &&
		$('.modal').hasClass('show')
	) {
		updateMultiplierDisplay();
	}

	updateDescriptionDisplay(inventory);

	displayIncreasingCosts();

	if (LOG_TIMES) console.timeEnd('display');
}

function displayIncreasingCosts() {
	for (let building of INCREASING_COST_BUILDINGS) {
		let costs = [];
		for (let amount of [1, 10, 100, 1000]) {
			let key_name = building.replace('-', '_');
			let cost = getIncreasingCost(
				amount,
				Math.ceil(
					VALS.costs.buildings[key_name] /
						Math.pow(10, inventory.upgrades.cost_divider)
				),
				inventory.buildings[key_name],
				VALS.costs.buildings[key_name]
			);
			costs.push(cost);
		}
		$(`.data-${building}-cost`).html(
			costs.map((x) => pretty(x)).join(', ')
		);
		$(`.data-${building}-per-purchase`).html('1, 10, 100, 1000');
		// display each aquarium costs more in info
	}
}

function setOutOfSpaceBannerDisplay(shown) {
	if (shown) $('#out-of-space-banner').addClass('show');
	else $('#out-of-space-banner').removeClass('show');
}

export { displayTick, displayConsts, setOutOfSpaceBannerDisplay };
