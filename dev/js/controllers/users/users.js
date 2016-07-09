tekoa.controller('usersController', function ($http, $rootScope, $scope, $routeParams) {
    $scope.init = function() {
        $scope.actualRoute = $routeParams.id;
    }

    // $scope.changeTab = function rateThis($event){
    //     var tabNext = angular.element($event.target).attr('data-tab');
    //     var tabActive = document.getElementById(tabNext);
    //     var tabParent = angular.element($event.target)[0].parentNode;
    //
    //     document.getElementById('personal-data').style.display = 'none';
    //     document.getElementById('permission-data').style.display = 'none';
    //     document.getElementById('log-data').style.display = 'none';
    //
    //     document.getElementsByClassName('tab-item')[0].classList.remove('active');
    //     document.getElementsByClassName('tab-item')[1].classList.remove('active');
    //     document.getElementsByClassName('tab-item')[2].classList.remove('active');
    //
    //     tabActive.style.display = 'block';
    //     tabParent.classList.add('active');
    // }

    $scope.init();
});
