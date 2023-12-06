import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faMinus} from '@fortawesome/free-solid-svg-icons';

function SidepanelItem(props) {
    const {...item} = props;
    const [state, setState] = useState(null);

    function toggleCollapse(status) {
        if (state === status) {
            setState(null);
        } else {
            setState(status);
        }
    };

    function stateIcon(item) {
        if (state === item.id) {
            return faMinus;
        } else {
            return faPlus;
        }
    }

    return (
        <li>
            <button
                className="btn btn-outline-primary btn-lg mb-3"
                style={{
                    fontSize: 24, width: '100%',
                }}
                onClick={() => toggleCollapse(item.id)}
            >
                <strong>{item.title.substring(0, 50)}</strong>
                {item.title.length > 50 && '.....'}
                <br/>
                <br/>
                {item.body.substring(0, 100)}
                {item.body.length > 100 && '.....'}
                <FontAwesomeIcon
                    icon={stateIcon(item)}
                    style={{
                        cursor: 'pointer', marginLeft: '10px'
                    }}
                    onClick={() => toggleCollapse(item.id)}
                />
            </button>
            <div
                className={`collapse ${state === item.id ? 'show' : ''}`}
                style={{
                    margin: '0 auto', border: '5px groove #000', maxWidth: 800, borderRadius: 20, marginBottom: 20
                }}
            >
                <p>
                    <strong>{item.title}</strong>
                </p>
                <p>
                    <br/> {item.body}
                </p>
                <p>
                    <br/>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.url}
                    </a>
                </p>
            </div>
        </li>
    );
}

function OptionsButton({ children, ...rest }) {
    return <a {...rest} onClick={() => chrome.runtime.openOptionsPage()}>{children}</a>
}

function NoGptWarning(props) {
    const warningStyle = {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    };
    return (
        <div className="alert alert-warning" role="alert" style={warningStyle}>
            ChatGPT is not enabled. <OptionsButton>Configure ChatGPT Now</OptionsButton>
        </div>
    )
}

export function Sidepanel(props) {
    const {data, usedChatGpt} = props;

    return (<div className="container-sm text-center">
        {usedChatGpt || <NoGptWarning/>}
        <h1 style={{marginBottom: '50px'}}>Relevant Posts</h1>
        <ul style={{listStyle: 'none'}}>
            {data.map(item => <SidepanelItem key={item.id} {...item}/>)}
        </ul>
    </div>);
}
