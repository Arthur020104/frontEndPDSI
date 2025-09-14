import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { Card } from './Card';
import { fetchAPI } from '../screens/services/api'; 
import { formatDate } from './OccurrenceBody';
type Installment =
{
  code: string;
  installmentStatus: 'Pago' | 'Pendente' | 'Atrasado';
  totalValue: number;
  dueDate: string;
  datePaid: string | null;
};

type BackendResponse = Installment[];

async function fetchInstallments(): Promise<BackendResponse>
{
  try
  {
    const data = await fetchAPI('/financeiro');
    const installments: BackendResponse = [];
    for (const item of data)
    {
      installments.push({
        code: item.code,
        installmentStatus: item.pago_em ? 'Pago' : (new Date(item.vencimento) < new Date() ? 'Atrasado' : 'Pendente'),
        totalValue: (item.valor || 0),
        dueDate: formatDate(item.vencimento),
        datePaid: item.pago_em ? formatDate(item.pago_em) : null,
      });
      console.log(item);
    }
    return installments;
  }
  catch (e: any)
  {
    console.error('Erro ao carregar financeiro:', e?.message || e);
    return [];
  }
}

interface FinanceBodyProps
{
  styleTitle?: StyleProp<TextStyle>;
}

export const FinanceBody: React.FC<FinanceBodyProps> = ({ styleTitle }) =>
{
  const [installments, setInstallments] = useState<Installment[]>([]);

  useEffect(() =>
  {
    (async () =>
    {
      const data = await fetchInstallments();
      setInstallments(data);
    })();
  }, []);

  const summary = useMemo(() =>
  {
    const pendingOrLate = installments.filter(
      inst => inst.installmentStatus === 'Pendente' || inst.installmentStatus === 'Atrasado'
    );
    for(let item of installments)
    {
      console.log(item.totalValue);

    }
    const totalPendingValue = pendingOrLate.reduce((sum, inst) => sum + Number(inst.totalValue || 0), 0);
    const isOverdue = pendingOrLate.some(inst => inst.installmentStatus === 'Atrasado');
    console.log(totalPendingValue, isOverdue);
    return {
      totalPendingValue,
      count: pendingOrLate.length,
      isOverdue,
    };
  }, [installments]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, styleTitle]}>Financeiro</Text>

      <Card title="Resumo de Pendências">
        <View style={styles.summaryContainer}>
          <View>
            <Text style={styles.summaryLabel}>Valor Total Pendente</Text>
            <Text style={[styles.summaryValue, summary.isOverdue && styles.summaryValueOverdue]}>
              R$ {summary.totalPendingValue.toString().replace('.', ',')}
            </Text>
          </View>
          <View style={styles.summaryCountContainer}>
            <Text style={styles.summaryCount}>{summary.count}</Text>
            <Text style={styles.summaryCountLabel}>
              {summary.count === 1 ? 'Parcela' : 'Parcelas'}
            </Text>
          </View>
        </View>
      </Card>
      
      {installments
        .slice()
        .sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1))
        .map(inst => (
          <Card key={inst.code} title={`Parcela: ${inst.code}`}>
            <View style={styles.installmentCardContent}>
              <View style={styles.installmentDetails}>
                <View style={styles.installmentRow}>
                <Text style={styles.installmentLabel}>Valor:</Text>
                <Text style={styles.installmentValue}>
                  R$ {inst.totalValue.toString().replace('.', ',')}
                </Text>
              </View>
              <View style={styles.installmentRow}>
                <Text style={styles.installmentLabel}>Data de Vencimento:</Text>
                <Text style={styles.installmentInfo}>{inst.dueDate}</Text>
              </View>
              <View style={styles.installmentRow}>
                <Text style={styles.installmentLabel}>Pagamento:</Text>
                <Text style={styles.installmentInfo}>
                  {inst.datePaid ? inst.datePaid : 'Não realizado'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, styles[`status${inst.installmentStatus}`]]}>
              <Text style={styles.statusText}>{inst.installmentStatus}</Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container:
  {
    width: '100%',
  },
  title:
  {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0058A3',
  },
  summaryContainer:
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel:
  {
    fontSize: 14,
    color: '#666',
  },
  summaryValue:
  {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  summaryValueOverdue:
  {
    color: '#D9534F',
  },
  summaryCountContainer:
  {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  summaryCount:
  {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0058A3',
  },
  summaryCountLabel:
  {
    fontSize: 12,
    color: '#555',
  },
  installmentCardContent:
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  installmentDetails:
  {
    flex: 1,
  },
  installmentRow:
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  installmentLabel:
  {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  installmentValue:
  {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  installmentInfo:
  {
    fontSize: 14,
    color: '#333',
  },
  statusBadge:
  {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24, // Altura fixa para alinhar
    marginLeft: 12, // Espaço entre o texto e o selo
  },
  statusPago: { backgroundColor: '#5CB85C' },
  statusPendente: { backgroundColor: '#F0AD4E' },
  statusAtrasado: { backgroundColor: '#D9534F' },
  statusText:
  {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default FinanceBody;