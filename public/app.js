var app = angular.module("judward2016", ['ngRoute','angular-md5']);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/rsvp', {
            templateUrl: 'html/rsvp.html',
            controller: 'rsvpController'
        }).
        when('/rsvp_complete', {
            templateUrl: 'html/rsvp_complete.html',
            controller: 'rsvpController'
        }).
        when('/theWedding', {
            templateUrl: 'html/theWedding.html'
        }).
        when('/hotels', {
            templateUrl: 'html/hotels.html',
            controller: 'hotelsController'
        }).
        when('/giftRegistry', {
            templateUrl: 'html/giftRegistry.html'
        }).
        otherwise({
            redirectTo: '/',
            templateUrl: 'html/ourStory.html'
        });
    }]);

app.controller('hotelsController', ['$scope', '$window',
    function($scope, $window) {
        $scope.redirectToMarriott = function(){
            $window.open('http://www.marriott.com/meeting-event-hotels/group-corporate-travel/groupCorp.mi?resLinkData=Gibson%20and%20Phung%20Wedding%5Estscy%60GIBGIBA%7CGIBGIBB%60164-174%60USD%60false%604%604/28/16%604/30/16%603/28/16&app=resvlink&stop_mobi=yes', '_blank');
        };
        $scope.setColor = function(){
            $scope.buttonColor = {backgroundColor: '#9B9EA0'};
        };
        $scope.resetColor = function(){
            $scope.buttonColor = {backgroundColor: '#CED1D4'};
        };
    }
]);

app.controller("weddingController", ['$scope', '$window',
    function($scope, $window) {
        $scope.redirectToGoogleMaps = function(){
            $window.open('https://www.google.com/maps/place/Paradise+Ridge+Winery/@38.4931054,-122.7259633,17z/data=!3m1!4b1!4m2!3m1!1s0x8084389f27c0af5f:0x7b782d318a2734cf', '_blank');
        };
        $scope.setColor = function(){
            $scope.buttonColor = {backgroundColor: '#9B9EA0'};
        };
        $scope.resetColor = function(){
            $scope.buttonColor = {backgroundColor: '#CED1D4'};
        };
    }
]);

app.controller("judward2016Ctrl", ['$scope', function($scope) {

}]);

app.controller('rsvpController', ['$scope', '$location','$timeout','userService','md5','$http','dataService', function($scope,$location,$timeout,userService,md5,$http,dataService) {
    var ref = new Firebase("https://judward2016.firebaseio.com");
    $scope.emailService = userService;
    $scope.hasPlus1 = 0;
    $scope.submitted = false;
    $scope.user_hash = '';
    $scope.leadGuestData = null;
    $scope.revealPlus1 = function() {
        $scope.hasPlus1 = 1;
    };
    $scope.hidePlus1 = function() {
        $scope.hasPlus1 = 0;
    };
    $scope.isAttending = function() {
        $scope.attending = 1;
    };
    $scope.isNotAttending = function() {
        $scope.attending = 0;
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
        if (($scope.rsvpForm.$valid) && $scope.attending) {
            $scope.user_hash = md5.createHash(user.email);
            console.log("email ="+user.email+" user_hash="+$scope.user_hash);
            console.log("form valid attending");
            ref.child($scope.user_hash).child("self").set({
                email:user.email,
                firstName: user.self.firstname,
                lastName: user.self.lastname,
                starter: user.self.starter,
                main: user.self.main,
                hasPlus1:user.hasPlus1,
                attending:'1'
            });
            if(user.hasPlus1=='1') {
                ref.child($scope.user_hash).child("plus1").set({
                    firstName: user.plus1.firstname,
                    lastName: user.plus1.lastname,
                    starter: user.plus1.starter,
                    main: user.plus1.main
                });
                $scope.emailService.model.plus1FirstName = user.plus1.firstname;
                $scope.emailService.model.plus1LastName = user.plus1.lastname;
                $scope.emailService.model.hasPlus1 = '1';
            }
            $scope.emailService.model.firstName = user.self.firstname;
            $scope.emailService.model.lastName = user.self.lastname;
            $scope.emailService.model.email = user.email;
            $scope.emailService.model.attending = '1';
            $scope.emailService.model.hasplus1 = '0';
            $location.path('/rsvp_complete');
        }
        else if(($scope.rsvpForm.$valid) && !$scope.attending) {
            $scope.user_hash = md5.createHash(user.email);
            console.log("email ="+user.email+" user_hash="+$scope.user_hash);
            console.log("form valid not attending");
            ref.child($scope.user_hash).set(null);
            ref.child($scope.user_hash).child("self").set({
                email:user.email,
                firstName: user.self.firstname,
                lastName: user.self.lastname,
                attending: '0',
                hasPlus1:'0'

            });
            $scope.emailService.model.firstName = user.self.firstname;
            $scope.emailService.model.lastName = user.self.lastname;
            $scope.emailService.model.email = user.email;
            $scope.emailService.model.attending = '0';
            $scope.emailService.model.hasplus1 = '0';
            $location.path('/rsvp_complete');
        }

        else {
            console.log("register:form NOT valid");
        }
    };

    $scope.sendMail = function(){
        if ($scope.rsvpForm.$valid) {
            var myRef = "https://judward2016.firebaseio.com/"+$scope.user_hash+".json";
            dataService.getData(myRef).then(function(dataResponse) {
                $scope.leadGuestData = dataResponse["data"]["self"];
                console.log($scope.leadGuestData);
                var leadGuestName = ""+$scope.leadGuestData["firstName"].substr(0,1).toUpperCase()+$scope.leadGuestData["firstName"].substr(1).toLowerCase()+" "+$scope.leadGuestData["lastName"].substr(0,1).toUpperCase()+$scope.leadGuestData["lastName"].substr(1).toLowerCase();
                var attending = $scope.leadGuestData["attending"];
                var hasPlus1  = $scope.leadGuestData["hasPlus1"];
                console.log(attending+" "+hasPlus1);
                if(parseInt(attending) && parseInt(hasPlus1)) {
                    console.log("guest attending with plus1, sending a email");
                    $scope.plus1GuestData = dataResponse["data"]["plus1"];
                    var plus1GuestName = ""+$scope.plus1GuestData["firstName"].substr(0,1).toUpperCase()+$scope.plus1GuestData["firstName"].substr(1).toLowerCase()+" "+$scope.plus1GuestData["lastName"].substr(0,1).toUpperCase()+$scope.plus1GuestData["lastName"].substr(1).toLowerCase();

                    var mailHtml = "Hi "+leadGuestName+","+
                        "<br><br>Awesome to hear you can make it to our wedding!"+
                        "<br>We welcome you and your plus1 "+plus1GuestName+"."+
                        "<br>Here is a summary of your RSVP please check it and contact info@judward2016.com if there are any issues."+
                        "<br><br>"+leadGuestName+
                        "<br>Starter: "+$scope.leadGuestData["starter"]+
                        "<br>Main: "+$scope.leadGuestData["main"]+
                        "<br><br>"+plus1GuestName+
                        "<br>Starter: "+$scope.plus1GuestData["starter"]+
                        "<br>Main: "+$scope.plus1GuestData["main"]+
                        "<br><br>Best wishes"+
                        "<br>Judy & Edward";
                }
                else if (parseInt(attending) && !parseInt(hasPlus1)) {
                    console.log("guest attending NO plus1, sending a email");
                    var mailHtml = "Hi "+leadGuestName+","+
                        "<br><br>Awesome to hear you can make it to our wedding!"+
                        "<br>Here is a summary of your RSVP please check it and contact info@judward2016.com if there are any issues."+
                        "<br><br>"+leadGuestName+
                        "<br>Starter: "+$scope.leadGuestData["starter"]+
                        "<br>Main: "+$scope.leadGuestData["main"]+
                        "<br><br>Best wishes"+
                        "<br>Judy & Edward";
                }
                else {
                    console.log("guest NOT attending, sending a email");
                    var mailHtml = "Hi "+leadGuestName+","+
                        "<br><br>Sorry to hear you can't make it to our wedding"+
                        "<br>Please revisit the website and update your RSVP using the same email if you change your mind, or contact us directly." +
                        "<br>Nevertheless, we look forward to catching up with you very soon."+
                        "<br><br>Best wishes"+
                        "<br>Judy & Edward";
                }

                var mailJSON ={
                    "key": "6UOoUuEGhLop3J8VCtuKgA",
                    "message": {
                        "html": mailHtml,
                        "text": "",
                        "subject": "Thank you for your Judward2016 Wedding RSVP",
                        "from_email": "info@judward2016.com",
                        "from_name": "Ed & Judy",
                        "to": [
                            {
                                "email": $scope.leadGuestData.email,
                                "name":  leadGuestName,
                                "type": "to"
                            }
                        ],
                        "important": false,
                        "track_opens": null,
                        "track_clicks": null,
                        "auto_text": null,
                        "auto_html": null,
                        "inline_css": null,
                        "url_strip_qs": null,
                        "preserve_recipients": null,
                        "view_content_link": null,
                        "tracking_domain": null,
                        "signing_domain": null,
                        "return_path_domain": null,
                        "bcc_address": "info@judward2016.com"
                    },
                    "async": false,
                    "ip_pool": "Main Pool"
                };
                var apiURL = "https://mandrillapp.com/api/1.0/messages/send.json";
                $http.post(apiURL, mailJSON).
                success(function(data, status, headers, config) {
                    $scope.form={};
                    console.log('successful email send.');
                    console.log('status: ' + status);
                    console.log('data: ' + data);
                    console.log('headers: ' + headers);
                    console.log('config: ' + config);
                }).error(function(data, status, headers, config) {
                    console.log('error sending email.');
                    console.log('status: ' + status);
                });
            });
        }
        else {
            console.log("sendMail:form NOT valid");
            return;
        }
    }
}]);


app.factory('userService', ['$rootScope', function ($rootScope) {

    var service = {

        model: {
            firstName: '',
            lastName: '',
            email: '',
            attending: '',
            hasPlus1: ''
        },

        SaveState: function () {
            sessionStorage.userService = angular.toJson(service.model);
        },

        RestoreState: function () {
            service.model = angular.fromJson(sessionStorage.userService);
        }
    };

    $rootScope.$on("savestate", service.SaveState);
    $rootScope.$on("restorestate", service.RestoreState);

    return service;
}]);

app.controller("rsvpCompleteController", ['$scope', function($scope) {
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

app.filter('capitalize', function() {
    return function(input, scope) {
        if (input!=null)
            input = input.toLowerCase();
        return input.substring(0,1).toUpperCase()+input.substring(1);
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


app.service('dataService', function($http) {
    this.getData = function(url) {
        // $http() returns a $promise that we can add handlers with .then()
        return $http({
            method: 'GET',
            url: url
        }).success(function(data){
        return data;
        }).error(function(data){
        console.log(data);
        return null;
        })
    }
});

/*
//Email via mandrill
app.controller('sentMailCntrl',function($scope, $http){
    $scope.sendMail = function(){
        console.log("sending an email");
        var mailJSON ={
            "key": "6UOoUuEGhLop3J8VCtuKgA",
            "message": {
                "html": "erm",
                "text": "its on",
                "subject": "yo",
                "from_email": "info@judward2016.com",
                "from_name": "Ed & Judy",
                "to": [
                    {
                        "email": "edward.d.gibson@gmail.com",
                        "name": "John Doe",
                        "type": "to"
                    }
                ],
                "important": false,
                "track_opens": null,
                "track_clicks": null,
                "auto_text": null,
                "auto_html": null,
                "inline_css": null,
                "url_strip_qs": null,
                "preserve_recipients": null,
                "view_content_link": null,
                "tracking_domain": null,
                "signing_domain": null,
                "return_path_domain": null
            },
            "async": false,
            "ip_pool": "Main Pool"
        };
        var apiURL = "https://mandrillapp.com/api/1.0/messages/send.json";
        $http.post(apiURL, mailJSON).
        success(function(data, status, headers, config) {
            alert('successful email send.');
            $scope.form={};
            console.log('successful email send.');
            console.log('status: ' + status);
            console.log('data: ' + data);
            console.log('headers: ' + headers);
            console.log('config: ' + config);
        }).error(function(data, status, headers, config) {
            console.log('error sending email.');
            console.log('status: ' + status);
        });
    }
});
*/







//old stuff still here
/*
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
*/
