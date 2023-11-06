import './App.css';
import {SettingContainer} from "./SettingsContainer";

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
