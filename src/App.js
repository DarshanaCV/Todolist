import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, set, push, onValue, remove } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [category, setCategory] = useState('');
  const [editTodoId, setEditTodoId] = useState(null);
  const [editTodoTask, setEditTodoTask] = useState('');
  const [editTodoCategory, setEditTodoCategory] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  const categories = ['Work', 'Personal', 'Shopping', 'Fitness', 'Others'];

  useEffect(() => {
    const todosRef = ref(db, 'todos/');
    onValue(todosRef, (snapshot) => {
      const data = snapshot.val();
      const todosArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setTodos(todosArray);
    });
  }, []);

  const saveTodo = async () => {
    if (newTodo.trim() && category) {
      const todosRef = ref(db, 'todos/');
      const newTodoRef = push(todosRef);
      await set(newTodoRef, {
        task: newTodo,
        completed: false,
        category: category,
      });
      setNewTodo('');
      setCategory('');
    }
  };

  const updateTodo = async () => {
    if (editTodoTask.trim() && editTodoCategory) {
      const todoRef = ref(db, `todos/${editTodoId}`);
      await set(todoRef, {
        task: editTodoTask,
        completed: false,
        category: editTodoCategory,
      });
      closeEditModal();
    }
  };

  const deleteTodo = async () => {
    if (todoToDelete) {
      const todoRef = ref(db, `todos/${todoToDelete.id}`);
      await remove(todoRef);
      closeDeleteModal();
    }
  };

  const toggleCompletion = async (todo) => {
    const todoRef = ref(db, `todos/${todo.id}`);
    await set(todoRef, { ...todo, completed: !todo.completed });
  };

  const openEditModal = (todo) => {
    setEditTodoId(todo.id);
    setEditTodoTask(todo.task);
    setEditTodoCategory(todo.category);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditTodoId(null);
    setEditTodoTask('');
    setEditTodoCategory('');
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (todo) => {
    setTodoToDelete(todo);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTodoToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const groupedTodos = categories.reduce((acc, category) => {
    acc[category] = todos.filter(todo => todo.category === category && !todo.completed);
    return acc;
  }, {});

  const finishedTasks = todos.filter(todo => todo.completed);
  const pendingTasks = todos.filter(todo => !todo.completed);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="app">
      <h1>Todo List 📝</h1>
      <div className="app-header">
        <p>Pending Tasks: {pendingTasks.length}</p>
        <p className="date">{today}</p>
      </div>
      
      <div className="input-container">
        <input
          type="text"
          placeholder="Add a new todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button onClick={saveTodo}>Add</button>
      </div>

      <div className="category-container">
        {categories.map((cat) => {
          const todosInCategory = groupedTodos[cat];
          if (todosInCategory.length === 0) return null;

          return (
            <div key={cat} className="category-card">
              <h2>{cat}</h2>
              <div className="todo-cards">
                {todosInCategory.map((todo) => (
                  <div key={todo.id} className="todo-card">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleCompletion(todo)}
                    />
                    <span className="todo-task">{todo.task}</span>
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="edit-icon"
                      onClick={() => openEditModal(todo)}
                    />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="delete-icon"
                      onClick={() => openDeleteModal(todo)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <h2>Finished Tasks</h2>
      <div className="finished-tasks">
        {finishedTasks.map((todo) => (
          <div key={todo.id} className="todo-card completed">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleCompletion(todo)}
            />
            <span className="todo-task">{todo.task}</span>
            <FontAwesomeIcon
              icon={faEdit}
              className="edit-icon"
              onClick={() => openEditModal(todo)}
            />
            <FontAwesomeIcon
              icon={faTrash}
              className="delete-icon"
              onClick={() => openDeleteModal(todo)}
            />
          </div>
        ))}
        {finishedTasks.length === 0 && <p>No finished tasks yet.</p>}
      </div>

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Todo</h2>
            <input
              type="text"
              value={editTodoTask}
              onChange={(e) => setEditTodoTask(e.target.value)}
            />
            <select
              value={editTodoCategory}
              onChange={(e) => setEditTodoCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="modal-buttons">
              <button onClick={updateTodo}>Update</button>
              <button onClick={closeEditModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Delete Todo</h2>
            <p>Are you sure you want to delete this task?</p>
            <p>"{todoToDelete?.task}"</p>
            <div className="modal-buttons">
              <button onClick={deleteTodo}>Delete</button>
              <button onClick={closeDeleteModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;