/* eslint-disable no-undef */
import React, {Component} from 'react';
import {Error} from "./Error";
import {Loading} from "./Loading";
import {NoResults} from "./NoResults";
import {Sidepanel} from "./Sidepanel";
export class MessageResult extends Component {
    constructor(props) {
        super();

        this._pages = [];
        this._error = null;
        this._listener = this.onRelatedPagesUpdate.bind(this)
        this._usedChatGPT = false;
    }

    componentDidMount() {
        chrome.runtime.onMessage.addListener(this._listener);
        try {
            chrome.runtime.sendMessage({type: 'RELATED_PAGES_REQUEST'});
        } catch (err) {
            console.warn(err);
        }
    }

    onRelatedPagesUpdate(relatedPagesMsg) {
        const {type} = relatedPagesMsg;
        switch(type) {
            case 'POST_CHANGE_START':
                this._loading = true;
                this.forceUpdate(); // forces an out of band update
                break;
            case 'POST_CHANGE_END':
                this._loading = false;
                this.forceUpdate(); // forces an out of band update
                break;
            case 'RELATED_PAGES':
            // case 'POST_LOADED':
                const {pages, error, usedChatGpt} = relatedPagesMsg;
                this._pages = pages;
                this._error = error;
                this._loading = false;
                this._usedChatGPT = !!usedChatGpt;
                this.forceUpdate(); // forces an out of band update
                break;
            default:
                //ignore other types
        }
    }

    render() {
        // console.log('RENDERING', this._pages, this._error, this._loading, this._usedChatGPT)
        if (this._error) {
            return <Error error={this._error}/>
        }
        if (this._loading) {
            return <Loading/>;
        }
        if (!this._pages || this._pages.length === 0) {
            return <NoResults/>;
        } else {
            return <Sidepanel data={this._pages} usedChatGpt={this._usedChatGPT}/>
        }

    }
}
