var calcWorker = new Worker('js/worker.js');
var pendingResponse = false;
var pendingMessage = null;

document.addEventListener("DOMContentLoaded", function() {
	registerEventListeners();
	// can we calc already?
	if (document.getElementById("mainform").checkValidity()) {
		performCalculations()
	}
});

function registerEventListeners() {
	document.querySelectorAll('input').forEach(function(element){
		element.addEventListener("change", performCalculations);	
	});
	calcWorker.onmessage = onWorkerMessage
}

function performCalculations(event) {
	let form = document.getElementById("mainform");
	form.classList.remove('was-validated')
	document.getElementById('results-loading').classList.add('d-none')
	document.getElementById('results').classList.add('d-none')
	if (!form.checkValidity()) {
		form.classList.add('was-validated')
		return
	}
	let message = readUIInputs()
	document.getElementById('results-loading').classList.remove('d-none')
	if (!pendingResponse) {
		pendingResponse = true;
		calcWorker.postMessage(message)
	} else {
		pendingMessage = message
	}
}

function readUIInputs() {
	let propval1 = document.getElementById('propval1').value | 0;
	let propval2 = document.getElementById('propval2').value | 0;
	let propval3 = document.getElementById('propval3').value | 0;
	let skillpoints = document.getElementById('skillpoints').value | 0;
	let skillmod = document.getElementById('skillmod').value | 0;
	let cumulative = document.querySelector('input[name="cumulative"]:checked').value | 0;

	let inputs = {propval1, propval2, propval3, skillpoints, skillmod, cumulative}
	return inputs
}

function onWorkerMessage(event) {
	pendingResponse = false;
	if (pendingMessage) {
		calcWorker.postMessage(pendingMessage)
		pendingMessage = null
	}
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
	document.getElementById('results-loading').classList.add('d-none')

	for(let qs in m.result) {
		let qsPercent = 100 * m.result[qs]/(20*20*20)
		let node = document.querySelector('#result-qs-'+qs+' > .progress-bar')
		node.textContent = (qsPercent |0) + "%"
		node.setAttribute('aria-valuenow', qsPercent)
		node.style.width = qsPercent + '%'
	}
}