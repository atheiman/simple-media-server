angular.module('directory', [
  'messages',
])

.controller('DirectoryCtrl', ['$scope', '$http', '$location', 'MEDIA_SERVER_API_BASE', 'msgService',
  function($scope, $http, $location, MEDIA_SERVER_API_BASE, msgService) {
    $scope.path = function(path) {
      return $location.path(path);
    }

    $scope.parentDir = function() {
      var pathComponents = $location.path().split('/');
      if (pathComponents.length < 3)
        return '/';
      pathComponents.pop();
      return pathComponents.join('/');
    }

    $scope.ls = function() {
      if ($scope.path() === '') $scope.path('/'); // set an angular path if one is not set
      var url = MEDIA_SERVER_API_BASE + 'ls' + $location.path();
      $http.get(url).then(
        function lsSuccess(res) {
          $scope.files = res.data;
        }, function lsError(res) {
          console.error('ls error:', res);
          $scope.files = [];
          if (res.status == 404) {
            msgService.warning({text: res.data.error, ttl: 5000});
          } else {
            msgService.danger({text: 'Error listing directory at ' + res.config.url});
          }
        }
      )
    }

    $scope.$on('$locationChangeSuccess', $scope.ls);
  }
])
;
