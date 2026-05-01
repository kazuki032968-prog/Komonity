import { Pressable, Text, View } from "react-native";

import { sharedStyles } from "../../styles/shared";
import type { ProfileState } from "../../types/app";

type SharedStyles = Record<string, any>;

/**
 * 指導者プロフィールを営業ページとしても使えるよう、強み・相談可否・外部導線をまとめて表示します。
 */
export function CoachProfileDetails({
  profile,
  onOpenUrl,
  styles = sharedStyles,
}: {
  profile: ProfileState;
  onOpenUrl: (url: string, label?: string) => void;
  styles?: SharedStyles;
}) {
  if (!profile.role.includes("指導員")) {
    return null;
  }

  const rows = [
    ["得意分野", profile.strengths],
    ["対応できる悩み", profile.supportTopics],
    ["資格", profile.certifications],
    ["所属スクール", profile.organization],
  ].filter(([, value]) => Boolean(value.trim()));
  const links = [
    ["YouTube", profile.youtubeUrl],
    ["X / Twitter", profile.xUrl],
    ["Instagram", profile.instagramUrl],
  ].filter(([, value]) => Boolean(value.trim()));

  if (
    rows.length === 0 &&
    links.length === 0 &&
    !profile.consultationAvailable &&
    !profile.paidConsultationAvailable
  ) {
    return null;
  }

  return (
    <View style={styles.coachProfileDetailBox}>
      <Text style={styles.coachProfileDetailTitle}>指導者プロフィール</Text>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.coachProfileDetailRow}>
          <Text style={styles.coachProfileDetailLabel}>{label}</Text>
          <Text style={styles.coachProfileDetailValue}>{value}</Text>
        </View>
      ))}
      {links.length > 0 ? (
        <View style={styles.externalLinksRow}>
          {links.map(([label, url]) => (
            <Pressable
              key={label}
              style={styles.externalLinkChip}
              onPress={() => onOpenUrl(url, label)}
            >
              <Text style={styles.externalLinkChipText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.sportChipRow}>
        {profile.consultationAvailable ? (
          <View style={styles.sportChipActive}>
            <Text style={styles.sportChipActiveText}>相談受付可</Text>
          </View>
        ) : null}
        {profile.paidConsultationAvailable ? (
          <View style={styles.sportChipActive}>
            <Text style={styles.sportChipActiveText}>有料相談可</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
