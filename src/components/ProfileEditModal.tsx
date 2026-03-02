import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { ModalContainer } from './ModalContainer';
import { ProfileImagePicker } from './ProfileImagePicker';

interface ProfileEditModalProps
{
  visible: boolean;
  currentAvatarUri: string;
  currentBannerUri: string;
  saving: boolean;
  onClose: () => void;
  onConfirm: (avatarUri?: string, bannerUri?: string) => void;
}

const PRIMARY = '#0058A3';

export function ProfileEditModal({
  visible,
  currentAvatarUri,
  currentBannerUri,
  saving,
  onClose,
  onConfirm
}: ProfileEditModalProps)
{
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [pendingBannerUri, setPendingBannerUri] = useState<string | null>(null);

  useEffect(() =>
  {
    if (visible)
    {
      setPendingAvatarUri(null);
      setPendingBannerUri(null);
    }
  }, [visible]);

  const handleConfirm = () =>
  {
    onConfirm(
      pendingAvatarUri ?? undefined,
      pendingBannerUri ?? undefined
    );
  };

  return (
    <ModalContainer visible={visible} onRequestClose={onClose}>
      <Text style={styles.title}>Editar fotos do perfil</Text>

      <Text style={styles.label}>Banner</Text>
      <ProfileImagePicker
        uri={pendingBannerUri ?? currentBannerUri}
        style={styles.bannerPreview}
        onPick={setPendingBannerUri}
        enabled={!saving}
      />

      <Text style={styles.label}>Avatar</Text>
      <View style={styles.avatarRow}>
        <ProfileImagePicker
          uri={pendingAvatarUri ?? currentAvatarUri}
          style={styles.avatarPreview}
          onPick={setPendingAvatarUri}
          enabled={!saving}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleConfirm}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ModalContainer>
  );
}

const styles = StyleSheet.create({
  title:
  {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY,
    marginBottom: 16,
    textAlign: 'center'
  },
  label:
  {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6
  },
  bannerPreview:
  {
    width: '100%',
    height: 110,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#ddd'
  },
  avatarRow:
  {
    alignItems: 'center',
    marginBottom: 20
  },
  avatarPreview:
  {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee'
  },
  actions:
  {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end'
  },
  cancelButton:
  {
    backgroundColor: '#e0e0e0',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  cancelText:
  {
    color: '#333',
    fontWeight: '600',
    fontSize: 14
  },
  saveButton:
  {
    backgroundColor: PRIMARY,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center'
  },
  saveText:
  {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  }
});
