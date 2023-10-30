(async () => {
    try {
        let pages = [];
        let url = null;

        function sendMessage(msg) {
            try {
                chrome.runtime.sendMessage(msg);
            } catch (err) {
                connsole.warn(err);
            }
        }

        function onPostChange(m) {
            const {type, body, url: _url} = m;

            console.log(`onPostChange:`, m);
            pages = Array.isArray(body) ? body : [body, body, body];
            url = _url;

            // TODO: Do some processing on the message

            // send the message to the sidebar
            sendMessage({type: 'RELATED_PAGES', pages, url});
        }

        function onRelatedPagesRequest(msg) {
            console.log(`onRelatedPagesRequest:`, msg);
            console.log('sending related pages', pages)
            sendMessage({type: 'RELATED_PAGES', pages, url});
        }


        function handleMessage(msg) {
            console.log('Got message', msg);
            if (!msg) return;

            const {type} = msg;
            switch (type) {
                case 'POST_LOADED':
                    onPostChange(msg)
                    break;
                case 'RELATED_PAGES_REQUEST':
                    onRelatedPagesRequest(msg)
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
        console.warn(err);
    }
})();

