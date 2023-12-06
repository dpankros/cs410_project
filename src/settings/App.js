import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {SettingContainer} from "./SettingsContainer";

function App() {
  return (
    <div className="App container">
        {/*<div className="settings form-container">*/}
            <SettingContainer storage={chrome.storage.sync}/>
        {/*</div>*/}
    </div>
  );
}

export default App;
