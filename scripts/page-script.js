window.$Utils = window.$Utils || (function(){
    "use strict";

    const TOOLING_APEX_CLASS_URL = `/services/data/v51.0/tooling/sobjects/ApexClass/`;

    return {
        getApexClasses: function() {
            chrome.storage.local.get(["sf_session_info"], function (value) {
                console.log(`initializePopup: ${value}`);
                sessionData = sessionData.sf_session_info;

            });
        },
    }
})();