import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { Card } from './Card';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { getImageUrl } from '../screens/services/api';
import { fetchAPI } from '../screens/services/api';

LocaleConfig.locales['pt-br'] =
{
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan.','Fev.','Mar.','Abr.','Mai.','Jun.','Ago.','Set.','Out.','Nov.','Dez.'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom.','Seg.','Ter.','Qua.','Qui.','Sex.','Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export interface ReservationCardProps
{
  id: number;
  nome: string;
  image_id: number;
  descricao: string;
  currentUserId: number;
}

type Schedule = { id: number; inicio: string; fim: string; user_id: number; reserva_id: number; username: string; };

async function fetchReservationLogs(id: number): Promise<Schedule[]>
{
  try
  {
    const data: Schedule[] = await fetchAPI(`/reservas/logs/${id}`, 'GET');
    return data;
  }
  catch (err: any)
  {
    console.error('Error fetching reservations:', err);
    return [];
  }
}
async function createScheduleLog(date: string, start: string, end: string, id: number): Promise<boolean>
{
  console.log(`Creating schedule on ${date} from ${start} to ${end} for card ${id}`);
  try
  {
    await fetchAPI(`/reservas/logs`, 'POST', { reservaId: id, inicio: start, fim: end });
    return true;
  }
  catch (err: any)
  {
    console.error('Error creating schedule:', err);
    return false;
  }
}
function dateKey(iso: string): string
{
  return new Date(iso).toLocaleDateString('sv').split(' ')[0];
}

export function ReservationCard(props: ReservationCardProps)
{
  const { nome, image_id, descricao, id} = props;
  
  const [showCal, setShowCal] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [marks, setMarks] = useState<{[k: string]: any}>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [dayItems, setDayItems] = useState<Schedule[]>([]);
  const [adding, setAdding] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const loadData = async () =>
  {
    const data = await fetchReservationLogs(id);
    setSchedules(data);
    
    const grouped: Record<string, Schedule[]> = {};
    for (const s of data)
    {
      const k = dateKey(s.inicio);
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(s);
    }
    
    const m: {[k: string]: any} = {};
    for (const [k, arr] of Object.entries(grouped))
    {
      const number = 15;;
      const hasId = arr.some(x => x.user_id === number);
      if (hasId)
      {
        m[k] = 
        {
          markingType: 'custom',
          customStyles:
          {
            container: { backgroundColor: '#0058A3', elevation: 2 },
            text: { color: '#fff', fontWeight: 'bold' }
          }
        };
      }
    }
    setMarks(m);
  }
  useEffect(() => 
  {
    loadData();
  }, []);
  
  function onDayPress(day: { dateString?: string })
  {
    const d = day?.dateString;
    if (!d) { return; }
    const filtered = schedules.filter(s => dateKey(s.inicio) === d);
    setDayItems(filtered);
    setModalDate(d);
    setModalOpen(true);
    setAdding(false);
    setStartTime('');
    setEndTime('');
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <Card title={nome}>
    <View style={styles.container}>
    <Image source={{ uri: getImageUrl(image_id) }} style={styles.image} />
    <View style={styles.contentContainer}>
    <Text style={styles.description}>{descricao}</Text>
    </View>
    <TouchableOpacity style={styles.calendarIconContainer} onPress={() => setShowCal(v => !v)}>
    <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/55/55281.png' }} style={styles.calendarIcon} />
    </TouchableOpacity>
    </View>
    
    {showCal && (
      <Calendar
      style={styles.calendarOverlay}
      markingType={'custom'}
      markedDates={marks}
      onDayPress={onDayPress}
      minDate={today}
      theme={{
        calendarBackground: '#ffffff',
        textSectionTitleColor: '#b6c1cd',
        todayTextColor: '#0058A3',
        dayTextColor: '#4e4e4e',
        textDisabledColor: '#d9e1e8',
        arrowColor: '#003868',
        monthTextColor: '#0058A3',
        indicatorColor: '#0058A3',
        textDayFontWeight: 'bold',
        textMonthFontWeight: 'bold',
        textDayHeaderFontWeight: '300',
        textDayFontSize: 16,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 16
      }}
      />
    )}
    
    <Modal
    visible={modalOpen}
    transparent
    animationType="fade"
    onRequestClose={() => setModalOpen(false)}
    >
    <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
    <Text style={styles.modalTitle}>Agendamentos em {modalDate}</Text>
    {dayItems.length === 0 ? (
      <Text style={styles.emptyText}>Nenhum agendamento.</Text>
    ) : (
      <FlatList
      data={dayItems}
      keyExtractor={(x) => `${x.id}-${x.inicio}`}
      renderItem={({ item }) => (
        <View style={styles.row}>
        <Text style={styles.cell}>Início: {new Date(item.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.cell}>Fim: {new Date(item.fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.cell}>Usuário: {item.username}</Text>
        </View>
      )}
      />
    )}
    {!adding && (
      <TouchableOpacity style={styles.primaryBtn} onPress={() => setAdding(true)}>
      <Text style={styles.primaryBtnText}>Adicionar horário</Text>
      </TouchableOpacity>
    )}
    {adding && (
      <View style={styles.addBox}>
      <Text style={styles.addTitle}>Novo horário</Text>
      <View style={styles.timesRow}>
      <View style={styles.timeCol}>
      <Text style={styles.timeLabel}>Início (HH:MM)</Text>
      <TextInput
      style={styles.timeInput}
      placeholder="00:00"
      value={startTime}
      onChangeText={setStartTime}
      keyboardType="numeric"
      />
      </View>
      <View style={styles.timeCol}>
      <Text style={styles.timeLabel}>Fim (HH:MM)</Text>
      <TextInput
      style={styles.timeInput}
      placeholder="23:59"
      value={endTime}
      onChangeText={setEndTime}
      keyboardType="numeric"
      />
      </View>
      </View>
      <View style={styles.actionsRow}>
      <TouchableOpacity style={styles.btnOutline} onPress={() => { setAdding(false); setStartTime(''); setEndTime(''); }}>
      <Text style={styles.btnOutlineText}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
      style={styles.primaryBtnRow}
      onPress={() =>
        {
          const rx = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
          if (!rx.test(startTime) || !rx.test(endTime)) { return; }
          const startISO = `${modalDate}T${startTime}:00Z`;
          const endISO = `${modalDate}T${endTime}:00Z`;
          createScheduleLog(modalDate, startISO, endISO, id).then(success => 
          {
          if (success) 
          {
            loadData();
            setModalOpen(false);
          }
          });
          setAdding(false);
          setStartTime('');
          setEndTime('');
        }}
        >
        <Text style={styles.primaryBtnText}>Criar</Text>
        </TouchableOpacity>
        </View>
        </View>
      )}
      <TouchableOpacity style={[styles.btnOutline, { alignSelf: 'flex-end', marginTop: 12 }]} onPress={() => setModalOpen(false)}>
      <Text style={styles.btnOutlineText}>Fechar</Text>
      </TouchableOpacity>
      </View>
      </View>
      </Modal>
      </Card>
    );
  }
  
  const styles = StyleSheet.create(
    {
      container:
      {
        flexDirection: 'row',
        alignItems: 'flex-start',
        position: 'relative'
      },
      image:
      {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginRight: 16
      },
      contentContainer:
      {
        flex: 1,
        justifyContent: 'flex-start'
      },
      description:
      {
        fontSize: 14,
        color: '#555',
        marginBottom: 8
      },
      unavailableTitle:
      {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 4
      },
      calendarOverlay:
      {
        zIndex: 100,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderRadius: 8,
        marginTop: 10,
        backgroundColor: '#fff',
        alignSelf: 'stretch'
      },
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
        fontSize: 16,
        fontWeight: '600',
        color: '#0058A3',
        marginBottom: 10
      },
      emptyText: { color: '#666', textAlign: 'center', paddingVertical: 8 },
      row:
      {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee'
      },
      cell: { fontSize: 13, color: '#333' },
      closeBtn:
      {
        marginTop: 12,
        alignSelf: 'flex-end',
        backgroundColor: '#0058A3',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8
      },
      closeBtnText: { color: '#fff', fontWeight: '600' },
      primaryBtn:
      {
        marginTop: 10,
        alignSelf: 'flex-start',
        backgroundColor: '#0058A3',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8
      },
      primaryBtnText: { color: '#fff', fontWeight: '600' },
      primaryBtnRow:
      {
        alignSelf: 'flex-start',
        backgroundColor: '#0058A3',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8
      },
      addBox:
      {
        marginTop: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10
      },
      addTitle:
      {
        color: '#0058A3',
        fontWeight: '600',
        marginBottom: 8
      },
      timesRow:
      {
        flexDirection: 'row',
        gap: 8
      },
      timeCol:
      {
        flex: 1
      },
      timeLabel:
      {
        fontSize: 12,
        color: '#666',
        marginBottom: 4
      },
      timeInput:
      {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
        backgroundColor: '#fff'
      },
      actionsRow:
      {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10
      },
      btnOutline:
      {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd'
      },
      btnOutlineText: { color: '#333', fontWeight: '600' },
      calendarIconContainer:
      {
        position: 'absolute',
        right: 0,
        bottom: 0,
        padding: 8,
        zIndex: 101
      },
      calendarIcon:
      {
        width: 24,
        height: 24,
        tintColor: '#555'
      }
    });
