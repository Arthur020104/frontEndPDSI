import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Header } from '../components/Header';
import { ReservationBody } from '../components/ReservationBody';
import { RulesBody } from '../components/RulesBody';
import { FinanceBody } from '../components/FinanceBody';
import { OccurrenceBody } from '../components/OccurrenceBody';
import NoticesBody, { NoticesBodyHandle } from '../components/NoticesBody';
import { FAB } from '../components/FAB';
import { CameraView } from '../components/CameraView';

const menuOptions = [
  { id: 1, label: 'Reservas', icon: 'calendar' },
  { id: 2, label: 'Câmeras', icon: 'video' },
  { id: 3, label: 'Avisos', icon: 'bell' },
  { id: 4, label: 'Denúncia', icon: 'alert-circle' },
  { id: 5, label: 'Financeiro', icon: 'currency-usd' },
  { id: 6, label: 'Regras', icon: 'book' }
];

const cardWidth = 90;

export const HomeScreen: React.FC<any> = ({ navigation, route }) =>
{
  const [selectedMenu, setSelectedMenu] = useState(menuOptions[0].label);
  const [userData, setUserData] = useState<any>(null);
  const [filterToday, setFilterToday] = useState(false);

  const occurrenceRef = useRef<any>(null);
  const reservationRef = useRef<any>(null);
  const rulesRef = useRef<any>(null);
  const financeRef = useRef<any>(null);
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
      setUserData(JSON.parse(userString));
    };
    loadUserData();
  }, [navigation]);

  useEffect(() =>
  {
    if (route.params?.selectedMenu)
    {
      setSelectedMenu(route.params.selectedMenu);
      setFilterToday(route.params.filterToday === true);
    }
  }, [route.params]);

  const isSyndic = userData?.role === 'syndic';

  function getActiveFABAction(): (() => void) | null
  {
    if (selectedMenu === 'Denúncia') { return () => occurrenceRef.current?.openCreateModal(); }
    if (selectedMenu === 'Avisos' && isSyndic) { return () => noticesRef.current?.openCreateModal(); }
    if (selectedMenu === 'Regras' && isSyndic) { return () => rulesRef.current?.openCreateModal(); }
    if (selectedMenu === 'Reservas' && isSyndic) { return () => reservationRef.current?.openCreateModal(); }
    if (selectedMenu === 'Financeiro' && isSyndic) { return () => financeRef.current?.openCreateModal(); }
    return null;
  }

  const renderMenuItem = ({ item }: any) =>
  {
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

  const fabAction = getActiveFABAction();

  return (
    <SafeAreaView style={styles.root}>
      <Header username={userData?.username} navigation={navigation} />

      <View style={{ height: 100 }}>
        <FlatList
          data={menuOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingLeft: 16, paddingVertical: 10 }}
          renderItem={renderMenuItem}
        />
      </View>

      <View style={styles.contentContainer}>
        {selectedMenu === 'Reservas' && (
          <ScrollView style={{ flex: 1 }}>
            <ReservationBody ref={reservationRef} styleTitle={styles.titleComponent} userId={userData?.id} isSyndic={isSyndic} />
          </ScrollView>
        )}

        {selectedMenu === 'Câmeras' && <CameraView />}

        {selectedMenu === 'Avisos' && (
          <NoticesBody
            ref={noticesRef}
            isSyndic={isSyndic}
            filter={filterToday ? 'today' : 'all'}
          />
        )}

        {selectedMenu === 'Denúncia' && (
          <ScrollView style={{ flex: 1 }}>
            <OccurrenceBody
              ref={occurrenceRef}
              styleTitle={styles.titleComponent}
              isSyndic={isSyndic}
              currentUserId={userData?.id}
            />
          </ScrollView>
        )}

        {selectedMenu === 'Financeiro' && (
          <ScrollView style={{ flex: 1 }}>
            <FinanceBody
              ref={financeRef}
              styleTitle={styles.titleComponent}
              isSyndic={isSyndic}
            />
          </ScrollView>
        )}

        {selectedMenu === 'Regras' && (
          <ScrollView style={{ flex: 1 }}>
            <RulesBody
              ref={rulesRef}
              styleTitle={styles.titleComponent}
              isSyndic={isSyndic}
            />
          </ScrollView>
        )}
      </View>

      {fabAction && <FAB onPress={fabAction} />}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root:
  {
    flex: 1,
    backgroundColor: '#f5f6fa'
  },
  menuCard:
  {
    width: cardWidth,
    height: 80,
    backgroundColor: '#4e73df',
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuCardSelected:
  {
    backgroundColor: '#2e59d9'
  },
  menuLabel:
  {
    color: '#fff',
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center'
  },
  contentContainer:
  {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  titleComponent:
  {
    fontSize: 25,
    fontWeight: '400',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333'
  }
});
