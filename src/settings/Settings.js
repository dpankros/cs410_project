import {FormInput} from "./FormInput";
import React from "react";

export function Settings(props) {
    const { openAiKey, setOpenAiKey, openAiOrg, setOpenAiOrg } = props || {};

    return (


        <form className="form">
            <div className="mb-3">
                <label for="key" class="form-label">OpenAI API Key</label>
                <FormInput id="key" type="text" onChange={setOpenAiKey} value={openAiKey}/>
                <div id="keyHelpBlock" class="form-text">
                    An OpenAI API Key.  Create one at <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Keys</a>
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor="org" className="form-label">OpenAI Organization (Optional)</label>
                <FormInput id="org" type="text" onChange={setOpenAiOrg} value={openAiOrg}/>
                <div id="orfyHelpBlock" className="form-text">
                    An OpenAI Organization, if set.  This can be found at <a href="https://platform.openai.com/account/organization" target="_blank">OpenAI Organization Settings</a>
                </div>
            </div>

            <div id="generalHelpBlock" class="form-text">
                Your changes will take effect immediately
            </div>
        </form>
    )
}
