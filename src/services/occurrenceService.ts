import { Alert } from 'react-native';
import { fetchAPI } from './api';

export type OccurrenceUser =
{
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
};

export type ChatMessage =
{
  id: number;
  content: string;
  sender: number;
  dateTime: string;
};

export type OccurrenceItem =
{
  id: number;
  user_id: number;
  condominium_id: number;
  titulo: string;
  descricao: string;
  status: string;
  created_at: string;
  updated_at: string;
  user: OccurrenceUser;
  chatMessages?: ChatMessage[];
};

export const occurrenceStatusColors: Record<string, string> =
{
  'aberto': '#a25200',
  'em andamento': '#007BFF',
  'resolvido': '#28a745',
  'vazio': '#6c757d'
};

export const occurrenceStatusOrder: string[] = ['aberto', 'em andamento', 'resolvido'];

export async function fetchOccurrences(): Promise<OccurrenceItem[]>
{
  const data = await fetchAPI('/ocorrencias');
  return data;
}

export async function createOccurrence(title: string, description: string): Promise<OccurrenceItem | null>
{
  try
  {
    const data: OccurrenceItem = await fetchAPI('/ocorrencias', 'POST', { titulo: title, descricao: description });
    return data;
  }
  catch (err: any)
  {
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
    return null;
  }
}

export async function deleteOccurrence(id: number): Promise<void>
{
  try
  {
    await fetchAPI(`/ocorrencias/${id}`, 'DELETE');
  }
  catch (err: any)
  {
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
  }
}

export async function setOccurrenceStatus(id: number, status: string): Promise<void>
{
  try
  {
    await fetchAPI(`/ocorrencias/${id}`, 'PUT', { status });
  }
  catch (err: any)
  {
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
  }
}

export async function getMessages(occurrenceId: number): Promise<ChatMessage[]>
{
  try
  {
    const data: ChatMessage[] = await fetchAPI(`/ocorrencias/chat/${occurrenceId}`);
    return data;
  }
  catch (err: any)
  {
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
    return [];
  }
}

export async function sendMessage(occurrenceId: number, content: string, senderId: number): Promise<void>
{
  try
  {
    await fetchAPI(`/ocorrencias/chat/${occurrenceId}`, 'POST', { content, senderId });
  }
  catch (err: any)
  {
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
  }
}
