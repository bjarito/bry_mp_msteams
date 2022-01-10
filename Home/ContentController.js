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
        var presenterMode = GetPresenterMode()
        var attendeeMode = GetAttendeeMode()
        if (attendeeMode === 'AttendeeHide') {
            DisplayAttendee(true)
        } else if (attendeeMode === 'Attendee') {
            DisplayAttendee(false)
        } else if (presenterMode !== 'Presenter') { // Logout
            $scope.GotoLogoutPage()
        }
        
        if (presenterMode === 'Presenter') {
            DisplayPresenter()
        } else { // Logout
            $scope.GotoLogoutPage()
        }
        console.log('presenterMode',presenterMode)
        console.log('attendeeMode',attendeeMode)

    }

    function GetAttendeeMode() {
        var User = getCurrentUser()
        if (User && 'ClientToken' in User) {
            if ($scope.frameContext === 'sidePanel') {
                return 'AttendeeHide'
            } else {
                return 'Attendee'
            }
        } else {
            return 'Logout'
        }
    }

    function GetPresenterMode() {
        var User = getCurrentUser()
        if (User && 'ClientToken' in User) {
            if ($scope.user == $scope.creator) {
                return 'Presenter'
            }
        } else {
            return 'Logout'
        }
    }

    function GetModeOrigin() {
        if ($scope.frameContext === 'sidePanel') {
            return 'Attendee'
        } else if ($scope.frameContext === 'content') {
            var User = getCurrentUser()
            if (User && 'ClientToken' in User) {
                return 'Presenter'
            } else {
                if ($scope.user == $scope.creator) {
                    return 'Logout'
                } else {
                    return 'Attendee'
                }
            }
        } else { // no case
            return 'Logout'
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
        monitor = setInterval(function () {
            if (GetAttendeeMode() === 'Logout' || GetPresenterMode === 'Presenter') {
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