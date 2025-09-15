import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { 
  View, Text, StyleSheet, StyleProp, TextStyle, 
  TouchableOpacity, Modal, TextInput, Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from './Card';
import { formatDate } from './OccurrenceBody';
import { fetchAPI } from '../screens/services/api';

type Notice = {
  id: number;
  title: string;
  message: string;
  date: string;
  creator: string;
};

type BackendResponseNotice = Notice[];

async function fetchNotices(): Promise<BackendResponseNotice> {
  const data = await fetchAPI('/notices');
  const notices: BackendResponseNotice = [];

  for (const item of data) {
    notices.push({
      id: item.id,
      title: item.titulo || "(Sem título)",
      message: item.descricao,
      date: formatDate(item.created_at),
      creator: item.user?.username || 'Desconhecido',
    });
  }

  return notices;
}

async function createNotice(title: string, message: string): Promise<boolean> {
  try {
    await fetchAPI('/notices', 'POST', { titulo: title, descricao: message });
    return true;
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível criar o aviso');
    console.error('Error creating notice:', error);
    return false;
  }
}

async function deleteNotice(id: number): Promise<boolean> {
  try {
    await fetchAPI(`/notices/${id}`, 'DELETE');
    return true;
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível deletar o aviso');
    console.error('Error deleting notice:', error);
    return false;
  }
}

interface NoticesBodyProps {
  styleTitle?: StyleProp<TextStyle>;
  isSyndic: boolean;
}

export type NoticesBodyHandle = { openCreateModal: () => void };

export const NoticesBody = forwardRef<NoticesBodyHandle, NoticesBodyProps>(
  function NoticesBody({ styleTitle, isSyndic }, ref) {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newMessage, setNewMessage] = useState('');

    const loadData = async () => {
      const data = await fetchNotices();
      setNotices(data.reverse()); // mostra mais recente no topo
    };

    useEffect(() => { loadData(); }, []);

    async function handleAddNotice() {
      const title = newTitle.trim();
      const message = newMessage.trim();
      if (!title || !message) {
        Alert.alert('Atenção', 'Preencha título e mensagem.');
        return;
      }
      const success = await createNotice(title, message);
      if (!success) return;
      setNewTitle('');
      setNewMessage('');
      setShowModal(false);
      loadData();
    }

    useImperativeHandle(ref, () => ({
      openCreateModal() {
        if (isSyndic) setShowModal(true);
      }
    }));

    return (
      <View style={styles.container}>
        <Text style={[styles.title, styleTitle]}>Avisos do Condomínio</Text>

        {notices.length === 0 && (
          <Text style={styles.placeholder}>Nenhum aviso disponível.</Text>
        )}

       {notices.map((notice, index) => (
  <Card
    key={notice.id ?? index}
    style={styles.card}
    title={
      <View style={styles.headerRow}>
        <Text style={styles.cardTitleText} numberOfLines={1} ellipsizeMode="tail">
          {notice.title}
        </Text>
        {isSyndic && (
          <TouchableOpacity 
            onPress={async () => { 
              await deleteNotice(notice.id); 
              loadData(); 
            }}
          >
            <Icon name="trash-can-outline" size={22} color="#E53935" />
          </TouchableOpacity>
        )}
      </View>
    }
  >
    <Text style={styles.messageText}>{notice.message}</Text>
    <Text style={styles.metaText}>
      Criado por: {notice.creator} em {notice.date}
    </Text>
  </Card>
))}

        {isSyndic && (
          <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Novo Aviso</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Título"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Mensagem"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalButton, styles.btnCancel]} onPress={() => setShowModal(false)}>
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.btnPrimary]} onPress={handleAddNotice}>
                    <Text style={styles.modalButtonTextPrimary}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { width: '100%', paddingBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#0058A3' },
  placeholder: { fontSize: 16, textAlign: 'center', color: '#555', marginVertical: 20 },
  card: { marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: '#f0f4f8', elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitleText: { fontSize: 17, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  messageText: { fontSize: 15, color: '#333', lineHeight: 22, paddingVertical: 4 },
  metaText: { fontSize: 12, color: '#777', textAlign: 'right', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0058A3', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 48, backgroundColor: '#fff', marginBottom: 10 },
  textarea: { height: 110, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  btnCancel: { borderColor: '#ddd', marginRight: 10 },
  btnPrimary: { backgroundColor: '#0058A3', borderColor: '#0058A3' },
  modalButtonText: { color: '#333', fontSize: 14 },
  modalButtonTextPrimary: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default NoticesBody;
