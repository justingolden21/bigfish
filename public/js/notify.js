import { playSoundEffect } from './audio.js';

// num items in queue, don't need to keep an actual queue
let snackbar_queue = 0;
const SNACKBAR_TIME = 3000;
const SNACKBAR_TIME_TOTAL = 3500;
let prev_message = '';
const ICON_TYPES = {
	error: 'exclamation-triangle',
	info: 'info-circle',
	success: 'check-circle',
	achievement: 'award',
	unlock: 'unlock-alt',
};

const MAX_HISTORY_SIZE = 200;
let notification_history = [];
const getNotificationHistory = () => notification_history;

// @todo: param for custom icon? eh
// @todo: option for custom durration? closeable notifications? eh
function showSnackbar(message, type) {
	if (message == 'Not enough coins') {
		showHighlight($('.num-coins'));
	} else if (message == 'Not enough space in aquarium') {
		showHighlight($('.num-space-used'));
		showHighlight($('.num-space-total'));
	}

	if (message == prev_message) return;

	prev_message = message;

	if (type in ICON_TYPES) {
		message = `<i class="fas fa-${ICON_TYPES[type]}"></i> ${message}`;
	}

	snackbar_queue++;
	setTimeout(() => {
		createSnackbar(message, type);
	}, SNACKBAR_TIME_TOTAL * (snackbar_queue - 1));
}
function createSnackbar(message, type) {
	prev_message = '';

	// ----------------

	if (type == 'achievement' || type == 'unlock')
		$('#snackbar').addClass('important');
	else $('#snackbar').removeClass('important');

	// note: removed 'error' from list
	if (['success', 'achievement', 'unlock'].includes(type))
		playSoundEffect(type);
	else playSoundEffect('notification');

	// ----------------

	$('#snackbar').html(message).addClass('show');

	notification_history.push(message);
	if (notification_history.length > MAX_HISTORY_SIZE)
		notification_history.shift();

	setTimeout(() => {
		$('#snackbar').removeClass('show');
		snackbar_queue--;
	}, SNACKBAR_TIME);
}

function showHighlight(elm, sec = 0.5) {
	elm.addClass('highlight');
	setTimeout(() => {
		elm.removeClass('highlight');
	}, sec * 1000);
}
function highlightIf(elm, condition) {
	if (condition) elm.addClass('highlight');
	else elm.removeClass('highlight');
}

function showBlink(elm, sec, alternate_sec) {
	for (let i = 0; i < sec; i += alternate_sec * 2) {
		setTimeout(() => showHighlight(elm, alternate_sec), i * 1000);
	}
}

$(() => {
	//  @tmp testing
	// highlightIf($('.num-hungry-fish'), 1>0);
});

export { showSnackbar, getNotificationHistory, highlightIf, showBlink };
