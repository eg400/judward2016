// Declare app level module which depends on ngRoute
angular.module('Judward2016', ['firebase']);

app.controller("SampleCtrl", function($scope, $firebaseArray) {
  var ref = new Firebase("https://<Judward2016>.firebaseio.com/data");
  // download the data into a local object
  var syncObject = $firebaseObject(ref);
  // synchronize the object with a three-way data binding
  // click on `index.html` above to see it used in the DOM!
  syncObject.$bindTo($scope, "data");
});
