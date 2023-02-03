const DESCRIPTIONS = {
	aquarium: `Lonely
Microscopic
Miniscule
Barren
Lackluster
Pathetic
Sad
Unpopulated
Tiny
Small
Little
Novice
Pleasant
Lovely
Quaint
Peaceful
Nice
Wholesome
Cozy
Comfortable
Average
Normal
Ordinary
Intermediate
Fair
Satisfactory
Decent
Pretty
Good
Neat
Special
Unique
Sparkling
Snazzy
Fancy
Dazzling
Gorgeous
Beautiful
Cool
Groovy
Stunning
Splendid
Exquisite
Lively
Thriving
Interesting
Loud
Busy
Populated
Active
Bustling
Wild
Chaotic
Unruly
Boisterous
Frantic
Advanced
Professional
Impressive
Elite
Elegant
Magnificent
Extravagant
Great
Big
Large
Hefty
Glamorous
Enchanted
Glorious
Exceptional
Exemplary
Breathtaking
Super
Magical
Mythical
Mega
Huge
Amazing
Majestic
Sensational
Marvelous
Awesome
Spacious
Expansive
Superior
Vast
Ultra
Masterful
Splendid
Wonderous
Superb
Fantastic
Wonderful
Staggering
Surreal
Spectacular
Crazy
Fabulous
Shocking
Miraculous
Startling
Impeccable
Extreme
Massive
Gigantic
Humongous
Tremendous
Ginormous
Monstrous
Behemoth
Absurd
Outrageous
Proposterous
Outstanding
Comical
Ludicrous
Ridiculous
Unreal
Colossal
Monumental
Gargantuan
Incredible
Extraordinary
Enormous
Monumentous
Astonishing
Bewildering
Astounding
Phenomenal
Obscene
Unrivaled
Unbelievable
Insurmountable
Otherworldly
Extraterrestrial
Immeasurable
Unthinkable
Unimaginable
Unfathomable
Incomprehensible
Inconceivable
Astronomical
Complete
Perfect
Infinite`.split('\n'),
};

// powers of 2, number of fish
function getDescription(num_item, item) {
	if (item == 'aquarium' && num_item == 0) return 'an empty aquarium';
	let scale = Math.min(
		DESCRIPTIONS[item].length - 1,
		Math.floor(Math.log2(num_item))
	);
	let word = DESCRIPTIONS[item][scale].toLowerCase();
	let n = 'aeiou'.split('').includes(word[0]);
	return `a${n ? 'n' : ''} ${word} ${item}`;
}

function updateDescriptionDisplay(inventory) {
	let num_fish =
		inventory.fish.small + inventory.fish.medium + inventory.fish.big;
	$('.description-aquarium').html(getDescription(num_fish, 'aquarium'));
}

// tests
// for(let i=1; i<1e30; i*=2) console.log(i + ': ' + getDescription(i, 'aquarium') );

export { updateDescriptionDisplay };
