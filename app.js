/* 
	Author: larkin
	Title: Colors of Pi
	Description: Generate an image from an image representation of a series of digits of pi
	Date: Pi Day, 2017
*/

var _ 			= require('lodash');
var jpeg 		= require('jpeg-js'); 
var request  	= require('request');
var q			= require('q');
var rgbHex		= require('rgb-hex');
var fs 			= require('fs');

var dimension = 50;
var start_digit = 150000;

var pi_data;
var rgb_values;

var frameData = new Buffer(dimension * dimension * 4);

// get the data from pi
getPiDigits(dimension, start_digit)
	.then(function (data) {

		// cool, got the digits from pi
		pi_data = data;
		console.log('Pi data: ');
		console.log(pi_data);

		// but we still need to process them into RGB values
		rgb_values = parseRGB(pi_data);

		console.log(frameData.length);

		// console.log('rgb values');
		// console.log(rgb_values);
		//now we need to convert these values into hex or something
		var count = 0;
		while (count < rgb_values) {
			frameData[(count * 4)] = rgb_values[count][0].toString(16); 	// red
		  	frameData[(count * 4) + 1] = rgb_values[count][1].toString(16); 	// green
		  	frameData[(count * 4) + 2] = rgb_values[count][2].toString(16); 	// blue
		  	frameData[(count * 4) + 3] = 0xFF; 							// alpha - ignored in JPEGs

		  	count ++;
		  	console.log(count);
		}

		console.log('cool, lets make an image');

		var rawImageData = {
		  	data: frameData,
		  	width: dimension,
		  	height: dimension
		};

		var jpegImageData = jpeg.encode(rawImageData, 50);
		console.log(jpegImageData);

		fs.writeFileSync('pi.jpeg', jpegImageData.data);

	}) 
	.catch(function (err0r) {

	});

/*
<Buffer 5b 40 29 ff 59 3e 29 ff 54 3c 26 ff 55 3a 27 ff 5a 3e 2f ff 5c 3c 31 ff 58 35 2d ff 5b 36 2f ff 55 35 32 ff 5a 3a 37 ff 54 36 32 ff 4b 32 2c ff 4b 36 ... >
*/

// Get all the digits of pi that we need
function getPiDigits(dimension, start_digit) {

	var deferred = q.defer();

	// How many pages we need to pull
	var pages = Math.floor((9 * (dimension * dimension) ) / 1000) + 1;
	var start_page = Math.floor(start_digit / 1000);

	// the digits of pi that we need to make our image
	var digits = "";

	// An array of all the promises that we need to make
	var promises = [];

	// add the promise for each page
	for(var count = 0; count < pages; count ++) {
		promises[count] = fetchPiDigits(start_page + count); 
	}

	q.allSettled(promises)
		.then(function (results) {
			results.forEach( function (result) {
				digits += result.value;
			});

			deferred.resolve(digits);
		});

	return deferred.promise;
}

// Get a page (1000 digits) of pi from the API
function fetchPiDigits(page) {

	// the promise for each call
	var deferred = q.defer();

	request('https://apidigits.apispark.net/v1/digits/' + page, 
		function (error, response, body) {
			if (error)
				deferred.reject(error);
			else
		    	deferred.resolve(JSON.parse(response.body).content);
	});

	return deferred.promise;
}

// Takes pi digits and converts each set of 9 into the rgb values representing a pixel
function parseRGB(digits) {

	var current_triplet = "";
	var start_position = 0;

	var red = 0;
	var green = 0;
	var blue = 0;

	var triplet = [];
	var triplets = [];

	for(var count = 0; count < (dimension * dimension); count ++) {

		start_position = count * 9;
		current_triplet = digits.substring(start_position, start_position + 9);

		red = parseInt(current_triplet.substring(0, 3)) % 255;
		green = parseInt(current_triplet.substring(3, 6)) % 255;
		blue = parseInt(current_triplet.substring(6, 9)) % 255;

		triplet = [red, green, blue];
		triplets[ count ] = triplet;
	
	}

	return triplets;
}

