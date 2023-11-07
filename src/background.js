import { ChatGptAPI } from './common/chatGptApi.js';
import {OPEN_AI_KEY, OPEN_AI_ORG} from "./common/constants.js";

const TITLE_REGEX = /([^#]*)#(\d+)(.*)/gim; // $1 is the title, $2 is the post id, $3 is the category
import { search } from './common/search.js';
(async () => {

    chrome.runtime.onStartup.addListener(e => console.log('background: On Startup'));
    chrome.runtime.onSuspend.addListener(e => console.log('background: On Suspend'));
    chrome.webRequest.onCompleted.addListener((...args) => {console.log('background: On Completed', args)}, { urls: ['https://campuswire.com/*']});

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

    try {
        let pages = [];
        let url = null;

        async function sendMessage(msg) {
            try {
                console.log('BACKGROUND - Sending', msg)
                await chrome.runtime.sendMessage(msg);
            } catch (err) {
                console.log(err);
                chrome.runtime.onMessage.addListener(handleMessage);
            }
        }
        async function fetchSearch() {
            console.log("I am fetching");
                const searchInstance = new search();
                try {
                    searchTerms = await searchInstance.getSearchTerms('hello');
                } catch (err) {
                    console.log(err);
                }
        }
        async function onPostChange(m) {
            const {type, body, title: fullTitle, url: _url} = m;
            sendMessage({type: 'POST_CHANGE_START', url }).catch(err => console.error(err));
            const title = fullTitle.replace(TITLE_REGEX, "$1");

            console.log(`onPostChange:`, m);
            fetchSearch();
            pages = Array.isArray(body) ? body : [body, body, body];
            url = _url;

            // Get ChatGPT Search Terms
            const { [OPEN_AI_KEY]: key, [OPEN_AI_ORG]: org = null } = await chrome.storage.sync.get(null);
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
            if (!searchTerms) { // use the title if we cannot use ChatGPT (error OR there was no key)
                searchTerms = title;
            }

            // TODO: Do some processing on the message

            if (searchTerms) {
                pages = searchTerms.split(' ');
            }
            // send the message to the sidebar
            await sendMessage({type: 'RELATED_PAGES', pages, url, error });
            sendMessage({type: 'POST_CHANGE_END', url }).catch(err => console.error(err));;
        }

        async function onRelatedPagesRequest(msg) {
            console.log(`onRelatedPagesRequest:`, msg);
            console.log('sending related pages', pages)
            await sendMessage({type: 'RELATED_PAGES', pages, url});
        }


        async function handleMessage(msg) {
            console.log('Got message', msg);
            if (!msg) return;

            const {type} = msg;
            switch (type) {
                case 'POST_LOADED':
                    await onPostChange(msg)
                    break;
                case 'RELATED_PAGES_REQUEST':
                    await onRelatedPagesRequest(msg)
                    break;
                default:
                    console.warn('Unhandled message:', msg);
            }
        }

        // eslint-disable-next-line no-undef
        chrome.runtime.onMessage.addListener(handleMessage);
        chrome.webRequest.onCompleted.addListener((...args) => {
            console.log("webRequest.onComplete", args)
            sendMessage({ type: 'PAGE_INFO_REQUEST' })
        }, { urls: ['https://campuswire.com/*']});
        console.log('Background listener loaded')
    } catch (err) {
        // catfch all top-level errors
        console.log(err);
    }
})();

