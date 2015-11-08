var app = angular.module("judward2016", []);

app.controller("judward2016Ctrl", ['$scope', function($scope) {
  var ref = new Firebase("https://judward2016.firebaseio.com");
}]);


app.controller("loginCtrl", ['$scope', '$timeout', function($scope, $timeout) {
  var ref = new Firebase("https://judward2016.firebaseio.com");
  $scope.alertMessage = '';
  $scope.updateAlertMessage = function(message){
    $timeout(function() {
      $scope.alertMessage = message;
    }, 0);
  };
  $scope.clearAlertMessage = function() {
    $timeout(function() {
      $scope.email = '';
      $scope.password = '';
    }, 0);
  };

  $scope.createUser = function(email, password) {
    ref.createUser({
      email    : email,
      password : password
    }, function(error, userData) {
      if (error) {
        console.log("Error creating user:", error);
        $scope.updateAlertMessage('Cannot creat useer: ' + error);
      } else {
        console.log("Successfully created user account with uid: local_email", userData.uid);
        $scope.updateAlertMessage('Created User: ' + email + 'Pleae Click Sign In to use your new account');
        ref.child("users").child(userData.uid).set({
          password: password,
          email: email
        });
      }
    });
  };

  $scope.loginUser = function(email, password) {
    email = typeof email !== 'undefined' ? email : 'noemail';
    password = typeof password !== 'undefined' ? password : 'pword';
    ref.authWithPassword({
      email    : email,
      password : password
    }, function(error, authData) {
      if (error) {
        ref.unauth();
        console.log("Login Failed!", error);
        $scope.updateAlertMessage('Login Failed!: ' + error);
      } else {
        $scope.updateAlertMessage('login successful with email:' + authData.password.email);
        console.log("Authenticated successfully with payload:", authData);
      }
    },
    {remember: "sessionOnly"}
  )};

  $scope.logoutUser = function(){
    ref.unauth();
    $scope.updateAlertMessage('No User logged in');
    $scope.clearAlertMessage();
    console.log("No User logged in");
  };

  // Create a callback which logs the current auth state
  function authDataCallback(authData) {
    if (authData) {
      $scope.updateAlertMessage(authData.password.email);
      console.log("User " + authData.uid + " is logged in with " + authData.provider + " email:" + authData.password.email);
    } else {
      console.log("No user logged in");
      $scope.updateAlertMessage('No User logged in');
    }
  }
  // Register the callback to be fired every time auth state changes
  ref.onAuth(authDataCallback);

}]);

app.directive('notification', ['$timeout', function ($timeout) {
  return {
    restrict: 'E',
    template:"<div class='alert alert-{{alertData.type}}' ng-show='alertData.message' role='alert' data-notification='{{alertData.status}}'>{{alertData.message}}</div>",
    scope:{
      alertData:"="
      }
  };
}]);

app.controller('MyController', ['$scope', function($scope) {
  $scope.username = 'World';

  $scope.sayHello = function() {
    $scope.greeting = 'Hello ' + $scope.username + '!';
  };
}]);
