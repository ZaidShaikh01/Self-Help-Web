import { api, clearApiCache, setApiCacheUser } from './api';

export interface User {
  _id: string;
  fullname: string;
  email: string;
  username: string;
}

let currentUser: User | null = null;
let currentUserRequest: Promise<User> | null = null;

export const loginRequest = async (email: string, password: string) => {
  const result = await api<{ user: User }>('/users/login', {
    method: 'POST',
    body: { email, password },
  });
  currentUser = result.user;
  currentUserRequest = null;
  setApiCacheUser(result.user._id);
  return result;
};

export const registerRequest = async (data: {
  fullname: string;
  email: string;
  username: string;
  password: string;
}) => {
  const user = await api<User>('/users/register', {
    method: 'POST',
    body: data,
  });
  currentUser = user;
  setApiCacheUser(user._id);
  return user;
};

export const getCurrentUser = (): Promise<User> => {
  if (currentUser) return Promise.resolve(currentUser);

  if (!currentUserRequest) {
    currentUserRequest = api<User>('/users/current-user')
      .then((user) => {
        currentUser = user;
        setApiCacheUser(user._id);
        return user;
      })
      .finally(() => {
        currentUserRequest = null;
      });
  }

  return currentUserRequest;
};

export const logoutRequest = async () => {
  const result = await api('/users/logout', { method: 'POST' });
  clearApiCache();
  currentUser = null;
  currentUserRequest = null;
  setApiCacheUser(null);
  return result;
};
