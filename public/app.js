var app = angular.module("judward2016", ['ngRoute']);

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/register', {
        templateUrl: 'html/register.html',
        controller: 'registerController'
      }).
      when('/rsvp', {
        templateUrl: 'html/rsvp.html',
        controller: 'rsvpController'
      }).
      when('/rsvp_complete', {
        templateUrl: 'html/rsvp_complete.html',
        controller: 'rsvpController'
      }).
      otherwise({
        redirectTo: '/'
      });
}]);

app.controller("judward2016Ctrl", ['$scope', function($scope) {
}]);

app.controller('rsvpController', ['$scope', '$location','$timeout','userService', function($scope,$location,$timeout,userService) {
    var ref = new Firebase("https://judward2016.firebaseio.com");
    $scope.whoAmI = "nobody";
    $scope.emailService = userService;


    $scope.hasPlus1 = 0;
    $scope.submitted = false;
    $scope.revealPlus1 = function() {
        $scope.hasPlus1 = 1;
    };
    $scope.hidePlus1 = function() {
        $scope.hasPlus1 = 0;
    };

    $scope.go = function(path) {
        $location.path(path);
    };

    $scope.register = function(user){
        //tell the alert boxes form is submitted
        $scope.submitted = true;
        //emit event for validity check on form
        $scope.$broadcast('show-errors-check-validity');
        //save form if valid
        if ($scope.rsvpForm.$valid) {
            console.log("form valid");
            ref.child(user.self.firstname+"_"+user.self.lastname).child("self").set({
                email:user.email,
                firstName: user.self.firstname,
                lastName: user.self.lastname,
                starter: user.self.starter,
                main: user.self.main,
                marriot: user.marriott,
                hasPlus1:user.hasPlus1
            });
            if(user.hasPlus1==1) {
                ref.child(user.self.firstname + "_" + user.self.lastname).child("plus1").set({
                    firstName: user.plus1.firstname,
                    lastName: user.plus1.lastname,
                    starter: user.plus1.starter,
                    main: user.plus1.main
                });
            }
            $scope.emailService.model.email = user.email;
            $scope.whoAmI = user.email;
            console.log($scope.whoAmI);
            $location.path('/rsvp_complete');
        }
        else {
            console.log("form NOT valid");
        }
    };
}]);


app.factory('userService', ['$rootScope', function ($rootScope) {

    var service = {

        model: {
            name: '',
            email: ''
        },

        SaveState: function () {
            sessionStorage.userService = angular.toJson(service.model);
        },

        RestoreState: function () {
            service.model = angular.fromJson(sessionStorage.userService);
        }
    }

    $rootScope.$on("savestate", service.SaveState);
    $rootScope.$on("restorestate", service.RestoreState);

    return service;
}]);

app.controller("rsvpCompleteController", ['$scope', function($scope) {

    $scope.$watch('whoAmI', function() {
        console.log($scope.whoAmI);
    });

}]);

app.directive('showErrors', function($timeout) {
    return {
        restrict: 'A',
        require: '^form',
        link: function (scope, el, attrs, formCtrl) {
            // find the text box element, which has the 'name' attribute
            var inputEl   = el[0].querySelector("[name]");
            // convert the native text box element to an angular element
            var inputNgEl = angular.element(inputEl);
            // get the name on the text box
            var inputName = inputNgEl.attr('name');

            // only apply the has-error class after the user leaves the text box
            var blurred = false;
            inputNgEl.bind('blur', function() {
                blurred = true;
                el.toggleClass('has-error', formCtrl[inputName].$invalid);
            });

            scope.$watch(function() {
                return formCtrl[inputName].$invalid
            }, function(invalid) {
                // we only want to toggle the has-error class after the blur
                // event or if the control becomes valid
                if (!blurred && invalid) { return }
                el.toggleClass('has-error', invalid);
            });

            scope.$on('show-errors-check-validity', function() {
                el.toggleClass('has-error', formCtrl[inputName].$invalid);
            });

            scope.$on('show-errors-reset', function() {
                $timeout(function() {
                    el.removeClass('has-error');
                }, 0, false);
            });
        }
    }
});


app.directive('radioErrors', function($timeout) {
    return {
        restrict: 'A',
        require: '^form',
        link: function (scope, el, attrs, formCtrl) {
            // find the text box element, which has the 'name' attribute
            var inputEl   = el[0].querySelector("[name]");
            // convert the native text box element to an angular element
            var inputNgEl = angular.element(inputEl);
            // get the name on the text box
            var inputName = inputNgEl.attr('name');

            scope.$watch(function() {
                return formCtrl[inputName].$invalid
            }, function(invalid) {
                // we only want to toggle the has-error class if the control becomes valid
                if (invalid) { return }
                el.toggleClass('has-error', invalid);
            });

            scope.$on('show-errors-check-validity', function() {
                el.toggleClass('has-error', formCtrl[inputName].$invalid);
            });
        }
    }
});


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
    var authData = ref.getAuth();
    if (authData) {
      console.log("Logged in as :" + authData.password.email + ' Please logout before Creating New User');
      $scope.updateAlertMessage("Logged in as :" + authData.password.email + ' Please logout before Creating New User');
    } else {
      ref.createUser({
        email    : email,
        password : password
      }, function(error, userData) {
        if (error) {
          console.log("Error creating user:", error);
          $scope.updateAlertMessage('Cannot creat user: ' + error);
        } else {
          console.log("Successfully created user account with uid: local_email", userData.uid);
          $scope.updateAlertMessage('Created User: ' + email + 'Pleae Click Sign In to use your new account');
          ref.child("users").child(userData.uid).set({
            password: password,
            email: email
          });
        }
      });
    }
  };

  $scope.loginUser = function(email, password) {
    email = typeof email !== 'undefined' ? email : 'noemail';
    password = typeof password !== 'undefined' ? password : 'nopword';
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
      $scope.updateAlertMessage("User " + authData.uid + " is logged in with " + authData.provider + " email:" + authData.password.email);
      console.log("User " + authData.uid + " is logged in with " + authData.provider + " email:" + authData.password.email);
    } else {
      console.log("No user logged in");
      $scope.updateAlertMessage('No User logged in');
    }
  }
  // Register the callback to be fired every time auth state changes
  ref.onAuth(authDataCallback);

}]);

