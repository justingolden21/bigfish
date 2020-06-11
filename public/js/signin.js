import { showSnackbar } from './notify.js';
import { getData, updateData } from './database.js';

const auth = firebase.auth();

let update_data_interval;

let signed_in = false;

auth.onAuthStateChanged(user => {
	if(user) { // logged in
		$('#account-info').html(user.email);
		displayLoggedIn();

		getData(user);

		// save data every 60s, and after 5s
		clearInterval(update_data_interval);
		update_data_interval = setInterval( ()=>updateData(user), 1000*60);
		setTimeout( ()=>updateData(user), 1000*5);
	} else { // logged out
		displayLoggedOut();

		clearInterval(update_data_interval);
	}

	signed_in = Boolean(user);
});

$( ()=> {
	displayLoggedOut(false);

	$('#signup-form').on('submit', evt=> {
		evt.preventDefault();

		// user info
		const email = $('#signup-email-input').val();
		const pass = $('#signup-password-input').val();
		const confirm_pass = $('#signup-password-confirm-input').val();

		if(pass != confirm_pass) {
			$('#signup-error-text').html('Passwords do not match.');
			return;
		}

		// sign up
		$('#signup-loader').css('display', 'block');
		$('#signup-error-text').html('');
		auth.createUserWithEmailAndPassword(email, pass).then(user=> {
			$('#signup-loader').css('display', 'none');
			console.log('signup success ' + user.uid);
	
			$('#signup-error-text').html('');
			$('#signin-modal').modal('hide');
			$('#signup-form').trigger('reset');
		}).catch(err=> {
			$('#signup-loader').css('display', 'none');
			console.log('signup error ' + err.message);

			$('#signup-error-text').html(err.message);
		});

	});



	$('#signin-form').on('submit', evt=> {
		evt.preventDefault();

		// user info
		const email = $('#signin-email-input').val();
		const pass = $('#signin-password-input').val();

		// sign in
		$('#signin-loader').css('display', 'block');
		$('#signin-error-text').html('');
		auth.signInWithEmailAndPassword(email, pass).then(cred => {
			$('#signin-loader').css('display', 'none');
			console.log('signin success');

			$('#signin-error-text').html('');
			$('#signin-modal').modal('hide');
			$('#signin-form').trigger('reset');
		}).catch(err=> {
			$('#signin-loader').css('display', 'none');
			console.log('signin error ' + err.message);

			$('#signin-error-text').html(err.message);
		});
	});


	$('#signout-btn').click(evt=> {
		evt.preventDefault();
		auth.signOut();
	});

});

function displayLoggedIn(show_snackbar=true) {
	if(show_snackbar) showSnackbar('Logged in', 'success');

	$('#account-info').show();
	$('#signout-btn').show();
	$('#signin-btn').hide();
}
function displayLoggedOut(show_snackbar=true) {
	if(show_snackbar) showSnackbar('Logged out', 'success');

	$('#account-info').hide();
	$('#signout-btn').hide();
	$('#signin-btn').show();
}

export { signed_in };