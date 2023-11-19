import {ChatGptAPI} from './common/chatGptApi.js';
import {MAX_SEARCH_TERMS, OPEN_AI_KEY, OPEN_AI_ORG} from "./common/constants.js";
import {CampusWireApi} from './common/campusWireApi.js';
import {ContextManager} from "./common/contextManager.js";
import {CampuswireContext} from "./common/CampuswireContext.js";

const TITLE_REGEX = /([^#]*)#(\d+)(.*)/gim; // $1 is the title, $2 is the post id, $3 is the category
const GROUP_ID_REGEX = /^.*\/group\/([^\/]+)\/.*/gi;


const contextManager = new ContextManager(CampuswireContext);

async function searchCampuswire(bearerToken, searchTerms, groupId) {
    console.log(`Has token: ${!!bearerToken} Search: ${searchTerms} GroupId: ${groupId}`)
    if (!searchTerms || !groupId || !bearerToken) {
        return;
    }
    searchTerms = searchTerms.split(' ').slice(0, MAX_SEARCH_TERMS).join('&');
    const campuswire = new CampusWireApi(bearerToken);
    try {
        return (await campuswire.search(searchTerms, groupId)) || [];
    } catch (err) {
        console.log(err);
    }
}

function extractGroupIdFromUrl(url) {
    const result = GROUP_ID_REGEX.exec(url);
    return result ? result[1] : null;
}

async function getChatGptSearchTerms(body, title) {
    // Get ChatGPT Search Terms
    const {[OPEN_AI_KEY]: key, [OPEN_AI_ORG]: org = null} = await chrome.storage.sync.get(null);
    let searchTerms = null;
    let error = null;
    if (key) {
        const chatGpt = new ChatGptAPI(key, org);
        try {
            searchTerms = await chatGpt.getSearchTermsForDocument(body, title);
        } catch (err) {
            error = err.message;
            searchTerms = null;
        }
    }
    return {searchTerms, error};
}


async function onPostChange(ctx, m) {
    const {type, body, title: fullTitle, url, token} = m;
    sendMessage({type: 'POST_CHANGE_START', url }).catch(err => console.error(err));
    const title = fullTitle.replace(TITLE_REGEX, "$1");
    console.log(`onPostChange:`, m, ctx);

    ctx.setValues({url, token});

    let {searchTerms, error = null} = await getChatGptSearchTerms(body, title);
    ctx.error = error;
    if (!searchTerms) { // use the title if we cannot use ChatGPT (error OR there was no key)
        searchTerms = title;
    }

    if (searchTerms) {
        ctx.searchTerms = searchTerms;
        ctx.pages  = (await searchCampuswire(ctx.token, ctx.searchTerms, ctx.groupId)) || [];
        if (!Array.isArray(ctx.pages)) {
            console.log("ERROR: Pages is NOT an array");
            ctx.pages  = [pages];
        }
        contextManager.setCurrentContext(ctx);
        await sendMessage({type: 'RELATED_PAGES', pages: ctx.pages, url: ctx.url, error: ctx.error});
    } else {
        console.log('There were no search terms.')
    }
    sendMessage({type: 'POST_CHANGE_END', url}).catch(err => console.error(err));
}

async function onRelatedPagesRequest(ctx, msg) {
    console.log(`onRelatedPagesRequest:`, msg, ctx);
    await sendMessage({type: 'RELATED_PAGES', pages: ctx.pages, url: ctx.url });
}

async function handleMessage(msg) {
    if (!msg) return;
    const ctx = await contextManager.getCurrentContext();

    const {type} = msg;
    switch (type) {
        case 'POST_LOADED':
            await onPostChange(ctx, msg)
            break;
        case 'RELATED_PAGES_REQUEST':
            await onRelatedPagesRequest(ctx,msg)
            break;
        default:
            console.warn('Unhandled message:', msg);
    }
}


async function sendMessage(msg) {
    try {
        console.log('BACKGROUND - Sending', msg)
        await chrome.runtime.sendMessage(msg);
    } catch (err) {
        console.log(err);
        chrome.runtime.onMessage.addListener(handleMessage);
    }
}



chrome.runtime.onStartup.addListener(e => console.log('background: On Startup'));
chrome.runtime.onSuspend.addListener(e => console.log('background: On Suspend'));
chrome.webRequest.onBeforeRequest.addListener(async ({ url }) => {
    const ctx = await contextManager.getCurrentContext();
    const newGroupId = extractGroupIdFromUrl(url);
    if (newGroupId !== null && newGroupId !== ctx.groupId) {
        sendMessage({ type: 'GROUP_CHANGED', oldGroupId: ctx.groupId, newGroupId });
        ctx.groupId = newGroupId;
        await contextManager.setCurrentContext(ctx);
    }
}, {
    urls: ['https://*.campuswire.com/*'],
    // types: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'other'],
});
// chrome.webRequest.onCompleted.addListener((...args) => {
//     console.log("webRequest.onComplete", args)
//     sendMessage({type: 'PAGE_INFO_REQUEST'})
// }, {
//     urls: ['https://*.campuswire.com/*'],
//     // types: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'other'],
// });

// this gets hit whenever the extension is updated
chrome.runtime.onInstalled.addListener(async (details) => {
    for (const cs of chrome.runtime.getManifest().content_scripts) {
        for (const tab of await chrome.tabs.query({url: cs.matches})) {
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                files: cs.js,
            });
        }
    }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const {pages, url, error} = contextManager.getContext(tabId).json;
    await sendMessage({type: 'RELATED_PAGES', pages, url, error, tabId});
})
chrome.runtime.onMessage.addListener(handleMessage);

console.log('Background listener loaded')


