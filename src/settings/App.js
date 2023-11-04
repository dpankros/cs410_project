import logo from '../logo.svg';
import './App.css';
import {SettingContainer} from "../menu/SettingsContainer";
/* eslint-disable no-undef */

function App() {
  return (
    <div className="App">
        <div className="settings form-container">
            <SettingContainer storage={chrome.storage.sync}/>
        </div>
    </div>
  );
}

export default App;
