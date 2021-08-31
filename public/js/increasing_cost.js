// amount: number of item purcahsed
// step: amount to increase each item cost by
// start: amount currently owned
// base: base price of item

const getIncreasingCost = (amount, step, start, base) =>
	amount * ((step / 2) * amount + step * start + step / 2 + base);

// const result =
// amount * ((step / 2) * amount + step * start + step / 2 + base);
// console.log(amount, step, start, base, result);
// return result;

// const getIncreasingCost = (amount, step, start, base) =>
// 	step * (getTriangular(amount + start) - getTriangular(start)) +
// 	base * amount;

// const getTriangular = (n) => ((n + 1) * n) / 2;

// https://www.wolframalpha.com/input/?i=Divide%5Bc%2Ca%5D+%3D+p*Divide%5Ba%2C2%5D+%2B+p*s+%2B+Divide%5Bp%2C2%5D+%2B+b%5C%28%2C%29+c%3E%3D0%5C%28%2C%29+s%3E0%5C%28%2C%29+p%3E0%5C%28%2C%29+b%3E0%5C%28%2C%29+solve+for+a&assumption=%7B%22C%22%2C+%22c%22%7D+-%3E+%7B%22Variable%22%7D&assumption=%22UnitClash%22+-%3E+%7B%22c%22%2C+%7B%22SpeedOfLight%22%7D%7D&assumption=%7B%22C%22%2C+%22p%22%7D+-%3E+%7B%22Variable%22%7D

// step > 0, base > 0, start >=0, coins >= 0
const maxCanAffordIncreasingCost = (coins, step, start, base) =>
	coins == 0
		? 0
		: Math.floor(
				(step *
					Math.sqrt(
						(4 * base * base +
							8 * base * step * start +
							4 * base * step +
							8 * coins * step +
							4 * step * step * start * start +
							4 * step * step * start +
							step * step) /
							step /
							step
					) -
					2 * base -
					2 * step * start -
					step) /
					step /
					2
		  );

// MATH

/*

(amount, step, start, base) => coins

(coins, step, start, base) => amount

--------

coins =
	step * (getTriangular(amount + start) - getTriangular(start)) +
	base * amount;

getTriangular(n) => ((n + 1) * n) / 2;

--------

((amount + start + 1) * (amount + start)) / 2 
- ((start + 1) * start) / 2

(amount*amount + 2*amount*start + start*start + amount + start
- start*start - start) / 2

(amount*amount + 2*amount*start + amount) / 2

--------

coins = step * (amount*amount + 2*amount*start + amount) / 2 + base * amount

coins = amount * (step * (amount + 2*start + 1) / 2 + base)

amount = coins / (step * (amount + 2*start + 1) / 2 + base)

c/a = p*a/2 + p*s + p/2 + b

floor for max can afford

*/

// TESTS

// const num_tests = 100;
// let tests_passed = 0,
// 	tests_failed = 0;
// for (let i = 0; i < num_tests; i++) {
// 	let coins = Math.floor(Math.random() * 10000),
// 		step = Math.ceil(Math.random() * 100),
// 		start = Math.ceil(Math.random() * 100),
// 		base = Math.ceil(Math.random() * 100);
// 	// if (i % 2 == 0) step = 0;
// 	// if (i % 3 == 0) start = 0;
// 	// if (i % 5 == 0) base = 0;
// 	// if (i % 7 == 0) coins = 0;

// 	const amount = maxCanAffordIncreasingCost(coins, step, start, base);

// 	console.log(`amount: ${amount}`);
// 	const i0 = getIncreasingCost(amount, step, start, base);
// 	const i1 = getIncreasingCost(amount + 1, step, start, base);
// 	console.log('increasing cost: ' + i0);
// 	console.log(`coins: ${coins}`);
// 	console.log('increasing cost amount+1: ' + i1);

// 	const test_passed = i0 <= coins && coins <= i1;
// 	console.log(
// 		`inputs:\ncoins: ${coins} | step: ${step} | start: ${start} | base: ${base}\ntest passed: %c${test_passed}`,
// 		`color: ${test_passed ? 'green' : 'red'}`
// 	);
// 	if (test_passed) tests_passed++;
// 	else tests_failed++;
// }
// console.log(`${tests_passed} tests passed, ${tests_failed} tests failed`);

export { getIncreasingCost, maxCanAffordIncreasingCost };
