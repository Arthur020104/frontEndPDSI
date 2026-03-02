import { useState } from 'react';
import { Alert } from 'react-native';
import { updateProfileImages } from '../services/profileService';

export function useProfileEdit(onSaved: () => void)
{
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const cancelEdit = () =>
  {
    setIsEditMode(false);
  };

  const saveChanges = async (userId: number, avatarUri?: string, bannerUri?: string) =>
  {
    if (saving) { return; }
    try
    {
      setSaving(true);
      await updateProfileImages(userId, avatarUri, bannerUri);
      setIsEditMode(false);
      onSaved();
    }
    catch (err: any)
    {
      Alert.alert('Erro', err?.message || 'Não foi possível salvar as alterações.');
    }
    finally
    {
      setSaving(false);
    }
  };

  return {
    isEditMode,
    setIsEditMode,
    saving,
    saveChanges,
    cancelEdit
  };
}
