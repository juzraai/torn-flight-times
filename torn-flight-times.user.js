// ==UserScript==
// @name         Torn Flight Times
// @version      2.0.0
// @description  Show flight times before flying
// @author       juzraai
// @license      MIT
// @namespace    https://juzraai.github.io/
// @updateURL    https://raw.githubusercontent.com/juzraai/torn-flight-times/main/torn-flight-times.user.js
// @downloadURL  https://raw.githubusercontent.com/juzraai/torn-flight-times/main/torn-flight-times.user.js
// @supportURL   https://github.com/juzraai/torn-flight-times/issues
// @match        https://www.torn.com/travelagency.php
// @grant        none
// ==/UserScript==

/**
 * Format UNIX time in milliseconds to "HH:MM" string.
 *
 * @param {Number} ms time in milliseconds
 * @return "HH:MM" string representation in current time zone
 */
function formatTime(ms) {
	return new Date(ms).toTimeString().substring(0, 5);
}

/**
 * Adds landing times below "Flight Time".
 */
function addFlightTimes() {

	// This will be the parent, also this contains the base information: "Flight Time"
	const flightTimeEl = document.querySelector('[aria-expanded=true] .travel-container .flight-time');

	// This will be our new element:
	let flightTimesEl = document.querySelector('[aria-expanded=true] .travel-container .flight-time .flight-times');

	// If it doesn't exist:
	if (!flightTimesEl) {

		// Create it:
		flightTimesEl = document.createElement('span');
		flightTimesEl.classList.add('flight-times');
		flightTimesEl.style.flexGrow = 1;

		// Style the containers:
		flightTimeEl.style.display = 'flex';
		flightTimeEl.style.justifyContent = 'center';
		flightTimeEl.style.flexWrap = 'wrap';
		flightTimeEl.style.lineHeight = 1.2;

		const travelInfoEl = document.querySelector('[aria-expanded=true] .travel-container .travel-info');
		travelInfoEl.style.alignItems = 'center';
		travelInfoEl.style.display = 'flex';

		// And our element:
		flightTimeEl.append(flightTimesEl);
	}

	// Extract "Flight Time":
	const flightTimeStr = flightTimeEl.textContent.split('-')[1].trim().split(/\s/)[0];
	const [hour, minute] = flightTimeStr.split(':').map(s => Number(s));
	const flightTimeMs = (hour * 60 + minute) * 60 * 1000;

	// Calculate landing times:
	const now = new Date().getTime();
	const landTimeMs = now + flightTimeMs;
	const returnTimeMs = landTimeMs + flightTimeMs;

	// Display landing times:
	flightTimesEl.innerHTML = `Landings - ${formatTime(landTimeMs)}, ${formatTime(returnTimeMs)}`
}

// Refreshing constantly every .5 seconds:
setInterval(addFlightTimes, 500); // This way flight times update as time goes by :)

