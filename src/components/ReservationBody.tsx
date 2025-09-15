import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { View, Text, StyleSheet, StyleProp, TextStyle, Alert, Modal, TouchableOpacity, TextInput, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { ReservationCard, ReservationCardProps } from "./ReservationCard";
import { fetchAPI } from "../screens/services/api";

export type BackendResponse = ReservationCardProps[];

async function fetchReservations(): Promise<BackendResponse> 
{
  try
  {
    const data : BackendResponse = await fetchAPI('/reservas');
    return data;
  }
  catch (err: any)
  {
    console.error('Error fetching reservations:', err);
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
    return [];
  }
  
}
async function createReservation(params: { image: any, name: string, description: string }) 
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

    console.error('Error creating reservation:', err);
    Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
  }
}
interface ReservationBodyProps 
{
  styleTitle?: StyleProp<TextStyle>;
  userId: number;
  isSyndic: boolean;
}
export type ReservationBodyHandle = { openCreateModal: () => void };

export const ReservationBody = forwardRef<ReservationBodyHandle, ReservationBodyProps>(function ReservationBody({ styleTitle , userId, isSyndic }, ref)
{
  const [reservations, setReservations] = useState<ReservationCardProps[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [img, setImg] = useState<{ uri: string, name: string, type: string } | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  
  useEffect(() => 
    {
    fetchReservations().then(setReservations);
  }, []);
  
  useImperativeHandle(ref, () =>
  ({
    openCreateModal()
    {
      if (isSyndic) setShowModal(true);
    }
  }));
  
  async function pickImage()
  {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted)
    {
      Alert.alert('Permissão', 'Conceda acesso às imagens.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.9
    });
    if (result.canceled) { return; }
    const asset = result.assets[0];
    const mime = asset.mimeType || 'image/jpeg';
    const isValidImageType = /^(image\/(jpeg|jpg|png|svg\+xml))$/i.test(mime);
    if (!isValidImageType)
    {
      Alert.alert('Atenção', 'A imagem deve ser jpeg, jpg, png ou svg.');
      return;
    }
    const name = asset.fileName || (`upload.${mime.includes('svg') ? 'svg' : mime.split('/')[1]}`);
    setImg({ uri: asset.uri, name, type: mime });
  }

  async function handleSubmit()
  {
    const n = name.trim();
    const d = desc.trim();
    if (!img || !n || !d)
    {
      Alert.alert('Atenção', 'Selecione uma imagem, preencha nome e descrição.');
      return;
    }
    await createReservation({ image: img as any, name: n, description: d });
    setImg(null);
    setName('');
    setDesc('');
    setShowModal(false);
    const data = await fetchReservations();
    setReservations(data);
    
  }
  
  return (
    <View style={styles.container}>
    <Text style={[styles.title, styleTitle]}>Reservas</Text>
    {reservations.map((reservation, index) => (
      <ReservationCard 
      key={index}
      {...reservation}
      userId={userId}
      />
    ))}
    
    {isSyndic && (
      <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowModal(false)}
      >
      <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>Nova reserva</Text>
      <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} onPress={pickImage}>
      <Text style={{ color: '#666' }}>{img ? img.name : 'Selecionar imagem (jpg, jpeg, png, svg)'}</Text>
      </TouchableOpacity>
      {img && (
        <View style={{ marginBottom: 10 }}>
          <Image source={{ uri: img.uri }} style={{ width: '100%', height: 140, borderRadius: 8 }} resizeMode="cover" />
        </View>
      )}
      <TextInput
      style={styles.input}
      placeholder="Nome"
      value={name}
      onChangeText={setName}
      />
      <TextInput
      style={[styles.input, styles.textarea]}
      placeholder="Descrição"
      value={desc}
      onChangeText={setDesc}
      multiline
      />
      <View style={styles.modalActions}>
      <TouchableOpacity style={[styles.modalButton, styles.btnCancel]} onPress={() => setShowModal(false)}>
      <Text style={styles.modalButtonText}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.modalButton, styles.btnPrimary]} onPress={handleSubmit}>
      <Text style={styles.modalButtonTextPrimary}>Enviar</Text>
      </TouchableOpacity>
      </View>
      </View>
      </View>
      </Modal>
    )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%"
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    color: "#0058A3"
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
  }
});