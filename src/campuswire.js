// This is a content script that is injected onto the campuswire.com site.   It does not load for any other url

const RETRY_INTERVAL_MS = 100; // this is the polling interval
const MAX_RETRIES = 30 * 1000 / RETRY_INTERVAL_MS; // retry over 30s period
const POST_TITLE_CCS_CLASS = 'post-title-wrap'; // this is the title of the current post
const POST_BODY_CSS_CLASS = 'post-body'; // this is the body of the current post
let oldUrl = window.location.pathname;

async function sendMessage(message) {
    console.log('Sending post', message);
    try {
        await chrome.runtime.sendMessage(message);
    } catch (err) {
        console.log(err);
    }
}

async function onLoadPost() {
    console.log('onLoadPost')
    const body = this.document.getElementsByClassName(POST_BODY_CSS_CLASS);
    const title = this.document.getElementsByClassName(POST_TITLE_CCS_CLASS);
    let token = (await localStorage.getItem('token')) || null;
    await sendMessage({
        type: 'POST_LOADED',
        url: document.URL,
        title: title[0].textContent,
        body: body[0].textContent,
        token: token ? token.replaceAll('"', '') : null,
    });
}

document.body.addEventListener("click", function() {
    var newUrl = window.location.pathname;
    if (newUrl !== oldUrl && newUrl.includes("feed/")) {
        onLoadPost();
    }
    oldUrl = newUrl;
});

async function onMessage(msg) {
    if (!msg) return;
    const { type } = msg;
    switch ( type ) {
        case 'PAGE_INFO_REQUEST':
            await onLoadPost();
            break;
        default:
            console.log('Ignoring unhandled message', msg);
    }
}

chrome.runtime.onMessage.addListener(onMessage);

(async () => {
    //
    // We have to wait for the post to load async.  The easiest waay to do this is polling for it.
    //
    let retryCount = 0;
    let recheckTimer = setInterval(() => {
        console.log('Checking for loaded post')
        const body = this.document.getElementsByClassName(POST_BODY_CSS_CLASS);
        if (body && body.length > 0) {
            clearInterval(recheckTimer);
            onLoadPost();
        }
        retryCount += 1;
        if (retryCount > MAX_RETRIES) {
            // terminate after MAX_RETRIES, if it hasn't already
            clearInterval(recheckTimer);
        }
    }, RETRY_INTERVAL_MS);
    console.log('Loaded Campuswire.js')
})();
