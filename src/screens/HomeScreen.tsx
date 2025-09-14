import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Header } from '../components/Header';
import { ReservationBody} from '../components/ReservationBody';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RulesBody } from '../components/RulesBody';
import { FinanceBody } from '../components/FinanceBody';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props 
{
  navigation: any;
}
const menuOptions = [
  { id: 1, label: 'Reservas', icon: 'calendar' },
  { id: 2, label: 'Câmeras', icon: 'video' },
  { id: 3, label: 'Avisos', icon: 'bell' },
  { id: 4, label: 'Denúncia', icon: 'alert-circle' },
  { id: 5, label: 'Financeiro', icon: 'currency-usd' },
  { id: 6, label: 'Regras', icon: 'book' },
];


const cardWidth = 90;
export const HomeScreen: React.FC<Props> = ({ navigation }) => {

  const [selectedMenu, setSelectedMenu] = useState(menuOptions[0].label);
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
      const user = JSON.parse(userString);
      setUserData(user);
      console.log('User Data:', user);
    };

    loadUserData();
  }, [navigation]);


  const renderMenuItem = ({ item }: any) => {
    const isSelected = item.label === selectedMenu;

    return (
      <TouchableOpacity
        style={[styles.menuCard, isSelected && styles.menuCardSelected]}
        onPress={() => setSelectedMenu(item.label)}
      >
        <Icon name={item.icon} size={28} color="#fff" />
        <Text style={styles.menuLabel}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
     <View style={styles.root}>
      <Header username={userData?.username} navigation={navigation} />

      {/* Carrossel horizontal */}
      <ScrollView>
        <FlatList
          data={menuOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingLeft: 16, paddingVertical: 10 }}
          renderItem={renderMenuItem}
        />

        {/* Conteúdo dinâmico */}
        <View style={styles.scrollContent}>
          {selectedMenu === 'Reservas' && (
            <ReservationBody styleTitle={styles.titleComponent} />
          )}

          {selectedMenu === 'Câmeras' && (
            <Text style={styles.placeholder}>Visualização das câmeras</Text>
          )}

          {selectedMenu === 'Avisos' && (
            <Text style={styles.placeholder}>Aqui vão os avisos do condomínio</Text>
          )}

          {selectedMenu === 'Denúncia' && (
            <Text style={styles.placeholder}>Formulário de denúncia</Text>
          )}

          {selectedMenu === 'Financeiro' && (
            <FinanceBody styleTitle={styles.titleComponent} />
          )}

          {selectedMenu === 'Regras' && (
            <RulesBody styleTitle={styles.titleComponent} />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f6fa' },
  menuCard: {
    width: cardWidth,
    height: 80,
    backgroundColor: '#4e73df',
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCardSelected: {
    backgroundColor: '#2e59d9',
  },
  menuLabel: {
    color: '#fff',
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  scrollContent: { padding: 16 },
  placeholder: {
    fontSize: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  titleComponent: {
    fontSize: 25,
    fontWeight: '400',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',

  },
});
