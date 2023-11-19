const currentTab = async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    return tab;
}

export class ContextManager {
    constructor(defaultContextClass = null) {
        this._ctxClass = defaultContextClass;
        this._ctx = {}
    }

    setContext(id, data = null) {
        if (!id) throw new Error(`Missing Required Argument: id`);

        this._ctx[id] = data;
        return this;
    }

    async setCurrentContext(data) {
        const tab = await currentTab();
        return this.setContext(tab.id, data);
    }

    removeContext(id) {
        delete this._ctx[id];
    }

    async getCurrentContext() {
        const tab = await currentTab();
        return this.getContext(tab ? tab.id : null);
    }

    getContext(id) {
        if (this.hasContext(id)) {
            // clone the context
           return new this._ctxClass({...this._ctx[id]});
        }
        return new this._ctxClass();
    }

    hasContext(id) {
        return id ? !!this._ctx[id] : false;
    }
}
