import {useEffect, useCallback, useState} from "react";

const NO_DEPS = [];
const BLANK = '';

export const useChromeSettings = (storage, settingName, defaultValue = BLANK, deps = NO_DEPS) => {
    const [stateValue, setStateValue] = useState(defaultValue);
    const [hasFetched, setFetched] = useState(false);

    const setValue = useCallback(async (value) => {
        await storage.set({ [settingName]: value });
        setStateValue(value);

        // purposely not awaited.  This is just a verification step
        storage.get(settingName).then(({[settingName]: v} = {}) => {
            if (v === undefined) console.log(`Failed to save setting ${settingName}`);
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storage, settingName, ...deps]);

    // Do the initial fetch
    useEffect(() => {
        const fetchValue = async () => {
            const result = await storage.get(settingName);
            const value = result[settingName];

            if (value === undefined) { // it was never set before
                setValue(defaultValue);
            } else {
                setStateValue(value);
            }
        }

        if (!hasFetched) {
            fetchValue().catch(e => console.error(`Uncaught error in useChromeSettings:`, e)).then(setFetched(true));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // blank so it runs only on the inital render

    return [stateValue, setValue];
};

