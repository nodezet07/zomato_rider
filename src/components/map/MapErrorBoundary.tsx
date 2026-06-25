import { Component, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type Props = {
  children: ReactNode;
  height?: number;
};

type State = { hasError: boolean };

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={[
            styles.fallback,
            this.props.height
              ? { height: this.props.height }
              : styles.fallbackFlex,
          ]}
        >
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.text}
          >
            Map unavailable. Run npx expo run:android to install a build with
            Google Maps.
          </ThemedText>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "rgba(255,90,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  text: { textAlign: "center", lineHeight: 18 },
  fallbackFlex: { flex: 1 },
});
