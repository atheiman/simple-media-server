angular.module('upload', [])

.controller('UploadCtrl', ['$scope', '$location',
  function($scope, $location) {
    $scope.path = function(path) {
      return $location.path(path);
    }
  }
])
;
