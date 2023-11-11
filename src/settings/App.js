import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
function App() {
  const data = [
    { id: 1, title: 'CS 410 Team Project', body: "I don't see the Leadership link or ta" },
    { id: 2, title: 'MP2.2 Grade not updated', body: "uaouadafaf" },
    { id: 3, title: 'Webhook not working', body: "aihaha8ha08faf"},
  ];
  const [selectedObject, setSelectedObject] = useState(null);
  const handleObjectClick = (object) => {
    setSelectedObject(object);
  };
  return (
    <div className="text-center">
      <h1 style={{ marginBottom: '50px' }}>Relevant Posts</h1>
      <ul style={{ listStyle: 'none' }}>
        {data.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => handleObjectClick(item)}
              className="btn btn-outline-primary btn-lg mb-3"
              style={{
                fontSize: '24px',
                padding: '10px 30px',
              }}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
      {selectedObject && (
        <div>
          <p>ID: {selectedObject.id}</p>
          <p>Title: {selectedObject.title}</p>
          <p>Body: {selectedObject.body}</p>
        </div>
      )}
    </div>
  );
}
export default App;