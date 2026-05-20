import { Pressable, ScrollView, Text, View } from "react-native";

import type {
  FeatureArticleConfig,
  ScreenKey,
  SearchContentFilterKey,
  TodayMenuConditionKey,
} from "../types/app";

type SearchPreset = {
  label?: string;
  query: string;
  contentFilter?: SearchContentFilterKey;
  conditions?: TodayMenuConditionKey[];
};

const featureListSearchShortcuts: SearchPreset[] = [
  { label: "60分以内の練習メニュー", query: "60分", contentFilter: "feed", conditions: ["under60"] },
  { label: "初心者向けメニュー", query: "初心者", contentFilter: "feed", conditions: ["beginner"] },
  { label: "雨・室内メニュー", query: "雨天", contentFilter: "feed", conditions: ["rainy"] },
  { label: "大会前メニュー", query: "大会前", contentFilter: "feed", conditions: ["preTournament"] },
  { label: "少人数メニュー", query: "少人数", contentFilter: "feed", conditions: ["fewPeople"] },
  { label: "守備強化メニュー", query: "守備", contentFilter: "feed", conditions: ["defense"] },
  { label: "攻撃づくりメニュー", query: "攻撃", contentFilter: "feed", conditions: ["offense"] },
  { label: "省スペース練習", query: "省スペース", contentFilter: "feed", conditions: ["smallSpace"] },
  { label: "実戦形式メニュー", query: "実戦", contentFilter: "feed", conditions: ["gameSituation"] },
  { label: "怪我予防メニュー", query: "怪我予防", contentFilter: "feed", conditions: ["injuryPrevention"] },
];

const featureListGuideCards = [
  {
    title: "顧問の先生は条件から探す",
    text: "今日の時間、人数、場所、目的に近い条件を押すと、検索画面で投稿を絞り込めます。",
  },
  {
    title: "記事内のタグも検索導線",
    text: "各特集のチップは検索画面につながっているので、読んだ流れで具体的な投稿へ移動できます。",
  },
  {
    title: "指導者はプロフィール改善へ",
    text: "プロフィール、活動バッジ、相談回答の記事から、見つけてもらいやすい導線を整えられます。",
  },
];

type FeatureListScreenProps = {
  styles: Record<string, any>;
  articles: FeatureArticleConfig[];
  onGoToScreen: (screen: ScreenKey) => void;
  onOpenSearchPreset: (preset: SearchPreset) => void;
};

/**
 * 検索流入を受ける特集記事の一覧画面です。
 * 関連テーマを内部リンクで束ね、検索エンジンにもサイト構造を伝えやすくします。
 */
export function FeatureListScreen({
  styles,
  articles,
  onGoToScreen,
  onOpenSearchPreset,
}: FeatureListScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>特集一覧</Text>
        <Text style={styles.heroTitle}>部活指導と指導者集客に役立つ特集ガイド</Text>
        <Text style={styles.heroText}>
          顧問の先生が検索しやすい練習メニュー、指導者が見つけてもらいやすくなるプロフィール設計、
          活動バッジの考え方をまとめています。記事を読むだけで終わらず、条件検索や関連ページへ進める入口として使えます。
        </Text>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.sectionTitle}>特集ページの使い方</Text>
        <View style={styles.topShortcutGrid}>
          {featureListGuideCards.map((card) => (
            <View key={card.title} style={styles.shortcutCard}>
              <Text style={styles.shortcutTitle}>{card.title}</Text>
              <Text style={styles.shortcutText}>{card.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.sectionTitle}>条件から練習メニューを探す</Text>
        <Text style={styles.heroText}>
          よく使う条件を押すと、検索画面で絞り込み済みの投稿をすぐ確認できます。短時間、初心者、雨の日だけでなく、守備強化や実戦形式まで選べます。
        </Text>
        <View style={styles.topShortcutGrid}>
          {featureListSearchShortcuts.map((shortcut) => (
            <Pressable
              key={shortcut.label}
              style={styles.shortcutCard}
              onPress={() => onOpenSearchPreset(shortcut)}
            >
              <Text style={styles.shortcutTitle}>{shortcut.label}</Text>
              <Text style={styles.shortcutText}>検索画面へ移動します。</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.sectionTitle}>特集記事</Text>
        <Text style={styles.heroText}>
          現場の制約から探す記事、相談投稿を改善する記事、指導者が信頼を積み上げる記事をまとめています。
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
