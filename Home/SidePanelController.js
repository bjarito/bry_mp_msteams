var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {

    ValidateToken()

    $scope.frameContext = ''
    $scope.id = ''
    $scope.user = ''
    $scope.email = ''
    $scope.creator = decodeURIComponent(getQueryStringValue('creator'))
    var meeting_id = getQueryStringValue('meet')

    microsoftTeams.initialize()

    function OpenMeeting() {
        microsoftTeams.getContext(function (context) {
            if (context) {
                if (context.frameContext) {
                    $scope.frameContext = context.frameContext
                }
                if (context.loginHint) {
                    $scope.id = context.userObjectId
                    $scope.user = context.loginHint
                    $scope.email = context.userPrincipalName
                }
            }
            Init()
        })
    }

    function ValidateToken() {
        var User = getCurrentUser()
        var headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Bearer " + User.Token
        }

        AngularServices.GET("meetings", headers).
            then(function (response) {
                switch (response.status) {
                    case 200:
                        OpenMeeting()
                        break
                    case 401:
                        AngularServices.RenewTokenOrLogout(OpenMeeting)
                        break
                    default:
                        // Redirect("Login.html")
                        break
                }
            })
    }

    function Init() {
        var mode = GetMode()
        if (mode === 'AttendeeHide') {
            DisplayAttendee()
        } else { // Logout
            $scope.GotoLogoutPage()
        }
    }

    function GetMode() {
        var User = getCurrentUser()
        if (User && 'ClientToken' in User) {
            return 'AttendeeHide'
        } else {
            return 'Logout'
        }
    }

    function DisplayAttendee() {
        var attURL = GetAttendeeURL(meeting_id, $scope.user, $scope.user, $scope.user)
        $('#iframe').attr('src', attURL)
        $('.header').hide()
        $('.content').show()
        StartMonitor()
    }

    var monitor = null

    function StartMonitor() {
        monitor = setInterval(function () {
            if (GetMode() === 'Logout') {
                $scope.GotoLogoutPage()
            }
        }, 5000)
    }

    function StopMonitor() {
        clearInterval(monitor)
    }

    $scope.GotoLogoutPage = function () {
        if (monitor !== null) {
            StopMonitor()
        }
        SaveUser(null)
        window.location.href = GetLogoutURL(window.location.href)
    }
}]

app.controller("myCtrl", myCtrl)