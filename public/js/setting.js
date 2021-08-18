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
	show_aquarium: true,
	bank_input_limit: true,

	// bank inputs
	bank_inputs: [],
};

function toggleSetting(setting_name) {
	settings[setting_name] = !settings[setting_name];
}

function updateSetting(setting_name, new_val) {
	settings[setting_name] = new_val;
}

const setBankVals = (arr) => {
	for (let i = 0; i < arr.length; i += 3) {
		// arr contains names, vals, and is_checked
		let name = arr[i],
			val = arr[i + 1],
			is_checked = arr[i + 2];
		$(`#bank-buy-${name}-input`).val(val);
		if ($(`#${name}-buy-sell-switch`).is(':checked') != is_checked) {
			$(`#${name}-buy-sell-switch`).click(); // updates label too
		}
		// $(`#bank-buy-${name}-input`).parent().siblings().find('input[type=checkbox]').prop('checked', is_checked);
	}
};

function importSettings(st) {
	/* notes
	some settings (paused, volume) we want to keep the old setting
	some settings with visual components (checkboxes, inputs, etc) we must update those visual components with the new one
	*/

	// support legacy settings
	if (st.show_aquarium == undefined) st.show_aquarium = true;
	if (st.bank_input_limit == undefined) st.bank_input_limit = true;

	// handle bank inputs (first check is for legacy)
	if (st.bank_inputs && st.bank_inputs.length) {
		setBankVals(st.bank_inputs);
	} else {
		st.bank_inputs = [];
	}

	let was_paused = settings.paused;
	let had_sound = settings.sound;

	settings = st;

	settings.paused = was_paused;
	settings.sound = had_sound;

	// update applicable settings
	$('#main-canvas').css('display', settings.show_aquarium ? '' : 'none');
	$('#info-row').css(
		'margin-bottom',
		settings.show_aquarium ? '' : '1.75rem'
	);

	// importing data closes the modal and importing from account the modal won't be open
	// and since modal will be recreated when user opens it, we don't need to update range inputs
	// when the user imports settings with volumes

	// @todo: update settings from multi-leveled object, such as display settings, audio settings etc
}

export { settings, toggleSetting, updateSetting, importSettings };
