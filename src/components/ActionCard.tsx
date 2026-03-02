import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LastAction } from '../services/profileService';

const FALLBACK_IMG = 'https://tocas-ui.com/5.0/en-us/assets/images/16-9.png';

interface ActionCardProps
{
  item: LastAction;
}

export function ActionCard({ item }: ActionCardProps)
{
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: item.img || FALLBACK_IMG }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>{item.location} • {item.displayDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:
  {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  image:
  {
    width: 90,
    height: 90,
    backgroundColor: '#ccc'
  },
  info:
  {
    flex: 1,
    padding: 10,
    justifyContent: 'center'
  },
  title:
  {
    fontSize: 14,
    fontWeight: '600',
    color: '#222'
  },
  meta:
  {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  }
});
