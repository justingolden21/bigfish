const getIncreasingCost = (amount, step, start) =>
	step * (getTriangular(amount + start) - getTriangular(start));

const maxCanAffordIncreasingCost = (coins, step, start) =>
	Math.floor(
		Math.sqrt((start + 0.5) * (start + 0.5) + (2 * coins) / step) -
			(start + 0.5)
	);

const getTriangular = (amount) => ((amount + 1) * amount) / 2;

// tests

// for(let i=1; i<21; i++) {
// 	console.log(i, getTriangular(i) );
// }
// console.log(getTriangular(1e9) );

// have 20 aquarium, want to buy 100, 10000 is price increase per aquairum (and base aquarium price)
// console.log(getIncreasingCost(100,10000,20) );

// have 2000 coins, cost is 10, own 5
// console.log(maxCanAffordIncreasingCost(2000,10,5) );
// console.log(getIncreasingCost(15,10,5) );

// let x = 2e8, y = 100000, z = 5;
// let amount = maxCanAffordIncreasingCost(x,y,z);
// console.log(amount);
// console.log(getIncreasingCost(amount,y,z) );
// console.log(x);

export { getIncreasingCost, maxCanAffordIncreasingCost };
