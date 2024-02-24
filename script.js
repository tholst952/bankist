'use strict';
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// const account = accounts.find(acc => acc.owner === 'Sarah Smith');
// console.log(account);

// Elements selected with the DOM
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/* This function takes an array of numbers(movements) from an account and displays each one as a row in our html */
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${mov.toFixed(2)}€</div>
  </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

/* This function calculates the current balance of an account by reducing the movements array to one sum. Then it displays in the appropriate spot */
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

/* This function sorts through an account's movements array of numbers and defines them as income, withdrawal. Then the interest is calculated and it's all displayed in the html in the appropriate spots  */
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

/* this function creates a username for each account based on the account owner value, which is their full name */
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()

      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);
  // Display balance
  calcDisplayBalance(acc);
  // Display Summary
  calcDisplaySummary(acc);
};

/* Here is the event handler for the login button */
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    containerApp.style.opacity = 100;

    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // update UI
    updateUI(currentAccount);
  }
});

// Transfering money
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  // clearing the transfer input fields
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // update UI
    updateUI(currentAccount);
  }
});

// Requesting loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.trunc(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement to account
    currentAccount.movements.push(amount);

    // update UI
    updateUI(currentAccount);

    inputLoanAmount.value = '';
  }
});

// Closing/Deleting the account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;

    // clear the close account input fields
    inputCloseUsername.value = inputClosePin.value = '';
  }
});

// Sorting the movements functionality
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/*
// Mini challenge! Create an array of the withdrawals
const movements1 = [5000, 3400, -150, -790, -3210, -1000, 8500, -30];

const withdrawals = movements1.filter(mov => mov < 0);
console.log(withdrawals);
*/
/////////////////////////////////////////////////
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
/*
/////🚧🚧 Simple Array Methods
let arr = ['a', 'b', 'c', 'd', 'e'];

// SLICE
console.log(arr.slice(2));
console.log(arr.slice(2, 4));
console.log(arr.slice(-2));
console.log(arr.slice(-1));
console.log(arr.slice(1, -2));
console.log(arr.slice());
console.log([...arr]);

// SPLICE
console.log(arr.splice(2));
console.log(arr);
console.log(arr.splice(-1));
console.log(arr);
console.log(arr.splice(1, 2));
console.log(arr);

// REVERSE
arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse());
console.log(arr2);

// CONCAT
const letters = arr.concat(arr2);
console.log(letters);
console.log([...arr, ...arr2]);

// JOIN
console.log(letters.join('-'));
*/
/*
/////🚧🚧 The New at Method
const arr = [47, 18, 93, 39, 55];
console.log(arr[-1]);
console.log(arr[0]);
console.log(arr.at(0));

// getting the last element of array
console.log(arr[arr.length - 1]);
console.log(arr.slice(-1)[0]);
console.log(arr.at(-1));
*/
/*
/////🚧🚧 Looping Arrays: forEach
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// for (const movement of movements) {
for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    console.log(`Movement ${i + 1}: You deposited ${movement}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`);
  }
}

console.log('----forEach----');
movements.forEach(function (mov, i, arr) {
  if (mov > 0) {
    console.log(`Movement ${i + 1}: You deposited ${mov}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(mov)}`);
  }
});

// The forEach function's iterations explanation
// 0: function(200)
// 1: function(450)
// 2: function(-400)
// ...and so on
*/
/*
/////🚧🚧 forEach method with maps and sets

// Map
const currencies = new Map([
  ['USD', 'United States Dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound Sterling'],
]);

currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
});

// Set
const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
console.log(currenciesUnique);

currenciesUnique.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
});
*/
/*
// CODING CHALLENGE #1 👾
const dogsJulia1 = [3, 5, 2, 12, 7];
const dogsKate1 = [4, 1, 15, 8, 3];

const dogsJulia2 = [9, 16, 6, 8, 3];
const dogsKate2 = [10, 5, 6, 1, 4];

const checkDogs = function (arr1, arr2) {
  const corrected = arr1.slice(1, -2);
  const combinedArr = [...corrected, ...arr2];
  // const combinedArr = corrected.concat(arr2);
  console.log(combinedArr);
  combinedArr.forEach(function (dog, i) {
    if (dog >= 3) {
      console.log(`Dog number ${i + 1} is an adult, and is ${dog} years old. `);
    } else {
      console.log(`Dog number ${i + 1} is still a puppy 🐶`);
    }
  });
};

checkDogs(dogsJulia1, dogsKate1);
checkDogs(dogsJulia2, dogsKate2);

const art1 = ['The', 'beginning', 'and'];
const art2 = ['the', 'End.'];

console.log(art1.concat(art2));
*/
/*
///// Map Method 5/1/2023

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const eurToUsd = 1.1;

// const movementsUSD = movements.map(function (mov) {
//   return mov * eurToUsd;
//   // return 23;
// });

// mini challenge replace above with an arrow function
// functional programming paradigm ✔
const movementsUSD = movements.map(mov => mov * eurToUsd);

console.log(movements);
console.log(movementsUSD);

// same thing with a FOR-OF loop
const movementsUSDfor = [];
for (const mov of movements) {
  movementsUSDfor.push(mov * eurToUsd);
}
console.log(movementsUSDfor);

const movementDescriptions = movements.map(function (mov, i) {
  return `Movement ${
    i + 1
  }: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(mov)}`;
});

console.log(movementDescriptions);
*/

// computing usernames 5/5/2023

/////////////////////////////////////////
/*
////////////filter method 5/11/2023
const deposits = account1.movements.filter(function (mov) {
  return mov > 0;
});
console.log(deposits);

const withdrawals = account1.movements.filter(mov => mov < 0);

console.log(withdrawals);

///////////////////reduce method 5/15/2023
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// accumulator = SNOWBALL ⚪
// const balance = movements.reduce(function (acc, current, i, arr) {
//   console.log(`Iteration ${i}: ${acc}`);
//   return acc + current;
// }, 0);
// console.log(balance);

// Arrow Function version:
const balance = movements.reduce((acc, cur) => acc + cur, 0);
console.log(balance);

let balance2 = 0;
for (const mov of movements) {
  balance2 += mov;
}
console.log(balance2);
// use innerHTML to read the property or use as above
// console.log(containerMovements.innerHTML);

// Maximum Value
const max = movements.reduce(function (acc, cur) {
  if (acc > cur) return acc;
  else return cur;
}, movements[0]);
console.log(max);
*/
/*
/////////////////////////////////////////
// Coding Challenge #2 🚧🚧🚧

const data1 = [5, 2, 4, 1, 15, 8, 3];
const data2 = [16, 6, 10, 5, 6, 1, 4];

const calcAverageHumanAge = function (ages) {
  const humanAge = ages.map(age => (age <= 2 ? 2 * age : 16 + age * 4));
  console.log(`Human Age: ${humanAge}`);

  const adults = humanAge.filter(age => age > 18);
  console.log(`Adult Dogs: ${adults}`);

  const average = adults.reduce((acc, cur) => acc + cur, 0) / adults.length;
  console.log(`Average Age: ${average}`);
};

calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);

// Coding Challenge #3 🚧🚧🚧
const calcAverageHumanAgeArrow = ages =>
  ages
    .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
    .filter(age => age > 18)
    .reduce((acc, cur, i, array) => acc + cur / array.length, 0);

console.log(calcAverageHumanAgeArrow([5, 2, 4, 1, 15, 8, 3]));
console.log(calcAverageHumanAgeArrow([16, 6, 10, 5, 6, 1, 4]));
*/
/*
//////////// chaining methods 5/30/2023
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const eurToUsd = 1.1;

// PIPELINE that processes our data
const totalDepositsUSD = movements
  .filter(mov => mov > 0)
  // .map(mov => mov * eurToUsd)
  .map((mov, i, arr) => {
    // console.log(arr);
    return mov * eurToUsd;
  })
  .reduce((acc, mov) => acc + mov, 0);
console.log(totalDepositsUSD);

///////////////////////////////////////////////////

const calcAverageHumanAgeArrow = ages =>
  ages
    .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
    .filter(age => age > 18)
    .reduce((acc, cur, i, array) => acc + cur / array.length, 0);

const avg1 = calcAverageHumanAgeArrow([5, 2, 4, 1, 15, 8, 3]);
const avg2 = calcAverageHumanAgeArrow([16, 6, 10, 5, 6, 1, 4]);
console.log(avg1, avg2);

////////////////////////////////the find method 5/31/2023
const firstWithdrawal = movements.find(mov => mov < 0);
console.log(movements);
console.log(firstWithdrawal);

const temperatures = [23, 30, 35, -9, 32, -13, -9, 24];
const firstLowest = temperatures.find(temp => temp < 0);

console.log(firstLowest);

// const account = accounts.find(acc => acc.owner === 'Jessica Davis');
// console.log(account);
let account;
for (const acc of accounts) {
  if (acc.owner === 'Jessica Davis') {
    account = acc;
    break;
  }
}
console.log(account);
*/
/*
//review refresher
const calcAverageHumanAge = function (ages) {
  const humanAge = ages
    .map(dogAge => (dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4))
    .filter(dogAge => dogAge > 18)
    .reduce((acc, age, i, arr) => acc + age / arr.length, 0);
  return humanAge;
};

console.log(calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]));
console.log(calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]));
*/
/*
//////////////////////////////////////////
// the some and every methods 6/20/2023
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// SOME METHOD
// includes only tests for EQUALITY, returning true or false
console.log(movements.includes(-130));

// with the some method you can test with a CONDITION
const anyDeposits = movements.some(mov => mov > 0);
const anyLargeDeposits = movements.some(mov => mov > 500);
console.log(anyDeposits);
console.log(anyLargeDeposits);

// EVERY METHOD
const numbers = [6, 24, 17, 98];
console.log(numbers.every(num => num > 0));

// Separate callback
const deposit = mov => mov > 0;
console.log(movements.some(deposit));
*/

/*
///////////////////////////////////////////////
// the flat and flatMap methods 6/26/2023

// one level deep
const arr = [[1, 2, 3], [4, 5, 6], 7, 8, [9, 10]];
console.log(arr.flat());

// two levels deep nesting
const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8, [9, 10]];
console.log(arrDeep.flat(2));

// using flat()
const overallBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, cur) => acc + cur, 0);
console.log(overallBalance);

// using flatMap()
const overallBalance2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, cur) => acc + cur, 0);
console.log(overallBalance2);
*/

/*
///////////////////////////////////////////////
// the sort method 7/4/2023 & 7/11/2023

// sorting strings
const owners = ['Joey', 'Allison', 'Mondo', 'Barenziah', 'Zeniah'];
console.log(owners.sort());
console.log(owners);

// sorting numbers
const ages = [11, 38, 40, 65, 42, 32, 6];
console.log(ages.sort());

// return < 0, A, B (keep order)
// return > 0, B, A (switch order)

// ascending order
ages.sort((a, b) => {
  if (a > b) return 1;
  if (a < b) return -1;
});

// dramatically reduced code, works the same
ages.sort((a, b) => a - b);
console.log(ages);

// descending order
ages.sort((a, b) => {
  if (a > b) return -1;
  if (a < b) return 1;
});
console.log(ages);
*/
/*
///////////////////////////////////////////////
// Creating and Filling Arrays 7/14/2023

// Empty arrays + fill method
const x = new Array(7);
console.log(x);

x.fill(1, 3, 5);
x.fill(1);
console.log(x);

const arr = [1, 2, 3, 4, 5, 6, 7];
arr.fill(23, 2, 6);
console.log(arr);

// Array.from()
const y = Array.from({ length: 7 }, () => 1);
console.log(y);

const z = Array.from({ length: 9 }, (_, i) => i + 1);
console.log(z);

// Challenge
// Try Array.from to generate an array with 100 random dice rolls.
const dice = Array.from({ length: 100 }, () =>
  Math.trunc(Math.random() * 100 + 1)
);
console.log(dice);

if (dice.includes(100)) {
  console.log(`Hey you rolled a 100!`);
}

console.log(Math.random() * 6 + 1);

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent.replace('€', ''))
  );

  console.log(movementsUI);
});

*/
/*
///////////////////////////////
// Array Methods Practice

// 1.
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((acc, cur) => acc + cur, 0);

console.log(bankDepositSum);

// 2.
// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov >= 1000).length;

const numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? count + 1 : count), 0);

console.log(numDeposits1000);

// ++ still returns the old value (addition not immediately shown)
let a = 10;
console.log(a++);
// console.log(a)

// prefixed plus plus operator
let b = 10;
console.log(++b);

// tricking JS to iterate from an object
const obj = {
  length: 5,
  first: 'Amanda',
  last: 'Jones',
  age: 34,
};

const f = Array.from(obj, (el, i) => obj.first);
console.log(f);

// 3.
// dot notation way
// const sums = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sums, cur) => {
//       cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
//       return sums;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );

// bracket notation way
const { deposits, withdrawals } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );

console.log(deposits, withdrawals);

const overallBalance = accounts.map(acc => acc.movements).flat();

console.log(overallBalance);

// challenge - making an array with reduce method.
// getting only positive values

const overallBalance2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, cur) => (cur > 0 ? [...acc, cur] : acc), []);
console.log(overallBalance2);

// 4.
// this is a nice title -> This Is a Nice Title

const convertTitleCase = function (title) {
  const capitalize = str => str[0].toUpperCase() + str.slice(1);

  const exceptions = ['a', 'an', 'the', 'but', 'or', 'on', 'and', 'in', 'with'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitalize(word)))
    .join(' ');
  return capitalize(titleCase);
};

console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not too long'));
console.log(convertTitleCase('and here is another title with an EXAMPLE'));
console.log(convertTitleCase('ride on the river in style'));


*/
/*
////////////////////////////////////////////////
// Coding Challenge #4

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// Task 1.
const calcRecommended = function (weight) {
  return weight * 0.75 * 28;
};

dogs.forEach(function (el) {
  el.recommendedFood = calcRecommended(el.weight);
});
console.log(dogs);

// Task 2.
const sarahsDog = dogs.find(dog => dog.owners.includes('Sarah'));
console.log(sarahsDog);

const summary =
  sarahsDog.curFood > sarahsDog.recommendedFood
    ? `Sarah's dog is eating too much!`
    : `Sarah's dog is eating too little..`;

console.log(summary);

// Task 3.
// el.curFood > el.recommendedFood * 0.9 && el.curFood < el.recommendedFood * 1.1

const ownersEatTooMuch = dogs.filter(dog => dog.curFood > dog.recommendedFood);
console.log(ownersEatTooMuch);

const ownersEatTooLittle = dogs.filter(
  dog => dog.curFood < dog.recommendedFood
);
console.log(ownersEatTooLittle);

// Task 4.
const allOwners = dogs.flatMap(dog => dog.owners);

allOwners.filter(dog=> )
*/

// fresh coding challenge #4

// our data:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// 1. Loop over the 'dogs' array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. So do not create a new array, simply loop over the array

dogs.forEach(
  dog => (dog.recommendedFood = Math.trunc(dog.weight ** 0.75 * 28))
);

console.log(dogs);

// 2. Find Sarah's dog and log to the console whether it's eating too much or too little.
const sarahsDog = dogs.find(dog => dog.owners.includes('Sarah'));
console.log(sarahsDog);

// const eatingEval = function (dog) {
//   if (dog.curFood > dog.recommendedFood) {
//     console.log(`Your dog is eating too much`);
//   } else {
//     console.log(`Your dog is eating too little`);
//   }
// };
// eatingEval(sarahsDog);

console.log(
  `Sarah's dog is eating ${
    sarahsDog.curFood > sarahsDog.recommendedFood ? 'too much!' : 'too little'
  }`
);

// 3. Create an array containing all owners of dogs who eat too much and an array with all owners of dogs who eat too little

const ownersEatTooMuch = dogs
  .filter(dog => dog.curFood > dog.recommendedFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooMuch);

const ownersEatTooLittle = dogs
  .filter(dog => dog.curFood < dog.recommendedFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooLittle);

// 4. Log a string to the console for each array created in 3, like this: 'Matilda and Alice and Bob's dogs eat too much!' and 'Sarah and John and Michaels's dogs eat too little);

console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too much!`);
console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too little!`);

// 5. Log to the console whether there is any dog eating exactly the amount of food that is recommended( just true or false)

console.log(dogs.some(dog => dog.curFood === dog.recommendedFood));

// 6. Log to the console whether there is any dog eating an okay amount of food (just true or false)

const eatingOkAmt = dog =>
  dog.curFood > dog.recommendedFood * 0.9 &&
  dog.curFood < dog.recommendedFood * 1.1;

console.log(dogs.some(eatingOkAmt));

// 7. Create an array containing the dogs that are eating an okay amount of food (try to reuse the condition used in 6)

console.log(dogs.filter(eatingOkAmt));

// 8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order

const recFoodAscending = dogs
  .map(dog => dog.recommendedFood)
  .sort((a, b) => a - b);

console.log(recFoodAscending);

const dogsCopy = dogs
  .slice()
  .sort((a, b) => a.recommendedFood - b.recommendedFood);

console.log(dogsCopy);

const evenOrOdd = function (int) {
  console.log(int % 2 == 0 ? 'Even' : 'Odd');
};

evenOrOdd(87);
evenOrOdd(4);
evenOrOdd(56);
evenOrOdd(99);
