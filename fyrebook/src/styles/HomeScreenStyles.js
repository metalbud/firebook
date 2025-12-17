import { StyleSheet } from "react-native";
import theme from "./theme";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenLight: {
    backgroundColor: theme.surfaceLight,
  },
  screenDark: {
    backgroundColor: theme.surfaceDark,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: theme.radiusLg,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 44, 0.25)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  heroCardDark: {
    backgroundColor: theme.charcoal,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  heroCopy: {
    flex: 1,
  },
  kicker: {
    color: theme.secondaryColor,
    letterSpacing: 1,
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroTitleDark: {
    color: theme.textLight,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroTitleLight: {
    color: theme.textDark,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  heroSubtitleDark: {
    color: "rgba(255, 255, 255, 0.92)",
  },
  heroSubtitleLight: {
    color: "#4A332A",
  },
  badge: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    minWidth: 96,
    alignItems: "flex-start",
    gap: 2,
  },
  badgeText: {
    color: theme.textLight,
    fontSize: 16,
    fontWeight: "700",
  },
  badgeSub: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 12,
  },
  kickerDark: {
    color: theme.secondaryColor,
  },
  kickerLight: {
    color: "#8A2B06",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: theme.radiusLg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 44, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  searchSectionDark: {
    backgroundColor: theme.charcoal,
    borderColor: "rgba(255, 107, 44, 0.35)",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radiusSm,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: theme.textDark,
    fontSize: 16,
  },
  darkTextInput: {
    color: theme.textLight,
  },
  searchButton: {
    marginLeft: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: theme.primaryColor,
    borderRadius: theme.radiusSm,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(255, 107, 44, 0.35)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  darkButton: {
    backgroundColor: "#FF824D",
  },
  searchButtonText: {
    fontSize: 14,
    color: "#1B0F0B",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.textDark,
  },
  sectionTitleDark: {
    color: theme.textLight,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#5C4335",
  },
  sectionSubtitleDark: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingIndicator: {
    marginTop: 32,
  },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255, 107, 44, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 44, 0.25)",
  },
  countPillDark: {
    backgroundColor: "rgba(255, 107, 44, 0.18)",
    borderColor: "rgba(255, 146, 72, 0.35)",
  },
  countPillText: {
    color: "#8A2B06",
    fontWeight: "700",
  },
  countPillTextDark: {
    color: theme.textLight,
  },
});

export default styles;
