var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {

    ValidateToken()

    $scope.frameContext = ''
    $scope.user = ''
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
                    $scope.user = context.loginHint
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
            DisplayAttendee(true)
        } else if (mode === 'Attendee') {
            DisplayAttendee(false)
        } else if (mode === 'PresenterHide') {
            DisplayPresenter(true)
        } else if (mode === 'Presenter') {
            DisplayPresenter(false)
        } else { // Logout
            $scope.GotoLogoutPage()
        }
    }

    function GetMode() {
        var User = getCurrentUser()
        if (User && 'ClientToken' in User) {
            if ($scope.frameContext === 'sidePanel') {
                if ($scope.user == $scope.creator) {
                    return 'PresenterHide'
                } else {
                    return 'AttendeeHide'
                }
            } else {
                if ($scope.user == $scope.creator) {
                    return 'Presenter'
                } else {
                    return 'Attendee'
                }
            }
        } else {
            return 'Logout'
        }
    }

    function DisplayAttendee(hide) {
        var attURL = GetAttendeeURL(meeting_id, $scope.user, $scope.user, $scope.user)
        $('#iframe').attr('src', attURL)
        if (hide) {
            $('.header').hide()
        } else {
            $('.header').show()
        }
        $('.content').show()
        StartMonitor()
    }

    function DisplayPresenter(hide) {
        $('#iframe').attr('src', GetPresenterURL(meeting_id))
        if (hide) {
            $('.header').hide()
        } else {
            $('.header').show()
        }
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