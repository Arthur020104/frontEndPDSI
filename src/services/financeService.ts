import { Alert } from 'react-native';
import { fetchAPI } from './api';
import { formatDate } from '../utils/formatDate';

export type Installment =
{
  id: number | string;
  code: string;
  installmentStatus: 'Pago' | 'Pendente' | 'Atrasado';
  totalValue: number;
  dueDate: string;
  datePaid: string | null;
};

export async function fetchInstallments(): Promise<Installment[]>
{
  const data = await fetchAPI('/financeiro');
  const installments: Installment[] = [];
  for (const item of data)
  {
    installments.push({
      id: item.id ?? `${item.code}-${item.vencimento}`,
      code: item.code,
      installmentStatus: item.pago_em ? 'Pago' : (new Date(item.vencimento) < new Date() ? 'Atrasado' : 'Pendente'),
      totalValue: (item.valor || 0),
      dueDate: formatDate(item.vencimento),
      datePaid: item.pago_em ? formatDate(item.pago_em) : null
    });
  }
  return installments;
}

export async function createFinanceCharge(code: string, value: number, dueDate: string, scope: 'all' | 'single', userId?: number): Promise<boolean>
{
  try
  {
    const payload: Record<string, unknown> = { code, valor: value, vencimento: dueDate };
    if (scope === 'single' && userId) { payload.user_id = userId; }
    await fetchAPI(scope === 'single' ? '/financeiro' : '/financeiro/all', 'POST', payload);
    return true;
  }
  catch (e: any)
  {
    Alert.alert('Erro', e?.message || 'Não foi possível criar a cobrança');
    return false;
  }
}

export async function payCharge(id: number): Promise<boolean>
{
  try
  {
    await fetchAPI(`/financeiro/${id}`, 'PUT');
    Alert.alert('Sucesso', 'Cobrança paga com sucesso');
    return true;
  }
  catch (e: any)
  {
    Alert.alert('Erro', e?.message || 'Não foi possível realizar o pagamento');
    return false;
  }
}
