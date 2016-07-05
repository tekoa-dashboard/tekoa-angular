'use strict';

var tekoa = angular.module('tekoa', ['ngResource', 'ngRoute', 'ngSanitize'])
.run(['$rootScope', function($rootScope){
  //Uma flag que define se o ícone de acesso ao servidor deve estar ativado
  $rootScope.showLoaderFlag = false;

  //Força que o ícone de acesso ao servidor seja ativado
  $rootScope.showLoader=function(){
    $rootScope.showLoaderFlag=true;
  }
  //Força que o ícone de acesso ao servidor seja desativado
  $rootScope.hideLoader=function(){
    $rootScope.showLoaderFlag=false;
  }

  //Método que retorna a URL completa de acesso ao servidor.
  // Evita usar concatenação
  $rootScope.server=function(url){
    return SERVER_URL + url;
  }

  $rootScope.appName = "tekoá";

}])

.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
  $routeProvider
  .when('/home', {
    templateUrl: '/templates/home/home.html',
    controller: 'homeController'
  })
  .when('/users', {
    templateUrl: '/templates/users/users.html',
    controller: 'usersController'
  })
  .otherwise({
    redirectTo: '/login'
  });
}]);
