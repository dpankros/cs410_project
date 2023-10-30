// This is a content script that is injected onto the campuswire.com site.   It does not load for any other url

const RETRY_INTERVAL_MS = 100; // this is the polling interval
const POST_CSS_CLASS = 'post-body'; // this is the root of a post


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
    const body = this.document.getElementsByClassName(POST_CSS_CLASS);
    sendMessage({type: 'POST_LOADED', url: document.URL, body: body[0].textContent});
}
document.addEventListener("load", () => {
    console.log('FOO');
    onLoadPost();
});
// window.addEventListener("load", () => console.log('Window load'))

(async () => {
    //
    // We have to wait for the post to load async.  The easiest waay to do this is polling for it.
    //
    let recheckTimer = setInterval(() => {
        const body = this.document.getElementsByClassName(POST_CSS_CLASS);
        if (body && body.length > 0) {
            clearInterval(recheckTimer);
            console.log('Campuswire Post Loaded');
            onLoadPost()
            // sendMessage({type: 'POST_LOADED', url: document.URL, body: body[0].textContent});
        }
    }, RETRY_INTERVAL_MS);

    chrome.runtime.onMessage.addListener(msg => {
        const { type } = msg;
        console.log('MSG Received', msg);
        if (type !== 'PAGE_INFO_REQUEST') return;
        onLoadPost()
    });
})();
