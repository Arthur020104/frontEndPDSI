import { Alert } from 'react-native';
import { fetchAPI } from './api';

export type ReservationItem =
{
  id: number;
  nome: string;
  image_id: number;
  descricao: string;
  userId: number;
};

export type Schedule =
{
  id: number;
  inicio: string;
  fim: string;
  user_id: number;
  reserva_id: number;
  username: string;
};

export async function fetchReservations(): Promise<ReservationItem[]>
{
  try
  {
    const data: ReservationItem[] = await fetchAPI('/reservas');
    return data;
  }
  catch (err: any)
  {
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
    return [];
  }
}

export async function createReservation(params: { image: any; name: string; description: string }): Promise<void>
{
  try
  {
    const form = new FormData();
    form.append('imageFile', params.image);
    form.append('nome', params.name);
    form.append('descricao', params.description);
    await fetchAPI('/reservas', 'POST', form);
  }
  catch (err: any)
  {
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
  }
}

export async function fetchReservationLogs(id: number): Promise<Schedule[]>
{
  try
  {
    const data: Schedule[] = await fetchAPI(`/reservas/logs/${id}`, 'GET');
    return data;
  }
  catch
  {
    return [];
  }
}

export async function createScheduleLog(date: string, start: string, end: string, id: number): Promise<boolean>
{
  try
  {
    await fetchAPI(`/reservas/logs`, 'POST', { reservaId: id, inicio: start, fim: end });
    return true;
  }
  catch
  {
    return false;
  }
}
