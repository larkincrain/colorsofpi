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

.controller('MainController', function($scope, $window, $location) {

    $scope.email = '';
    $scope.password = '';
    $scope.startDigit = 1;

    

});
