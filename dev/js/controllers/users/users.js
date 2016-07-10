tekoa.controller('usersController', function ($http, $rootScope, $scope, $routeParams) {
    $scope.init = function() {
        $scope.actualRoute = $routeParams.id;
    }

    $scope.init();
});
