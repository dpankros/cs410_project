import { ChatGptAPI } from './common/chatGptApi.js';
import {OPEN_AI_KEY, OPEN_AI_ORG} from "./common/constants.js";

(async () => {
    try {
        let pages = [];
        let url = null;

        async function sendMessage(msg) {
            try {
                console.log('BACKGROUND - Sending', msg)
                await chrome.runtime.sendMessage(msg);
            } catch (err) {
                console.log(err);
            }
        }

        async function onPostChange(m) {
            const {type, body, title, url: _url} = m;

            console.log(`onPostChange:`, m);
            pages = Array.isArray(body) ? body : [body, body, body];
            url = _url;

            // Get ChatGPT Search Terms
            const { [OPEN_AI_KEY]: key, [OPEN_AI_ORG]: org = null } = await chrome.storage.sync.get(null);
            let searchTerms;
            let error = null;
            if (key) {
                const chatGpt = new ChatGptAPI(key, org);
                try {
                    searchTerms = await chatGpt.getSearchTermsForDocument(body);
                } catch (err) {
                    error = err.message;
                }
            } else {
                searchTerms = title;
            }

            // TODO: Do some processing on the message

            if (searchTerms) {
                pages = searchTerms.split(' ');
            }
            // send the message to the sidebar
            await sendMessage({type: 'RELATED_PAGES', pages, url, error });
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
        console.log(chrome)
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

