
export const OPEN_AI_KEY= "OpenAiKey";
export const OPEN_AI_ORG= "OpenAiOrganization";

// the model to use
export const DEFAULT_CHATGPT_MODEL = 'gpt-3.5-turbo';
// The auth/api key for chatgpt
export const DEFAULT_CHATGPT_KEY = null;

// The api endpoint for chatgpt
export const DEFAULT_CHATGPT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// whether to use local canned responses or actually hit the API
export const LOCAL_DEBUG = false;

// The prompt to use for chat gpt use %TITLE% and %BODY% for the title and body, respectively
export const CHATGPT_DOCUMENT_PROMPT = 'Suggest a search to find like the following document.  ' +
    'Provide just the query, no quotes, no other text, and a maximum of 10 words:\n\ntitle: "%TITLE%"\nbody:"%BODY%"';
