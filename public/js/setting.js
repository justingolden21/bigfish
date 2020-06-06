let settings = {
	// basics
	paused: false,

	// audio
	sound: false,
	audio: {
		background_volume: 0.5,
		effects_volume: 0.5,
	},
	background_song: 'default',

	// display
	num_abrev: true,
};

function toggleSetting(setting_name) {
	settings[setting_name] = !settings[setting_name];
}

function updateSetting(setting_name, new_val) {
	settings[setting_name] = new_val;
}

function importSettings(st) {

	// @todo: more testing for sound (all 4 possible cases)

	let was_paused = false;
	let had_sound = false;
	if(st.paused && !settings.paused) {
		$('#pause-btn').click();
	} else if(!st.paused && settings.paused) {
		// trust me
		$('#pause-btn').click();
		$('#pause-btn').click();
		was_paused = true;
	}
	if(st.sound && !settings.sound) {
		had_sound = true;
	}

	settings = st;
	if(was_paused) settings.paused = true;
	if(had_sound) settings.sound = false; // if imported had sound and current doesn't, keep old setting and sound off

	// @todo: update settings from object, such as display settings, audio settings etc
}

export { settings, toggleSetting, updateSetting, importSettings };