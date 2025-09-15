import React, { useEffect, useState, useRef } from 'react';
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
import type { RulesBodyHandle } from '../components/RulesBody';
import { FinanceBody } from '../components/FinanceBody';
import type { FinanceBodyHandle } from '../components/FinanceBody';
import { OccurrenceBody } from '../components/OccurrenceBody';
import NoticesBody, { NoticesBodyHandle } from '../components/NoticesBody';
import type { OccurrenceBodyHandle } from '../components/OccurrenceBody';
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
  const occurrenceRef = useRef<OccurrenceBodyHandle>(null);
  const rulesRef = useRef<RulesBodyHandle>(null);
  const financeRef = useRef<FinanceBodyHandle>(null);
  const noticesRef = useRef<NoticesBodyHandle>(null);


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
            <ReservationBody styleTitle={styles.titleComponent} userId={userData?.id} isSyndic={userData?.role === 'syndic'} />
          )}

          {selectedMenu === 'Câmeras' && (
            <Text style={styles.placeholder}>Visualização das câmeras</Text>
          )}

          {selectedMenu === 'Avisos' && (
            
               <NoticesBody ref={noticesRef} isSyndic={userData?.role === 'syndic'} />


)}


          {selectedMenu === 'Denúncia' && (
            <OccurrenceBody
              ref={occurrenceRef}
              styleTitle={styles.titleComponent}
              isSyndic={userData?.role === 'syndic'}
            />
          )}

          {selectedMenu === 'Financeiro' && (
            <FinanceBody ref={financeRef} styleTitle={styles.titleComponent} isSyndic={userData?.role === 'syndic'} />
          )}

          {selectedMenu === 'Regras' && (
            <RulesBody ref={rulesRef} styleTitle={styles.titleComponent} isSyndic={userData?.role === 'syndic'} />
          )}
        </View>
      </ScrollView>

      {selectedMenu === 'Denúncia' && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.9}
          onPress={() => occurrenceRef.current?.openCreateModal()}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

        {selectedMenu === 'Avisos' && userData?.role === 'syndic' && (
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => noticesRef.current?.openCreateModal()}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    )}


      {selectedMenu === 'Regras' && userData?.role === 'syndic' && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.9}
          onPress={() => rulesRef.current?.openCreateModal()}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {selectedMenu === 'Financeiro' && userData?.role === 'syndic' && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.9}
          onPress={() => financeRef.current?.openCreateModal()}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0058A3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 10,
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    marginTop: -2,
  },
});
