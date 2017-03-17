// public/js/app.js
angular.module('colorsOfPi', 
	['ngRoute'])

.config ( function ( $routeProvider, $locationProvider) {

    $routeProvider

        // home page
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'MainController'
        });

    $locationProvider.html5Mode(true);

})

.run( function($window) {

    //check to see if we are still logged in

})

.controller('MainController', function($scope, $window, $location, $http) {

    $scope.email = '';
    $scope.password = '';
    $scope.startDigit = 1;
    
    $scope.image = "";
    $scope.hexData = [];
    $scope.hexTable = [];
    $scope.dimension = 0;

    $scope.getImage = function() {
        $http({
            url: '/api/image/' + $scope.startDigit,
            method: 'GET'
        })
        .then(function (data) {
            $scope.hexData = [];
            $scope.hexTable = [];

            $scope.image = data.data.imageData;
            $scope.hexData = data.data.hexData;
            $scope.dimension = data.data.dimension;

            $scope.hexTable = makeHexTable($scope.dimension, $scope.hexData);
            console.log($scope.hexTable[0]);
        });
    }

    // given a dimension and an array of hexvalues, create a 2 dimensional array of hex values
    function makeHexTable (dimension, hexData) {
        var table = [];
        var row = [];

        for(var count_r = 0; count_r < dimension; count_r ++) {
            for (count_c = 0; count_c < dimension; count_c ++) {
                row[count_c] = 'rgb(' + hexData[(count_r * dimension) + count_c] + ')';
            }

            table[count_r] = row;
            row = [];
        }

        return table;
    }

});
