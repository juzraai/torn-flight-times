// ==UserScript==
// @name         Torn Flight Times
// @version      2.1.0
// @description  Show landing times in your timezone before and during flying
// @author       juzraai
// @license      MIT
// @namespace    https://juzraai.github.io/
// @updateURL    https://raw.githubusercontent.com/juzraai/torn-flight-times/main/torn-flight-times.user.js
// @downloadURL  https://raw.githubusercontent.com/juzraai/torn-flight-times/main/torn-flight-times.user.js
// @supportURL   https://github.com/juzraai/torn-flight-times/issues
// @match        https://www.torn.com/index.php
// @match        https://www.torn.com/travelagency.php
// @grant        none
// ==/UserScript==

/**
 * Format UNIX time in milliseconds to "HH:MM" or "HH:MM:SS" string.
 *
 * @param {Number} ms time in milliseconds
 * @param {Boolean} needSecondsToo whether you need seconds too in the output
 * @return "HH:MM" or "HH:MM:SS" string representation in current time zone
 */
function formatTime(ms, needSecondsToo) {
	return new Date(ms).toTimeString().substring(0, needSecondsToo ? 8 : 5);
}

/**
 * Updates element's innerHTML property only if new content is different.
 *
 * @param {HTMLElement} element
 * @param {String} content
 */
function updateInnerHTML(element, content) {
	if (element.innerHTML !== content) {
		element.innerHTML = content;
	}
}

/**
 * Adds landing times below "Flight Time" in Travel Agency.
 */
function addLandingTimesToTravelInfo() {

	// This will be the parent, also this contains the base information: "Flight Time"
	const flightTimeEl = document.querySelector('[aria-expanded=true] .travel-container .flight-time');

	// If the element not exists (e.g. Travel Agency markup changed), we quit:
	if (!flightTimeEl) return;

	// This will be our new element:
	let landingTimesEl = document.querySelector('[aria-expanded=true] .travel-container .flight-time .flight-times');

	// If it doesn't exist, we create and add it:
	if (!landingTimesEl) {
		landingTimesEl = document.createElement('span');
		landingTimesEl.classList.add('flight-times');
		landingTimesEl.style.flexGrow = 1;
		landingTimesEl.title = 'These times are in your timezone. Always check actual landing times after takeoff since there is a variance of 3% on flight times!';
		flightTimeEl.append(landingTimesEl);

		// And also style the containers:
		flightTimeEl.style.display = 'flex';
		flightTimeEl.style.justifyContent = 'center';
		flightTimeEl.style.flexWrap = 'wrap';
		flightTimeEl.style.lineHeight = 1.2;

		const travelInfoEl = document.querySelector('[aria-expanded=true] .travel-container .travel-info');
		travelInfoEl.style.alignItems = 'center';
		travelInfoEl.style.display = 'flex';
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
	updateInnerHTML(landingTimesEl, `Landings - ${formatTime(landTimeMs)}, ${formatTime(returnTimeMs)}`);
}

/**
 * Adds landing time after "Remaining time" on flying page.
 */
function addLandingTimeWhenFlying() {

	// This contains the base information: the remaining time until landing
	const counterEl = document.querySelector('#countrTravel');

	// If the element not exists (e.g. we're not flying), we quit:
	if (!counterEl) return;

	// This will be our new element:
	let landingTimeEl = document.querySelector('#countrTravel + #landingTime')

	// If it doesn't exist, we create and add it:
	if (!landingTimeEl) {
		landingTimeEl = document.createElement('span');
		landingTimeEl.id = 'landingTime'
		landingTimeEl.title = 'This time is in your timezone, and is based on the displayed remaining flight time.';
		counterEl.parentElement.appendChild(landingTimeEl)
	}

	// Extract remaining time:
	const [hour, minute, second] = counterEl.textContent.trim().split(':').map(s => Number(s));
	const remainingTimeMs = ((hour * 60 + minute) * 60 + second) * 1000;

	// Calculate landing time:
	const now = new Date().getTime();
	const landTimeMs = now + remainingTimeMs;

	// Preventing second-flipping by always selecting earlier landing time:
	if (window.previousLandTimeMs && window.previousLandTimeMs < landTimeMs) return;
	window.previousLandTimeMs = landTimeMs;

	// Display landing time:
	updateInnerHTML(landingTimeEl, `(Landing at ${formatTime(landTimeMs, true)})`);
}

// On travel page, we refresh every .5 seconds:
if (window.location.href.startsWith('https://www.torn.com/travelagency.php')) {
	setInterval(addLandingTimesToTravelInfo, 500);
}

// While flying, we refresh every 2 seconds:
if (window.location.href.startsWith('https://www.torn.com/index.php')) {
	setInterval(addLandingTimeWhenFlying, 2 * 1000);
}
