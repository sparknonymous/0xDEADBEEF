'use strict';
// Call this function when the page loads (the "ready" event)
$(document).ready(function() {
	initializePage();
})

function initializePage() {
	$(".marker").click(cowClick);

}

function cowClick() {
	console.log("moo");
}