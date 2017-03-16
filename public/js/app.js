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

    $scope.getImage = function() {
        $http({
            url: '/api/image/' + $scope.startDigit,
            method: 'GET'
        })
        .then(function (data) {
            console.log(data);
            $scope.image = data.data;
        });
    }

});
