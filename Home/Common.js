// Available endpoints and their configs.

// Intended API is chosen based on where the MSTeams assets are being served.
// Order is important: first matching object wins.
var configs = {
    "development": {
        "domain": "dev.meet.ps"
    },
    "default": {
        "domain": "app.meet.ps"
    },
    "local": {
        "domain": "local.meet.ps:8443"
    }
}

// FIXME: This is supposed to be a private key!
var sharedKey = "da3bfe2b41a29ac8d3d32eb0aa10b9d91cf7"

var mode
if (location.href.search('bjarito.github.io') >= 0) {
    mode = "development"
} else if (location.href.search('local-msteams.meet.ps') >= 0) {
    mode = "local"
} else {
    mode = "default"
}

// IE11 compat
// var config
// for (var i = 0; i < configs.length; i++) {
//     var candidate = configs[i]
//     if (window.location.href.indexOf(candidate.assets) !== -1) {
//         config = config || candidate
//     }
// }

// Last ditch scenario
// config = config || configs[configs.length - 1]
config = configs[mode]

var BaseURL = "https://" + config.domain + "/"
var BaseAPIURI = BaseURL + "api/"

var basePath = "/Home"

// Reprototypings.

Storage.prototype.setObj = function (key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}

Storage.prototype.getObj = function (key) {
    return JSON.parse(this.getItem(key))
}


// Common funcs.

function removeObj(myObjects, prop, value) {
    return myObjects.filter(function (val) {
        return val[prop] !== value
    })
}

function SaveUser(User) {
    localStorage.setObj("User", User)
}

function getCurrentUser() {
    return localStorage.getObj("User")
}

// Relative URL redirector with support for customized views depending on config/endpoint.
function Redirect(q) {
    window.location.href = GetRedirectURL(q)
}

function GetRedirectURL(q) {
    // Honour base relative path.
    var currentPath = window.location.pathname.indexOf(basePath)
    var basePrefix = window.location.pathname.substring(0, currentPath)
    // Get the target view name, check if it has custom version.
    var view = String(q).trim().split(".").shift()
    var isCustom = config.customViews && config.customViews[view] && config.customPath
    var prefix = basePrefix + (isCustom ? (config.customPath + "/") : "/Home/")
    // Carry over the endpoint/mode thing. Note that other strings might already be present there.
    return prefix + q
}

function ForgotPassword () {
    window.open(BaseURL + "login/forgot", "_blank")
}

function generateAttendeePayload(id, name, email) {
    var bodyString = sharedKey + id + name + email
    var body = {
        "client": "msteams",
        "id": id,
        "name": name,
        "email": email,
        "signature": sha256(bodyString)
    }
    return encodeURIComponent(btoa(JSON.stringify(body)));
}

function GetAttendeeURL (meetingid, id, name, email) {
    var retURL = BaseURL + meetingid + '?hmm=true'
    if (id !== undefined && name !== undefined && email !== undefined) {
        retURL = retURL + '&i=' + generateAttendeePayload(id, name, email)
    }
    return retURL
}

function GetPresenterURL (meetingid) {
    var User = getCurrentUser()
    console.log(User)
    return BaseURL + 'presenter/' + meetingid + '?t=' + User.ClientToken + '&hmm=true'
}

function GetLogoutURL (redirect) {
    var url = window.location.protocol + '//' + window.location.hostname + GetRedirectURL('Login.html')
    return url + '?redirect=' + encodeURIComponent(redirect)
}

function GetContentURL (file, params) {
    var url = window.location.protocol + '//' + window.location.hostname + GetRedirectURL(file)
    var paramString = params.map(function (param) {
        return param.key + '=' + param.value
    }).join('&')
    if (paramString.length > 0) {
        url = url + '?' + paramString
    }
    return url
}

function getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"))
}


// "main"

if (window.angular) {
    var app
    if (window.location.href.search('Login.html') >= 0) {
        app = angular.module('myApp', ['ngSanitize', 'ngMaterial', 'ngMessages'])
    } else {
        app = angular.module('myApp', ['ngSanitize'])
    }

    app.filter('encodeURIComponent', function () {
        return window.encodeURIComponent
    })

    app.filter('sanitizer', ['$sce', function ($sce) {
        return function (url) {
            return $sce.trustAsResourceUrl(url)
        }
    }])

    app.config(function($sceProvider) {
        $sceProvider.enabled(false);
    });

    app.service('AngularServices', ['$http', function ($http) {
        var API = {
            GET: function (EndPoint,headers) {

                return $http(
                    {
                        method: 'GET',
                        url: BaseAPIURI + EndPoint,
                        headers: headers
                    })
                    .then(function (response) {
                        return response
                    }).catch(function (response) {
                        return response
                    })
            },
            POST: function (EndPoint, body, headers) {
                var settings = {
                    method: 'POST',
                    url: BaseAPIURI + EndPoint,
                    data: body,
                    headers: headers
                }
                return $http(settings)
                    .then(function (response) {
                        return response
                    }).catch(function (response) {
                        return response
                    })
            },
            PUT: function (EndPoint, body, headers) {
                var settings = {
                    method: 'PUT',
                    url: BaseAPIURI + EndPoint,
                    data: body,
                    headers: headers
                }
                return $http(settings)
                    .then(function (response) {
                        return response
                    }).catch(function (response) {
                        return response
                    })
            }
        }

        API.RenewTokenOrLogout = function (cb) {
            var User = getCurrentUser()
            var data = {
                "email": User.Email,
                "password": User.Password
            }
            var headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }

            API.POST("auth", data, headers).
                then(function (response) {
                    switch (response.status) {
                        case 401:
                            SaveUser(null)
                            Redirect("Login.html")
                            break
                        case 200:
                            User.Token = response.data.result.token
                            User.ClientToken = response.data.result.clientToken
                            SaveUser(User)
                            cb()
                            break

                        default:
                            SaveUser(null)
                            Redirect("Login.html")
                            break
                    }
                })
        }

        API.config = config

        return API
    }])
}
