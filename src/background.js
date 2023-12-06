import {ChatGptAPI} from './common/chatGptApi.js';
import {MAX_SEARCH_TERMS, OPEN_AI_KEY, OPEN_AI_ORG} from "./common/constants.js";
import {CampusWireApi} from './common/campusWireApi.js';
import {ContextManager} from "./common/contextManager.js";
import {CampuswireContext} from "./common/CampuswireContext.js";

const TITLE_REGEX = /([^#]*)#(\d+)(.*)/gim; // $1 is the title, $2 is the post id, $3 is the category
const GROUP_ID_REGEX = /^.*\/group\/([^\/]+)\/.*/gi;
const POST_NUMBER_REGEX = /^.+\/feed\/(\d+)\/?.*/gi;

const contextManager = new ContextManager(CampuswireContext);

async function searchCampuswire(bearerToken, searchTerms, groupId) {
    console.log(`Has token: ${!!bearerToken} Search: ${searchTerms} GroupId: ${groupId}`)
    if (!searchTerms || !groupId || !bearerToken) {
        return [];
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
    sendMessage({type: 'POST_CHANGE_START', url}).catch(err => console.error(err));
    const title = fullTitle.replace(TITLE_REGEX, "$1");
    const postNumber = url.replace(POST_NUMBER_REGEX, "$1");
    console.log(`onPostChange:`, m, ctx);

    ctx.setValues({url, token, postNumber});

    let {searchTerms, error = null} = await getChatGptSearchTerms(body, title);
    ctx.error = error;
    if (!searchTerms) { // use the title if we cannot use ChatGPT (error OR there was no key)
        searchTerms = title;
        ctx.usedChatGpt = false;
    } else {
        ctx.usedChatGpt = true;
    }

    if (searchTerms) {
        ctx.searchTerms = searchTerms;
        ctx.pages = (await searchCampuswire(ctx.token, ctx.searchTerms, ctx.groupId)) || [];
        if (!Array.isArray(ctx.pages)) {
            console.log("ERROR: Pages is NOT an array");
            ctx.pages = [pages];
        }
        ctx.pages = ctx.pages.filter(p => p.postNumber != postNumber);
        console.log('Set Context -->', ctx)
        await contextManager.setCurrentContext(ctx);
        await sendMessage({
            type: 'RELATED_PAGES',
            pages: ctx.pages,
            url: ctx.url,
            error: ctx.error,
            usedChatGpt: ctx.usedChatGpt
        });
    } else {
        console.log('There were no search terms.')
        ctx.searchTerms = null;
        ctx.pages = [];
    }
    sendMessage({type: 'POST_CHANGE_END', url}).catch(err => console.error(err));
}

async function onRelatedPagesRequest(ctx, msg) {
    console.log(`onRelatedPagesRequest:`, msg, ctx);
    await sendMessage({
        type: 'RELATED_PAGES',
        pages: ctx.pages,
        url: ctx.url,
        error: ctx.error,
        usedChatGpt: ctx.usedChatGpt
    });
}

async function handleMessage(msg) {
    console.log('Background.js received message:', msg)
    if (!msg) return;
    const ctx = await contextManager.getCurrentContext();

    const {type} = msg;
    switch (type) {
        case 'POST_LOADED':
            await onPostChange(ctx, msg)
            break;
        case 'RELATED_PAGES_REQUEST':
            await onRelatedPagesRequest(ctx, msg)
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
chrome.webRequest.onBeforeRequest.addListener(async ({url, tabId}) => {
    const ctx = await contextManager.getContext(tabId);
    const newGroupId = extractGroupIdFromUrl(url);
    if (newGroupId !== null && newGroupId !== ctx.groupId) {
        sendMessage({type: 'GROUP_CHANGED', oldGroupId: ctx.groupId, newGroupId});
        ctx.groupId = newGroupId;
        await contextManager.setCurrentContext(ctx);
    }
}, {
    urls: ['https://*.campuswire.com/*'],
    // types: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'other'],
});

chrome.runtime.onInstalled.addListener(async (details) => {
    installContentScripts()
})

function parseMatchPattern(input) {
    if (typeof input !== 'string') return null;
    var match_pattern = '(?:^'
        , regEscape = function (s) {
        return s.replace(/[[^$.|?*+(){}\\]/g, '\\$&');
    }
        , result = /^(\*|https?|file|ftp|chrome-extension):\/\//.exec(input);

    // Parse scheme
    if (!result) return null;
    input = input.substr(result[0].length);
    match_pattern += result[1] === '*' ? 'https?://' : result[1] + '://';

    // Parse host if scheme is not `file`
    if (result[1] !== 'file') {
        if (!(result = /^(?:\*|(\*\.)?([^\/*]+))(?=\/)/.exec(input))) return null;
        input = input.substr(result[0].length);
        if (result[0] === '*') {    // host is '*'
            match_pattern += '[^/]+';
        } else {
            if (result[1]) {         // Subdomain wildcard exists
                match_pattern += '(?:[^/]+\\.)?';
            }
            // Append host (escape special regex characters)
            match_pattern += regEscape(result[2]);
        }
    }
    // Add remainder (path)
    match_pattern += input.split('*').map(regEscape).join('.*');
    match_pattern += '$)';
    return match_pattern;
}

async function installContentScripts() {
    console.log('Instalilng scripts');

    let contentScripts = chrome.runtime.getManifest().content_scripts;
    // Exclude CSS files - CSS is automatically inserted.
    contentScripts = contentScripts.filter(function (content_script) {
        return content_script.js && content_script.js.length > 0;
    });

    await Promise.all(contentScripts.map(async function (contentScript) {
        try {
            // NOTE: an array of patterns is only supported in Chrome 39+
            chrome.tabs.query({
                url: contentScript.matches
            }, injectScripts);
        } catch (e) {
            // NOTE: This requires the "tabs" permission!
            chrome.tabs.query({}, async function (tabs) {
                const parsed = contentScript.matches.map(parseMatchPattern);
                const pattern = new RegExp(parsed.join('|'));
                tabs = tabs.filter(function (tab) {
                    return pattern.test(tab.url);
                });
                await injectScripts(tabs);
            });
        }

        async function injectScripts(tabs) {
            tabs.forEach(function (tab) {
                // content_script.js.forEach(function (js) {
                chrome.scripting.executeScript({target: {tabId: tab.id}, files: contentScript.js});
                // });
            });
        }
    }))
}

chrome.tabs.onActivated.addListener(async ({tabId}) => {
    const ctx = contextManager.getContext(tabId).json;
    await sendMessage({type: 'RELATED_PAGES', ...ctx});
})
chrome.runtime.onMessage.addListener(handleMessage);

console.log('Background listener loaded')


