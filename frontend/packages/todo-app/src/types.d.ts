/// <reference types="svelte" />
/// <reference types="vite/client" />

import { Readable, Writable } from "svelte/store";
import { ToasterStore } from "todo-app-common";

interface Config {
  apiUrl: string;
  notificationMethod: string;
  auth: Keycloak.KeycloakConfig;
  profileUrl: string;
  dashboardUrl: string;
}

type NotificationType =
  | "todo.created.ok"
  | "todo.created.error"
  | "todo.completed.ok"
  | "todo.completed.error";

interface NewTodo {
  name: string;
  description?: string;
}

type NewTodoStore = Readable<NewTodo>;

interface ServerTodo {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Todo {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

type TodosStore = Writable<Todo[]>;

interface GetTodosRequest {
  offset: number;
  limit: number;
}

interface GetTodosResponse {
  meta: GetTodosResponseMeta;
  data: ServerTodo[];
}

interface GetTodosResponseMeta {
  offset: number;
  limit: number;
}

interface NotificationStore {
  connected: Writable<boolean>;
  connect: () => Promise<() => void>;
}

interface TodoFormStore {
  name: Writable<string>;
  description: Writable<string>;
  closeOnCreate: Writable<boolean>;
  todo: Readable<NewTodo>;
  isValid: Readable<boolean>;
  reset: () => void;
}

interface TodoStore {
  todos: TodosStore;
  loading: Writable<boolean>;
  getTodos: (offset?: number, limit?: number) => Promise<void>;
  createTodo: (todo: NewTodo) => Promise<void>;
  completeTodo: (id: number) => Promise<void>;
}

interface Stores {
  toasterStore: ToasterStore;
  notificationStore: NotificationStore;
  todoFormStore: TodoFormStore;
  todoStore: TodoStore;
}
