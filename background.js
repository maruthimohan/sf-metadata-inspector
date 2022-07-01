try {
    importScripts('scripts/constants.js');
} catch (error) {
    console.error(error);
}

chrome.commands.onCommand.addListener((command) => {
    console.log(`command send: ${command}`);

    if (command === 'search_metadata') {
        // chrome.runtime.sendMessage({ showSearch: true }, () => { });

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let [currentTab] = tabs;
            let currentURL = new URL(currentTab.url).origin;
            
            chrome.storage.local.get(["sf_session_info"], response => {
                    if (response && response.sf_session_info) {
                        const isServerURLMatch = response.sf_session_info.instance_url === currentURL;
                        if (isServerURLMatch) {
                            validateSessionID(response.sf_session_info.access_token, response.sf_session_info.instance_url)
                                .then(isValidSession => {
                                    console.log(`Is the session valid: ${isValidSession}`);
                                    chrome.tabs.sendMessage(tabs[0].id, { showSearch: true, url: currentURL, isSessionValid: isValidSession }, function (response) {
                                        console.log(response.farewell);
                                    });
                                })
                                .catch(error => console.error(`Something went wrong while validating session`));
                        } else {
                            chrome.tabs.sendMessage(tabs[0].id, { showSearch: true, url: currentURL, isSessionValid: false }, function (response) {
                                console.log(response.farewell);
                            });
                        }
                    } else {
                        chrome.tabs.sendMessage(tabs[0].id, { showSearch: true, url: currentURL, isSessionValid: false}, function (response) {
                            console.log(response.farewell);
                        });
                    }
                });
        });
    }
});

/* chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: contentScriptFunc,
        args: ['action'],
    });
});

function contentScriptFunc(name) {
    alert(`"${name}" executed`);
} */

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.doAuthorize) {
        let redirectUri = chrome.identity.getRedirectURL();
        let url = `https://test.salesforce.com/services/oauth2/authorize?response_type=token&client_id=${$CONST.CLIENT_ID}&redirect_uri=${redirectUri}&prompt=login`;
        console.log(`URL: ${url}`);
        chrome.identity.launchWebAuthFlow(
            { 'url': url, 'interactive': true },
            function (redirect_url) {
                console.log('Redirect URL');
                console.log(redirect_url);

                const access_token = redirect_url.match(/access_token=[^&]+/)[0].split('=')[1];
                console.log(`access_token: ${access_token}`);
                // chrome.cookies.set({
                //     name: `session_info`,
                //     value: JSON.stringify(getSessionInfoObject(redirect_url)),
                //     secure: true,
                //     sameSite: `strict`,
                //     url: `https://test.salesforce.com`
                // }, function (cookie) {
                //     console.log(cookie);
                // });

                chrome.storage.local.set({ "sf_session_info": getSessionInfoObject(redirect_url) }, function (data) {
                    console.log(`Sessions stored`);
                    console.log(data);
                });

                sendResponse(`Logged in successfully! ${redirect_url}`);
            });
    }

    if (message.openPopup) {
        chrome.tabs.create({url:"views/main-popup.html"});
    }

    return true;
});

function getSessionInfoObject(redirect_url) {
    let session_info = {};
    let pairs = redirect_url.split("#")[1].split("&");

    pairs.forEach(pair => {
        let keyValues = pair.split("=");
        session_info[keyValues[0]] = decodeURIComponent(keyValues[1]);
    });

    return session_info;
}

function validateSessionID(authToken, serverURL) {

    // Make a callout to Salesforce
    let headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    });
    let url = `${serverURL}/services/oauth2/userinfo`;
    let requestData = {
        method: 'GET',
        headers: headers
    };

    let request = new Request(url, requestData);
    return fetch(request)
        .then(response => {
            console.log(`Is validate Session ID response successful: ${response.ok}`);
            if (response.ok) {
                return response.json();
            } else {
                return false;
            }
        })
        .catch(error => console.error(error));
}