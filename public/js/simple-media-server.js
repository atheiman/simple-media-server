angular.module('simpleMediaServer', [
  'upload',
  'directory',
  'fsStat',
  'messages',
])

.constant('MEDIA_SERVER_API_BASE', 'http://localhost:4567/api/')
;
