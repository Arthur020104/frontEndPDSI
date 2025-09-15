import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchAPI } from '../screens/services/api';

export type NoticesBodyHandle = { openCreateModal: () => void };

type Notice = {
  id: number;
  title: string;
  message: string;
  date: string;
  creator: string;
};

interface NoticesBodyProps {
  styleTitle?: any;
  isSyndic: boolean;
  filter?: 'all' | 'today';
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
};

export const NoticesBody = forwardRef<NoticesBodyHandle, NoticesBodyProps>(
  ({ styleTitle, isSyndic, filter = 'all' }, ref) => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newMessage, setNewMessage] = useState('');

    const loadData = async () => {
      try {
        const data: any[] = await fetchAPI('/notices');
        let list: Notice[] = data.map((item) => ({
          id: item.id,
          title: item.titulo || '(Sem título)',
          message: item.descricao,
          date: formatDate(item.created_at),
          creator: item.user?.username || 'Desconhecido',
        }));
        list.reverse();

        if (filter === 'today') {
          const today = new Date().toLocaleDateString('pt-BR');
          list = list.filter((n) => n.date === today);
        }

        setNotices(list);
      } catch (error) {
        console.error('Erro ao carregar avisos', error);
      }
    };

    useEffect(() => { loadData(); }, [filter]);

    const handleAddNotice = async () => {
      if (!newTitle.trim() || !newMessage.trim()) {
        Alert.alert('Erro', 'Preencha título e mensagem');
        return;
      }

      try {
        await fetchAPI('/notices', 'POST', { titulo: newTitle, descricao: newMessage });
        setNewTitle('');
        setNewMessage('');
        setShowModal(false);
        loadData();
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível criar o aviso');
      }
    };

    useImperativeHandle(ref, () => ({
      openCreateModal: () => { if (isSyndic) setShowModal(true); },
    }));

    return (
      <View style={styles.container}>
        <Text style={[styles.title, styleTitle]}>Avisos do Condomínio</Text>

        <FlatList
          data={notices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {isSyndic && (
                  <TouchableOpacity
                    onPress={async () => {
                      await fetchAPI(`/notices/${item.id}`, 'DELETE');
                      loadData();
                    }}
                  >
                    <Icon name="trash-can-outline" size={22} color="#E53935" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.cardMessage}>{item.message}</Text>
              <Text style={styles.cardDate}>
                Criado por: {item.creator} em {item.date}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum aviso disponível</Text>}
        />

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
      </View>
    );
  }
);

export default NoticesBody;

const styles = StyleSheet.create({
  container: { width: '100%', paddingBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#0058A3' },
  card: { marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: '#f0f4f8', elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  cardMessage: { fontSize: 15, color: '#333', lineHeight: 22, paddingVertical: 4 },
  cardDate: { fontSize: 12, color: '#777', textAlign: 'right', marginTop: 4 },
  empty: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 20 },
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
