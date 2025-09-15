import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Header } from '../components/Header';
import { ReservationBody } from '../components/ReservationBody';
import { RulesBody } from '../components/RulesBody';
import { FinanceBody } from '../components/FinanceBody';
import { OccurrenceBody } from '../components/OccurrenceBody';
import NoticesBody, { NoticesBodyHandle } from '../components/NoticesBody';

const menuOptions = [
  { id: 1, label: 'Reservas', icon: 'calendar' },
  { id: 2, label: 'Câmeras', icon: 'video' },
  { id: 3, label: 'Avisos', icon: 'bell' },
  { id: 4, label: 'Denúncia', icon: 'alert-circle' },
  { id: 5, label: 'Financeiro', icon: 'currency-usd' },
  { id: 6, label: 'Regras', icon: 'book' },
];

const cardWidth = 90;

export const HomeScreen: React.FC<any> = ({ navigation, route }) => {
  const [selectedMenu, setSelectedMenu] = useState(menuOptions[0].label);
  const [userData, setUserData] = useState<any>(null);
  const [filterToday, setFilterToday] = useState(false);

  const occurrenceRef = useRef<any>(null);
  const rulesRef = useRef<any>(null);
  const financeRef = useRef<any>(null);
  const noticesRef = useRef<NoticesBodyHandle>(null);

  // Carrega usuário
  useEffect(() => {
    const loadUserData = async () => {
      const userString = await AsyncStorage.getItem('@user');
      if (!userString) {
        Alert.alert('Erro', 'Usuário não logado. Faça login novamente.');
        navigation.navigate('Login');
        return;
      }
      setUserData(JSON.parse(userString));
    };
    loadUserData();
  }, [navigation]);

  // Lê params do Header (sino)
  useEffect(() => {
    if (route.params?.selectedMenu) {
      setSelectedMenu(route.params.selectedMenu);
      setFilterToday(!!route.params.filterToday);
    }
  }, [route.params]);

  // Reseta filtro de hoje ao clicar manualmente no menu Avisos
  useEffect(() => {
    if (selectedMenu === 'Avisos') {
      setFilterToday(false);
    }
  }, [selectedMenu]);

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
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <Header username={userData?.username} navigation={navigation} />

      {/* Carrossel horizontal */}
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

      {/* Conteúdo principal */}
      <View style={styles.contentContainer}>
        {selectedMenu === 'Reservas' && (
          <ScrollView style={{ flex: 1 }}>
            <ReservationBody styleTitle={styles.titleComponent}userId={userData?.id} isSyndic={userData?.role === 'syndic'} />
          </ScrollView>
        )}

        {selectedMenu === 'Câmeras' && (
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.cameraContainer}>
              <Text style={styles.cameraTitle}>Visualização das Câmeras</Text>
              <View style={styles.cameraGrid}>
                {[
                  'https://lh3.googleusercontent.com/gps-cs-s/AC9h4np7MZf-BcdtQPoOZQVyjxyxnGGxqn-E98AOXG5BoZcXia8iLEB_JMe6Ya-jB6BuKU-b21iIKH2dbxYVIwd3C1eW8YldFRzXbmUPwxdz0dF2zuwZ_Ft9V0RoxwCWKAI5qoq5YeMNcw=s1360-w1360-h1020-rw',
                  'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrlY7of7DdyQmOuP67z4oj0UmqQlRfA-V49f4ECd_pDrCSN0I0-UrXkPibKVViCdq8yNsBwMGvBHJ1WsTiDfxsC_mOmnHnwBYVMXA_dtRs5Nk0iarD3MQajClfYf_8fOh3-f3Ni=s1360-w1360-h1020-rw',
                  'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrUWAoRVUiPBV_AHnlUUHfb4ELuBOLItLD1Ofy5OX0I4IMMXsJ9m6fwV1i3WjKQROfJrudQ7jip4s4qvv9h-0F4g9NzPWrD7DWszUfifuJjMMubhCdDfNp92iRSr_tmleoGYHA=s1360-w1360-h1020-rw',
                  'https://lh3.googleusercontent.com/gps-cs-s/AC9h4npcV3Gg9_0zBjrTD57zIDRtq4_9DkzXvTV8eJ7WwM7rgYLOZ_4gUX_r85BHTMx_l25lKHmM3kdgZg28bEQOjTfDHSfjfHgDOi05THFVdaeRW4etmOJfByKH5qhlpZZ6tO97N-reMQ=s1360-w1360-h1020-rw',
                ].map((uri, index) => (
                  <View key={index} style={styles.fakeCamera}>
                    <Image
                      source={{ uri }}
                      style={{ width: '100%', height: '100%', borderRadius: 16 }}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {selectedMenu === 'Avisos' && (
          <NoticesBody
            ref={noticesRef}
            isSyndic={userData?.role === 'syndic'}
            filter={filterToday ? 'today' : 'all'}
          />
        )}

        {selectedMenu === 'Denúncia' && (
          <ScrollView style={{ flex: 1 }}>
            <OccurrenceBody
              ref={occurrenceRef}
              styleTitle={styles.titleComponent}
              isSyndic={userData?.role === 'syndic'}
            />
          </ScrollView>
        )}

        {selectedMenu === 'Financeiro' && (
          <ScrollView style={{ flex: 1 }}>
            <FinanceBody
              ref={financeRef}
              styleTitle={styles.titleComponent}
              isSyndic={userData?.role === 'syndic'}
            />
          </ScrollView>
        )}

        {selectedMenu === 'Regras' && (
          <ScrollView style={{ flex: 1 }}>
            <RulesBody
              ref={rulesRef}
              styleTitle={styles.titleComponent}
              isSyndic={userData?.role === 'syndic'}
            />
          </ScrollView>
        )}
      </View>

      {/* FABs */}
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
    </SafeAreaView>
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
  menuCardSelected: { backgroundColor: '#2e59d9' },
  menuLabel: { color: '#fff', marginTop: 6, fontSize: 12, textAlign: 'center' },
  contentContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  titleComponent: { fontSize: 25, fontWeight: '400', marginBottom: 12, textAlign: 'center', color: '#333' },

  // FAB
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
  fabText: { color: '#fff', fontSize: 30, marginTop: -2 },

  // Câmeras
  cameraContainer: { flex: 1, padding: 16 },
  cameraTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#0058A3', textAlign: 'center' },
  cameraGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  fakeCamera: {
    width: '48%',
    height: 150,
    backgroundColor: '#e0e4e8',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
