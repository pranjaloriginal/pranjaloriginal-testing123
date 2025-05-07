import { Todo } from './types';

const LS_KEY = 'todo_items';

export function loadTodos(): Todo[] {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Todo[];
  } catch (e) {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(todos));
}
