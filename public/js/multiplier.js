import { inventory } from './game.js';
import { openModal } from './modal.js';
import { getProgressBar } from './chart.js';
import { capitalize } from './util.js';
import { pretty } from './number.js';

// 1 + 0.2 for each power of 10 starting at 100
function getMultiplier() {
	let min_fish = Math.min(Math.min(inventory.fish.small, inventory.fish.medium), inventory.fish.big);
	if(min_fish < 100) return 1;
	let log_fish = Math.floor(Math.log10(min_fish) );
	let multiplier = (log_fish) * 0.2 + 1;
	return multiplier;
}

function updateMultiplierDisplay() {
	$('.modal-body').html(getMultiplierHTML() );
}

function getMultiplierHTML() {
	let fish_display_HTML = '';
	let min_lvl = Infinity;
	let types = ['small', 'medium', 'big'];
	for(let type of types) {
		let is_zero = false;

		let num_fish = inventory.fish[type];
		if(num_fish == 0) {
			is_zero = true;
			num_fish++;
		}
		let total_next_lvl = 10 ** Math.ceil(Math.log10(num_fish) );

		let percent = num_fish / total_next_lvl;
		let lvl = Math.floor(Math.log10(num_fish) );

		// lvl -= 1;
		if(lvl < 0) lvl = 0;

		if(percent==1) {
			if(is_zero) {
				percent = 0;
			} else {
				percent = 0.1;
			}
			// lvl++;
			total_next_lvl *= 10;
		}

		if(is_zero) {
			num_fish--;
		}

		fish_display_HTML += `<hr><b>${capitalize(type)} Fish</b><br> Level ${lvl} ${getProgressBar(percent)}
			${pretty(num_fish)} / ${pretty(total_next_lvl)}`;

		if(lvl < min_lvl) min_lvl = lvl;
	}

	return `Your fish can earn coins at a faster rate if you maintain a balanced ecosystem.<br>
			Your multiplier increase with the number of fish you have of each type,
			but it's limited by the smallest number of any type of fish you have.<br>
			${fish_display_HTML}<hr>
			You are level ${min_lvl} with multiplier ${min_lvl*0.2 + 1}`;
}

export { getMultiplier, updateMultiplierDisplay, getMultiplierHTML };