import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { cardStyle, Layout } from '@/constants/layout';
import { Brand, Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { registerWithEmailPassword } from '@/lib/auth';
import type { VehicleType } from '@/types/rider';

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'bike', label: 'Bike' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'bicycle', label: 'Bicycle' },
  { value: 'car', label: 'Car' },
];

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRegister() {
    setError(null);
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      setError('Name, email and password (6+ chars) required');
      return;
    }
    setBusy(true);
    try {
      await registerWithEmailPassword({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        mobile: mobile.trim() || undefined,
        vehicleType,
        vehicleNumber: vehicleNumber.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  const fields = [
    ['Full name', fullName, setFullName, false, 'words' as const],
    ['Email', email, setEmail, false, 'none' as const],
    ['Mobile (10 digits)', mobile, setMobile, false, 'phone-pad' as const],
    ['Password', password, setPassword, true, 'default' as const],
    ['Vehicle number', vehicleNumber, setVehicleNumber, false, 'default' as const],
  ] as const;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <ThemedText style={styles.heroBadge}>QuickBite Partner</ThemedText>
        <ThemedText style={styles.heroTitle}>Join as rider</ThemedText>
        <ThemedText style={styles.heroSub}>Instant approval — start delivering today.</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, cardStyle, { backgroundColor: theme.backgroundElement }]}>
          {fields.map(([label, value, setter, secure, keyboard]) => (
            <View key={label} style={styles.field}>
              <ThemedText type="label" themeColor="textSecondary">
                {label}
              </ThemedText>
              <TextInput
                value={value}
                onChangeText={setter}
                secureTextEntry={secure}
                autoCapitalize={label === 'Email' ? 'none' : 'words'}
                keyboardType={keyboard === 'phone-pad' ? 'phone-pad' : 'default'}
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border, fontFamily: Fonts.medium },
                ]}
              />
            </View>
          ))}

          <ThemedText type="label" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
            Vehicle type
          </ThemedText>
          <View style={styles.vehicleRow}>
            {VEHICLE_OPTIONS.map((v) => (
              <Pressable
                key={v.value}
                onPress={() => setVehicleType(v.value)}
                style={[
                  styles.vehicleChip,
                  {
                    backgroundColor: vehicleType === v.value ? theme.primarySoft : theme.backgroundSelected,
                    borderColor: vehicleType === v.value ? theme.primary : theme.border,
                  },
                ]}>
                <ThemedText
                  type="small"
                  style={{
                    color: vehicleType === v.value ? theme.primary : theme.textSecondary,
                    fontFamily: Fonts.bold,
                  }}>
                  {v.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {error ? (
            <ThemedText type="small" style={{ color: theme.danger, marginTop: Spacing.one }}>
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={onRegister}
            disabled={busy}
            style={[styles.button, { backgroundColor: theme.primary, opacity: busy ? 0.7 : 1 }]}>
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Create account</ThemedText>
            )}
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.back}>
            <ThemedText type="link">Back to login</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    backgroundColor: Brand.orange,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 56,
    paddingBottom: Spacing.three,
  },
  heroBadge: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#fff',
    fontFamily: Fonts.extraBold,
    fontSize: 26,
    marginTop: Spacing.two,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.92)',
    fontFamily: Fonts.medium,
    fontSize: 14,
    marginTop: Spacing.one,
  },
  scroll: { padding: Layout.screenPadding },
  card: { padding: Spacing.three },
  field: { marginBottom: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Layout.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginTop: 4,
  },
  vehicleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  vehicleChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  button: { marginTop: Spacing.three, borderRadius: Layout.buttonRadius, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontFamily: Fonts.extraBold, fontSize: 16 },
  back: { alignItems: 'center', marginTop: Spacing.three, padding: Spacing.two },
});
