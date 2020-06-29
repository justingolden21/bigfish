import { aquarium_fullscreen } from './onload.js';

window.onkeyup = function(e) {
	let key = e.keyCode ? e.keyCode : e.which;
	if(key == 27) { // esc
		if(aquarium_fullscreen) {
			$('#fullscreen-aquarium-btn').click();
		} else {
			// doesn't work with modals other than signin-modal
			// because the modal is already closed by the time it's reading it
			// signin-modal stays open upon clicking esc
			if(! $('.modal').hasClass('show') ) {
				$('#pause-btn').click();
			}
		}
	}
}