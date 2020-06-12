import { settings } from './setting.js';
import { displayTick, displayConsts, setOutOfSpaceBannerDisplay } from './display.js';
import { addManyDrawnFish, checkReduceDrawnFish } from './sprite.js';
import { checkUnlocks } from './unlock.js';
import { openModal } from './modal.js';
import { showSnackbar, highlightIf } from './notify.js';
import { check, verify, prettyStr, pluralize } from './util.js';
import { getMultiplier } from './multiplier.js';
import { round } from './number.js';
import { setupCharts } from './chart.js';
import { playSoundEffect } from './audio.js';

// ==== data ====

const DEBUG = 0;
const LOG_TIMES = false;

let inventory = {
	food: 0,
	coins: DEBUG ? 1e15 : 1,
	fish: {
		small: 1,
		medium: 0,
		big: 0,
	},
	buildings: {
		food_farm: 0,
		small_hatchery: 0,
		medium_hatchery: 0,
		big_hatchery: 0,
		aquarium: 1,
		bank: 0,
		aquarium_factory: 0,
	},
};

// display info
let hungry = {
	small: 0,
	medium: 0,
	big: 0,
};

let rates;

// @todo: keep track of how long fish have been hungry and make it an achievement?
// if fish have been hungry for a total of an hour "you're killing me here", "have fish starve for a total of an hour"
let stats = {
	ticks: 0,
	food: {
		purchased: 0,
		eaten: 0,
		farmed: 0,
	},
	fish: {
		small: {
			purchased: 0,
			eaten: 0,
			sold: 0,
			hatched: 0,
			income: 0,
		},
		medium: {
			purchased: 0,
			eaten: 0,
			sold: 0,
			hatched: 0,
			income: 0,
		},
		big: {
			purchased: 0,
			eaten: 0,
			sold: 0,
			hatched: 0,
			income: 0,
		},
	},
	buildings: {
		purchased: 0,
		sold: 0,
		factory: 0, // created/produced by factories/automatically (as opposed to purchased)
	},
};

// game constants
const VALS = {
	costs: {
		food: 1,
		fish: {
			small: 25,
			medium: 250,
			big: 2500,
		},
		buildings: {
			food_farm: 50,
			small_hatchery: 1250,
			medium_hatchery: 12500,
			big_hatchery: 125000,
			aquarium: 1e4,
			bank: 1e6,
			aquarium_factory: 1e6,
		},
	},
	rates: {
		fish: {
			small: 2,
			medium: 30,
			big: 300,
		},
		buildings: {
			food_farm: 1,
			small_hatchery: 1,
			medium_hatchery: 1,
			big_hatchery: 1,
			aquarium: 200, // workaround for display.js, same as space provided (resource provided per bxuilding)
			bank: 10,
			aquarium_factory: 1,
		},
	},
	space: {
		aquarium: 200,
		fish: {
			small: 1,
			medium: 3,
			big: 5,
		},
	},
};

// ==== import previous data ====

function importInventory(inv) {
	// currently an array of values
	let i=0;
	for(let key in inventory) {
		inventory[key] = inv[i++];
	}

	// formerly just the unlocks object
	// inventory = inv;




	addManyDrawnFish('small', inventory.fish.small-1);
	addManyDrawnFish('medium', inventory.fish.medium);
	addManyDrawnFish('big', inventory.fish.big);
}
function importStats(sts) {
	// currently an array of values
	let i=0;
	for(let key in stats) {
		stats[key] = sts[i++];
	}

	// formerly just the object
	// stats = sts;
}

// ==== setup and tick ====

function setupGame() {
	const TICK_SPEED = 1000;
	tick();
	stats.ticks = 0; // reset from above tick
	setInterval(tick, TICK_SPEED);

	displayConsts(VALS);

	setupCharts(inventory);
}

function tick() {
	if(settings.paused) return;

	stats.ticks++;

	// every min you get a pity coin
	if(stats.ticks % 60 == 0) inventory.coins += 1;

	if(LOG_TIMES) console.time('tick');
	// building tick before fish tick so fish don't appear to teleport
	resetRates();
	buildingTick();
	if(LOG_TIMES) console.timeLog('tick');
	fishTick();
	if(LOG_TIMES) console.timeLog('tick');
	checkUnlocks(inventory);
	if(LOG_TIMES) console.timeLog('tick');
	display();
	if(LOG_TIMES) console.timeEnd('tick');
}

function display() {
	displayTick(inventory, hungry, rates, VALS);
}

function resetRates() {
	rates = {
		coins: {
			small: 0,
			medium: 0,
			big: 0,
			bank: 0,
		},
		food: 0,
		fish: {
			small: 0,
			medium: 0,
			big: 0,
		},
	};
}

function fishTick() {

	let num_eat = Math.min(inventory.fish.small, inventory.food);
	inventory.food -= num_eat;
	hungry.small = inventory.fish.small - num_eat;
	rates.food -= num_eat;
	fishProduce('small', num_eat);
	stats.food.eaten += num_eat;

	num_eat = Math.min(inventory.fish.medium, inventory.fish.small);
	removeFish('small', num_eat);
	hungry.medium = inventory.fish.medium - num_eat;
	rates.fish.small -= num_eat;
	fishProduce('medium', num_eat);
	stats.fish.small.eaten += num_eat;
	hungry.small -= num_eat; // dead fish can't be hungry
	hungry.small = check(hungry.small, 0, inventory.fish.small);

	num_eat = Math.min(inventory.fish.big, inventory.fish.medium);
	removeFish('medium', num_eat);
	hungry.big = inventory.fish.big - num_eat;
	rates.fish.medium -= num_eat;
	fishProduce('big', num_eat);
	stats.fish.medium.eaten += num_eat;
	hungry.medium -= num_eat; // dead fish can't be hungry
	hungry.medium = check(hungry.medium, 0, inventory.fish.medium);
}

function fishProduce(type, num_fish) {
	// floor because with multiplier can be floating point number
	let multiplier = getMultiplier();

	$('#multiplier-text').html(`x ${round(multiplier)}`);

	// if at any point it's over 1 then show, and keep showing even if it goes down to 1 (it gets unlocked)
	if(multiplier != 1) $('#multiplier-span').show();
	// else $('#multiplier-span').hide();

	let total_earn = Math.floor(num_fish * VALS.rates.fish[type] * multiplier);

	inventory.coins += total_earn;
	rates.coins[type] += total_earn;
	stats.fish[type].income += total_earn;
}

function buildingTick() {
	if(LOG_TIMES) console.time('building tick');
	// @todo the coin rate needs to reflect the bank purchases
	if(inventory.buildings.bank > 0) {
		// if statement for efficiency, checking inputs interacts with DOM and takes time
		const max_transaction = VALS.rates.buildings.bank*inventory.buildings.bank;
	
		// let buildings = ['food-farm', 'aquarium', 'bank', 'aquarium-factory', 'small-hatchery', 'medium-hatchery', 'big-hatchery'];
		// obtain buildings in order they appear on screen
		let buildings = $('.sortable').sortable('toArray', {attribute: 'id'}).map(x=>x.replace('bank-sortable-','') );

		const do_clear = $(`#bank-buy-once-checkbox`).is(':checked');
		for(let building of buildings) {
			let key_name = building.replace('-','_');
			// let transaction_input = $(`#bank-buy-${building}-input`);
			let transaction_input = document.getElementById(`bank-buy-${building}-input`);
			// let num_transaction = verify(parseInt(transaction_input.val() ) );
			// let num_transaction = verify(parseInt(transaction_input.value) );
			let transaction_input_val = verify(Math.floor(Number(transaction_input.value) ) );
			if(transaction_input_val == 0) {
				transaction_input.classList.remove('error'); // just in case
				continue;
			}

			// limit transactions by number of banks
			let num_transaction = Math.min(transaction_input_val, max_transaction);

			// @note: takes about 15ms per time val is set
			// transaction_input.val(do_clear ? 0 : num_transaction);
			if(transaction_input != document.activeElement) { // doesn't have focus
				if(do_clear && transaction_input_val != 0) {
					transaction_input.value = 0;
				} else if(settings.bank_input_limit && num_transaction != transaction_input_val) {
					// if setting, then limit input value by number of banks
					transaction_input.value = num_transaction;
				} else if(!do_clear && transaction_input_val != num_transaction) {
					transaction_input.value = transaction_input_val;
				}

				// transaction_input.value = (do_clear ? 0 : num_transaction);
			}
			if(transaction_input == document.activeElement && do_clear) {
				// our options are either purchase and clear in the middle of them typing,
				// allow the bank to keep purchasing when they type, even if the do_clear checkbox is checked,
				// or, to simply ignore the active element until they're done, if the do_clear checkbox is checked:
				continue;
			}

			// @note: these functions check for coins and display notifications etc
			if($(`#${building}-buy-sell-switch`).is(':checked') ) { // sell
				if(building.endsWith('-fish') ) {
					let type = building.split('-')[0];
					let num_sold = sellFish(type, num_transaction);
					rates.coins.bank += Math.floor(VALS.costs.fish[type] * num_sold / 2);
				} else {
					let num_sold = sellBuildings(key_name, num_transaction, true);
					rates.coins.bank += Math.floor(VALS.costs.buildings[key_name] * num_sold / 2);
				}
			} else { // buy
				let num_bought;
				
				if(building.endsWith('-fish') ) {
					let type = building.split('-')[0];
					num_bought = buyFish(type, num_transaction);
					rates.coins.bank -= VALS.costs.fish[type] * num_bought;
				} else {
					num_bought = buyBuildings(key_name, num_transaction, true);
					rates.coins.bank -= VALS.costs.buildings[key_name] * num_bought;
				}

				if(num_bought != num_transaction) {
					transaction_input.classList.add('error');
				} else {
					transaction_input.classList.remove('error');
				}
			}
		}
		
	}

	if(LOG_TIMES) console.timeLog('building tick');

	// aquarium factories
	let num_add = inventory.buildings.aquarium_factory * VALS.rates.buildings.aquarium_factory;
	inventory.buildings.aquarium += num_add;
	stats.buildings.factory += num_add;

	// food farms
	num_add = inventory.buildings.food_farm * VALS.rates.buildings.food_farm;
	inventory.food += num_add;
	stats.food.farmed += num_add;
	rates.food += num_add;

	if(LOG_TIMES) console.timeLog('building tick');

	// hatcheries
	setOutOfSpaceBannerDisplay(false);
	let types = ['small', 'medium', 'big'];
	for(let type of types) {
		num_add = inventory.buildings[`${type}_hatchery`] * VALS.rates.buildings[`${type}_hatchery`];
		if(num_add==0) continue;
		let amount_added = addFish(type, num_add);
		stats.fish[type].hatched += amount_added;
		rates.fish[type] += amount_added;
		if(num_add != amount_added) setOutOfSpaceBannerDisplay(true);
	}

	if(LOG_TIMES) console.timeEnd('building tick');
}

// ==== purchasing ====

$( ()=> {

	$('#multiplier-span').hide();

	// make fish tabs
	// https://stackoverflow.com/a/9306228/4907950
	$('#v-pills-medium-fish').html($('#v-pills-small-fish').html().replace(/small/g, 'medium').replace(/Small/g, 'Medium').replace(/food-rate/g, 'FOOD-RATE').replace(/rate-food/g, 'tmp1').replace(/food/g, 'small fish').replace(/tmp1/g, 'rate-food').replace(/capsules/g, 'fish').replace(/FOOD-RATE/g, 'food-rate') );
	$('#v-pills-big-fish').html($('#v-pills-small-fish').html().replace(/small/g, 'big').replace(/Small/g, 'Big').replace(/food-rate/g, 'FOOD-RATE').replace(/rate-food/g, 'tmp1').replace(/food/g, 'medium fish').replace('/tmp1/g', 'rate-food').replace(/capsules/g, 'fish').replace(/FOOD-RATE/g, 'food-rate') );

	$('#v-pills-medium-hatchery').html($('#v-pills-small-hatchery').html().replace(/small/g, 'medium').replace(/Small/g, 'Medium').replace(/food/g, 'small fish').replace(/capsules/g, 'fish') );
	$('#v-pills-big-hatchery').html($('#v-pills-small-hatchery').html().replace(/small/g, 'big').replace(/Small/g, 'Big').replace(/food/g, 'medium fish').replace(/capsules/g, 'fish') );

	$('#v-pills-aquarium').html($('#v-pills-food-farm').html().replace(/food-farm/g, 'aquarium').replace(/Food Farm/g, 'Aquarium').replace(/food farm/g, 'aquarium').replace(/makes/g, 'provides').replace(/food\/s/g, 'space').replace(/\/s total/g, 'space total').replace(/farm/g, 'water').replace(/capsules/g, 'water') );
	$('#v-pills-aquarium-factory').html($('#v-pills-food-farm').html().replace(/food-farm/g, 'aquarium-factory').replace(/Food Farms/g, 'Aquarium Factories').replace(/food farm/g, 'aquarium factory').replace(/food/g, 'aquarium').replace(/farm/g, 'industry-alt').replace(/capsules/g, 'water') );
	$('#v-pills-bank').html($('#v-pills-food-farm').html().replace(/food-farm/g, 'bank').replace(/Food Farm/g, 'Bank').replace(/food farm/g, 'bank').replace(/makes/g, 'enables purchasing of').replace(/food/g, 'items').replace(/farm/g, 'landmark').replace(/capsules/g, 'money-check-edit') );
	
	$('#v-pills-aquarium .info-toggle-card .card-body').append('<br><div class="progress"></div>');

	let buildings = ['food-farm', 'aquarium', 'bank', 'aquarium-factory', 'small-hatchery', 'medium-hatchery', 'big-hatchery'];
	let bank_HTML = '';
	for(let building of buildings.concat(['small-fish', 'medium-fish', 'big-fish']) ) {
		let className = (building == 'bank' ? 'unlock big-banking-unlock' : `unlock ${building}-unlock`);
		className += (building.endsWith('-fish') ? 'unlock bank-fish-unlock' : '');
		bank_HTML += `
			<div id="bank-sortable-${building}" class="col-12 row bg-white">
			<div class="col-sm-6 col-lg-4 ${className}">
				<i class="fas fa-arrows-alt"></i>
				<label for="bank-buy-${building}-input">${prettyStr(pluralize(building) )}</label>
			</div>
			<div class="col-sm-6 col-lg-2 ${className}">
				<div class="custom-control custom-switch">
					<input type="checkbox" class="custom-control-input" id="${building}-buy-sell-switch">
					<label class="custom-control-label" for="${building}-buy-sell-switch">Buy</label>
				</div>
			</div>
			<div class="col-sm-12 col-lg-6 ${className}">
				<input id="bank-buy-${building}-input" class="form-control my-1" type="number" min="0" value="0">
			</div>
			</div>`;
	}

	$('#bank-accordion').append(`
		<div class="card">
				<div class="card-header" id="manage-bank-heading">
					<h2 class="mb-0">
						<button class="btn" type="button" data-toggle="collapse" data-target="#manage-bank-collapse" aria-expanded="false" aria-controls="manage-bank-collapse">
						<i class="fas fa-tasks"></i> Manange Banks
						</button>
					</h2>
				</div>
				<div id="manage-bank-collapse" class="card-body collapse" aria-labelledby="manage-bank-heading" data-parent="#bank-accordion">
					<p><b>Buy / Sell Buildings:</b></p>
					<div class="custom-control custom-checkbox">
						<input type="checkbox" class="custom-control-input" id="bank-buy-once-checkbox">
						<label class="custom-control-label" for="bank-buy-once-checkbox">Only buy / sell once</label>
					</div>
					<div class="row sortable">
						${bank_HTML}
					</div>
					<br>You can buy and sell up to <span class="rate-bank"></span> items/s (of each type)
					<br> Your bank transactions are causing a net change of <span class="bank-spend-rate"></span> coins/s
				</div>
			</div>
		`); // <br>You can use scientific notation (ie. 1e5=10,000)

	$('.unlock.big-banking-unlock').hide();
	$('.unlock.bank-fish-unlock').hide();

	$('.sortable').sortable({cursor:'move', axis:'y'});
	
	for(let building of buildings.concat(['small-fish', 'medium-fish', 'big-fish']) ) {

		$(`#${building}-buy-sell-switch`).change( ()=> {
			$(`label[for=${building}-buy-sell-switch]`).html($(`#${building}-buy-sell-switch`).is(':checked') ? 'Sell' : 'Buy');
		});

		// skip banks because we don't want to unlock big banking upon unlocking banks
		if(building=='bank') continue;

		// @note: don't need to check unlocks variable because they're created at the beginning
		// hide buildings that haven't been unlocked from bank menu
		$(`.unlock.${building}-unlock`).hide();


		// $(`#bank-buy-${building}-input`).hide().addClass(`unlock ${building}-unlock`);
		// $(`label[for=bank-buy-${building}-input]`).hide().addClass(`unlock ${building}-unlock`);
	}

	for(let building of buildings) {
		let key_name = building.replace('-','_');

		$(`.purchase-${building}-btns .btn`).click( (evt)=> {
			let amount = parseInt($(evt.target).html().split(' ')[0]);
			let purchased = buyBuildings(key_name, amount);

			if(purchased != amount) playSoundEffect('error');
			else playSoundEffect('button');
		});
		$(`.sell-${building}-btns .btn`).click( (evt)=> {
			let amount = parseInt($(evt.target).html().split(' ')[0]);
			let sold = sellBuildings(key_name, amount);
			
			if(sold != amount) playSoundEffect('error');
			else playSoundEffect('button');
		});
	}

	$('.purchase-food-btns .btn').click( (evt)=> {
		let amount = parseInt($(evt.target).html().split(' ')[0]);
		let purchased = buyFood(amount);
		
		if(purchased != amount) playSoundEffect('error');
		else playSoundEffect('button');
	});

	let types = ['small', 'medium', 'big'];
	for(let type of types) {
		$(`.purchase-${type}-fish-btns .btn`).click( (evt)=> {
			let amount = parseInt($(evt.target).html().split(' ')[0]);
			let purchased = buyFish(type, amount);
			
			if(purchased != amount) playSoundEffect('error');
			else playSoundEffect('button');
		});
		$(`.sell-${type}-fish-btns .btn`).click( (evt)=> {
			let amount = parseInt($(evt.target).html().split(' ')[0]);
			let sold = sellFish(type, amount);
			
			if(sold != amount) playSoundEffect('error');
			else playSoundEffect('button');
		});
	}

});

function buyFish(type, amount) {
	amount = Math.min(amount, maxCanAfford(VALS.costs.fish[type]) );

	// make sure they don't lock themselves early
	if( (type=='small' && inventory.coins < VALS.costs.fish.small * amount + VALS.costs.food && inventory.food == 0 && inventory.fish.medium == 0) ||
		(type=='medium' && inventory.coins < VALS.costs.fish.medium * amount + VALS.costs.fish.small && inventory.fish.small == 0 && inventory.fish.big == 0) ) {
		// buying one less than the most they can afford will leave them with enough coins for a small fish
		// as long as small fish are cheaper than medium fish
		// and food is cheaper than small fish
		amount = maxCanAfford(VALS.costs.fish[type]) - 1;
		console.log('idiot');
	}

	highlightIf($('.num-coins'), amount == 0);

	if(amount == 0) {
		// showSnackbar('Not enough coins', 'error');
		return 0;
	} else {
		let amount_added = addFish(type, amount);
		inventory.coins -= amount_added * VALS.costs.fish[type];
		stats.fish[type].purchased += amount_added;
		if(amount_added < amount) {
			// showSnackbar('Not enough space in aquarium', 'error');
		}
		display();
		return amount_added;
	}
}

function addFish(type, amount) {
	let space_limit = Math.floor(getSpaceRemaining() / VALS.space.fish[type]);
	let amount_added = Math.min(amount, space_limit);
	inventory.fish[type] += amount_added;
	addManyDrawnFish(type, amount_added);
	highlightIf($('.num-space-total'), amount!=amount_added);
	// setOutOfSpaceBannerDisplay(amount!=amount_added);
	return amount_added;
}

function sellFish(type, amount) {
	// cannot sell last small fish
	amount = Math.min(amount, inventory.fish[type] - (type=='small'?1:0) );

	if(amount == 0) {
		// showSnackbar(`Not enough ${type} fish`, 'error');
	} else {
		inventory.coins += Math.floor(amount * VALS.costs.fish[type] / 2);
		removeFish(type, amount);
		stats.fish[type].sold += amount;
		// setOutOfSpaceBannerDisplay(false);
		display();
	}

	return amount;
}

function removeFish(type, amount) {
	inventory.fish[type] -= amount;
	checkReduceDrawnFish(type, inventory.fish[type]);
}

function buyFood(amount) {
	amount = Math.min(amount, maxCanAfford(VALS.costs.food) );

	// make sure they don't lock themselves early
	if(inventory.coins < VALS.costs.food * amount + VALS.costs.fish.small && inventory.fish.small == 0) {
		amount = (inventory.coins - VALS.costs.fish.small) / VALS.costs.food;
		console.log('idiot');
	}

	highlightIf($('.num-coins'), amount == 0);

	if(amount == 0) {
		// showSnackbar('Not enough coins', 'error');
	} else {
		inventory.coins -= amount * VALS.costs.food;
		inventory.food += amount;
		stats.food.purchased += amount;
		display();
	}

	return amount;
}

function buyBuildings(building_name, amount, is_bank=false) {
	amount = Math.min(amount, maxCanAfford(VALS.costs.buildings[building_name]) );

	highlightIf($('.num-coins'), amount == 0);

	if(amount == 0) {
		// if(!is_bank) showSnackbar('Not enough coins', 'error');
	} else {
		inventory.coins -= amount * VALS.costs.buildings[building_name];
		inventory.buildings[building_name] += amount;
		stats.buildings.purchased += amount;
		display();
	}

	if(building_name == 'aquarium' && amount != 0) {
		highlightIf($('.num-space-total'), false);
	}

	return amount;
}

function sellBuildings(building_name, amount, is_bank=false) {
	// keep at least 1 aquarium
	amount = Math.min(amount, inventory.buildings[building_name] - (building_name=='aquarium'?1:0) );

	if(amount == 0) {
		// if(!is_bank) showSnackbar(`Not enough ${pluralize(building_name.replace('_',' ') )}`, 'error');
	} else if(building_name=='aquarium' && (inventory.buildings.aquarium - amount) * VALS.space.aquarium < getSpaceUsed() ) {
		if(!is_bank) showSnackbar(`Cannot sell full aquariums`, 'error');
	} else {
		inventory.coins += Math.floor(amount * VALS.costs.buildings[building_name] / 2);
		inventory.buildings[building_name] -= amount;
		stats.buildings.sold += amount;
		display();
	}

	return amount;
}

function maxCanAfford(cost) {
	return Math.floor(inventory.coins / cost);
}

// ==== utility / aquarium ====

function getTotalSpace() {
	return inventory.buildings.aquarium * VALS.space.aquarium;
}
function getSpaceUsed() {
	return VALS.space.fish.small * inventory.fish.small +
		VALS.space.fish.medium * inventory.fish.medium +
		VALS.space.fish.big * inventory.fish.big;
}
function getAquariumsUsed() {
	return getSpaceUsed() / getTotalSpace();
}
function getSpaceRemaining() {
	return getTotalSpace() - getSpaceUsed();
}

export { setupGame, inventory, stats, importInventory, importStats, getTotalSpace, getSpaceUsed, getAquariumsUsed, display, VALS };

// move data / inventory / stats / hungry into a variables/common file
// move buy functions to a buy file

// tests
if(DEBUG==2) {
	$( ()=> {
		setTimeout( ()=> {
			$('.purchase-food-btns .btn')[3].click();
			for(let i=0; i<10; i++) $('.purchase-small-fish-btns .btn')[3].click();
			$('.purchase-aquarium-btns .btn')[3].click();
			$('.purchase-aquarium-factory-btns .btn')[3].click();
			$('.purchase-medium-fish-btns .btn')[3].click();
			$('.purchase-small-hatchery-btns .btn')[3].click();
			$('.purchase-medium-hatchery-btns .btn')[2].click();
			$('.purchase-big-hatchery-btns .btn')[2].click();
			// for(let i=0; i<10; i++) $('.purchase-aquarium-factory-btns .btn')[3].click();
			// for(let i=0; i<10; i++) $('.purchase-medium-hatchery-btns .btn')[3].click();
			// $('.purchase-bank-btns .btn')[3].click();
			// $('#buildings-tab').click();
			// $('#v-pills-bank-tab').click();
		}, 1000);
	});
}