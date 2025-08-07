import React from 'react';
import TaskManager from './components/TaskManager';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">TaskLite</h1>
      <div className="w-full max-w-7xl">
        <TaskManager />
      </div>
    </div>
  );
}
