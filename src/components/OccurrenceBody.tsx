import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Image, StyleProp, TextStyle, TouchableOpacity, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from './Card';
import { fetchAPI } from '../services/api';
import { formatDate } from '../utils/formatDate';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OccurrenceUser = {
	id: number;
	username: string;
	email: string;
	avatarUrl?: string;
};

type OccurrenceItem = {
	id: number;
	user_id: number;
	condominium_id: number;
	titulo: string;
	descricao: string;
	status: string;
	created_at: string;
	updated_at: string;
	user: OccurrenceUser;
  chatMessages?: chatMessage[];
};
type chatMessage = {
  id: number;
  content: string;
  sender: number;
  dateTime: string;
};
type BackendResponse = OccurrenceItem[];

const FALLBACK_AVATAR = 'https://static.vecteezy.com/system/resources/previews/036/594/092/non_2x/man-empty-avatar-photo-placeholder-for-social-networks-resumes-forums-and-dating-sites-male-and-female-no-photo-images-for-unfilled-user-profile-free-vector.jpg';

async function fetchOccurrences(): Promise<BackendResponse>
{
	const data = await fetchAPI('/ocorrencias');
	return data;
}
async function createOccurrence(title: string, description: string): Promise<OccurrenceItem | null>
{
	try
	{
		const data: OccurrenceItem = await fetchAPI('/ocorrencias', 'POST', { titulo: title, descricao: description });
		return data;
	}
	catch (err: any)
	{
		Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
		console.error(err);
		return null;
	}
}
async function deleteOccurrence(id: number): Promise<void>
{
	try
	{
		await fetchAPI(`/ocorrencias/${id}`, 'DELETE');
	}
	catch (err: any)
	{
		Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
		console.error(err);
	}
}
const occurrenceStatusColors: { [key: string]: string } = {
  'aberto': '#a25200', 
  'em andamento': '#007BFF', 
  'resolvido': '#28a745', 
  'vazio': '#6c757d' 
}
const occurrenceStatusOrder: string[] = ['aberto', 'em andamento', 'resolvido'];
async function setOccurrenceStatus(id: number, status: string): Promise<void>
{
  try
  {
    await fetchAPI(`/ocorrencias/${id}`, 'PUT', {status: status});
  }
  catch (err: any)
  {
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
    console.error(err);
  }
}
async function disableOcurrence(id: number): Promise<void>
{
	try
	{
		await fetchAPI(`/ocorrencias/${id}`, 'PUT', {status: "resolvido"});
	}
	catch (err: any)
	{
		Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
		console.error(err);
	}
}
async function getMessages(occurrenceId: number): Promise<chatMessage[]>
{
  try
  {
    const data: chatMessage[] = await fetchAPI(`/ocorrencias/chat/${occurrenceId}`);
    console.log(JSON.stringify(data));
    return data;
  }
  catch (err: any)
  {
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
    console.error(err);
    return [];
  }
}
async function sendMessage(occurrenceId: number, content: string, senderId: number): Promise<null>
{
  try
  {
    await fetchAPI(`/ocorrencias/chat/${occurrenceId}`, 'POST', { content: content, senderId: senderId });
    return null;
  }
  catch (err: any)
  {
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
    console.error(err);
    return null;
  }
}


interface OccurrenceBodyProps
{
  styleTitle?: StyleProp<TextStyle>;
  isSyndic?: boolean;
  currentUserId: number;
}
export type OccurrenceBodyHandle = { openCreateModal: () => void };

export const OccurrenceBody = forwardRef<OccurrenceBodyHandle, OccurrenceBodyProps>(function OccurrenceBody({ styleTitle, isSyndic, currentUserId }, ref)
{
	const [items, setItems] = useState<OccurrenceItem[]>([]);
	const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [followUpModalId, setFollowUpModalId] = useState<number | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState('');
  
	
  const loadChatMessages = async (occurrenceId: number) =>
  {
    const data = await getMessages(occurrenceId);
    return data;
  };
  const loadData = async () => 
  {
    const data = await fetchOccurrences();
    const itemsWithMessages = await Promise.all(
      data.map(async (item) => 
      {
        const messages = await loadChatMessages(item.id);
        return { ...item, chatMessages: messages };
      })
    );
    setItems(itemsWithMessages);
  };

  useEffect(() =>
  {
    let interval: NodeJS.Timeout;
    if (followUpModalId !== null)
    {
      interval = setInterval(() =>
      {
        loadData();
      }, 1000);
    }
    return () =>
    {
      if (interval) clearInterval(interval);
    };
  }, [followUpModalId]);
  
	useEffect(() =>
	{	
		loadData();
	}, []);

    useImperativeHandle(ref, () => ({
      openCreateModal() { setShowModal(true); }
    }));
    
  const currentUserOccurrence = items.find(item => item.user_id === currentUserId);
  const currentChatMessages = Array.isArray(currentUserOccurrence?.chatMessages) ? currentUserOccurrence.chatMessages : [];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, styleTitle]}>Ocorrências</Text>

      {items.map((item, index) => {
    const isFollowUpVisible = followUpModalId === item.id;
    return (
      <React.Fragment key={item.id ?? index}>
      <Card
        title={
        <View style={styles.headerRow}>
          <Text style={styles.cardTitleText} numberOfLines={1} ellipsizeMode="tail">{item.titulo}</Text>
          {isSyndic && (
          <TouchableOpacity
            onPress={async () => {
            await deleteOccurrence(item.id);
            loadData();
            }}
          >
            <Icon name="trash-can-outline" size={20} color="#E53935" />
          </TouchableOpacity>
          )}
          {(item.user_id === currentUserId || isSyndic) && (
          <TouchableOpacity
            onPress={() => {
            setFollowUpModalId(item.id);
            setFollowUpMessage('');
            }}
            style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#3967ffff', borderRadius: 6 }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600' }}>Acompanhar ocorrencia</Text>
          </TouchableOpacity>
          )}
        </View>
        }
      >
        <View>
        <Text style={styles.text}>{item.descricao}</Text>
        <View style={styles.footerRow}>
          <Image
          source={{ uri: item.user?.avatarUrl || FALLBACK_AVATAR }}
          style={styles.avatar}
          />
          <Text style={styles.meta}>
          Por {item.user?.username ?? 'Usuário'} em {formatDate(item.created_at)}
          </Text>
        </View>
        </View>
      </Card>

      <Modal
        visible={isFollowUpVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
        setFollowUpModalId(null);
        setFollowUpMessage('');
        }}
      >
        <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={styles.modalTitle}>Acompanhar Ocorrência</Text>
            <TouchableOpacity
            onPress={() => {
            setFollowUpModalId(null);
            setFollowUpMessage('');
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
            <Icon name="close" size={20} color="#0058A3" />
            </TouchableOpacity>
            </View>
          
            <TouchableOpacity
            style={{ 
            paddingVertical: 10, 
            paddingHorizontal: 14, 
            borderRadius: 8, 
            borderWidth: 1, 
            backgroundColor: item.status ? occurrenceStatusColors[item.status]: occurrenceStatusColors['vazio'],
            borderColor: item.status ? occurrenceStatusColors[item.status]: occurrenceStatusColors['vazio'],
            marginBottom: 12
            }}
            disabled={!isSyndic}
            onPress={async () => {
            if (!isSyndic) return;
            const oldStatusIndex = item.status ? occurrenceStatusOrder.indexOf(item.status) : -1;

            const newStatusIndex = oldStatusIndex + 1 < occurrenceStatusOrder.length ? oldStatusIndex + 1 : 0;

            const newStatus = occurrenceStatusOrder[newStatusIndex];
            

            await setOccurrenceStatus(item.id, newStatus);
            loadData();
            }
          }>
            <Text style={{ color: '#fff' }}> 
            <Text style={{ fontWeight: '600' }}> Status: </Text> {item.status ?? 'vazio'}
            </Text>
            </TouchableOpacity>
       
          {Array.isArray(item.chatMessages) && item.chatMessages.length > 0 ? (
          item.chatMessages.map(msg => (
            <View key={msg.id} style={styles.chatMessage}>
            <Text style={styles.chatUser}>{msg.sender === currentUserId ? 'Você' : isSyndic ? 'Usuário' : 'Síndico'}:</Text>
            <Text style={styles.chatText}>{msg.content}</Text>
            </View>
          ))
          ) : (
          <Text style={styles.chatText}>Nenhuma mensagem ainda.</Text>
          )}
          <TextInput
          style={styles.input}
          placeholder="Adicionar comentário..."
          multiline
          value={followUpMessage}
          onChangeText={setFollowUpMessage}
          />
          <TouchableOpacity
          style={[styles.modalButton, styles.btnPrimary]}
          onPress={async () => {
            if (!followUpMessage.trim()) { return; }
            await sendMessage(item.id, followUpMessage.trim(), currentUserId);
            setFollowUpMessage('');
            loadData();
          }}
          >
          <Text style={styles.modalButtonTextPrimary}>Enviar</Text>
          </TouchableOpacity>
        </View>
        </View>
      </Modal>
      </React.Fragment>
    );
    })}

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nova ocorrência</Text>
            <TextInput
              style={styles.input}
              placeholder="Título"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Descrição"
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.btnCancel]} onPress={() => setShowModal(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.btnPrimary]}
                onPress={() =>
                {
                  createOccurrence(newTitle, newDesc).then(newItem =>
                  {
                    if (newItem)
                    {
                      loadData();
                    }
                  });
                  setNewTitle('');
                  setNewDesc('');
                  setShowModal(false);
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

const styles = StyleSheet.create(
{
  container:
  {
      width: '100%'
  },
  title:
  {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0058A3'
  },
  footerRow:
  {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    width: '100%'
  },
  footerText:
  {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12
  },
  avatar:
  {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: '#0058A3'
  },
  text:
  {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    textAlign: 'center',
    padding: 6
  },
  meta:
  {
    fontSize: 12,
    color: '#777',
    textAlign: 'left'
  },
  headerRow:
  {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%'
  },
  cardTitleText:
  {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8
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
    fontSize: 18,
    fontWeight: '600',
    color: '#0058A3',
    marginBottom: 12
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
  textarea:
  {
    height: 110,
    textAlignVertical: 'top'
  },
  cardInner:
  {
    position: 'relative'
  },
  deleteBtn:
  {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 6
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
  chatContainer:
  {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 12
  },
  chatTitle:
  {
    fontSize: 14,
    fontWeight: '600',
    color: '#0058A3',
    marginBottom: 12
  },
  chatMessage:
  {
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0058A3'
  },
  chatUser:
  {
    fontSize: 13,
    fontWeight: '600',
    color: '#0058A3',
    marginBottom: 4
  },
  chatText:
  {
    fontSize: 13,
    color: '#333',
    lineHeight: 18
  }
});

