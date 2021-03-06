 // app/routes.js

// for web server stuff
var bcrypt      = require('bcrypt-nodejs');
var jwt         = require('jsonwebtoken');

// for making the image
var _           = require('lodash');
var jpeg        = require('jpeg-js'); 
var request     = require('request');
var q           = require('q');
var rgbHex      = require('rgb-hex');
var fs          = require('fs');


module.exports = function(app) {

    // server routes ===========================================================
    // get the comments for an image
    app.get('/api/image/:startPosition', function(req, res) {

        // we'll want to send back the bas64 URL encoded representation of this image that we create
        var dimension = 50;
        var start_digit = req.params.startPosition || 67;

        var pi_data;
        var rgb_values;

        var frameData = new Buffer(dimension * dimension * 4);

        // get the data from pi
        getPiDigits(dimension, start_digit)
            .then(function (data) {

                // cool, got the digits from pi
                pi_data = data;

                // but we still need to process them into RGB values
                rgb_values = parseRGB(pi_data);

                //now we need to convert these values into hex or something
                var count = 0;
                while (count < rgb_values) {
                    frameData[(count * 4)] = rgb_values[count][0].toString(16);         // red
                    frameData[(count * 4) + 1] = rgb_values[count][1].toString(16);     // green
                    frameData[(count * 4) + 2] = rgb_values[count][2].toString(16);     // blue
                    frameData[(count * 4) + 3] = 0xFF;                                  // alpha - ignored in JPEGs

                    count ++;
                }

                var rawImageData = {
                    data: frameData,
                    width: dimension,
                    height: dimension
                };

                var jpegImageData = jpeg.encode(rawImageData, 50);
                var timeStamp = new Date().getTime();

                // save the image to the disk
                fs.writeFileSync('pi_' + timeStamp + '.jpeg', jpegImageData.data);

                //return the base64 URL encoded string
                var imageData = 'data:image/jpg;base64,' + jpegImageData.data.toString('base64');
                var hexData = [];

                for(var count = 0; count < rgb_values.length; count ++) {
                    hexData[count] = rgb_values[count]; //rgbToHex(rgb_values[count]);
                }

                return res.json({
                    imageData: imageData,
                    hexData: hexData,
                    dimension: dimension
                    });

            }) 
            .catch(function (error) {

            });

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

                    //remove unwanted digits from the start of the first page
                    digits = digits.substring(start_digit % 1000, digits.length);

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

        function rgbToHex(rgbValue) {

            var hex = "";

            hex = toHex(rgbValue[0])
                + toHex(rgbValue[1])
                + toHex(rgbValue[2]);

            return hex;
        }

        function toHex(value) {

            value = parseInt(value,10);

            if (isNaN(value)) 
                return "00";

            value = Math.max(0,Math.min(value,255));

            return "0123456789ABCDEF".charAt((value - value % 16) / 16)
              + "0123456789ABCDEF".charAt(value % 16);
        }

    });

    // frontend routes =========================================================
    // route to handle all angular requests
    app.get('*', function(req, res) {
        res.sendfile('./public/views/index.html'); // load our public/index.html file
    });

};
