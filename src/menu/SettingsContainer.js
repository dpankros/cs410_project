import react, {useEffect, useState} from 'react';
import {FormInput} from "../settings/FormInput";
import {OPEN_AI_KEY, OPEN_AI_ORG} from "../common/constants";

const useChromeSettings = (storage, settingName, defaultValue = '', deps = []) => {
    const [ getStateValue, setStateValue ] = useState(defaultValue);
    const hasFetched = false;
    const setValue = async (value) => {
        setStateValue(value);
        await storage.set({ [settingName]: value });

        // purposely not awaited.  This is just a verification step
        storage.get(settingName).then(({[settingName]: v} = {}) => {
            if (v === undefined) console.log(`Failed to save setting ${settingName}`);
        });
    }
    const fetchValue = async () => {
        const result = await storage.get(settingName);
        const value = result[settingName];

        if (value === undefined) { // it was never set before
            setValue(defaultValue);
        } else {
            setStateValue( value);
        }
    }

    // Do the initial fetch
    useEffect(() => {
        if (!hasFetched) {
            fetchValue().catch(e => console.error(`Uncaught error in useChromeSettings:`, e));
        }
    }, deps);

    return [getStateValue, setValue];
};

export function SettingContainer(props) {
    const { storage } = props || {};
    const [openAiKey, setOpenAiKey] = useChromeSettings(storage, OPEN_AI_KEY)
    const [openAiOrg, setOpenAiOrg] = useChromeSettings(storage, OPEN_AI_ORG)

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
