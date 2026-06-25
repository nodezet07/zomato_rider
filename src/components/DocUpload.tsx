import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { cardStyle, Layout } from '@/constants/layout';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { hasUploadedImage } from '@/lib/imageUtils';
import { pickDocumentImage, takeDocumentPhoto } from '@/lib/pickDocumentImage';

type Props = {
  label: string;
  value?: string;
  onChange: (uri: string) => void;
  required?: boolean;
};

export function DocUpload({ label, value, onChange, required }: Props) {
  const theme = useTheme();
  const uploaded = hasUploadedImage(value);

  async function onPick(fromCamera: boolean) {
    const uri = fromCamera ? await takeDocumentPhoto(label) : await pickDocumentImage(label);
    if (uri) onChange(uri);
  }

  return (
    <View style={[styles.docCard, cardStyle, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.docHeader}>
        <ThemedText style={styles.docLabel}>{label}</ThemedText>
        {uploaded ? (
          <View style={[styles.uploadedBadge, { backgroundColor: theme.partnerSoft }]}>
            <Ionicons name="checkmark-circle" size={14} color={theme.partner} />
            <ThemedText style={{ color: theme.partner, fontSize: 11, fontFamily: Fonts.bold }}>
              Added
            </ThemedText>
          </View>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            {required ? 'Required' : 'Optional'}
          </ThemedText>
        )}
      </View>
      {uploaded && value ? (
        <Image source={{ uri: value }} style={styles.preview} resizeMode="cover" />
      ) : null}
      <View style={styles.docActions}>
        <Pressable onPress={() => onPick(false)} style={[styles.docBtn, { borderColor: theme.border }]}>
          <Ionicons name="images-outline" size={16} color={theme.primary} />
          <ThemedText type="link" style={{ fontSize: 13 }}>
            Gallery
          </ThemedText>
        </Pressable>
        <Pressable onPress={() => onPick(true)} style={[styles.docBtn, { borderColor: theme.border }]}>
          <Ionicons name="camera-outline" size={16} color={theme.primary} />
          <ThemedText type="link" style={{ fontSize: 13 }}>
            Camera
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  docCard: { padding: Spacing.three, marginBottom: Spacing.two },
  docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  docLabel: { fontSize: 13, fontFamily: Fonts.bold },
  uploadedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  preview: { width: '100%', height: 120, borderRadius: Layout.inputRadius, marginTop: Spacing.two },
  docActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  docBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Layout.inputRadius,
    paddingVertical: 10,
  },
});
