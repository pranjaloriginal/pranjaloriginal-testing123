import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Todo, Priority } from './types';
import { loadTodos, saveTodos } from './utils/storage';

import './App.css';

export type FeedbackType = 'success' | 'error';
interface Feedback {
  message: string;
  type: FeedbackType;
}

const priorities: Priority[] = ['Low', 'Medium', 'High'];

function isOverdue(todo: Todo) {
  if (!todo.dueDate) return false;
  return !todo.completed && new Date(todo.dueDate) < new Date();
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('Medium');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Load from storage
  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  // Save to storage
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  // Feedback disappears after 2 seconds
  useEffect(() => {
    if (feedback) {
      const to = setTimeout(() => setFeedback(null), 2000);
      return () => clearTimeout(to);
    }
  }, [feedback]);

  const handleAdd = () => {
    if (!title.trim()) {
      setFeedback({ message: 'Title cannot be empty.', type: 'error' });
      return;
    }
    const newTodo: Todo = {
      id: uuidv4(),
      title: title.trim(),
      completed: false,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority: priority || 'Medium',
    };
    setTodos([newTodo, ...todos]);
    setTitle('');
    setDueDate('');
    setPriority('Medium');
    setFeedback({ message: 'Task Added.', type: 'success' });
  };

  const startEdit = (todo: Todo) => {
    setEditId(todo.id);
    setEditTitle(todo.title);
    setEditDueDate(todo.dueDate ? todo.dueDate.slice(0, 10) : ''); // yyyy-mm-dd
    setEditPriority(todo.priority || 'Medium');
  };
  const cancelEdit = () => {
    setEditId(null);
    setEditTitle('');
    setEditDueDate('');
    setEditPriority('Medium');
  };
  const handleEdit = (id: string) => {
    if (!editTitle.trim()) {
      setFeedback({ message: 'Title cannot be empty.', type: 'error' });
      return;
    }
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              title: editTitle.trim(),
              dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
              priority: editPriority || 'Medium',
            }
          : todo
      )
    );
    setFeedback({ message: 'Task Edited.', type: 'success' });
    cancelEdit();
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    setFeedback({ message: 'Task Deleted.', type: 'success' });
  };

  const toggleComplete = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    setFeedback({ message: 'Task Status Changed.', type: 'success' });
  };

  // Sorted: incomplete first, then overdue, then by due date
  const sortedTodos = [...todos].sort((a, b) => {
    // Completed at the bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Overdue first but not completed
    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    // By due date if present
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  function priorityColor(priority: Priority) {
    switch (priority) {
      case 'High':
        return '#dc2626';
      case 'Medium':
        return '#2563eb';
      case 'Low':
        return '#16a34a';
      default:
        return '#64748b';
    }
  }

  return (
    <div className="app-container">
      <h1>To-Do List</h1>

      {feedback && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}

      <div className="add-form">
        <input
          type="text"
          placeholder="Task Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="New Task Title"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          aria-label="Due Date"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          aria-label="Priority"
        >
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button onClick={handleAdd}>Add Task</button>
      </div>

      <ul className="todo-list">
        {sortedTodos.map((todo) => (
          <li
            key={todo.id}
            className={
              'todo-item' +
              (todo.completed ? ' completed' : '') +
              (isOverdue(todo) ? ' overdue' : '')
            }
          >
            {/* Completion Toggle */}
            <button
              className="toggle-btn"
              tabIndex={0}
              aria-label={todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
              onClick={() => toggleComplete(todo.id)}
            >
              {todo.completed ? '⏺️' : '⭕'}
            </button>

            {/* Task Display or Edit Form */}
            {editId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  aria-label="Edit Title"
                />
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  aria-label="Edit Due Date"
                />
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Priority)}
                  aria-label="Edit Priority"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button className="save-btn" onClick={() => handleEdit(todo.id)}>
                  Save
                </button>
                <button className="cancel-btn" onClick={cancelEdit}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="task-title">
                  {todo.title}
                  {isOverdue(todo) && <span className="overdue-badge">Overdue</span>}
                </span>
                {todo.dueDate && (
                  <span className="due-date">
                    Due: {new Date(todo.dueDate).toLocaleDateString()}
                  </span>
                )}
                {todo.priority && (
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: priorityColor(todo.priority) }}
                  >
                    {todo.priority}
                  </span>
                )}
                <button className="edit-btn" onClick={() => startEdit(todo)} aria-label="Edit Task">
                  ✏️
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(todo.id)}
                  aria-label="Delete Task"
                >
                  🗑️
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
