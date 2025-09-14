import React, { use, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAPI } from './services/api';

export interface CondominiumCreateData 
{
  message: string;
  condominium: 
  {
    id: number;
    name: string;
    token: string;
    owner_id: number;
  };
}
export interface CondominiumLinkData
{
  message: string;
  user: { id: number };
  condominium: CondominiumCreateData['condominium'];
}


export default function LinkCondominiumScreen()
{
  const navigation = useNavigation<any>();
  const [condominiumToken, setCondominiumToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  async function createCondominium(name: string)
  {
    try
    {
      const data: CondominiumCreateData = await fetchAPI('/condominium/create', 'POST', { name });
      return data;
    }
    catch (err: any)
    {
      Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
    }
  }

  async function linkCondominium(token: string, user: any)
  {
    if (!token.trim())
    {
      return {'state': false, 'linkData': null};
    }
    if (loading) { return {'state': false, 'linkData': null}; }

    try
    {
      setLoading(true);

      const userToken = user.token;
      let data: CondominiumLinkData;
      try
      {
        data = await fetchAPI('/condominios/link', 'POST',
        {
          user_token: userToken,
          condominium_token: token.trim().toUpperCase()
        });
      }
      catch (e: any)
      {
        return {'state': false, 'linkData': null};
      }


      return {'state': true, 'linkData': data};
    }
    catch (err: any)
    {
      
      return {'state': false, 'linkData': null};
    }
    finally
    {
      setLoading(false);

    }
  }

  useEffect(() =>
  {
    const checkIfLinked = async () =>
    {
      const userString = await AsyncStorage.getItem('@user');
      if (userString)
      {
        const user = JSON.parse(userString);
        if (user.condominium_token)
        {
          navigation.navigate('Home');
        }
      }
    };
    checkIfLinked();
  }, [navigation]);

  const handleLink = async () =>
  {
    let { state, linkData } = await linkCondominium(condominiumToken, userData);
    state ? Alert.alert('Sucesso', 'Condomínio vinculado com sucesso!') : Alert.alert('Erro', 'Token inválido ou erro ao conectar ao servidor.');
    if(!state)
    {
      let create = null
      if(userData.role === 'syndic')
      {
        create = await createCondominium(condominiumToken);
        await new Promise<void>(resolve => 
        {
          Alert.alert(
            'Sucesso',
            `Condomínio criado com sucesso! \n Não esqueça de salvar o token: ${create!.condominium.token}`,
            [{ text: 'OK', onPress: () => resolve() }],
            { cancelable: false }
          );
        });
      }
      if(create){ ({ state, linkData } =  await linkCondominium(create!.condominium.token, userData)); }
    }

    if(state && linkData)
    {
      const updatedUser = {
        ...userData,
        condominium: linkData.condominium,
        condominium_token: linkData.condominium.token.trim().toUpperCase()
      };
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
      navigation.navigate('Home');
    }
    
  };
  useEffect(() => 
  {
    const loadUserData = async () => 
    {
      const userString = await AsyncStorage.getItem('@user');
      if (!userString) 
      {
        Alert.alert('Erro', 'Usuário não logado. Faça login novamente.');
        navigation.navigate('Login');
        return;
      }
      const user = JSON.parse(userString);
      setUserData(user);
    };

    loadUserData();
  }, [navigation]);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps='handled'
        >
          <Text style={styles.title}>Vincular Condomínio {userData?.role === "syndic" ? "Ou Criar" : ""}</Text>
          <Text style={styles.subtitle}>Informe o token fornecido pelo síndico {userData?.role === "syndic" ? "Ou digite nome do condomínio para criar" : ""}</Text>

          <View style={styles.inputContainer}>
            <Icon name='key' size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder='Ex: COND-007'
              value={condominiumToken}
              onChangeText={setCondominiumToken}
              autoCapitalize='characters'
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLink}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size='small' color='#ffffff' />
            ) : (
              <Text style={styles.buttonText}>Vincular</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>Voltar</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:
  {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title:
  {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    alignSelf: 'center',
    color: '#2c3e50',
  },
  subtitle:
  {
    fontSize: 16,
    marginBottom: 20,
    alignSelf: 'center',
    color: '#7f8c8d',
  },
  inputContainer:
  {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 50 },
  button:
  {
    backgroundColor: '#2980b9',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerLink:
  {
    marginTop: 15,
    alignSelf: 'center',
  },
  registerText:
  {
    color: '#2980b9',
    fontSize: 16,
    fontWeight: 'bold',
  },
});