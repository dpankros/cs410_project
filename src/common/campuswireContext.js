
// These are the properties allowed in the context object.  ALL OTHERS WILL THROW AN ERROR
const ALLOWED_PROP_NAMES = [
    'groupId',
    'url',
    'token',
    'pages',
    'error',
    'searchTerms',
]
export class CampuswireContext {
    constructor(json = {}) {
        for (const prop of ALLOWED_PROP_NAMES) {
            this[prop] = undefined;
        }
        Object.preventExtensions(this);

        this.setValues(json);
    }

    setValues(json = {}) {
        if (!json) return this;

        for (const prop in json){
            this[prop] = json[prop];
        }
        return this;
    }

    get json() {
        return ALLOWED_PROP_NAMES.reduce((prev, prop) => ({ ...prev, [prop]: this[prop]}), {});
    }
}
