// ({
//     plugins: ['jsdom-quokka-plugin'],
//     jsdom: {html: `<div id="testDiv">Hello</div>`}
// })
// import fetch from 'node-fetch';

import {
    CHATGPT_DOCUMENT_PROMPT,
    DEFAULT_CHATGPT_ENDPOINT,
    DEFAULT_CHATGPT_KEY,
    DEFAULT_CHATGPT_MODEL,
    LOCAL_DEBUG
} from './constants.js';

const EXAMPLE_TERMS_JSON =  {
    id: 'chatcmpl-8BkKIblY7Zi0nLjN7BeKEvbL1Bg55',
    object: 'chat.completion',
    created: 1697810378,
    model: 'gpt-3.5-turbo-0613',
    choices:
        [{
            index: 0,
            message:
                {
                    role: 'assistant',
                    content: '"Project proposal submission and tech review signup requirements"'
                },
            finish_reason: 'stop'
        }],
    usage: {prompt_tokens: 132, completion_tokens: 10, total_tokens: 142}
};

export class ChatGptAPI {
    constructor(key = DEFAULT_CHATGPT_KEY, organization = null, model = DEFAULT_CHATGPT_MODEL, endpoint = DEFAULT_CHATGPT_ENDPOINT) {
        this.endpoint = endpoint;
        this.key = key;
        this.organization = organization || null;
        if (this.organization && !this.organization.startsWith('org-')) {
            console.warn('An OpenAI Organization was provided, but it appears to be invalid.  Organizations should begin with "org-".');
        }

        this.headers = {
            Authorization: `Bearer ${this.key}`,
            'Content-Type': 'application/json',
        };
        if (this.organization) {
            this.headers["OpenAI-Organization"] = this.organization;
        }
        // here in case we need it
        const params = new URLSearchParams();
        this.url = new URL(`${this.endpoint}?${params.toString()}`)
        this.model = 'gpt-3.5-turbo';
    }

    async getSearchTermsForDocument(body = null, title = '') {
        if (body === null) throw Error("Missing required argument: doc");

        const content = CHATGPT_DOCUMENT_PROMPT.replace('%BODY%', body).replace('%TITLE%', title)
        console.log("GPT Query:", content);
        const requestBody = {
            model: this.model,
            messages: [{ 'role': 'user', content }],
        }; // ?
        let termsJson = null;
        if (!LOCAL_DEBUG) {
            const response = await this.post(requestBody);
            termsJson = await response.json();
        } else {
            termsJson = EXAMPLE_TERMS_JSON;
        }
        console.log('Suggested Terms:', termsJson)
        const { error = null, choices: [firstChoice, ...rest] = [] } = termsJson || {};
        if (error) {
            const { code, message } = error;
            console.log(error)
            throw new Error(`${message} (${code})`);
        }
        const {message: {content: result = ''} = {}} = firstChoice || {};
        return result.replace(/["]+/g, '');
    }

    async post(body, headers = {}) {
        return fetch(this.url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {...this.headers, ...headers}
        });
    }
}

// const sampleDoc = "I am extremely confused on what needs to be done for this weekend. From what I can understand there is two things that need to be done.\n" +
//     "\t1\tProject Proposal Submission\n" +
//     "\t2\tTech Review signup\n" +
//     "Is this all that is due?\n" +
//     "What needs to be included in the project proposal submission/where can I find this information?\n" +
//     "What needs to be done for the tech review signup/where can I find this information?\n" +
//     "If anyone could provide some clarity on this information it would be really helpful. Thanks"
//
// async function main() {
//     // const s = new WordNetSynonyms();
//     // await s.synonymFor('computer');  //?
//     // await s.synonymFor('class');  //?
//     // await s.synonymFor('person');  //?
//     const gpt = new ChatGptAPI('needs a key');
//     const terms = await gpt.getSearchTermsForDocument(sampleDoc);
//     console.log(terms);
// }
//
// main();

