import { aquarium_fullscreen } from './onload.js';

window.onkeyup = function(e) {
	let key = e.keyCode ? e.keyCode : e.which;
	if(key == 27) { // esc
		if(aquarium_fullscreen) {
			$('#fullscreen-aquarium-btn').click();
		} else {
			// if(! $('.modal').hasClass('show') ) { // not working because modal is already closed by the time it's reading it
				$('#pause-btn').click();
			// }
		}
	}
}