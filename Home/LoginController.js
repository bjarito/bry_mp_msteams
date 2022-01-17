var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {

    $scope.Email = ""
    $scope.Password = ""

    angular.element(document).ready(function () {
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    })

    $scope.OpenForgot = function() {
        window.open(baseUrl() + 'dashboard/login/forgot')
    }

    $scope.OpenHow = function() {
        window.open('https://meet.ps/')
    }

    $scope.OpenSignUp = function() {
        window.open(baseUrl() + 'dashboard/login/signup')
    }

    $scope.Login = function () {

        var data = {
            "email": $scope.Email,
            "password": $scope.Password
        }
        var headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        AngularServices.POST("auth", data, headers).
            then(function (response) {
                switch (response.status) {
                    case 401:
                        document.getElementById("error").innerText = response.data.error.message
                        break
                    case 200:
                        SaveUser({
                            "Email": $scope.Email,
                            "Password": $scope.Password,
                            "Token": response.data.result.token,
                            "ClientToken": response.data.result.clientToken
                        })
                        var redir = getQueryStringValue("redirect")
                        if (redir == "") {
                            Redirect("Meetings.html")
                        } else {
                            window.location.href = decodeURIComponent(redir)
                        }
                        break
                    default:
                        break
                }
            })
    }
}]

app.controller("myCtrl", myCtrl)
