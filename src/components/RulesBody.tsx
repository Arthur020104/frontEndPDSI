import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, StyleProp, TextStyle, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from './Card';
import { formatDate } from './OccurrenceBody';
import { fetchAPI } from '../screens/services/api';

type Rule = 
{
  str: string;
  date: string;
  creator: string;
};

type BackendResponse = Rule[];


async function fetchRules(): Promise<BackendResponse>
{
  const data = await fetchAPI('/rules');
  const rules: BackendResponse = [];
  for(const item of data)
  {
    rules.push({
      str: item.descricao,
      date: formatDate(item.created_at),
      creator: item.user?.username || 'NONE'
    });
  }
  return rules;
}
async function createRule(desc: string): Promise<boolean>
{
  try
  {
    await fetchAPI('/rules', 'POST', { descricao: desc });
    return true;
  }
  catch (error)
  {
    Alert.alert('Erro', 'Não foi possível criar a regra');
    console.error('Error creating rule:', error);
    return false;
  }
}


interface RulesBodyProps 
{
  styleTitle?: StyleProp<TextStyle>;
  isSyndic: boolean;
}
export type RulesBodyHandle = { openCreateModal: () => void };

export const RulesBody = forwardRef<RulesBodyHandle, RulesBodyProps>(function RulesBody({ styleTitle, isSyndic }, ref)
{
  const [rules, setRules] = useState<Rule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newDesc, setNewDesc] = useState('');


  const loadData = async () =>
  {
    const data = await fetchRules();
    setRules(data);
  };
  useEffect(() =>
  {
    loadData();
  }, []);

  async function handleAddRule()
  {
    const desc = newDesc.trim();
    if (!desc)
    {
      Alert.alert('Atenção', 'Descreva a nova regra.');
      return;
    }
    
    const success = createRule(desc);
    if (!success) return;
    setNewDesc('');
    setShowModal(false);

    loadData();
  }

  useImperativeHandle(ref, () =>
  ({
    openCreateModal()
    {
      if (isSyndic) setShowModal(true);
    }
  }));

  return (
    <View style={styles.container}>

      <Text style={[styles.title, styleTitle]}>Regras do Condomínio</Text>

      {rules.map((rule, index) => (
        
        <Card key={index} title={`Regra #${index + 1}`}>
          <View style={styles.ruleContent}>
            <Text style={styles.ruleText}>"{rule.str}"</Text>
            <Text style={styles.ruleMeta}>
              Criado por: {rule.creator} em {rule.date}
            </Text>
          </View>
        </Card>
      ))
      }

      {isSyndic && (
        <Modal
          visible={showModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Nova regra</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Descrição da regra"
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalButton, styles.btnCancel]} onPress={() => setShowModal(false)}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.btnPrimary]} onPress={handleAddRule}>
                  <Text style={styles.modalButtonTextPrimary}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
});


const styles = StyleSheet.create(
{
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
  ruleContent: 
  {
    paddingVertical: 4,
  },
  ruleText: 
  {
    fontSize: 15,
		color: '#333',
		lineHeight: 22,
		textAlign: 'center',
		padding: 6,
    fontStyle: 'italic',
  },
  ruleMeta: 
  {
    fontSize: 12,
    color: '#777',
    marginTop: 12,
    textAlign: 'right',
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

export default RulesBody;