import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAPI } from './api';

export type LoginResult =
{
  token: string;
  email: string;
  username: string;
  role: string;
  id: number;
  isLinked: boolean;
};

export async function loginUser(email: string, password: string): Promise<LoginResult>
{
  const data = await fetchAPI('/auth/login', 'POST', { email, password });
  await AsyncStorage.setItem('@user', JSON.stringify({ token: data.token }));
  const meData = await fetchAPI('/auth/me');
  const user: LoginResult =
  {
    token: data.token,
    email: data.email,
    username: data.username,
    role: data.role,
    id: meData.id,
    isLinked: meData.isLinked
  };
  await AsyncStorage.setItem('@user', JSON.stringify(user));
  return user;
}

export async function registerUser(name: string, email: string, password: string, role: 'syndic' | 'resident'): Promise<void>
{
  await fetchAPI('/auth/register', 'POST', { name, email, password, role });
}
