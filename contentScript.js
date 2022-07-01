/*
 ------------------------------------

    Utility JS methods
 ------------------------------------
*/

let createElem = function (elemType, attributes) {
    let elem = document.createElement(elemType);
    // set attributes
    for (let key in attributes) {
        elem.setAttribute(key, attributes[key]);
    }

    return elem;
}

// Create a root sf-metadata-inspector
$("body").append(`
    <div id="sf-metadata-inspector"></div>
`);

const $shadowHost = document.getElementById("sf-metadata-inspector");
const $shadow = $shadowHost.attachShadow({ mode: `open` });

// Load mat icons
const $matIcons = $("<link/>", {
    type: "text/css",
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/icon?family=Material+Icons"
});
// $shadow.appendChild($matIcons[0]);

// Load materialize CSS
/* const $matCSS = $("<link/>", {
    type : "text/css",
    rel : "stylesheet",
    href : `${chrome.runtime.getURL("styles/materialize/materialize.min.css")}`
});
$shadow.appendChild($matCSS[0]); */

// Add custom css
const $customCSS = $(`
    <style>
        div#sf-metadata-inspector-container {
            position: fixed;
            bottom: 10px;
            right: 10px;
        }

        .search-button {
            padding: 10px;
            border-radius: 5px;
            background: #1491b9;
            color: #ffffff;
            box-shadow: 2px 2px 2px rgb(0 0 0);
            cursor: pointer;
        }

        .search-area {
            width: 600px;
            position: fixed;
            top: 25%;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px;
            border-radius: 2px;
            background: rgb(243 246 249);
            z-index: 2147483647;
            display: none;
            box-shadow: 2px 2px 16px rgb(0 0 0 / 50%);
        }

        .search-area-input {
            padding: 8px;
            font-size: 28px;
            border: none;
            border-radius: 2px;
            outline: none;
            width: 100%;
        }

        .search-results {
            max-height: 300px;
            overflow: auto;
        }

        .search-result { 
            color: inherit;
            padding: 10px;
            background: rgb(211 211 211);
            font-size: 14px;
            display: block;
            outline: none;
            text-decoration: none;
        }

        .search-result:hover {
            /* background: rgb(127 255 212); */
            border-bottom: 1px solid rgb(21 151 192);
        }

        @font-face {
            font-family: 'Material Icons';
            font-style: normal;
            font-weight: 400;
            src: url(${chrome.runtime.getURL("fonts/material-icon-fonts.woff2")}) format('woff2');
        }
          
        .material-icons {
            font-family: 'Material Icons';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
        }

        .mdc-mi-max-width {
            width: 100%;
        }

        .mdc-list-item {
            height: 48px;
            align-items: center !important
        }

        .metadata-type-selector,
        .metadata-type-selector__menu {
            width: 100%;
        }

        .close-search {
            position: absolute;
            right: -20px;
            top: -20px;
            cursor: pointer;
        }

        .search-unauthorized {
            display: none;
            padding: 10px;
            background: rgb(243 246 249);
        }
    
        .search-unauthorized .error-msg {
            padding: 10px;
            font-size: 16px;
        }

        .search-unauthorized .authorize-btn {
            width: 100%;
            text-align: center;
        }

    </style>`
);
$shadow.appendChild($customCSS[0]);

// Load JQuery
/* const jQueryElem = createElem('script', {
    type: "text/javascript",
    href: `${chrome.runtime.getURL("scripts/jquery-3.6.0.min.js")}`
});
$shadow.appendChild(jQueryElem);

// Load materialize JS
const $matJS = $("<script/>", {
    type: "text/javascript",
    src: `${chrome.runtime.getURL("scripts/materialize/materialize.min.js")}`
});
$shadow.appendChild($matJS[0]); */

const mdcStyles = createElem('link', {
    href: chrome.runtime.getURL("styles/material-components-web.min.css"),
    rel: `stylesheet`
});

const mdcScripts = createElem('script', {
    type: "text/javascript",
    src: chrome.runtime.getURL("scripts/material-components-web.min.js")
});

$shadow.appendChild(mdcStyles);
$shadow.appendChild(mdcScripts);

/**
 * Adding a container div a floating button
 * that adds to the right bottom corner of the page
 */
let mainContainerDiv = createElem(`div`, {
    id: `sf-metadata-inspector-container`
});

/* let divSearchButton = createElem('div', {
    class : `search-button`,
    text : `Initiate Search`
});

let fbAnchor = createElem(`a`, {
    class : `btn-floating red`
});

divSearchButton.appendChild(fbAnchor);
mainContainerDiv.appendChild(divSearchButton); */

$shadow.appendChild(mainContainerDiv);

// Add a search area
const $searchArea = $(`
    <div class="search-area">
        <div class="search-metadata">
            <span class="material-icons md-24 close-search">highlight_off</span>
            <!-- <input class="search-area-input" type="search"> -->

            <!--  Metadata Type Selector -->
            <div class="mdc-select mdc-select--filled metadata-type-selector" data-mdc-auto-init="MDCSelect">
                <div class="mdc-select__anchor">
                    <span class="mdc-select__ripple"></span>
                    <span class="mdc-floating-label mdc-floating-label--float-above">Select a Metadata Type</span>
                    <span class="mdc-select__selected-text-container">
                    <span class="mdc-select__selected-text">Vegetables</span>
                    </span>
                    <span class="mdc-select__dropdown-icon">
                    <svg
                        class="mdc-select__dropdown-icon-graphic"
                        viewBox="7 10 10 5" focusable="false">
                        <polygon
                            class="mdc-select__dropdown-icon-inactive"
                            stroke="none"
                            fill-rule="evenodd"
                            points="7 10 12 15 17 10">
                        </polygon>
                        <polygon
                            class="mdc-select__dropdown-icon-active"
                            stroke="none"
                            fill-rule="evenodd"
                            points="7 15 12 10 17 15">
                        </polygon>
                    </svg>
                    </span>
                    <span class="mdc-line-ripple"></span>
                </div>

                <div class="mdc-select__menu mdc-menu mdc-menu-surface metadata-type-selector__menu" data-mdc-auto-init="MDCMenu">
                    <ul class="mdc-list" data-mdc-auto-init="MDCList">
                        <li class="mdc-list-item" data-value="ApexClass" data-mdc-auto-init="MDCRipple">
                            <span class="mdc-list-item__ripple"></span>
                            <span class="mdc-list-item__text">Apex Class</span>
                        </li>
                        <li class="mdc-list-item" data-value="ApexTrigger" data-mdc-auto-init="MDCRipple">
                            <span class="mdc-list-item__ripple"></span>
                            <span class="mdc-list-item__text">Apex Trigger</span>
                        </li>
                        <li class="mdc-list-item mdc-list-item" data-value="ApexComponent" data-mdc-auto-init="MDCRipple">
                            <span class="mdc-list-item__ripple"></span>
                            <span class="mdc-list-item__text">Apex Component</span>
                        </li>
                        <li class="mdc-list-item" data-value="ApexPage" data-mdc-auto-init="MDCRipple">
                            <span class="mdc-list-item__ripple"></span>
                            <span class="mdc-list-item__text">Apex Page</span>
                        </li>
                        <li class="mdc-list-item" data-value="ExternalString" data-mdc-auto-init="MDCRipple">
                            <span class="mdc-list-item__ripple"></span>
                            <span class="mdc-list-item__text">Custom Label</span>
                        </li>
                    </ul>
                </div>
            </div>


            <label class="mdc-text-field mdc-text-field--filled mdc-text-field--with-trailing-icon mdc-mi-max-width search-input" data-mdc-auto-init="MDCTextField">
                <span class="mdc-text-field__ripple"></span>
                <span class="mdc-floating-label" id="my-label-id">Search Metadata</span>
                <input class="mdc-text-field__input search-input__element" type="text" aria-labelledby="my-label-id">
                <i class="material-icons mdc-text-field__icon mdc-text-field__icon--trailing search-input-clear" tabindex="0" role="button">delete</i>
                <span class="mdc-line-ripple"></span>
            </label>

            <div class="search-results"></div>
        </div>

        <div class="search-unauthorized">
            <div class="error-msg">You are not logged in. Please authorize.</div>
            <div class="authorize-btn">
                <button class="mdc-button authorize" data-mdc-auto-init="MDCRipple">
                    <span class="mdc-button__ripple"></span>
                    <span class="mdc-button__label">Authorize</span>
                </button>
            </div>
        </div>
    </div>
`);

$shadow.appendChild($searchArea[0]);

const $pageScript = document.createElement("script");
$pageScript.setAttribute('src', `${chrome.runtime.getURL('scripts/page-script.js')}`);
$pageScript.setAttribute('type', 'text/javascript');

$shadow.appendChild($pageScript);

// Add events to the input box
/* const $searchInput = $shadow.querySelector(".search-area-input");

$searchInput.addEventListener('keyup', (event) => {
    console.log(event.target.value);
    fetchApexClasses(event.target.value);
});

$searchInput.addEventListener('search', (event) => {
    $searchResults = $shadow.querySelector('.search-results');
    $searchResults.innerHTML = '';
}); */

/*
 ------------------------------------
    -----------------------
    MDC
    -----------------------

    Adding MDC Styles
 ------------------------------------
*/

/* mdc.ripple.MDCRipple.attachTo(
    $shadow.querySelector(`.mdc-button`)
);

mdc.textField.MDCTextField.attachTo(
    $shadow.querySelector(`.mdc-text-field`)
); */

window.mdc.autoInit($shadow);


// Capture change event on the Select

const $metadataSelector = $shadow.querySelector(".metadata-type-selector");
const $mdc__metadataSelector = $metadataSelector.MDCSelect;

$metadataSelector.addEventListener('MDCSelect:change', (event) => {
    console.log(`You have selected: ${$mdc__metadataSelector.value}`);
});

// Capture events from the new search input
const $newSearchInput = $shadow.querySelector(".search-input");

$newSearchInput.addEventListener('keyup', (event) => {
    console.log(event.target.value);
    fetchApexClasses(event.target.value, $mdc__metadataSelector.value);
});

const $newSearchInputClear = $shadow.querySelector(".search-input-clear");

$newSearchInputClear.addEventListener('click', (event) => {
    $shadow.querySelector(".search-input__element").value = "";
    // clear search results
    $searchResults = $shadow.querySelector('.search-results');
    $searchResults.innerHTML = '';
});

// close Search
const $closeSearch = $shadow.querySelector(".close-search");
$closeSearch.addEventListener('click', () => {
    $shadow.querySelector(".search-area").style.display = 'none';
});

// Authorize
$authorize =$shadow.querySelector(".search-unauthorized .authorize");
$authorize.addEventListener('click', () => {
    doAuthorize();
})

/*
 ------------------------------------

    Making callouts to SF to fetch
    Apex Classes
 ------------------------------------
*/

const TOOLING_APEX_CLASS_URL = `/services/data/v51.0/tooling/query?q=select+id,+name+from+ApexClass+where+name+Like+'Account%'`;
let abortController;

let fetchApexClasses = function (inputTerm, toolingAPIObject) {

    chrome.storage.local.get(["sf_session_info"], function (value) {
        sessionData = value.sf_session_info;

        if (inputTerm) {
            // Cancel the previous call
            // even if it is completed, fetch just ignores it
            if (abortController) abortController.abort();
            abortController = new AbortController();

            // Make a callout to Salesforce
            let headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionData.access_token}`
            });
            let url = `${sessionData.instance_url}/services/data/v51.0/tooling/query?q=select+id,+name,+NamespacePrefix+from+${toolingAPIObject}+where+name+Like+'%25${inputTerm}%25'+AND+NamespacePrefix+=+null`;
            let requestData = {
                method: 'GET',
                headers: headers
            };
            let request = new Request(url, requestData);

            fetch(request, { signal: abortController.signal })
                .then(response => {
                    if (response.ok) {
                        response.json().then(body => {
                            console.log(body);
                            buildResults(sessionData.instance_url, body.records);
                        })
                    } else {
                        console.error(response.body);
                    }
                })
                .catch(error => console.error(error));
        } else {
            $searchResults = $shadow.querySelector('.search-results');
            $searchResults.innerHTML = '';
        }
    });

}

let buildResults = function (serverURL, results) {
    $searchResults = $shadow.querySelector('.search-results');
    $searchResults.innerHTML = '';
    // Add results to the Div
    results.forEach(result => {
        $result = document.createElement("a");
        $result.href = `${serverURL}/${result.Id}`;
        $result.name = result.Name;
        $result.target = `_blank`;
        $result.text = result.Name;
        $result.className = `search-result`;
        $result.autofocus = true;
        $result.placeholder = "Search for Metadata"

        $searchResults.appendChild($result);
    });
}

/*
 ------------------------------------

    Listen to Messages from
    Background.js
 ------------------------------------
*/
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.showSearch) {
        const $searchAreaDiv = $shadow.querySelector(".search-area");
        $searchAreaDiv.style.display = 'block';

        if (message.isSessionValid) {
            const $searchAreaDiv = $shadow.querySelector(".search-area");
            $searchAreaDiv.style.display = 'block';
        } else {
            const $searchMetadata = $shadow.querySelector(".search-metadata");
            $searchMetadata.style.display = 'none';

            const $searchUnauthorized = $shadow.querySelector(".search-unauthorized");
            $searchUnauthorized.style.display = 'block';
        }
    }

    return true;
});

/*
 ------------------------------------

    Authorize to Salesforce through
    Background.js
 ------------------------------------
*/
function doAuthorize() {
    chrome.runtime.sendMessage({ doAuthorize: false, openPopup: true }, function (url) {
        console.log(url);

        chrome.storage.local.get(["sf_session_info"], function (value) {
            console.log(`content-script.js: session info - `);
            console.log(value);
        })
    });
}
