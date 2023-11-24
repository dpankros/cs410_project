import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
export function Data(props) {
  const { data } = props;
  const [state, setState] = useState(null);
  function toggleCollapse(status){
    if (state === status){
      setState(null);
    }
    else{
      setState(status);
    }
  };
  function stateIcon(item) {
    if (state === item.id){
      return faMinus;
    }
    else{
      return faPlus;
    }
  }
  return(
    <div className = "text-center"
    >
      <h1 style={{ marginBottom: '50px' }}>Relevant Posts</h1>
      <ul style = {{ listStyle: 'none' }}>
        {data.map((item) => (
          <li key={item.id}>
            <button
              className = "btn btn-outline-primary btn-lg mb-3"
              style = {{
                fontSize: 24,
                width: '100%',
              }}
              onClick={ () => toggleCollapse(item.id)}
            >
              <strong >
                {item.title.substring(0, 50)}
              </strong>
              {item.title.length > 50 && '.....'}
              <br />
              <br />
              {item.body.substring(0, 100)}
              {item.body.length > 100 && '.....'}
              <FontAwesomeIcon
                icon = {stateIcon(item)}
                style = {{ 
                  cursor: 'pointer', 
                  marginLeft: '10px' 
                }}
                onClick={ () => toggleCollapse(item.id)}
              />
            </button>
            <div 
              className = {`collapse ${state === item.id ? 'show' : ''}`} 
              style = {{ 
              margin: '0 auto', 
              border: '5px groove #000',
              maxWidth: 800, 
              borderRadius: 20, 
              marginBottom: 20 
              }}
            >
            <p>
              <strong>{item.title}</strong>
            </p>
            <p>
              <br /> {item.body}
            </p>
            <p>
              <br /> 
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.url}
                </a>
            </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}