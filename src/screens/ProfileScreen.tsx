import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { fetchProfile, ProfileData } from '../services/profileService';
import { ActionCard } from '../components/ActionCard';
import { ProfileEditModal } from '../components/ProfileEditModal';
import { useProfileEdit } from '../hooks/useProfileEdit';

interface ProfileScreenProps
{
  navigation: any;
}

const PRIMARY = '#0058A3';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) =>
{
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [userData, setUserData] = useState<ProfileData | null>(null);

  const loadData = useCallback(async () =>
  {
    setLoading(true);
    setError(null);
    try
    {
      const result = await fetchProfile();
      setUserName(result.username);
      setUserId(result.userId);
      setUserData(result.data);
    }
    catch
    {
      setError('Erro ao carregar dados.');
    }
    finally
    {
      setLoading(false);
    }
  }, []);

  useEffect(() =>
  {
    loadData();
  }, [loadData]);

  const { isEditMode, setIsEditMode, saving, saveChanges, cancelEdit } = useProfileEdit(loadData);

  if (loading)
  {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error)
  {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userData)
  {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Dados indisponíveis.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{'<'}</Text>
      </TouchableOpacity>

      <View style={styles.bannerWrapper}>
        <Image source={{ uri: userData.bannerImg }} style={styles.banner} />
        <Image source={{ uri: userData.profileImg }} style={styles.avatar} />
      </View>

      <View style={styles.headerBlock}>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userData.email}</Text>
        <Text style={styles.phone}>{userData.phone}</Text>
        <TouchableOpacity
          onPress={() => setIsEditMode(true)}
          style={styles.editButton}
          activeOpacity={0.85}
        >
          <Text style={styles.editButtonText}>Editar perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimas ações publicadas</Text>
        <FlatList
          data={userData.lastActions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ActionCard item={item} />}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma ação encontrada.</Text>}
        />
      </View>
      <View style={{ height: 40 }} />

      <ProfileEditModal
        visible={isEditMode}
        currentAvatarUri={userData.profileImg}
        currentBannerUri={userData.bannerImg}
        saving={saving}
        onClose={cancelEdit}
        onConfirm={(avatarUri, bannerUri) =>
        {
          if (userId !== null)
          {
            saveChanges(userId, avatarUri, bannerUri);
          }
        }}
      />
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  root:
  {
    flex: 1,
    backgroundColor: '#f5f6fa'
  },
  scrollContent:
  {
    paddingBottom: 24
  },
  centered:
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa'
  },
  loadingText:
  {
    marginTop: 12,
    fontSize: 14,
    color: '#555'
  },
  errorText:
  {
    fontSize: 14,
    color: '#c62828',
    marginBottom: 12
  },
  retryButton:
  {
    backgroundColor: PRIMARY,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryButtonText:
  {
    color: '#fff',
    fontWeight: '600'
  },
  bannerWrapper:
  {
    width: '100%',
    backgroundColor: '#ddd',
    height: 170,
    marginBottom: 56
  },
  banner:
  {
    width: '100%',
    height: '100%'
  },
  avatar:
  {
    position: 'absolute',
    bottom: -48,
    left: 20,
    width: 110,
    height: 110,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#eee'
  },
  headerBlock:
  {
    paddingHorizontal: 20,
    marginBottom: 28
  },
  name:
  {
    fontSize: 24,
    fontWeight: '700',
    color: PRIMARY
  },
  email:
  {
    fontSize: 14,
    color: '#555',
    marginTop: 4
  },
  phone:
  {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
    marginBottom: 14
  },
  editButton:
  {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    alignSelf: 'flex-start'
  },
  editButtonText:
  {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  section:
  {
    paddingHorizontal: 20
  },
  sectionTitle:
  {
    fontSize: 18,
    fontWeight: '600',
    color: PRIMARY,
    marginBottom: 14
  },
  separator:
  {
    height: 12
  },
  emptyText:
  {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic'
  },
  backButton:
  {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10
  },
  backButtonText:
  {
    fontSize: 35,
    color: PRIMARY,
    fontWeight: '500'
  }
});
