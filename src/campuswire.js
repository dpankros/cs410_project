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
        console.log(err);
    }
}

function onLoadPost() {
    console.log('onLoadPost')
    const body = this.document.getElementsByClassName(POST_BODY_CSS_CLASS)[0].textContent;
    const titleRaw = this.document.getElementsByClassName(POST_TITLE_CCS_CLASS);
    const titleSplit = titleRaw[0].textContent.split("#");
    const title = titleSplit[0];
    const categorySplit = titleSplit[1];
    let substringIndex = 0;
    for (var index in categorySplit) {
        if (isNaN(parseInt(categorySplit.charAt(index)))) {
            break;
        } 
        substringIndex++;
    }
    const category = titleSplit[1].substring(substringIndex);
    sendMessage({type: 'POST_LOADED', url: document.URL, title: title, category: category, body: body});
}

document.body.addEventListener("click", function() {
    var newUrl = window.location.pathname;
    if (newUrl !== oldUrl && newUrl.includes("feed/")) {
        onLoadPost();
    }
    oldUrl = newUrl;
});

(async () => {
    //
    // We have to wait for the post to load async.  The easiest waay to do this is polling for it.
    //
    let recheckTimer = setInterval(() => {
        const body = this.document.getElementsByClassName(POST_BODY_CSS_CLASS);
        if (body && body.length > 0) {
            clearInterval(recheckTimer);
            onLoadPost();
        }
    }, RETRY_INTERVAL_MS);
})();
