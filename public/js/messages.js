angular.module('messages', [])

.factory('msgService', function($rootScope) {
  // Messages to be delivered to the user
  var msgs = [];
  var contexts = ['success', 'info', 'warning', 'danger'];

  var obj = {};
  obj.flashMsg = function(msg) {
    // msg properties:
    //   text - (string) text to display
    //   ttl - (number) milliseconds before alert is removed
    //   context - (string) 'success', 'info', 'warning', 'danger' (aligned with Bootstrap alerts)

    // defaults
    msg.text = angular.isDefined(msg.text) ? msg.text : 'Message text missing...';
    msg.ttl = typeof msg.ttl === 'number' ? msg.ttl : 20000;
    msg.context = contexts.indexOf(msg.context) === -1 ? contexts[1] : msg.context

    // add a timestamp
    msg.id = Date.now();
    var index = msgs.push(msg) - 1;
    $rootScope.$broadcast('MSG_ADDED', index);
  };

  // shortcut functions
  obj.success = function(msg) {this.flashMsg({text: msg.text, ttl: msg.ttl, context: 'success'})};
  obj.info = function(msg) {this.flashMsg({text: msg.text, ttl: msg.ttl, context: 'info'})};
  obj.warning = function(msg) {this.flashMsg({text: msg.text, ttl: msg.ttl, context: 'warning'})};
  obj.danger = function(msg) {this.flashMsg({text: msg.text, ttl: msg.ttl, context: 'danger'})};

  obj.getMsg = function(index) {return msgs[index]};
  return obj;
})

.controller('MsgCtrl', ['$scope', '$timeout', 'msgService',
  function($scope, $timeout, msgService) {
    $scope.msgs = [];

    $scope.$on('MSG_ADDED', function(event, index) {
      var msg = msgService.getMsg(index);
      $scope.msgs.push(msg);
      $timeout($scope.removeMsg, msg.ttl, true, msg.id);
    });

    $scope.removeMsg = function(id) {
      $scope.msgs = $scope.msgs.filter(function(obj) {
        // remove msg from msgs if id matches
        return obj.id !== id;
      });
    };
  }
])
;
