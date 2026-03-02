import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createCondominium, linkCondominium } from '../services/condominiumService';
import { InputField } from '../components/InputField';

export default function LinkCondominiumScreen()
{
  const navigation = useNavigation<any>();
  const [condominiumToken, setCondominiumToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

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
      setUserData(JSON.parse(userString));
    };
    loadUserData();
  }, [navigation]);

  const handleLink = async () =>
  {
    if (!condominiumToken.trim() || loading) { return; }

    try
    {
      setLoading(true);
      let linkData = null;

      try
      {
        const result = await linkCondominium(userData.token, condominiumToken);
        linkData = result;
        Alert.alert('Sucesso', 'Condomínio vinculado com sucesso!');
      }
      catch
      {
        if (userData.role === 'syndic')
        {
          const created = await createCondominium(condominiumToken);
          await new Promise<void>(resolve =>
          {
            Alert.alert(
              'Sucesso',
              `Condomínio criado com sucesso!\nNão esqueça de salvar o token: ${created.condominium.token}`,
              [{ text: 'OK', onPress: () => resolve() }],
              { cancelable: false }
            );
          });
          const result = await linkCondominium(userData.token, created.condominium.token);
          linkData = result;
        }
        else
        {
          Alert.alert('Erro', 'Token inválido ou erro ao conectar ao servidor.');
        }
      }

      if (linkData)
      {
        const updatedUser = {
          ...userData,
          condominium: linkData.condominium,
          condominium_token: linkData.condominium.token.trim().toUpperCase()
        };
        await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
        navigation.navigate('Home');
      }
    }
    catch (err: any)
    {
      Alert.alert('Erro', err?.message || 'Não foi possível conectar ao servidor');
    }
    finally
    {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>
            Vincular Condomínio {userData?.role === 'syndic' ? 'Ou Criar' : ''}
          </Text>
          <Text style={styles.subtitle}>
            Informe o token fornecido pelo síndico {userData?.role === 'syndic' ? 'Ou digite nome do condomínio para criar' : ''}
          </Text>

          <InputField
            iconName='key'
            placeholder='Ex: COND-007'
            value={condominiumToken}
            onChangeText={setCondominiumToken}
            autoCapitalize='characters'
          />

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
    backgroundColor: '#f9f9f9'
  },
  title:
  {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    alignSelf: 'center',
    color: '#2c3e50'
  },
  subtitle:
  {
    fontSize: 16,
    marginBottom: 20,
    alignSelf: 'center',
    color: '#7f8c8d',
    textAlign: 'center'
  },
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
    elevation: 3
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerLink:
  {
    marginTop: 15,
    alignSelf: 'center'
  },
  registerText:
  {
    color: '#2980b9',
    fontSize: 16,
    fontWeight: 'bold'
  }
});


