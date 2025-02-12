// frontend/src/components/ProgressBar.jsx
const ProgressBar = ({ progress, status }) => (
  <div className="w-full h-2 bg-gray-200 rounded">
    <div 
      className="h-full bg-blue-500 rounded transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
    <div className="mt-1 text-sm text-gray-600">
      {status === 'downloading' ? `${progress.toFixed(1)}%` : status}
    </div>
  </div>
);