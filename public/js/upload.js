angular.module('upload', [])

.controller('UploadCtrl', ['$scope', '$location',
  function($scope, $location) {
    $scope.getPath = function() {
      return $location.path();
    }
  }
])
;
