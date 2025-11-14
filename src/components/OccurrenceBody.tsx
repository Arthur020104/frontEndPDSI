import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Image, StyleProp, TextStyle, TouchableOpacity, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from './Card';
import { fetchAPI } from '../screens/services/api';
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
export function formatDate(iso: string): string
{
	const d = new Date(iso);
	const dd = String(d.getDate()).padStart(2, '0');
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const yyyy = d.getFullYear();
	return `${dd}/${mm}/${yyyy}`;
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
	const [userData, setUserData] = useState<any>(null);
	const [displayOccurrenceFollowUp, setDisplayOccurrenceFollowUp] = useState(false);
  	
	
  console.log(JSON.stringify(items));
	const loadData = async () => 
	{
		const data = await fetchOccurrences();
		setItems(data);
	};
	useEffect(() =>
	{	
		loadData();
	}, []);

		useImperativeHandle(ref, () => ({
			openCreateModal() { setShowModal(true); }
		}));

	return (
		<View style={styles.container}>
			<Text style={[styles.title, styleTitle]}>Ocorrências</Text>

			{items.map((item, index) => (
				<Card
					key={item.id ?? index}
					title={
						<View style={styles.headerRow}>
							<Text style={styles.cardTitleText} numberOfLines={1} ellipsizeMode="tail">{item.titulo}</Text>
							{isSyndic && (
								<TouchableOpacity onPress={async () => 
								{
									await disableOcurrence(item.id);
									loadData();
                  
								}}>
									<Icon name="trash-can-outline" size={20} color="#E53935" />
								</TouchableOpacity>
							)}
              {item.user_id == currentUserId  && (
                <TouchableOpacity
                  onPress={async () => {
                    setDisplayOccurrenceFollowUp(true);
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
			))}

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
      <Modal
      visible={displayOccurrenceFollowUp}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
      >
      <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>Acompanhar Ocorrência</Text>
      {/* Placeholder for chat interface */}
      <Text style={styles.text}>Situação atual: Em análise pelo síndico.</Text>
      <View style={styles.chatContainer}>
        <Text style={styles.chatTitle}>Comentários:</Text>
        <View style={styles.chatMessage}>
          <Text style={styles.chatUser}>Síndico:</Text>
          <Text style={styles.chatText}>Estamos analisando a ocorrência.</Text>
        </View>
        <View style={styles.chatMessage}>
          <Text style={styles.chatUser}>Usuário:</Text>
          <Text style={styles.chatText}>Obrigado pela atualização.</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Adicionar comentário..."
          multiline
        />
        <TouchableOpacity style={[styles.modalButton, styles.btnPrimary]}>
          <Text style={styles.modalButtonTextPrimary}>Enviar</Text>
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

