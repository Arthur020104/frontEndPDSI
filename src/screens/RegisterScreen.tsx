import React, { useState } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { registerUser } from '../services/authService';
import { InputField } from '../components/InputField';

interface Props
{
  navigation: any;
}

export default function RegisterScreen({ navigation }: Props)
{
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSyndic, setIsSyndic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () =>
  {
    if (!username || !email || !password)
    {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }
    if (loading) { return; }

    try
    {
      setLoading(true);
      await registerUser(username, email, password, isSyndic ? 'syndic' : 'resident');
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      navigation.navigate('Login');
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
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Bem-vindo ao CondoApp</Text>
          <Text style={styles.subtitle}>Registre-se para acessar</Text>

          <InputField
            iconName="account"
            placeholder="Nome de usuário"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="words"
          />

          <InputField
            iconName="email"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <InputField
            iconName="lock"
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.adminRow}>
            <TouchableOpacity
              style={[styles.adminToggle, isSyndic && styles.adminToggleActive]}
              onPress={() => setIsSyndic(!isSyndic)}
              activeOpacity={0.85}
            >
              <Icon name="crown" size={16} color={isSyndic ? '#fff' : '#888'} />
            </TouchableOpacity>
            <Text style={styles.adminLabel}>Sou síndico (admin)</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Registrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>Já tem conta? Login</Text>
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
    color: '#7f8c8d'
  },
  adminRow:
  {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  adminToggle:
  {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  adminToggleActive:
  {
    backgroundColor: '#0058A3',
    borderColor: '#0058A3'
  },
  adminLabel:
  {
    fontSize: 15,
    color: '#444'
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
  buttonText:
  {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  loginLink:
  {
    marginTop: 15,
    alignSelf: 'center'
  },
  loginText:
  {
    color: '#2980b9',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
