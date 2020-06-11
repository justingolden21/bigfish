import { showSnackbar } from './notify.js';
import { getData, updateData } from './database.js';

// @TODO show/hide ".invalid-feedback" divs

// @TODO: display loader while signing in

const auth = firebase.auth();

let update_data_interval;

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
	}
});

$( ()=> {
	displayLoggedOut(false);

	$('#signup-form').on('submit', evt=> {
		evt.preventDefault();


		// @TODO: error handle if passwords don't mach, then return


		// user info
		const email = $('#signup-email-input').val();
		const pass = $('#signup-password-input').val();
		const confirm_pass = $('#signup-password-confirm-input').val();

		if(pass != confirm_pass) {
			$('#error-text').html('Passwords do not match.');
			return;
		}

		// sign up
		$('#signup-loader').css('display', 'block');
		$('#error-text').html('');
		auth.createUserWithEmailAndPassword(email, pass).then(user=> {
			$('#signup-loader').css('display', 'none');
			console.log('signup success ' + user.uid);
	
			$('#error-text').html('');
			$('#signin-modal').modal('hide');
			$('#signup-form').trigger('reset');
		}).catch(err=> {
			$('#signup-loader').css('display', 'none');
			console.log('signup error ' + err);

			$('#error-text').html(err.message);
		});

	});

	$('#signout-btn').click(evt=> {
		evt.preventDefault();
		auth.signOut();
	});

	$('#signin-form').on('submit', evt=> {
		evt.preventDefault();

		// @TODO: error handle if pass doesn't match user

		// user info
		const email = $('#signin-email-input').val();
		const pass = $('#signin-password-input').val();

		// sign in
		auth.signInWithEmailAndPassword(email, pass).then(cred => {
			// close the modal
			$('#signin-modal').modal('hide');

			// clear the form
			$('#signin-form').trigger('reset');
		});
	});




	// // ======== Validation ========
	// // 8 chararcters, 1 letter, 1 number, 1 special
	// // https://stackoverflow.com/a/21456918/4907950
	// const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

	// const doValidation = ()=> {
	// 	if(!PASSWORD_REGEX.test($('#signup-password-input').val() ) )
	// 		$('#signup-password-input').addClass('is-invalid');
	// 	else
	// 		$('#signup-password-input').removeClass('is-invalid');

	// 	if($('#signup-password-input').val() != $('#signup-password-confirm-input').val() )
	// 		$('#signup-password-confirm-input').addClass('is-invalid');
	// 	else
	// 		$('#signup-password-confirm-input').removeClass('is-invalid');
	// };

	// $('#signup-password-input').change(doValidation);
	// $('#signup-password-confirm-input').change(doValidation);









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
