import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import as a function
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../api/taskService';
import './Taskmanager.css';

const statuses = ['Todo', 'In Progress', 'Done'];

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Low',
    dueDate: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const data = await getAllTasks();
    setTasks(data);
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) return;

    if (isEditing) {
      await updateTask(editingTaskId, { ...formData });
    } else {
      await createTask({ ...formData, status: 'Todo' });
    }

    setFormData({ title: '', description: '', priority: 'Low', dueDate: '' });
    setIsEditing(false);
    setEditingTaskId(null);
    fetchTasks();
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    fetchTasks();
  };

  const handleEdit = (taskId) => {
    const task = tasks.find((t) => t._id === taskId);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate?.slice(0, 10),
    });
    setIsEditing(true);
    setEditingTaskId(taskId);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const draggedTask = tasks.find((task) => task._id === draggableId);
    const updated = { ...draggedTask, status: destination.droppableId };

    await updateTask(draggableId, updated);
    fetchTasks();
  };

const handleDownloadPDF = (task) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Task Details', 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [['Field', 'Value']],
    body: [
      ['Title', task.title],
      ['Description', task.description || '—'],
      ['Priority', task.priority],
      ['Due Date', task.dueDate?.slice(0, 10)],
      ['Status', task.status],
    ],
  });

  doc.save(`${task.title || 'task'}.pdf`);
};
  const getPriorityBadge = (priority) => {
    const map = {
      Low: 'success',
      Medium: 'warning',
      High: 'danger',
    };
    return <span className={`badge bg-${map[priority]}`}>{priority}</span>;
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Task Manager</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <input
              name="title"
              className="form-control"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              name="description"
              className="form-control"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-2">
            <select
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="col-md-2">
            <input
              type="date"
              name="dueDate"
              className="form-control"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100">
              {isEditing ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </div>
      </form>

      {isEditing && (
        <div className="text-end mt-2">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setIsEditing(false);
              setEditingTaskId(null);
              setFormData({
                title: '',
                description: '',
                priority: 'Low',
                dueDate: '',
              });
            }}
          >
            Cancel Edit
          </button>
        </div>
      )}

      {/* Task Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="row">
          {statuses.map((status) => (
            <div className="col-md-4" key={status}>
              <h4 className="text-center">{status}</h4>
              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-light p-2 rounded"
                    style={{ minHeight: '300px' }}
                  >
                    {tasks
                      .filter((task) => task.status === status)
                      .map((task, index) => (
                        <Draggable
                          draggableId={String(task._id)}
                          index={index}
                          key={task._id}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="card mb-2"
                            >
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h5 className="card-title mb-0">
                                    {task.title}
                                  </h5>
                                  {getPriorityBadge(task.priority)}
                                </div>
                                <p className="card-text">
                                  {task.description || 'No description'}
                                </p>
                                <p className="text-muted mb-2">
                                  Due: {task.dueDate?.slice(0, 10)}
                                </p>
                                <div className="d-flex justify-content-between">
                                  <button
                                    onClick={() => handleEdit(task._id)}
                                    className="btn btn-sm btn-warning"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(task._id)}
                                    className="btn btn-sm btn-danger"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => handleDownloadPDF(task)}
                                    className="btn btn-sm btn-secondary"
                                  >
                                    Download PDF
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskManager;
