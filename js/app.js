var calcWorker = new Worker('js/worker.js');

document.addEventListener("DOMContentLoaded", function() {
	registerEventListeners();
});

function registerEventListeners() {
	document.getElementById("calcbtn").addEventListener("click", clickCalc);
	document.querySelectorAll('input').forEach(function(element){
		element.addEventListener("change", resetForm);	
	});
	calcWorker.onmessage = onWorkerMessage
}

function resetForm(event) {
	let form = event.target.form;
	form.classList.remove('was-validated')
	document.getElementById('results').classList.add('d-none')
}

function clickCalc(event) {
	event.preventDefault();
	let form = event.target.form;
	if (!form.checkValidity()) {
		form.classList.add('was-validated')
		return
	}
	let message = readUIInputs()
	calcWorker.postMessage(message)
}

function readUIInputs() {
	let propval1 = document.getElementById('propval1').value | 0;
	let propval2 = document.getElementById('propval2').value | 0;
	let propval3 = document.getElementById('propval3').value | 0;
	let skillpoints = document.getElementById('skillpoints').value | 0;
	let skillmod = document.getElementById('skillmod').value | 0;
	let cumulative = document.querySelector('input[name="cumulative"]:checked').value | 0;

	let inputs = {propval1, propval2, propval3, skillpoints, skillpoints, cumulative}
	return inputs
}

function onWorkerMessage(event) {
	let m = event.data
	// check current state, might have changed in the mean time
	let currentState = readUIInputs()
	for (let k in currentState) {
		if (currentState[k] != m[k]) {
			console.log(k, currentState, m)
			return
		}
	}

	document.querySelector('.container').setAttribute('data-cumulative', m.cumulative)

	document.getElementById('runtime').textContent = m.time
	document.getElementById('results').classList.remove('d-none')
	for(let qs in m.result) {
		let qsPercent = 100 * m.result[qs]/(20*20*20)
		let node = document.querySelector('#result-qs-'+qs+' > .progress-bar')
		node.textContent = qsPercent
		node.setAttribute('aria-valuenow', qsPercent)
		node.style.width = qsPercent + '%'
	}
}