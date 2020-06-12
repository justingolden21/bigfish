import { exportData, importData } from './data.js';
import { inventory, stats } from './game.js';
import { signed_in } from './signin.js';

const db = firebase.firestore();

// @TODO error handling everywhere
// @TODO option to manually update save data before you quit

// make sure that we don't set scores before getting scores
let data_is_set = false;

// on signin
function getData(user) {

	if(!user) {
		data_is_set = true; // data doesn't exist so we can set scores now
		return false;
	}

	db.collection('users').doc(user.uid).get().then(snapshot=> {
		console.log(snapshot);

		if(snapshot.data() ) {
			importData(snapshot.data().savedata);

			// add login
			let prev_logins = snapshot.data().logins;
			prev_logins.push(getMills() );
			db.collection('users').doc(user.uid).update({logins: prev_logins });
		} else {
			createData(user);
		}

		data_is_set = true;

	});

}

const getMills = ()=> new Date().getTime();

// creates a new user, adds their save data and login time
function createData(user) {
	db.collection('users').doc(user.uid).set({ savedata: exportData(), email: user.email, logins: [getMills()] }).then(snapshot=> {
		console.log(snapshot);
	});
}

// called on an interval from signin
// save data to db with exportData
function updateData(user, signout=false) {
	if(!data_is_set || !signed_in) return;

	console.log('updating data');

	updateGlobalStats(user);

	db.collection('users').doc(user.uid).update({ savedata: exportData() }).then( ()=> {
		if(signout) firebase.auth().signOut();
	});
}

// empty data in db
function deleteAllData() {
	let user = firebase.auth().currentUser;
	db.collection('users').doc(user.uid).set({});
}


// update global stats
// get the user's previous stats
// add the difference to global data
// then update the user's previous stats
function updateGlobalStats(user) {

	if(!user) return;

	db.collection('users').doc(user.uid).get().then(snapshot=> {
		console.log(snapshot);

		// get user's previous stats
		let prev_stats;
		if(snapshot.data().prevstats) {
			prev_stats = snapshot.data().prevstats;
		} else {
			prev_stats = {ticks: 0, fish: 0, buildings: 0, coins: 0};
		}

		// calculate the difference since last update
		let diff_stats = {
			ticks: stats.ticks - prev_stats.ticks,
			fish: (inventory.fish.small + inventory.fish.medium + inventory.fish.big) - prev_stats.fish,
			buildings: stats.buildings.purchased - prev_stats.buildings, // good anough for now
			coins: inventory.coins - prev_stats.coins,
		};

		// add the difference to the global data
		db.collection('global').doc('stats').update({
			ticks: firebase.firestore.FieldValue.increment(diff_stats.ticks),
			fish: firebase.firestore.FieldValue.increment(diff_stats.fish),
			buildings: firebase.firestore.FieldValue.increment(diff_stats.buildings),
			coins: firebase.firestore.FieldValue.increment(diff_stats.coins),
		});

		// update user's previous stats
		db.collection('users').doc(user.uid).update({
			prevstats: {
				ticks: stats.ticks,
				fish: (inventory.fish.small + inventory.fish.medium + inventory.fish.big),
				buildings: stats.buildings.purchased,
				coins: inventory.coins,
			}
		});

	});
}

export { getData, updateData, deleteAllData };