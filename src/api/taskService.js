import api from './axios';

// Fetch all tasks
export const getAllTasks = async () => {
  const response = await api.get('/tasks');
  return response.data;
};

// Create a new task
export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

// Update task (e.g. after drag-and-drop or edit)
export const updateTask = async (taskId, updatedData) => {
  const response = await api.put(`/tasks/${taskId}`, updatedData);
  return response.data;
};

// Delete task
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
};
