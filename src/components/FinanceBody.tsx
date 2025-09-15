import React, { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, StyleProp, TextStyle, TouchableOpacity, Modal, TextInput, Alert, Pressable } from 'react-native';
import { Card } from './Card';
import { fetchAPI } from '../screens/services/api'; 
import { formatDate } from './OccurrenceBody';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Locale for calendar
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev.','Mar.','Abr.','Mai.','Jun.','Ago.','Set.','Out.','Nov.','Dez.'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom.','Seg.','Ter.','Qua.','Qui.','Sex.','Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';
type Installment =
{
  id: number | string;
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
    id: item.id ?? `${item.code}-${item.vencimento}`,
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
async function createFinanceCharge(code: string, value: number, dueDate: string, scope: 'all' | 'single', userId?: number): Promise<boolean>  
{
  try
  {
    const payload: any = { code: code, valor: value, vencimento: dueDate};
    if (scope === 'single' && userId) { payload.user_id = userId; }
    await fetchAPI( scope == 'single'? '/financeiro' : '/financeiro/all', 'POST', payload);
    return true;
  }
  catch (e: any)
  {
    Alert.alert('Erro', e?.message || 'Não foi possível criar a cobrança');
    console.error(e);
    return false;
  }
}
async function payCharge(id: number): Promise<boolean>
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
    console.error(e);
    return false;
  }
}
function onBrazilianStandard(value: string): boolean
{
  const regex = /^(?!0\.000)(?:\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{1,2})?$/;
  return regex.test(value);
}
function toNumberFromBrazilianStandard(value: string): number
{
  // Remove all dots and replace comma with dot
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}
interface FinanceBodyProps
{
  styleTitle?: StyleProp<TextStyle>;
  isSyndic: boolean;
}
export type FinanceBodyHandle = { openCreateModal: () => void };

export const FinanceBody = forwardRef<FinanceBodyHandle, FinanceBodyProps>(function FinanceBody({ styleTitle, isSyndic }, ref)
{
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [codeDropdownOpen, setCodeDropdownOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [valueInput, setValueInput] = useState<string>('');
  const [dueDateInput, setDueDateInput] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [allCondo, setAllCondo] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>('');

  const loadData = async () =>
  {
    const data = await fetchInstallments();
    setInstallments(data);
  };

  useEffect(() => { (async () => { await loadData(); })(); }, []);

  useImperativeHandle(ref, () => ({
    openCreateModal() { if (isSyndic) setShowModal(true); }
  }));

  const codeOptions = useMemo(() => ['EXTRA', 'CONDO', 'EVEN'], []);

  useEffect(() =>
  {
    if (!selectedCode) { setSelectedCode('CONDO'); }
  }, [selectedCode]);

  const codeLabels: Record<string, string> = 
  {
    EXTRA: 'EXTRA | parcelas adicionais não previstas',
    CONDO: 'CONDO | parcelas usuais',
    EVEN: 'EVEN | parcelas de eventos',
  };
  const selectedCodeLabel = codeLabels[selectedCode] || 'Selecione';

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
        .map((inst, index) => (
          <Card key={`${inst.code}-${inst.dueDate}-${index}`} title={`Parcela: ${inst.code}`}>
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
            <View style={styles.rightColumn}>
              <View style={[styles.statusBadge, styles[`status${inst.installmentStatus}`]]}>
                <Text style={styles.statusText}>{inst.installmentStatus}</Text>
              </View>
              {inst.installmentStatus !== 'Pago' && (
                <Pressable
                  onPress={async () => {
                    const success = await payCharge(inst.id as number);
                    if(success) await loadData();
                  }}
                style={({ pressed }) => [styles.payButton, pressed && styles.payButtonPressed]}
              >
                {({ pressed }) => (
                  <Text style={[styles.payButtonText, pressed && styles.payButtonTextPressed]}>Pagar</Text>
                )}
              </Pressable>)}
            </View>
          </View>
        </Card>
      ))}

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nova cobrança</Text>

            <Text style={styles.inputLabel}>Código da parcela</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setCodeDropdownOpen(v => !v)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownText}>{selectedCodeLabel}</Text>
              <Icon name={codeDropdownOpen ? 'chevron-up' : 'chevron-down'} size={22} color="#555" />
            </TouchableOpacity>
            {codeDropdownOpen && (
              <View style={styles.dropdownList}>
        {codeOptions.map((code) => (
                  <TouchableOpacity
                    key={code}
                    style={styles.dropdownItem}
                    onPress={() => { setSelectedCode(code); setCodeDropdownOpen(false); }}
                  >
          <Text style={styles.dropdownItemText}>{codeLabels[code]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.inputLabel}>Valor</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: 100,00"
              keyboardType="numeric"
              value={valueInput}
              onChangeText={setValueInput}
            />
            <Text style={styles.inputLabel}>Data de vencimento</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowCalendar(v => !v)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownText}>{dueDateInput || 'Escolher data'}</Text>
              <Icon name={showCalendar ? 'calendar' : 'calendar-outline'} size={20} color="#555" />
            </TouchableOpacity>
            {showCalendar && (
              <Calendar
                style={styles.calendar}
                onDayPress={(day) => 
                {
                  if (day?.dateString) 
                  {
                    setDueDateInput(day.dateString);
                    setShowCalendar(false);
                  }
                }}
                markedDates={dueDateInput ? { [dueDateInput]: { selected: true, selectedColor: '#0058A3' } } : {}}
                minDate={new Date().toISOString().split('T')[0]}
                theme={{
                  calendarBackground: '#ffffff',
                  todayTextColor: '#0058A3',
                  dayTextColor: '#4e4e4e',
                  textDisabledColor: '#d9e1e8',
                  arrowColor: '#003868',
                  monthTextColor: '#0058A3',
                  indicatorColor: '#0058A3',
                  textDayFontWeight: '500',
                  textMonthFontWeight: '600',
                  textDayHeaderFontWeight: '400',
                }}
              />
            )}

            <TouchableOpacity style={styles.checkboxRow} onPress={() => setAllCondo(v => !v)}>
              <Icon
                name={allCondo ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={22}
                color={allCondo ? '#0058A3' : '#555'}
              />
              <Text style={styles.checkboxLabel}>Todo condomínio</Text>
            </TouchableOpacity>
            {!allCondo && (
              <TextInput
                style={styles.input}
                placeholder="ID do usuário"
                keyboardType="numeric"
                value={userId}
                onChangeText={setUserId}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.btnCancel]} onPress={() => setShowModal(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.btnPrimary]}
                onPress={async () =>
                {
                  if (!selectedCode || !dueDateInput || !valueInput) 
                  {
                    Alert.alert('Aviso', 'Preencha código, valor e vencimento.');
                    return;
                  }
                  if (!onBrazilianStandard(valueInput))
                  {
                    Alert.alert('Aviso', 'Valor em formato inválido para o padrão brasileiro.');
                    return;
                  }
                  const transformedValue = toNumberFromBrazilianStandard(valueInput);
                  const ok = await createFinanceCharge(selectedCode, transformedValue, dueDateInput, allCondo ? 'all' : 'single', allCondo ? undefined : parseInt(userId));
                  if (ok) 
                  {
              
                    setShowModal(false);
                    setValueInput('');
                    setDueDateInput('');
                    setAllCondo(true);
                    setUserId('');
                    await loadData();
                  }
                }}
              >
                <Text style={styles.modalButtonTextPrimary}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

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
  inputLabel:
  {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    marginTop: 8,
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
    height: 24,
    marginLeft: 12,
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
  rightColumn:
  {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  payButton:
  {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0058A3',
    backgroundColor: '#fff',
  },
  payButtonPressed:
  {
    backgroundColor: '#0058A3',
  },
  payButtonText:
  {
    color: '#0058A3',
    fontSize: 12,
    fontWeight: '600'
  },
  payButtonTextPressed:
  {
    color: '#fff',
    fontWeight: '600'
  },
  // Modal styles (reused pattern)
  modalOverlay:
  {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCard:
  {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16
  },
  modalTitle:
  {
    fontSize: 18,
    fontWeight: '600',
    color: '#0058A3',
    marginBottom: 8
  },
  input:
  {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#fff',
    marginBottom: 10
  },
  modalActions:
  {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8
  },
  modalButton:
  {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1
  },
  btnCancel:
  {
    borderColor: '#ddd',
    marginRight: 10
  },
  btnPrimary:
  {
    backgroundColor: '#0058A3',
    borderColor: '#0058A3'
  },
  modalButtonText:
  {
    color: '#333',
    fontSize: 14
  },
  modalButtonTextPrimary:
  {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  dropdown:
  {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#fff',
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dropdownText: { color: '#333', fontSize: 14, flex: 1, marginRight: 8 },
  dropdownList:
  {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
    overflow: 'hidden'
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10 },
  dropdownItemText: { fontSize: 14, color: '#333' },
  checkboxRow:
  {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6
  },
  checkboxLabel: { marginLeft: 8, color: '#333' }
  ,
  calendar:
  {
    zIndex: 100,
    elevation: 10,
    borderRadius: 8,
    marginTop: 6,
    backgroundColor: '#fff',
    alignSelf: 'stretch',
  }
});

export default FinanceBody;