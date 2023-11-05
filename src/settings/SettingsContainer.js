import React from 'react';
import {OPEN_AI_KEY, OPEN_AI_ORG} from "../common/constants.js";
import {Settings} from "./Settings.js";
import { useChromeSettings } from "./useChromeSettings.js";

export function SettingContainer(props) {
    const { storage } = props || {};
    const [openAiKey, setOpenAiKey] = useChromeSettings(storage, OPEN_AI_KEY)
    const [openAiOrg, setOpenAiOrg] = useChromeSettings(storage, OPEN_AI_ORG)

    return <Settings openAiKey={openAiKey} setOpenAiKey={setOpenAiKey} openAiOrg={openAiOrg} setOpenAiOrg={setOpenAiOrg()} />
}
