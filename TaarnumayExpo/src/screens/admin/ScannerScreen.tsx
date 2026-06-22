import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { Colors } from '../../constants/colors';
import { Scan } from 'lucide-react-native';
import { FadeInUpView } from '../../components/ui/FadeInUpView';

type Nav = StackNavigationProp<AdminStackParamList, 'AdminTabs'>;

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
    });
    return unsubscribe;
  }, [navigation]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.centerBox}>
          <Text style={styles.message}>We need your permission to show the camera</Text>
          <TouchableOpacity style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      // If it's a URL (e.g. from a web certificate), extract the last part as token/ID
      let queryId = data;
      if (data.includes('/')) {
        const parts = data.split('/');
        queryId = parts[parts.length - 1];
      }

      // We need to import participantsApi dynamically or at the top. Let's assume it's imported at the top.
      const { participantsApi } = require('../../api/participants.api');
      const { Alert } = require('react-native');
      
      const res = await participantsApi.lookup(queryId);
      const resData = res.data.data;
      
      if (resData.found) {
        // Navigate to participant detail with the actual registration ID returned
        navigation.navigate('ParticipantDetail', { registrationId: resData.participant.id });
      } else {
        Alert.alert('Not Found', 'No registration or certificate found for this QR code.', [
          { text: 'OK', onPress: () => setScanned(false) }
        ]);
      }
    } catch (err) {
      const { Alert } = require('react-native');
      Alert.alert('Error', 'Failed to verify QR code.', [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      <View style={styles.overlay}>
        <FadeInUpView style={styles.header}>
          <Scan size={32} color={Colors.primary} />
          <Text style={styles.title}>TAARUNYAM SECURE SCANNER</Text>
          <Text style={styles.subtitle}>Align Virtual Ticket QR Code within frame</Text>
        </FadeInUpView>

        <View style={styles.scannerFrame}>
          {/* Top Left */}
          <View style={[styles.corner, styles.topLeft]} />
          {/* Top Right */}
          <View style={[styles.corner, styles.topRight]} />
          {/* Bottom Left */}
          <View style={[styles.corner, styles.bottomLeft]} />
          {/* Bottom Right */}
          <View style={[styles.corner, styles.bottomRight]} />

          {scanned && (
            <View style={styles.scannedOverlay}>
              <Text style={styles.scannedText}>DECRYPTING...</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {scanned && (
            <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
              <Text style={styles.rescanBtnText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: Colors.white,
    fontFamily: 'Poppins-Black',
    fontSize: 20,
    marginTop: 12,
    letterSpacing: 2,
  },
  subtitle: {
    color: Colors.primaryLight,
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginTop: 4,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primary,
  },
  topLeft: {
    top: 0, left: 0,
    borderTopWidth: 4, borderLeftWidth: 4,
  },
  topRight: {
    top: 0, right: 0,
    borderTopWidth: 4, borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0, left: 0,
    borderBottomWidth: 4, borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0, right: 0,
    borderBottomWidth: 4, borderRightWidth: 4,
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(51, 136, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedText: {
    color: Colors.white,
    fontFamily: 'Poppins-Black',
    letterSpacing: 3,
  },
  footer: {
    height: 60,
  },
  rescanBtn: {
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rescanBtnText: {
    color: Colors.textMuted,
    fontFamily: 'Poppins-Bold',
  },
});
