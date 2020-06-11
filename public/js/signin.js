import { showSnackbar } from './notify.js';

// @TODO show/hide ".invalid-feedback" divs

const auth = firebase.auth();
// const db = firebase.firestore();

$( ()=> {
	displayLoggedOut(false);

	$('#signup-form').on('submit', evt=> {
		evt.preventDefault();

		// @TODO: pass must be 6 chars

		// @TODO: handle if user exists

		// @TODO: error handle if passwords don't mach, then return


		// user info
		const email = $('#signup-email-input').val();
		const pass = $('#signup-password-input').val();

		// sign up
		auth.createUserWithEmailAndPassword(email, pass).then(cred => {
			// close the modal
			$('#signin-modal').modal('hide');

			// clear the form
			$('#signup-form').trigger('reset');

			// display signed in email
			$('#account-info').html(cred.user.email);

			// show/hide correct login btns and info
			displayLoggedIn();
		});
	});

	$('#signout-btn').click(evt=> {
		evt.preventDefault();
		auth.signOut().then( ()=> {
			displayLoggedOut();
		});
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

			// display signed in email
			$('#account-info').html(cred.user.email);

			// show/hide correct login btns and info
			displayLoggedIn();
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