var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {

    ValidateToken()

    $scope.frameContext = ''
    $scope.user = ''
    $scope.creator = decodeURIComponent(getQueryStringValue('creator'))
    var meeting_id = getQueryStringValue('meet')

    microsoftTeams.initialize()

    function OpenMeeting() {
        microsoftTeams.getContext(function (context) {
            console.log('context', context)
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
        if ($scope.user == $scope.creator) {
            var User = getCurrentUser()
            if (User && 'ClientToken' in User) {
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
            } else {
                Logout()
            }
        } else {
            OpenMeeting()
        }
    }

    function Init() {
        var mode = GetMode()
        console.log('mode', mode)
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
        if ($scope.user == $scope.creator) {
            var User = getCurrentUser()
            if (User && 'ClientToken' in User) {
                if ($scope.frameContext === 'sidePanel') {
                    return 'PresenterHide'
                } else {
                    return 'Presenter'
                }
            } else {
                return 'Logout'
            }
        } else {
            if ($scope.frameContext === 'sidePanel') {
                return 'AttendeeHide'
            } else {
                return 'Attendee'
            }
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
        Logout()
    }

    function Logout() {
        SaveUser(null)
        window.location.href = GetLogoutURL(window.location.href)
    }
}]

app.controller("myCtrl", myCtrl)