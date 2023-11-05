/* eslint-disable no-undef */
import React, {Component} from 'react';
import {Error} from "./Error";


export class MessageResult extends Component {
    constructor(props) {
        super();

        this._pages = [];
        this._error = null;
        this._listener = this.onRelatedPagesUpdate.bind(this)
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
            case 'RELATED_PAGES':
            // case 'POST_LOADED':
                const {pages, error} = relatedPagesMsg;
                this._pages = pages;
                this._error = error;
                this.forceUpdate(); // forces an out of band update
                break;
            default:
                //ignore other types
        }
    }

    render() {
        console.log('RENDERING', this._pages)
        if (this._error) {
            return <Error error={this._error}/>
        }
        if (!this._pages || this._pages.length === 0) {
            return <strong>Nothing to Show</strong>;
        } else {
            return <ul>{this._pages.map((page, i) => (<li key={`p-${i}`}>{page}</li>))}</ul>;
        }

    }
}
