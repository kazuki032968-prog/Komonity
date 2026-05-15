import { Pressable, ScrollView, Text, View } from "react-native";

import type { FeatureArticleConfig, ScreenKey } from "../types/app";

type FeatureDetailScreenProps = {
  styles: Record<string, any>;
  article: FeatureArticleConfig;
  onGoToScreen: (screen: ScreenKey) => void;
};

/**
 * 特集記事の詳細画面です。
 * 1URLにつき1テーマへ絞り、検索意図と内部リンクを明確にします。
 */
export function FeatureDetailScreen({ styles, article, onGoToScreen }: FeatureDetailScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>{article.category}</Text>
        <Text style={styles.heroTitle}>{article.title}</Text>
        <Text style={styles.heroText}>{article.lead}</Text>
        <Text style={styles.shortcutText}>最終更新: {article.updatedAt}</Text>
      </View>

      {article.sections.map((section) => (
        <View key={section.title} style={styles.heroCard}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.heroText}>{section.body}</Text>
          <View style={styles.tagRow}>
            {section.points.map((point) => (
              <View key={point} style={styles.pill}>
                <Text style={styles.pillText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.heroCard}>
        <Text style={styles.sectionTitle}>関連ページ</Text>
        <View style={styles.topShortcutGrid}>
          {article.relatedLinks.map((link) => (
            <Pressable
              key={`${article.screen}-${link.screen}`}
              style={styles.shortcutCard}
              onPress={() => onGoToScreen(link.screen)}
            >
              <Text style={styles.shortcutTitle}>{link.label}</Text>
              <Text style={styles.shortcutText}>このテーマに近いページを開きます。</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
