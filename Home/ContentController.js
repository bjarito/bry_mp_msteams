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
        var attendeeMode = GetAttendeeMode()
        var presenterMode = GetPresenterMode()
        var User = getCurrentUser()
        if (User && 'ClientToken' in User) {
            if (attendeeMode === 'AttendeeHide') {
                DisplayAttendee(true)
            } else if (attendeeMode === 'Attendee') {
                DisplayAttendee(false)
            }
            if (presenterMode === 'Presenter') {
                DisplayPresenter()
            } 
        }
        else { // Logout
            $scope.GotoLogoutPage()
        }
    }

    function GetAttendeeMode() {
        if (User && 'ClientToken' in User) {
            if ($scope.frameContext === 'sidePanel') {
                return 'AttendeeHide'
            } else {
                if ($scope.user !== $scope.creator) {
                    return 'Attendee'
                }
            }
        }
    }

    function GetPresenterMode() {
        var User = getCurrentUser()
        if (User && 'ClientToken' in User) {
            if ($scope.user == $scope.creator) {
                return 'Presenter'
            } 
        }
    }

    function DisplayAttendee(hide) {
        var attURL = GetAttendeeURL(meeting_id, $scope.id, $scope.user, $scope.email)
        $('#iframe').attr('src', attURL)
        if (hide) {
            $('.header').hide()
        } else {
            $('.header').show()
        }
        $('.content').show()
        StartMonitor()
    }

    function DisplayPresenter() {
        $('#iframe').attr('src', GetPresenterURL(meeting_id))
        $('.header').show()
        $('.content').show()
        StartMonitor()
    }

    var monitor = null

    function StartMonitor() {
        var User = getCurrentUser()
        monitor = setInterval(function () {
            if (User && 'ClientToken' in User) {
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
