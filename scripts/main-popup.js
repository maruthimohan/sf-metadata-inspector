const $authorize = document.getElementById("authorize");
const $login = document.getElementById("login");
const $forget = document.getElementById("forget");
const $username = document.getElementById("username");
const $salesforce_url = document.getElementById("salesforce_url");
const $loggedInPanel = document.getElementById("logged-in-panel");
const $authorizePanel = document.getElementById("authorize-panel");
const $authorize_msg = document.getElementById("authorize_msg");

initializePopup();

$authorize.addEventListener('click', () => {
    console.log(`login button has been clicked!`);
    authenticateToSF();
});

$login.addEventListener('click', () => {
    loginToSF();
})

$forget.addEventListener('click', () => {
    forgetLoginInfo();
})

function authenticateToSF() {
    chrome.runtime.sendMessage({ doAuthorize: true }, function (url) {
        console.log(url);

        chrome.storage.local.get(["sf_session_info"], function (value) {
            console.log(`main-popup.js: session info - `);
            console.log(value);
            initializePopup();
        })
    });
}

function initializePopup() {
    let sessionData;
    $login.style.display = 'none';
    $authorize.style.display = 'none';

    chrome.storage.local.get(["sf_session_info"], function (value) {
        sessionData = value;

        if (sessionData.sf_session_info) {
            // Make a callout to Salesforce
            let headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionData.sf_session_info.access_token}`
            });
            let url = `${sessionData.sf_session_info.instance_url}/services/oauth2/userinfo`;
            let requestData = {
                method: 'GET',
                headers: headers
            };
            let request = new Request(url, requestData);

            fetch(request)
                .then(response => {
                    if (response.ok) {
                        response.json().then(body => {
                            $loggedInPanel.style.display = 'block';
                            $login.style.display = 'block';
                            $forget.style.display = 'block';
                            $username.innerText = `Hi ${body.name}!`;
                            $salesforce_url.innerText = `${sessionData.sf_session_info.instance_url}`;
                        })
                    } else {
                        $authorizePanel.style.display = 'block';
                        $authorize.style.display = 'block';
                        $authorize_msg.innerText = 'Oops! seems like you have been logged out. Please authorize!';
                    }
                })
                .catch(error => console.error(error));
        } else {
            chrome.identity.clearAllCachedAuthTokens(() => {
                $authorize_msg.innerText = 'Oops! seems like you have been logged out. Please authorize!';
                $authorize.style.display = 'block';
                $authorizePanel.style.display = 'block';
            });
        }
    });
}

function initializePopupUI(isLoggedIn, username, instanceURL) {
    $login.style.display = 'none';
    $authorize.style.display = 'none';

    if (isLoggedIn) {
        $loggedInPanel.style.display = 'block';
        $login.style.display = 'block';
        $forget.style.display = 'block';
        $username.innerText = `Hi ${username}!`;
        $salesforce_url.innerText = `${instanceURL}`;
    } else {
        $authorizePanel.style.display = 'block';
        $authorize.style.display = 'block';
        $authorize_msg.innerText = 'Oops! seems like you have been logged out. Please authorize!';
    }
}

function loginToSF() {
    chrome.storage.local.get(["sf_session_info"], function (value) {
        let sessionData = value.sf_session_info;
        let loginUrl = `${sessionData.instance_url}/secur/frontdoor.jsp?sid=${sessionData.access_token}`;
        chrome.tabs.create({
            url: loginUrl
        });
    });
}

function forgetLoginInfo() {
    /* chrome.storage.local.remove(["sf_session_info"], function (value) {
        console.log(`sf_session_info has been removed successfully!`);
    }); */

    chrome.storage.local.get(["sf_session_info"], function (value) {
        let sessionData = value.sf_session_info;
        const revoke_token_url = `https://test.salesforce.com/services/oauth2/revoke?token=${sessionData.access_token}`;
        
        let request = new Request(
            revoke_token_url,
            {
                method: 'GET'
            }
        );

        fetch(request)
            .then(response => {
                if (response.ok) {
                    chrome.storage.local.remove(["sf_session_info"], function (value) {
                        console.log(`sf_session_info has been removed successfully!`);
                    });
                }
            })
            .catch(error => {
                console.error(error);
            });
    });
}