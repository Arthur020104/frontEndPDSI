import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

const CAMERA_URLS = [
  'https://lh3.googleusercontent.com/gps-cs-s/AC9h4np7MZf-BcdtQPoOZQVyjxyxnGGxqn-E98AOXG5BoZcXia8iLEB_JMe6Ya-jB6BuKU-b21iIKH2dbxYVIwd3C1eW8YldFRzXbmUPwxdz0dF2zuwZ_Ft9V0RoxwCWKAI5qoq5YeMNcw=s1360-w1360-h1020-rw',
  'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrlY7of7DdyQmOuP67z4oj0UmqQlRfA-V49f4ECd_pDrCSN0I0-UrXkPibKVViCdq8yNsBwMGvBHJ1WsTiDfxsC_mOmnHnwBYVMXA_dtRs5Nk0iarD3MQajClfYf_8fOh3-f3Ni=s1360-w1360-h1020-rw',
  'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nrUWAoRVUiPBV_AHnlUUHfb4ELuBOLItLD1Ofy5OX0I4IMMXsJ9m6fwV1i3WjKQROfJrudQ7jip4s4qvv9h-0F4g9NzPWrD7DWszUfifuJjMMubhCdDfNp92iRSr_tmleoGYHA=s1360-w1360-h1020-rw',
  'https://lh3.googleusercontent.com/gps-cs-s/AC9h4npcV3Gg9_0zBjrTD57zIDRtq4_9DkzXvTV8eJ7WwM7rgYLOZ_4gUX_r85BHTMx_l25lKHmM3kdgZg28bEQOjTfDHSfjfHgDOi05THFVdaeRW4etmOJfByKH5qhlpZZ6tO97N-reMQ=s1360-w1360-h1020-rw'
];

export function CameraView()
{
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Visualização das Câmeras</Text>
        <View style={styles.grid}>
          {CAMERA_URLS.map((uri, index) => (
            <View key={index} style={styles.camera}>
              <Image
                source={{ uri }}
                style={styles.cameraImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    padding: 16
  },
  title:
  {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#0058A3',
    textAlign: 'center'
  },
  grid:
  {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  camera:
  {
    width: '48%',
    height: 150,
    backgroundColor: '#e0e4e8',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  cameraImage:
  {
    width: '100%',
    height: '100%',
    borderRadius: 16
  }
});
