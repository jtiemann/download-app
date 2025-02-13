import React, { useState } from 'react';
import FileBrowser from './components/FileBrowser';
import DownloadManager from './components/DownloadManager';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Large File Download Manager</h1>
      </header>
      <main className="App-main">
        <FileBrowser onFileSelect={handleFileSelect} />
        {selectedFile && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">
              Selected File: {selectedFile.name}
            </h2>
            <DownloadManager fileId={selectedFile.name} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;