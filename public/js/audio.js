import { settings, updateSetting } from './setting.js';

const DEFAULT_BACKGROUND_VOLUME = 0.25;
const DEFAULT_EFFECT_VOLUME = 0.25;
const QUIETER_EFFECT_VOLUME = 0.1;

// sound: false,
// audio: {
// 	background_volume: 1,
// 	effects_volume: 1,
// },
// background_song: 'default',

// ideas: modal and hover sounds
// compression website: https://www.compresss.com/compress-audio.html
// background from purple planet, effects from soundly @todo credit them3


// note: to update volume, update it in two places: here and setVolume()

//  @todo: split sounds into 2 arrays: backgrounds and effects
let sounds = {
	backgrounds: {
		default:
			new Howl({
				src: ['audio/background.wav'],
				loop: true,
				volume: DEFAULT_BACKGROUND_VOLUME,
				rate: 1,
				autoplay: false,
			}),
		snow:
			new Howl({
				src: ['audio/background.wav'], // @todo background-snow.wav
				loop: true,
				volume: DEFAULT_BACKGROUND_VOLUME,
				rate: 1,
				autoplay: false,
			}),
	},
	effects: {
		button:
			new Howl({
				src: ['audio/effects/button.wav'],
				volume: DEFAULT_EFFECT_VOLUME,
				rate: 1,
				autoplay: false,
			}),
		notification:
			new Howl({
				src: ['audio/effects/notification.wav'],
				volume: DEFAULT_EFFECT_VOLUME,
				rate: 1,
				autoplay: false,
			}),
		achievement:
			new Howl({
				src: ['audio/effects/achievement.wav'],
				volume: DEFAULT_EFFECT_VOLUME,
				rate: 1,
				autoplay: false,
			}),
		unlock:
			new Howl({
				src: ['audio/effects/unlock.wav'],
				volume: QUIETER_EFFECT_VOLUME,
				rate: 1,
				autoplay: false,
			}),
		error:
			new Howl({
				src: ['audio/effects/error.wav'],
				volume: QUIETER_EFFECT_VOLUME,
				rate: 1,
				autoplay: false,
			}),
		success:
			new Howl({
				src: ['audio/effects/success.wav'],
				volume: DEFAULT_EFFECT_VOLUME,
				rate: 1,
				autoplay: false,
			}),
	}
};


function playSoundEffect(name) {
	if(settings.sound && settings.audio.effects_volume != 0) {
		sounds.effects[name].play();
	}
}

function setSound(is_on) {
	let bg_song = sounds.backgrounds[settings.background_song];

	// if was on now off, then pause
	// if was off now on then play
	if(is_on && !settings.paused && settings.audio.background_volume != 0 && !settings.sound && !bg_song.playing() ) {
		bg_song.play();
	}
	else if(!is_on && settings.audio.background_volume != 0 && settings.sound && bg_song.playing() ) {	
		bg_song.pause();
	}

	// update at end so we can read previous sound settings
	updateSetting('sound', is_on);
}

function setVolume(type, new_volume) {
	updateSetting('audio', {
		background_volume: type == 'background' ? new_volume : settings.audio.background_volume,
		effects_volume: type == 'effects' ? new_volume : settings.audio.effects_volume,
	});

	updateVolumes();
}

function updateVolumes() {
	let ef = settings.audio.effects_volume;
	let bg = settings.audio.background_volume;

	for(let sound of Object.values(sounds.backgrounds) ) {
		sound.volume(DEFAULT_BACKGROUND_VOLUME*bg);
	}

	for(let sound of Object.values(sounds.effects) ) {
		if(sound._src.includes('unlock') ) {
			sound.volume(QUIETER_EFFECT_VOLUME*ef);
		}
		else {
			sound.volume(DEFAULT_EFFECT_VOLUME*ef);
		}
	}
}

function changeBackgroundSong(song_name) {
	if(settings.background_song == song_name) return;

	let bg_song = sounds.backgrounds[settings.background_song];

	// if old was playing, now new is playing
	if(bg_song.playing() ) {
		bg_song.pause();
		let new_bg_song = sounds.backgrounds[song_name];
		new_bg_song.play();
	}

	updateSetting('background_song', song_name);
}

function audioHandlePause(paused) {
	let bg_song = sounds.backgrounds[settings.background_song];
	if(paused) {
		bg_song.pause();
	} else {
		if(!settings.paused && settings.sound && settings.audio.background_volume != 0 && !bg_song.playing() ) {
			bg_song.play();
		}
	}
}

$( ()=> {
	updateVolumes();
});

export{ setSound, playSoundEffect, audioHandlePause, setVolume };