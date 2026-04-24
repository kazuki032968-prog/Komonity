import { StyleSheet } from "react-native";

import { colors } from "../constants/theme";

/**
 * Shared UI components can render outside App.tsx, so they need a stable
 * baseline style set that works even when screen-specific styles are omitted.
 */
export const sharedStyles = StyleSheet.create({
  pageHeaderCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    gap: 12,
  },
  pageIntroCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    gap: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandSoft,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  backButtonText: {
    color: colors.brand,
    fontSize: 15,
    fontWeight: "700",
  },
  sectionTitle: {
    color: colors.textStrong,
    fontSize: 22,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 24,
  },
  legalSection: {
    gap: 8,
  },
  legalSectionTitle: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: "800",
  },
  legalSectionBody: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 26,
  },
  richToolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  richToolbarButton: {
    backgroundColor: colors.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  richToolbarButtonText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: "700",
  },
  badgeSection: {
    gap: 12,
  },
  badgeSectionTitle: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: "800",
  },
  badgeLauncher: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  badgePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badgeStackedWrap: {
    alignItems: "center",
    gap: 4,
  },
  kBadge: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
  },
  badgeBronze: {
    backgroundColor: "#c98342",
  },
  badgeSilver: {
    backgroundColor: "#9aa6b2",
  },
  badgeGold: {
    backgroundColor: "#d6a627",
  },
  kBadgeInner: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  kBadgeText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
  },
  badgeRibbon: {
    minWidth: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.textStrong,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeRibbonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  badgeLauncherTextWrap: {
    flex: 1,
    gap: 4,
  },
  badgeLauncherTitle: {
    color: colors.textStrong,
    fontSize: 17,
    fontWeight: "800",
  },
  badgeLauncherMeta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  richTextStack: {
    gap: 10,
  },
  richTextStackCompact: {
    gap: 8,
  },
  richTextSpacer: {
    height: 6,
  },
  richQuoteBlock: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brand,
    backgroundColor: "#fffaf2",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  richListRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  richBullet: {
    color: colors.brand,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  richListText: {
    flex: 1,
  },
  richTextBold: {
    fontWeight: "800",
  },
  richTextLink: {
    color: colors.brand,
    textDecorationLine: "underline",
  },
  richTextCompact: {
    fontSize: 14,
    lineHeight: 22,
  },
  linkPreviewCard: {
    gap: 4,
    backgroundColor: "#f6f8fc",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d9e1f0",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  linkPreviewDomain: {
    color: colors.textStrong,
    fontSize: 14,
    fontWeight: "800",
  },
  linkPreviewUrl: {
    color: colors.brand,
    fontSize: 13,
    lineHeight: 20,
  },
  linkPreviewHint: {
    color: colors.textMuted,
    fontSize: 12,
  },
  expandToggleText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },
  replyList: {
    gap: 10,
  },
  replyItem: {
    backgroundColor: "#f8fbff",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  replyAuthor: {
    color: colors.textStrong,
    fontSize: 14,
    fontWeight: "800",
  },
  replyBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 24,
  },
  feedbackBanner: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  feedbackSuccess: {
    backgroundColor: "#e8fff0",
    borderColor: "#7add9d",
  },
  feedbackError: {
    backgroundColor: "#fff1f1",
    borderColor: "#f1a4a4",
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
  },
  feedbackSuccessText: {
    color: "#187348",
  },
  feedbackErrorText: {
    color: "#b23333",
  },
  mediaGallery: {
    gap: 10,
  },
  postMediaImage: {
    width: "100%",
    minHeight: 240,
    borderRadius: 18,
    backgroundColor: colors.brandSoft,
  },
  postMediaImageCompact: {
    width: "100%",
    minHeight: 180,
    borderRadius: 18,
    backgroundColor: colors.brandSoft,
  },
  videoCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 4,
  },
  videoCardLabel: {
    color: colors.textStrong,
    fontSize: 14,
    fontWeight: "800",
  },
  videoCardName: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  mediaPreviewStack: {
    gap: 12,
  },
  mediaPreviewCard: {
    gap: 10,
  },
  mediaPreviewVideo: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 4,
  },
  mediaRemoveButton: {
    alignSelf: "flex-start",
    backgroundColor: "#fff1f1",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  mediaRemoveButtonText: {
    color: "#b23333",
    fontSize: 13,
    fontWeight: "700",
  },
  formGroup: {
    gap: 10,
  },
  formLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  formLabel: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
  },
  formDetail: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "700",
  },
  fieldSupport: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  sportGroupStack: {
    gap: 12,
  },
  sportGroupCard: {
    gap: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sportGroupTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: "800",
  },
  sportSelectorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sportSelectorChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sportSelectorChipActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  sportSelectorChipText: {
    color: colors.textStrong,
    fontSize: 14,
    fontWeight: "700",
  },
  sportSelectorChipTextActive: {
    color: "#ffffff",
  },
  logoWrap: {
    gap: 2,
  },
  logoText: {
    color: colors.brand,
    fontSize: 34,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -1,
  },
  logoUnderlineWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -2,
    paddingLeft: 4,
  },
  logoUnderline: {
    width: 104,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.secondary,
  },
  logoDot: {
    borderRadius: 999,
    backgroundColor: colors.brand,
  },
  logoDotOne: {
    width: 8,
    height: 8,
  },
  logoDotTwo: {
    width: 6,
    height: 6,
    opacity: 0.85,
  },
  logoDotThree: {
    width: 8,
    height: 8,
    backgroundColor: colors.secondary,
  },
  imagePickerCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: "hidden",
  },
  avatarPreview: {
    width: 112,
    height: 112,
    borderRadius: 999,
    alignSelf: "center",
    marginVertical: 16,
  },
  coverPreview: {
    width: "100%",
    height: 160,
  },
  avatarPlaceholder: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  avatarPlaceholderText: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: "800",
  },
  removeImageButton: {
    alignSelf: "flex-start",
    backgroundColor: "#f7fbff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#c9d8ef",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  removeImageButtonText: {
    color: colors.textStrong,
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.textStrong,
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: "top",
  },
  profileBanner: {
    width: "100%",
    height: 220,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  profileBannerImage: {
    width: "100%",
    height: 220,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  cardBody: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 26,
  },
  postDetailBody: {
    color: colors.textStrong,
    fontSize: 16,
    lineHeight: 28,
  },
});
