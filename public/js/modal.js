import { stats, display, inventory } from './game.js';
import { settings, toggleSetting } from './setting.js';
import { updateStatsDisplay, getStatsHTML } from './stats.js';
import { updateInsightsDisplay, getInsightsHTML } from './chart.js';
import { getMultiplierHTML } from './multiplier.js';
import { showSnackbar, getNotificationHistory } from './notify.js';
import { exportData, doImport } from './data.js';
import { getAchievementHTML, getAchievementSize, getCompletedAchievementSize, unlocks } from './unlock.js';

function openModal(title, body, footer='', is_big=false) {
	$('#default-modal .modal-title').html(title);
	$('#default-modal .modal-body').html(body);
	$('#default-modal .modal-footer').html(footer);
	if(is_big) {
		$('#default-modal .modal-dialog').addClass('modal-lg');
	} else {
		$('#default-modal .modal-dialog').removeClass('modal-lg');
	}
	$('#default-modal.modal').modal('show');
}

$( ()=> {

	// @bug: notifications aren't added to notification modal as they're displayed (check if modal is open with bool and append to it?)
	// @todo: add clear notification history btn
	// maybe sort by types of notifications, add options to delete all of a certain type, btn to remove all notifications from queue?
	// options for notifications in settings link( which notifications are displayed, durration on screen, )
	$('#notifications-modal-btn').click( ()=> {
		openModal(
			`<i class="fas fa-history"></i> Notifications`,
			getNotificationHistory().reverse().join('<br>')
		);
	});

	$('#multiplier-info-btn').click( ()=> {
		openModal(
			`<i class="fas fa-info-circle"></i> Ecosystem Multiplier`,
			getMultiplierHTML()
		);
	});

	// @todo call stats.getHTML in separate stats js file
	$('#stats-modal-btn').click( ()=> {
		openModal(
			`<i class="fas fa-sort-amount-up"></i> Stats`,
			getStatsHTML(),
			`<p><i class="fas fa-clock"></i> <span class="stats-ticks"></span></p>`,
			true
		);
		updateStatsDisplay();
	});

	$('#insights-modal-btn').click( ()=> {
		openModal(
			`<i class="fas fa-chart-line"></i> Insights (alpha)`,
			getInsightsHTML(inventory)
		);
		updateInsightsDisplay(inventory);
	});

	$('#settings-modal-btn').click( ()=> {
		openModal(
			`<i class="fas fa-cog"></i> Settings`,
			`<b>Import:</b>
			<textarea id="import-textarea" class="form-control"></textarea>
			<button id="do-import-btn" class="btn mt-2"><i class="fas fa-file-import"></i> Import</button>
			<hr>
			<b>Export:</b>
			<textarea id="export-textarea" class="form-control">${exportData()}</textarea>
			<button id="copy-export-btn" class="btn mt-2"><i class="fas fa-copy"></i> Copy</button>
			<br>
			<b>Display Settings:</b>
			<div class="custom-control custom-checkbox">
				<input ${settings.num_abrev?'checked':''} type="checkbox" class="custom-control-input" id="setting-num-abrev-checkbox">
				<label class="custom-control-label" for="setting-num-abrev-checkbox">Display large numbers with abbreviations</label>
			</div>
			`
		);
		// @note @maybe setTimeout to update export-texarea with new exportData()? nah
		// btn to refresh export data? yeah
		$('#copy-export-btn').click( ()=> {
			$('#export-textarea').select();
			document.execCommand('copy');
			// @todo: display copied confirmation (in popover or text below)
		});

		// @maybe onenter in textarea doImport as well, don't have to click btn to import
		$('#do-import-btn').click( ()=> {
			// @todo: catch import errors and give notification
			doImport();
			$('.modal').modal('hide');
			display();
			showSnackbar('Game data imported successfully', 'success');
		});

		$('#setting-num-abrev-checkbox').change( ()=> {
			toggleSetting('num_abrev');
			display(); // display changes immedatly, especially if paused
			$('#export-textarea').val(exportData() ); // update it with new setting
		});
	});

	$('#achievement-modal-btn').click( ()=> {
		openModal(
			`<i class="fas fa-info-award"></i> Achievements`,
			`${getAchievementHTML()}<p class="text-right">${getCompletedAchievementSize()} / ${getAchievementSize()}</p>`
		);
	});

	$('#about-modal-btn').click( ()=> {
		// @todo add github repo link
		openModal(
			`<i class="fas fa-info-circle"></i> About`,
			`<button class="btn my-2" onclick="window.open('mailto:contact@justingolden.me')"><i class="fas fa-envelope"></i> Contact</button>
			<p>Made by <a href="https://justingolden.me" target="_blank">Justin Golden</a></p>
			<p>Check out our <a href="https://discord.gg/aEnKS5e" target="_blank">Discord</a></p>`
		);
	});
	$('#help-modal-btn').click( ()=> {
		openModal(
			`<i class="fas fa-question"></i> Help`,


				// <ol class="carousel-indicators">
				// 	<li data-target="#help-carousel" data-slide-to="0" class="active"></li>
				// 	${unlocks.buildings ? `<li data-target="#help-carousel" data-slide-to="1"></li>` : ''}
				// 	${unlocks.volume ? `<li data-target="#help-carousel" data-slide-to="2"></li>` : ''}
				// </ol>
			`<div id="help-carousel" class="carousel slide" data-ride="carousel" data-interval="false">
				<div class="carousel-inner">
					<div class="carousel-item active">
						<p class="text-center"><b>Fish</b></p>
						<p>You start the game with 1 small fish <i class="fas fa-fish"></i></p>
						<p>Your fish earn you coins <i class="fas fa-coins"></i> when they're full</p>
						<p>Your fish won't starve when they're hungry, they just won't give you coins</p>
						<p>Your fish eat food <i class="fas fa-capsules"></i> which costs coins <i class="fas fa-coins"></i></p>
						<p>You can purchase food <i class="fas fa-capsules"></i> and fish <i class="fas fa-fish"></i> under the <b><i class="fas fa-fish"></i> Fish</b> tab</p>
						${unlocks['medium-fish'] ? `<p>Medium fish <i class="fas fa-fish"></i> eat small fish, and earn more coins than small fish</p>` : ''}
						${unlocks['big-fish'] ? `<p>Big fish <i class="fas fa-fish"></i> eat medium fish, and earn more coins than medium fish</p>` : ''}
						${unlocks['sell-small-fish'] || unlocks['sell-medium-fish'] || unlocks['sell-big-fish'] ? `<p>You can sell <i class="fas fa-donate"></i> fish for half price</p>` : ''}
						${unlocks['aquarium'] ? `<p>Fish take up space in your aquarium <i class="fas fa-water"></i>. If you run out of space, you'll have to sell fish or purchase another aquarium.</p>` : ''}
						${unlocks['medium-fish'] ? `<br>` : ''}
					</div>
					${unlocks.buildings ?
					`<div class="carousel-item">
						<p class="text-center"><b>Buildings</b></p>
						<p><i class="fas fa-store-alt"></i> You can purchase buildings to produce items every second</p>
						${unlocks['food-farm'] ? `<p><i class="fas fa-farm"></i> Food farms produce food for your small fish every second</p>` : ''}
						${unlocks['small-hatchery'] ? `<p><i class="fas fa-building"></i> Small fish hatcheries produce small fish every second</p>` : ''}
						${unlocks['medium-hatchery'] ? `<p><i class="fas fa-building"></i> Medium fish hatcheries produce small fish every second</p>` : ''}
						${unlocks['big-hatchery'] ? `<p><i class="fas fa-building"></i> Big fish hatcheries produce small fish every second</p>` : ''}
						${unlocks['small-hatchery'] || unlocks['medium-hatchery'] || unlocks['big-hatchery'] ? `<p>Hatcheries produce in the order: small, medium, big</p>` : ''}
						${unlocks['aquarium'] ? `<p><i class="fas fa-water"></i> Aquariums allow you to hold more fish</p>` : ''}
						${unlocks['aquarium-factory'] ? `<p><i class="fas fa-industry-alt"></i> Aquarium factories produce aquariums every second</p>` : ''}
						${unlocks['bank'] ? `<p><i class="fas fa-landmark"></i> Banks enable you to buy and sell buildings every second, automatically</p>` : ''}
						${unlocks['bank-fish'] ? `<p><i class="fas fa-landmark"></i> You can also buy and sell fish at banks</p>` : ''}
						${unlocks['big-banking'] ? `<p><i class="fas fa-landmark"></i> You can even buy banks with banks!</p>` : ''}
						<br>
					</div>` : ''}
					${unlocks['volume'] ? `<div class="carousel-item">
						<p class="text-center"><b>Using the Website</b></p>
						<p>To learn more about something, click the <i class="fas fa-info-circle"></i> info button next to it.</p>
						${unlocks['volume'] ? `<p>Turn on the volume with the <i class="fas fa-volume-up"></i> button above</p>` : ''}
						${unlocks['fullscreen'] ? `<p>Go into fullscreen mode with the <i class="fas fa-arrows-alt"></i> button above</p>` : ''}
						${unlocks['fullscreen-aquarium'] ? `<p>Enter fullscreen aquarium mode with the <b><i class="fas fa-external-link-alt"></i> Fullscreen Aquarium</b> button below. Your game will run in the background, but you'll get to watch your beautiful fish swim around. It's a great wallpaper.</p>` : ''}
						${unlocks['stats'] ? `<p>Check out your game stats with the <b><i class="fas fa-sort-amount-up"></i> Stats</b> button below</p>` : ''}
					</div>` : ''}
					${unlocks.aquarium ? `<div class="carousel-item">
						<p class="text-center"><b>FAQs</b></p>
						<p><i>I can't purchase fish even though I have enough money. What's wrong?</i></p>
						<p>Check your aquarium space.</p>
						<p><i>My aquarium space says it has room but my hatcheries don't seem to be producing. What gives?</i></p>
						<p>Your hatcheries produce to capacity. Then, your fish eat. So for example, if you have hatcheries producing to your maximum aquarium space, then the fish are getting eaten, it will show a constant number of aquarium space, fish, and hungry fish, even though your aquarium is full. That's why we've included the little banner at the top.</p>
						${unlocks.buildings ? `<p><i>I have a building that should be producing but the numbers aren't going up. Why?</i></p>` : ''}
						<p>You are probably producing it then it is being consumed at that rate or faster.</p>
					</div>` : ''}
				</div>
				${unlocks['volume'] ?
				`<a class="carousel-control-prev" href="#help-carousel" role="button" data-slide="prev">
					<span class="carousel-control-prev-icon" aria-hidden="true"></span>
					<span class="sr-only">Previous</span>
				</a>
				<a class="carousel-control-next" href="#help-carousel" role="button" data-slide="next">
					<span class="carousel-control-next-icon" aria-hidden="true"></span>
					<span class="sr-only">Next</span>
				</a>` : ''}
			</div>`,

			`<i class="fas fa-info-circle"></i> Reopen this window at any time by clicking the <b>Help</b> button.`,
			true
		);
	});
});

export { openModal };