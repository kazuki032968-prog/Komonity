import { Pressable, ScrollView, Text, View } from "react-native";

import type { ScreenKey, SeoLandingPageConfig } from "../types/app";

type SeoLandingScreenProps = {
  styles: Record<string, any>;
  page: SeoLandingPageConfig;
  onGoToScreen: (screen: ScreenKey) => void;
};

/**
 * 検索意図ごとに独立URLを持たせるSEO用ランディング画面です。
 * 1ページ1テーマにして、検索エンジンとユーザーの両方が内容を理解しやすい構造にします。
 */
export function SeoLandingScreen({ styles, page, onGoToScreen }: SeoLandingScreenProps) {
  const secondaryScreen = page.secondaryCtaScreen;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>{page.eyebrow}</Text>
        <Text style={styles.heroTitle}>{page.title}</Text>
        <Text style={styles.heroText}>{page.description}</Text>
        <View style={styles.heroActions}>
          <Pressable style={styles.primaryButton} onPress={() => onGoToScreen(page.ctaScreen)}>
            <Text style={styles.primaryButtonText}>{page.ctaLabel}</Text>
          </Pressable>
          {secondaryScreen ? (
            <Pressable style={styles.secondaryButton} onPress={() => onGoToScreen(secondaryScreen)}>
              <Text style={styles.secondaryButtonText}>{page.secondaryCtaLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.topShortcutGrid}>
        {page.heroBullets.map((bullet) => (
          <View key={bullet} style={styles.shortcutCard}>
            <Text style={styles.shortcutTitle}>{bullet}</Text>
            <Text style={styles.shortcutText}>
              Komonity 内の投稿・相談・プロフィールにつながる検索導線です。
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.sectionTitle}>このページでわかること</Text>
        {page.sections.map((section) => (
          <View key={section.title} style={styles.flowCard}>
            <Text style={styles.flowTitle}>{section.title}</Text>
            <Text style={styles.flowText}>{section.body}</Text>
            <View style={styles.tagRow}>
              {section.points.map((point) => (
                <View key={point} style={styles.pill}>
                  <Text style={styles.pillText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
