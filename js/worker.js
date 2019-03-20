
onmessage = function(event) {
	let timeStart = performance.now();
	let m = event.data;
	let resultFunc = generateResultFunc(m.propval1, m.propval2, m.propval3, m.skillpoints, m.skillmod);
	let result = evaluatResultFunc(resultFunc)
	if (m.cumulative) {
		cumulateResults(result)
	}
	let timeEnd = performance.now();
	m.result = result;
	m.time = timeEnd - timeStart
	postMessage(m)
}
function cumulateResults(results) {
	for(let i=5; i>=1;--i) {
		results[i] += results[i+1]
	}
}

function evaluatResultFunc(resultFunc) {
	let results = [0, 0, 0, 0, 0, 0, 0];
	for( let dice1 = 1; dice1 <= 20; ++dice1) {
		for( let dice2 = 1; dice2 <= 20; ++dice2){
			for( let dice3 = 1; dice3 <= 20; ++dice3){
				let result= resultFunc(dice1, dice2, dice3)
				results[result] +=1
			}
		}
	}
	return results
}

function generateResultFunc(propval1, propval2, propval3, skillpoints, skillmod) {
	const criticalDices = function(dice1, dice2, dice3, critV) {
		return dice1 == critV && dice2 == critV ||
		dice1 == critV && dice3 == critV || 
		dice2 == critV && dice3 == critV
	}

	const negativeCritDices = function(dice1, dice2, dice3) {
		return criticalDices(dice1, dice2, dice3, 20)
	}

	const positiveCritDices = function(dice1, dice2, dice3) {
		return criticalDices(dice1, dice2, dice3, 1)
	}

	const QS_FAIL = 0;
	const QS_1 = 1;
	const QS_2 = 2;
	const QS_3 = 3;
	const QS_4 = 4;
	const QS_5 = 5;
	const QS_6 = 6;

	let skillPointsToQS = function(points){
		if (points < 0)
			return QS_FAIL;
		if (points < 4)
			return QS_1;
		if (points < 7)
			return QS_2;
		if (points < 10)
			return QS_3;
		if (points < 13)
			return QS_4;
		if (points < 16)
			return QS_5;
		console.log(points)
		return QS_6;
	}
	let singleDicePointsDebt = function(dice, prop) {
		if (dice <= prop)
			return 0
		return prop - dice
	}
	return function(dice1, dice2, dice3) {
		// special handling, crits
		if (positiveCritDices(dice1, dice2, dice3))
			return QS_6;
		if (negativeCritDices(dice1, dice2, dice3))
			return QS_FAIL;
		let remainingPoints = skillpoints;
		remainingPoints += singleDicePointsDebt(dice1, propval1+skillmod)
		remainingPoints += singleDicePointsDebt(dice2, propval2+skillmod)
		remainingPoints += singleDicePointsDebt(dice3, propval3+skillmod)

		return skillPointsToQS(remainingPoints)
	}
}