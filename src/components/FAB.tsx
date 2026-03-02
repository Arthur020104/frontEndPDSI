import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps)
{
  return (
    <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={onPress}>
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab:
  {
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
    zIndex: 10
  },
  fabText:
  {
    color: '#fff',
    fontSize: 30,
    marginTop: -2
  }
});
