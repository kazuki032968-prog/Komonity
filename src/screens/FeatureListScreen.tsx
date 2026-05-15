import { Pressable, ScrollView, Text, View } from "react-native";

import type { FeatureArticleConfig, ScreenKey } from "../types/app";

type FeatureListScreenProps = {
  styles: Record<string, any>;
  articles: FeatureArticleConfig[];
  onGoToScreen: (screen: ScreenKey) => void;
};

/**
 * 検索流入を受ける特集記事の一覧画面です。
 * 関連テーマを内部リンクで束ね、検索エンジンにもサイト構造を伝えやすくします。
 */
export function FeatureListScreen({ styles, articles, onGoToScreen }: FeatureListScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>特集一覧</Text>
        <Text style={styles.heroTitle}>部活指導と指導者集客に役立つ特集</Text>
        <Text style={styles.heroText}>
          顧問の先生が検索しやすい練習メニュー、指導者が見つけてもらいやすくなるプロフィール設計、
          活動バッジの考え方をまとめています。
        </Text>
      </View>

      {articles.map((article) => (
        <Pressable
          key={article.screen}
          style={styles.heroCard}
          onPress={() => onGoToScreen(article.screen)}
        >
          <Text style={styles.eyebrow}>{article.category}</Text>
          <Text style={styles.sectionTitle}>{article.title}</Text>
          <Text style={styles.heroText}>{article.description}</Text>
          <View style={styles.tagRow}>
            {article.keywords.slice(0, 3).map((keyword) => (
              <View key={keyword} style={styles.pill}>
                <Text style={styles.pillText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
