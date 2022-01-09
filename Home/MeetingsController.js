var myCtrl = ['$scope', 'AngularServices', function ($scope, AngularServices) {

    var meetId = ''
    var teamsContext = {}
    angular.element(document).ready(function () {
        GetMeetings()
    })

    microsoftTeams.initialize()

    microsoftTeams.getContext(function (context) {
        if (context) {
            teamsContext = context
        }
    })

    microsoftTeams.settings.registerOnSaveHandler(function (saveEvent) {
        var url = GetContentURL('Content.html', [
            { key: 'creator', value: teamsContext['loginHint']},
            { key: 'meet', value: meetId }
        ])
        microsoftTeams.settings.setSettings({
            contentUrl: url,
            entityId: meetId,
            suggestedDisplayName: meetId
        })
        saveEvent.notifySuccess()
    })

    $scope.Meetings = []
    $scope.selected = ''

    $scope.GoToPolls = function (e, meetingId) {
        e.preventDefault()

        meetId = meetingId
        $scope.selected = meetId

        microsoftTeams.settings.setValidityState(true)
    }

    $scope.GoToMeetings = function() {
        var baseHref = "https://" + AngularServices.config.host
        window.open(baseHref + "/dashboard/meetings")
    }

    $scope.Logout = function() {
        SaveUser(null)
        Redirect("Login.html")
    }

    function GetMeetings() {
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
                        $scope.Meetings = response.data.result
                        if ($scope.Meetings.length == 0) {
                            document.getElementById("error").innerText = "No meetings have been created in this account."
                        }
                        break
                    case 401:
                        AngularServices.RenewTokenOrLogout(GetMeetings)
                        break
                    default:
                        // Redirect("Login.html")
                        break
                }
            })
    }
}]

app.controller("myCtrl", myCtrl)
