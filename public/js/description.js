const DESCRIPTIONS = {
aquarium:
`Lonely
Microscopic
Miniscule
Barren
Lackluster
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
Unruly
Boisterous
Frantic
Advanced
Professional
Elite
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
Magical
Mythical 
Mega
Huge
Amazing
Majestic
Sensational
Marvelous
Awesome
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
Spectacular
Fabulous
Miraculous
Extreme
Massive
Gigantic
Tremendous
Ginormous
Monstrous
Behemoth
Absurd
Outrageous
Proposterous
Outstanding
Incredible
Extraordinary
Enormous
Monumentous
Astonishing
Astounding
Phenomenal
Unbelievable
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
	if(item == 'aquarium' && num_item == 0) return 'an empty aquarium';
	let scale = Math.min(DESCRIPTIONS[item].length - 1, Math.floor(Math.log2(num_item) ) );
	let word = DESCRIPTIONS[item][scale].toLowerCase();
	let n = 'aeiou'.split('').includes(word[0]);
	return `a${n?'n':''} ${word} ${item}`;
}

function updateDescriptionDisplay(inventory) {
	let num_fish = inventory.fish.small+inventory.fish.medium+inventory.fish.big;
	$('.description-aquarium').html(getDescription(num_fish, 'aquarium') );
}

// tests
// for(let i=1; i<1e30; i*=2) console.log(i + ': ' + getDescription(i, 'aquarium') );

export { updateDescriptionDisplay };