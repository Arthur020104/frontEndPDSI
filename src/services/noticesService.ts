import { Alert } from 'react-native';
import { fetchAPI } from './api';
import { formatDate } from '../utils/formatDate';

export type Notice =
{
  id: number;
  title: string;
  message: string;
  date: string;
  creator: string;
};

export async function fetchNotices(filter: 'all' | 'today' = 'all'): Promise<Notice[]>
{
  const data: any[] = await fetchAPI('/notices');
  let list: Notice[] = data.map((item) => ({
    id: item.id,
    title: item.titulo || '(Sem título)',
    message: item.descricao,
    date: formatDate(item.created_at),
    creator: item.user?.username || 'Desconhecido'
  }));
  list.reverse();

  if (filter === 'today')
  {
    const today = new Date().toLocaleDateString('pt-BR');
    list = list.filter((n) => n.date === today);
  }

  return list;
}

export async function createNotice(titulo: string, descricao: string): Promise<boolean>
{
  try
  {
    await fetchAPI('/notices', 'POST', { titulo, descricao });
    return true;
  }
  catch
  {
    Alert.alert('Erro', 'Não foi possível criar o aviso');
    return false;
  }
}

export async function deleteNotice(id: number): Promise<void>
{
  await fetchAPI(`/notices/${id}`, 'DELETE');
}
