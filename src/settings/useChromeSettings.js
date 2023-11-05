import {useEffect, useState} from "react";

export const useChromeSettings = (storage, settingName, defaultValue = '', deps = []) => {
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


    // Do the initial fetch
    useEffect(() => {
        const fetchValue = async () => {
            const result = await storage.get(settingName);
            const value = result[settingName];

            if (value === undefined) { // it was never set before
                setValue(defaultValue);
            } else {
                setStateValue( value);
            }
        }

        if (!hasFetched) {
            fetchValue().catch(e => console.error(`Uncaught error in useChromeSettings:`, e));
        }
    }, [hasFetched, defaultValue, settingName, storage, ...deps]);

    return [getStateValue, setValue];
};
