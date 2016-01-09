angular.module('fsStat', [
  'messages',
])

.controller('fsStatCtrl', ['$scope', '$http', '$location', 'MEDIA_SERVER_API_BASE', 'msgService',
  function($scope, $http, $location, MEDIA_SERVER_API_BASE, msgService) {
    $scope.getFsStat = function() {
      var url = MEDIA_SERVER_API_BASE + 'fs-stat' + $location.path();
      $http.get(url).then(
        function fsStatSuccess(res) {
          $scope.fsStat = res.data;
          $scope.fsStat.usedPercent = 1 - $scope.fsStat.blocks_available / $scope.fsStat.blocks;
        }, function fsStatError(res) {
          console.error('fsStat error:', res);
          $scope.fsStat = {};
          if (res.status == 404) {
            msgService.warning({text: res.data.error, ttl: 5000});
          } else {
            msgService.danger({text: 'Error getting filesystem statistics at ' + res.config.url});
          }
        }
      )
    }

    $scope.$on('$locationChangeSuccess', $scope.getFsStat);
  }
])

// https://gist.github.com/thomseddon/3511330
.filter('bytes', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
  }
})

.filter('percentage', ['$filter', function($filter) {
  // assumes input will be in decimal form (i.e. 17% is 0.17).
  return function(input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
}])
;
