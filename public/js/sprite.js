import { canvas, ctx, settings } from './onload.js';
import { inventory } from './game.js';

// Globals
// --------------------------------

let sprites_img,
	sprites_loaded = false;
const SPRITE_SIZE = 32;

// values for fish minimum and maxiumum coords
let MAX_X, MAX_Y;

let drawn_fish = [];
let num_drawn_fish = {
	small: 0,
	medium: 0,
	big: 0,
};

const MAX_DRAWN_FISH = 100; // per type

// Setup
// --------------------------------

function canvasLoaded() {
	MAX_X = canvas.width - SPRITE_SIZE;
	MAX_Y = canvas.height - SPRITE_SIZE;

	setupSprites();

	addDrawnFish('small');
	// for(let i=0; i<50; i++) addDrawnFish(['small', 'small', 'small', 'small', 'medium', 'big'][random(0,5)]);

	setupSeaweed();

	setInterval(drawAllFish, 100);
	drawAllFish();
}

function onCanvasReload() {
	for (let df of drawn_fish) {
		df.randomY();
	}

	MAX_X = canvas.width - SPRITE_SIZE;
	MAX_Y = canvas.height - SPRITE_SIZE;

	updateNumDrawnFish();
	drawAllFish(true);
}

function setupSprites() {
	sprites_img = new Image();
	sprites_img.onload = () => (sprites_loaded = true);
	sprites_img.src = 'img/sprites.png';
}

// Basics
// --------------------------------

function addDrawnFish(type) {
	if (num_drawn_fish[type] >= MAX_DRAWN_FISH) return false;

	drawn_fish.push(new DrawnFish(type));
	num_drawn_fish[type]++;
	return true;
}

function addManyDrawnFish(type, amount) {
	if (amount < 1) return false;
	amount = Math.min(amount, MAX_DRAWN_FISH);
	for (let i = 0; i < amount - 1; i++) {
		addDrawnFish(type);
	}
	return addDrawnFish(type);
}

function removeDrawnFish(type) {
	if (num_drawn_fish[type] == 0) return false;

	// doesn't mutate
	// drawn_fish.filter( x => x.type==type ).pop();

	for (let idx in drawn_fish) {
		if (drawn_fish[idx].type == type) {
			drawn_fish.splice(idx, 1);
			break;
		}
	}

	num_drawn_fish[type]--;
	return true;
}

// reduce drawn fish down to amount, if amount is greater then pass
// give amount of fish left after sold/eaten
function checkReduceDrawnFish(type, amount) {
	if (num_drawn_fish[type] > amount) {
		while (num_drawn_fish[type] > amount) {
			removeDrawnFish(type);
		}
		return true;
	}
	return false;
}

function updateNumDrawnFish() {
	let types = ['small', 'medium', 'big'];
	for (let type of types) {
		if (num_drawn_fish[type] > inventory.fish[type]) {
			checkReduceDrawnFish(type, inventory.fish[type]);
		} else if (
			num_drawn_fish[type] < inventory.fish[type] &&
			num_drawn_fish[type] < MAX_DRAWN_FISH
		) {
			let amt =
				Math.min(inventory.fish[type], MAX_DRAWN_FISH) -
				num_drawn_fish[type];
			addManyDrawnFish(type, amt);
		}
	}
}

const LOG_TIMES = false;

function drawAllFish(override_pause = false) {
	if (settings.paused && !override_pause) return;

	if (!settings.show_aquarium) return;

	if (LOG_TIMES) console.time('sprites');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (LOG_TIMES) console.timeLog('sprites');

	for (let df of drawn_fish) {
		df.update();
	}

	// // timing test code
	// for(let df of drawn_fish) df.move();
	// if(LOG_TIMES) console.timeLog('sprites');
	// for(let df of drawn_fish) df.nextFrame();
	// if(LOG_TIMES) console.timeLog('sprites');
	// for(let df of drawn_fish) df.draw();

	afterDrawFish();

	if (LOG_TIMES) console.timeLog('sprites');
	drawSeaweed();

	// for(let i=0; i<drawn_fish.length; i++) {
	// 	if(i==Math.floor(drawn_fish.length/2) ) drawSeaweed();
	// 	drawn_fish[i].update();
	// }

	if (LOG_TIMES) console.timeEnd('sprites');
}

// Seaweed
// --------------------------------

let seaweedX = [];
let seaweedFrames = [];
let seaweedHues = [];

function setupSeaweed() {
	for (let x = 0; x < canvas.width - SPRITE_SIZE; x += SPRITE_SIZE) {
		if (Math.random() > 0.4) {
			seaweedX.push(x);
			seaweedFrames.push(Math.round(Math.random())); // 0 or 1
			seaweedHues.push(random(-45, 60));
		}
	}
}
function drawSeaweed() {
	for (let i = 0; i < seaweedX.length; i++) {
		ctx.filter = `hue-rotate(${seaweedHues[i]}deg)`;
		ctx.drawImage(
			sprites_img,
			seaweedFrames[i] * SPRITE_SIZE,
			SPRITE_SIZE * 2,
			SPRITE_SIZE,
			SPRITE_SIZE,
			seaweedX[i],
			MAX_Y,
			SPRITE_SIZE,
			SPRITE_SIZE
		);
		if (Math.random() > 0.95) {
			seaweedFrames[i]++;
			if (seaweedFrames[i] > 2) seaweedFrames[i] = 0;
		}
	}
	ctx.filter = 'none';
}

// Drawn Fish
// --------------------------------

const FISH_SCALES = {
	small: 1,
	medium: 2,
	big: 3,
};
const FISH_SPEEDS = {
	// 4,3,2 and 2,3,4 are other ideas
	small: 3,
	medium: 3,
	big: 3,
};
const NUM_FRAMES = 3;

class DrawnFish {
	constructor(type) {
		this.type = type;
		this.x = random(0, canvas.width - SPRITE_SIZE * FISH_SCALES[this.type]);
		this.y = random(
			0,
			canvas.height - SPRITE_SIZE * FISH_SCALES[this.type]
		);
		this.facing_left = Math.random() >= 0.5;

		this.frame = random(0, 2);
		this.color = randomGaussian() * 360; // gaussian distribution, then shifted +180deg
		this.species = Math.random() > 0.5 ? 0 : Math.random() > 0.5 ? 1 : 2;
		this.special = Math.random() >= 0.9998; // yay easter eggs // .9998
	}
	nextFrame() {
		this.frame++;
		if (this.frame >= NUM_FRAMES) {
			this.frame = 0;
		}
	}

	randomY() {
		this.y = random(
			0,
			canvas.height - SPRITE_SIZE * FISH_SCALES[this.type]
		);
	}

	move() {
		// move according to speed, random direction
		let max_x = canvas.width - SPRITE_SIZE * FISH_SCALES[this.type];
		let max_y = canvas.height - SPRITE_SIZE * FISH_SCALES[this.type];

		this.facing_left =
			Math.random() >= 0.01 ? this.facing_left : !this.facing_left;

		if (!this.facing_left) this.x += FISH_SPEEDS[this.type];
		// + random(-1,1);
		else this.x -= FISH_SPEEDS[this.type]; // + random(-1,1);
		if (Math.random() >= 0.1) {
			if (this.y <= 0) {
				this.y++;
			} else if (this.y >= max_y) {
				this.y--;
			} else {
				if (Math.random() > 0.5) {
					this.y++;
				} else {
					this.y--;
				}
			}
		}

		if (this.x <= 0) {
			this.x = 0;
			this.facing_left = !this.facing_left;
		} else if (this.x >= max_x) {
			this.x = max_x;
			this.facing_left = !this.facing_left;
		}
	}
	draw() {
		// draws fish on canvas
		drawFish(
			this.x,
			this.y,
			this.facing_left,
			this.frame,
			this.type,
			this.color,
			this.species,
			this.special
		);
	}
	update() {
		this.move();
		this.nextFrame();
		this.draw();

		if (this.special) {
			// if(Math.random() > 0.9) {
			// 	this.color = random(0, 360);
			// }
			this.color += 1;
		}
	}
}

function drawFish(x, y, facing_left, frame, type, color, species, special) {
	if (!sprites_loaded) return;

	let direction = facing_left ? 1 : 0;
	let scale = FISH_SCALES[type];
	let special_num = special ? 1 : 0;

	// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter
	ctx.filter = `hue-rotate(${
		color + special_num * 180
	}deg) invert(${special_num})`; // note: performance hit
	ctx.drawImage(
		sprites_img,
		(frame + species * NUM_FRAMES) * SPRITE_SIZE,
		direction * SPRITE_SIZE,
		SPRITE_SIZE,
		SPRITE_SIZE,
		x,
		y,
		SPRITE_SIZE * scale,
		scale * SPRITE_SIZE
	);
}
function afterDrawFish() {
	ctx.filter = 'none';
}

// min is inclusive, max is inclusive, returns an int, used for starting positions
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// https://stackoverflow.com/a/49434653/4907950
function randomGaussian() {
	let u = 0,
		v = 0;
	while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	while (v === 0) v = Math.random();
	let num = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	num = num / 10 + 0.5; // Translate to 0 -> 1
	if (num > 1 || num < 0) return randomGaussian(); // resample between 0 and 1
	return num;
}

export { canvasLoaded, addManyDrawnFish, checkReduceDrawnFish, onCanvasReload };
