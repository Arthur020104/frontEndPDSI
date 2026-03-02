import { Alert } from 'react-native';
import { fetchAPI } from './api';
import { formatDate } from '../utils/formatDate';

export type Rule =
{
  id: number;
  str: string;
  date: string;
  creator: string;
};

export async function fetchRules(): Promise<Rule[]>
{
  const data = await fetchAPI('/rules');
  const rules: Rule[] = [];
  for (const item of data)
  {
    rules.push({
      id: item.id,
      str: item.descricao,
      date: formatDate(item.created_at),
      creator: item.user?.username || 'NONE'
    });
  }
  return rules;
}

export async function createRule(desc: string): Promise<boolean>
{
  try
  {
    await fetchAPI('/rules', 'POST', { descricao: desc });
    return true;
  }
  catch (error: any)
  {
    Alert.alert('Erro', 'Não foi possível criar a regra');
    return false;
  }
}

export async function deleteRule(id: number): Promise<boolean>
{
  try
  {
    await fetchAPI(`/rules/${id}`, 'DELETE');
    return true;
  }
  catch (error: any)
  {
    Alert.alert('Erro', 'Não foi possível deletar a regra');
    return false;
  }
}
