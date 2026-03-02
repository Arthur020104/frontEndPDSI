import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { ImageStyle } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ProfileImagePickerProps
{
  uri: string;
  style: ImageStyle;
  onPick: (localUri: string) => void;
  enabled: boolean;
}

export function ProfileImagePicker({ uri, style, onPick, enabled }: ProfileImagePickerProps)
{
  const handlePress = async () =>
  {
    const result = await ImagePicker.launchImageLibraryAsync(
    {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });

    if (!result.canceled && result.assets.length > 0)
    {
      onPick(result.assets[0].uri);
    }
  };

  if (!enabled)
  {
    return <Image source={{ uri }} style={style} />;
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Image source={{ uri }} style={style} />
    </TouchableOpacity>
  );
}
