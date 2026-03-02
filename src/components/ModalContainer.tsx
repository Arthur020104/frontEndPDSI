import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';

interface ModalContainerProps {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}

export function ModalContainer({ visible, onRequestClose, children }: ModalContainerProps)
{
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:
  {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card:
  {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16
  }
});
