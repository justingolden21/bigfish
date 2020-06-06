import { canvasLoaded, onCanvasReload } from './sprite.js';
import { setupGame } from './game.js';
import { showSnackbar, showBlink } from './notify.js';
// import { openModal } from './modal.js';
import { settings, toggleSetting } from './setting.js';
import { setSound, playSoundEffect, audioHandlePause } from './audio.js';
import { checkAchievement } from './unlock.js';

let canvas, ctx;

let first_pause = true;

let aquarium_fullscreen = false; // note: not a setting, not part of save data

let last_mousemove = -1;

$( ()=> {

	// UI stuff

	$('.card-header').click( (evt)=> {
		if(evt.target.tagName!='BUTTON')
			$(evt.target).find('.btn').click();
	});

	$('.collapse.show').parent().find('.card-header').addClass('open');

	$('.card-header .btn').click( (evt)=> {
		let has = $(evt.target).parent().parent().hasClass('open');
		$('.card-header').removeClass('open');
		if(has)
			$(evt.target).parent().parent().removeClass('open');
		else
			$(evt.target).parent().parent().addClass('open');
	});

	$('.carousel').carousel('pause');



	$('.btn:not(#volume-btn)').click( (e)=> {
		// https://stackoverflow.com/a/6692173/4907950
		if (e.originalEvent !== undefined) { // if human
			// playSoundEffect('button');
		}
	});



	$('#pause-btn').click( (e)=> {
		toggleSetting('paused');
		$('#pause-btn').html(`<i class="fas fa-${settings.paused?'play':'pause'}"></i>`);
		$('#top-hr').toggleClass('paused');
		$('#out-of-space-banner').toggleClass('paused');
		audioHandlePause(settings.paused);
		// https://stackoverflow.com/a/6692173/4907950
		if (e.originalEvent !== undefined) { // if human
			showSnackbar(`Game ${settings.paused?'paused':'resumed'}`, 'info');
		}
	});
	$('#volume-btn').click( ()=> {
		// toggleSetting('sound');
		setSound(!settings.sound);
		$('#volume-btn').html(`<i class="fas fa-volume-${settings.sound?'up':'mute'}"></i>`);
		checkAchievement('Scales');
	});
	$('#fullscreen-btn').click(toggleFullScreen);

	$('.info-toggle-btn').click( (evt)=> {
		let t = $(evt.target);
		let btn = t.prop('tagName') == 'BUTTON' ? t : t.parent(); // account for clicking icon inside btn
		let id = btn.parent().attr('href');
		$(id).find('.info-toggle-card').slideToggle();
	});
	// uncomment below to default to hiding info cards
	// $('.info-toggle-card').hide();

	// Canvas stuff

	canvas = document.getElementById('main-canvas');
	canvas.width = window.innerWidth;
	canvas.height = 160;

	ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false; // https://stackoverflow.com/a/11751817/4907950

	canvasLoaded();

	setupGame();

	// --------

	$('#help-modal-btn').click();
	$('#pause-btn').click();
	$('.modal').on('hidden.bs.modal', ()=> {
		if(first_pause) {
			first_pause = false;
			$('#pause-btn').click();
			showBlink($($('.purchase-food-btns .btn')[0]), 5, 1);
			setTimeout( ()=> showSnackbar('Hint: Why don\'t you purchase some food?', 'info'), 3000);
		}
	});

	$('#exit-fullscreen-btn').hide();

	// fullscreen aquarium stuff below

	$('#fullscreen-aquarium-btn').click( ()=> {
		aquarium_fullscreen = !aquarium_fullscreen;
		if(aquarium_fullscreen) {
			document.documentElement.scrollTop = document.body.scrollTop = 0;

			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			ctx.imageSmoothingEnabled = false;
			$('#exit-fullscreen-btn').show();
			// $('#full-aquarium-css').attr('onload', onCanvasReload);
			$('#full-aquarium-css').attr('href', 'css/full-aquarium.css');
			$('*:not(#exit-fullscreen-btn)').attr('tabindex', '-1');
		} else {
			canvas.width = window.innerWidth;
			canvas.height = 160;
			ctx.imageSmoothingEnabled = false;
			$('#exit-fullscreen-btn').hide();
			// $('#full-aquarium-css').attr('onload', onCanvasReload);
			$('#full-aquarium-css').attr('href', '');
			$('*:not(#exit-fullscreen-btn)').attr('tabindex', '');
		}
		onCanvasReload();
	});

	$(window).resize( ()=> {
		canvas.width = window.innerWidth;
		if(aquarium_fullscreen) {
			canvas.height = window.innerHeight;
		} else {
			canvas.height = 160;
		}
		ctx.imageSmoothingEnabled = false;
		onCanvasReload();
	});

	$('canvas').click( ()=> {
		if(aquarium_fullscreen) {
			$('#fullscreen-aquarium-btn').click();
		}
	});

	$('canvas').mousemove( ()=> {
		if(aquarium_fullscreen) {
			$('#exit-fullscreen-btn').show();
			last_mousemove = new Date();
			setTimeout( ()=> {
				// https://stackoverflow.com/a/4944782/4907950
				if(Math.abs(new Date() - last_mousemove) >= 3000) {
					$('#exit-fullscreen-btn').hide();
				}
			}, 3000);
		}
	});

	$('#exit-fullscreen-btn').click( ()=> $('#fullscreen-aquarium-btn').click() );
});

// https://stackoverflow.com/a/10627148/4907950
function toggleFullScreen() {
	if ((document.fullScreenElement && document.fullScreenElement !== null) ||
	 (!document.mozFullScreen && !document.webkitIsFullScreen)) {
		if (document.documentElement.requestFullScreen) {
			document.documentElement.requestFullScreen();
		} else if (document.documentElement.mozRequestFullScreen) {
			document.documentElement.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullScreen) {
			document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	}
}

export { canvas, ctx, settings, aquarium_fullscreen };