import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HeaderProps {
  username: string;
  navigation: any;
}

export const Header: React.FC<HeaderProps> = ({ username, navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.greet}>{`Olá, ${username}`}</Text>

      {/* Ícone de notificação clicável */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Home', { selectedMenu: 'Avisos', filterToday: true })
        }
        style={styles.iconWrapper}
      >
        <Image source={require('../../assets/imgs/Icon.png')} style={styles.iconBell} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.profileRedirect}>{`Ver meu perfil >`}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () =>
        {
          try { await AsyncStorage.removeItem('@user'); } catch (_) {}
          navigation.navigate('Login');
        }}
      >
        <Text style={styles.logout}>{`< Sair`}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  greet: {
    fontSize: 28,
    fontWeight: '500',
    color: '#333',
    textAlign: 'left',
    marginLeft: 16,
  },
  iconWrapper: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  iconBell: {
    width: 26,
    height: 30,
    resizeMode: 'contain',
  },
  profileRedirect: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00508F',
    textAlign: 'left',
    marginLeft: 16,
    marginTop: 4,
  },
  logout: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00457E',
    textAlign: 'left',
    marginLeft: 16,
    marginTop: 6,
  },
});
