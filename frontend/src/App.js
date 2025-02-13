import React from 'react';
import DownloadManager from './components/DownloadManager';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Large File Download Manager</h1>
      </header>
      <main className="App-main">
        <DownloadManager fileId="test.iso" />
      </main>
    </div>
  );
}

export default App;