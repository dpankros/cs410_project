// This is a content script that is injected onto the campuswire.com site.   It does not load for any other url

const RETRY_INTERVAL_MS = 100; // this is the polling interval
const POST_TITLE_CCS_CLASS = 'post-title-wrap'; // this is the title of the current post
const POST_BODY_CSS_CLASS = 'post-body'; // this is the body of the current post
let oldUrl = window.location.pathname;

function sendMessage(message) {
    console.log('Sending post', message);
    try {
        chrome.runtime.sendMessage(message);
    }catch(err) {
        console.warn(err);
    }
}

function onLoadPost() {
    console.log('onLoadPost')
    const body = this.document.getElementsByClassName(POST_BODY_CSS_CLASS);
    const title = this.document.getElementsByClassName(POST_TITLE_CCS_CLASS);
    sendMessage({type: 'POST_LOADED', url: document.URL, title: title[0].textContent, body: body[0].textContent});
}

document.body.addEventListener("click", function() {
    var newUrl = window.location.pathname;
    if (newUrl !== oldUrl && newUrl.includes("feed/")) {
        onLoadPost();
    }
    oldUrl = newUrl;
});
