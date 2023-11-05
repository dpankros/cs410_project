import {FormInput} from "./FormInput";
import React from "react";

export function Settings(props) {
    const { openAiKey, setOpenAiKey, openAiOrg, setOpenAiOrg } = props || {};

    return (
        <div className="form">
            <div className="form-row">
                <div className="form-label">OpenID API Key</div>
                <div className="form-input">
                    <FormInput type="text" size={20} onChange={setOpenAiKey} value={openAiKey}/>
                </div>
            </div>

            <div className="form-row">
                <div className="form-label">OpenID Organization (Optional)</div>
                <div className="form-input">
                    <FormInput type="text" size={20} onChange={setOpenAiOrg} value={openAiOrg}/>
                </div>
            </div>
        </div>
    )
}
