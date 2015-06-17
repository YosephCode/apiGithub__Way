/*
* Service Module - apiGithub
* Service to bring 
* github repositories (repositoriesService) and 
* github users (usersService)
*/
angular.module('Services',[])
.factory('repositoriesService', ['$http', function($http){
	var repositoriesRequest = function(username){
		return $http({
			method: 'JSONP',
			url: 'https://api.github.com/users/' + username + '/repos?callback=JSON_CALLBACK'
		});
	};
	return {
		event: function(username){
			return repositoriesRequest(username);
		}
	}
}]).factory('usersService', ['$http', function($http){
	var usersRequest = function(username){
		return $http({
			method: 'JSONP',
			url: 'https://api.github.com/users/' + username + '?callback=JSON_CALLBACK'
		});
	};
	return {
		event: function(username){
			return usersRequest(username);
		}
	}
}]).factory('contributorsService', ['$http', function($http){
	var contributorsRequest = function(username, repository){
		return $http({
			method: 'JSONP',
			url: 'https://api.github.com/repos/' + username + '/'+ repository +'/contributors?callback=JSON_CALLBACK'
		});
	};
	return {
		event: function(username, repository){
			return contributorsRequest(username, repository);
		}
	}
}]);


/*
* Main module - App
*/
var app = angular.module('App',['Services', 'ngRoute']);

//Config - Single Page Application
app.config(function($routeProvider){
	$routeProvider
	.when('/', {templateUrl:'../partials/profile.html'})
	.when('/repositorio/detalhes', {templateUrl:'../partials/repository.html', controller:'repositoryController'})
	.when('/repositorios/favoritos', {templateUrl:'../partials/favoriteRepositories.html',  controller:'favoriteRepositoryController' })
	.otherwise({redirectTo:'/'})
});

//Controllers
app.controller('mainController', function($scope, $log, $timeout, repositoriesService, usersService){
	
	var timeout;
	$scope.repositories = null;
	$scope.users = null;
	$scope.favorites = [];
	$scope.page = false;
	$scope.checkedFavorite = false;
	
	
	$scope.dataRepository = function (obj){
		$scope.repository = obj;
	};

	$scope.statusPage = function(){
		$scope.page = !$scope.page;
		
	};



	/*
	* Watch the changes at username model and 
	* pass success data to the services.
	*/
	$scope.$watch('username', function(newUsername){
		if(newUsername){
			if(timeout) { console.log("timeoutSearch"); $timeout.cancel(timeout); }

			timeout = $timeout(function(){
				console.log(repositoriesService.event(newUsername));
				repositoriesService.event(newUsername).success(function(data,status) {
					$scope.repositories = data.data;				
					angular.forEach($scope.repositories, function(obj){
					   //Using dot notation
					   obj.checkedFav = false;
					   obj.statusFavorite = "not-checked";
					   console.log(obj);
					});
				});
				usersService.event(newUsername).success(function(data,status) {
					$scope.users = data.data;					
					console.log($scope.users);
				});
			}, 800);
		}
	});

});
app.controller('repositoryController', function($scope, $log, contributorsService){
	$scope.contributors = null;
	$scope.repositoryDetails  = null;
	$scope.$parent.page = true; //input username disabled
	
	/*
	* Verify favorite is checked
	*/

	$scope.repositoryDetails = $scope.repository;


	contributorsService.event($scope.repositoryDetails.owner.login, $scope.repositoryDetails.name).success(function(data,status) {
		$scope.contributors = data.data;					
	});

	$scope.addFavorites = function (repositoryFavorite) {
		$scope.repFavorite = repositoryFavorite;
		
		setTimeout(function () {
	        $scope.$apply(function () {
				$scope.repFavorite.checkedFav = !$scope.repFavorite.checkedFav;
				if($scope.repFavorite.checkedFav){
					$scope.repFavorite.statusFavorite = "checked";	
				}else{ $scope.repFavorite.statusFavorite = "not-checked";}
				
				$log.info($scope.repFavorite);
	        });
	    }, 100);

		setTimeout(function(){
			if($scope.repFavorite.checkedFav) {
				$scope.$apply(function () {
					$scope.$parent.favorites.push($scope.repFavorite);
					//delete $scope.repfavorite;
					$log.warn($scope.$parent.favorites);
				});
			}else{
				$scope.$apply(function () {	
					$scope.$parent.favorites.splice($scope.repFavorite, 1);
			        $log.error($scope.$parent.favorites);
			    });
			}
		}, 300);
	};		
});
app.controller('favoriteRepositoryController', function($scope){
	$scope.$parent.page = true; //input username disabled
});

