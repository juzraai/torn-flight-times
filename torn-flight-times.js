// ==UserScript==
// @name         Torn Flight Times
// @version      1.0.0
// @description  Show flight times before flying
// @author       juzraai
// @license      MIT
// @namespace    https://juzraai.github.io/
// @updateURL    https://raw.githubusercontent.com/juzraai/torn-flight-times/main/torn-flight-times.js
// @downloadURL  https://raw.githubusercontent.com/juzraai/torn-flight-times/main/torn-flight-times.js
// @supportURL   https://github.com/juzraai/torn-flight-times/issues
// @match        https://www.torn.com/travelagency.php
// @grant        none
// ==/UserScript==

/**
 * Adds real time clock values for landings (destination and Torn) for the
 * currently selected destination on Travel Agency screen.
 */
function addFlightTimeCalculator() {
	const flightTime = document.querySelector('[aria-expanded=true] .travel-container .flight-time');
	//if (!flightTime) return;
	const hourMin = flightTime.textContent.split('-')[1].trim();
	const [hour, minute] = hourMin.split(':').map(s => Number(s));
	const flightTimeMs = (hour * 60 + minute) * 60 * 1000;

	const now = new Date().getTime();
	const landTimeMs = now + flightTimeMs;
	const returnTimeMs = landTimeMs + flightTimeMs;

	const landTime = new Date(landTimeMs);
	const returnTime = new Date(returnTimeMs);

	const landTimeFormatted = String(landTime.getHours()).padLeft(2, 0) + ':' + String(landTime.getMinutes()).padLeft(2, 0);
	const returnTimeFormatted = String(returnTime.getHours()).padLeft(2, 0) + ':' + String(returnTime.getMinutes()).padLeft(2, 0);

	const panel = document.querySelector('.travel-agency + .clear');
	panel.innerHTML = `Land @ ~${landTimeFormatted} | Return @ ~${returnTimeFormatted}`;
	panel.style.fontSize = '1.25rem';
	panel.style.fontWeight = 'bold';
	panel.style.padding = '1rem';
	panel.style.textAlign = 'center';
}

setInterval(addFlightTimeCalculator, 500);