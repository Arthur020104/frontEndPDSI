import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = `http://${API_HOST}:5000/api`;

export async function fetchAPI(endpoint: string, method = 'GET', body?: any)
{
  const userString = await AsyncStorage.getItem('@user');
  let token: string | null = null;

  if (userString)
  {
    try
    {
      const user = JSON.parse(userString);
      token = user?.token ?? null;
    }
    catch (_) {}
  }

  const res = await fetch(`${API_URL}${endpoint}`,
  {
    method,
    headers:
    {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  let data: any = null;
  try { data = await res.json(); } catch (_) {}

  if (!res.ok)
  {
    const message = (data && data.message) ? data.message : 'Erro na requisição';
    throw new Error(message);
  }

  return data;
}



export function getImageUrl(imageId: number | string): string
{
  return `${API_URL}/images/${imageId}`;
}