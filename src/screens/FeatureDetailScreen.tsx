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

const pointSearchPresetMap: Record<string, SearchPreset> = {
  "60分": { query: "60分", contentFilter: "feed", conditions: ["under60"] },
  "練習時間": { query: "練習時間", contentFilter: "feed", conditions: ["under60"] },
  "短時間": { query: "短時間", contentFilter: "feed", conditions: ["under60"] },
  "放課後": { query: "放課後", contentFilter: "feed", conditions: ["under60"] },
  "雨天": { query: "雨天", contentFilter: "feed", conditions: ["rainy"] },
  "雨の日": { query: "雨の日", contentFilter: "feed", conditions: ["rainy"] },
  "室内": { query: "室内", contentFilter: "feed", conditions: ["rainy"] },
  "少人数": { query: "少人数", contentFilter: "feed", conditions: ["fewPeople"] },
  "必要な道具": { query: "道具", contentFilter: "feed", conditions: ["fewTools"] },
  "道具不足": { query: "道具不足", contentFilter: "feed", conditions: ["fewTools"] },
  "大会前": { query: "大会前", contentFilter: "feed", conditions: ["preTournament"] },
  "初心者": { query: "初心者", contentFilter: "feed", conditions: ["beginner"] },
  "初心者育成": { query: "初心者", contentFilter: "feed", conditions: ["beginner"] },
  "怪我予防": { query: "怪我予防", contentFilter: "feed", conditions: ["injuryPrevention"] },
  "体力差": { query: "体力差", contentFilter: "feed", conditions: ["mixedAbility"] },
  "中学生": { query: "中学生", contentFilter: "feed", conditions: ["juniorHigh"] },
  "高校生": { query: "高校生", contentFilter: "feed", conditions: ["highSchool"] },
  "基礎づくり": { query: "基礎", contentFilter: "feed", conditions: ["basicPractice"] },
  "ウォームアップ": { query: "ウォームアップ", contentFilter: "feed", conditions: ["warmup"] },
  "体力づくり": { query: "体力", contentFilter: "feed", conditions: ["stamina"] },
  "守備強化": { query: "守備", contentFilter: "feed", conditions: ["defense"] },
  "攻撃づくり": { query: "攻撃", contentFilter: "feed", conditions: ["offense"] },
  "省スペース": { query: "省スペース", contentFilter: "feed", conditions: ["smallSpace"] },
  "実戦形式": { query: "実戦", contentFilter: "feed", conditions: ["gameSituation"] },
  "半面": { query: "半面", contentFilter: "feed", conditions: ["smallSpace"] },
  "ミニゲーム": { query: "ミニゲーム", contentFilter: "feed", conditions: ["gameSituation"] },
  "ケース": { query: "ケース", contentFilter: "feed", conditions: ["gameSituation"] },
  "役割": { query: "役割", contentFilter: "feed", conditions: ["teamwork"] },
  "体幹": { query: "体幹", contentFilter: "feed" },
  "ストレッチ": { query: "ストレッチ", contentFilter: "feed" },
  "フォーム確認": { query: "フォーム確認", contentFilter: "feed" },
  "振り返り": { query: "振り返り", contentFilter: "feed" },
  "タイマー": { query: "タイマー", contentFilter: "feed" },
};

const createPointSearchPreset = (
  point: string,
  article: FeatureArticleConfig
): SearchPreset => {
  const preset = pointSearchPresetMap[point];
  if (preset) {
    return preset;
  }

  const contentFilter = article.category.includes("練習") ? "feed" : "all";
  return { query: point, contentFilter };
};

const getArticleSearchShortcuts = (
  article: FeatureArticleConfig
): SearchPreset[] => {
  if (article.screen === "feature-today-practice-menu-search") {
    return [
      { label: "60分以内のメニューを探す", query: "60分", contentFilter: "feed", conditions: ["under60"] },
      { label: "初心者向けメニューを探す", query: "初心者", contentFilter: "feed", conditions: ["beginner"] },
      { label: "雨・室内メニューを探す", query: "雨天", contentFilter: "feed", conditions: ["rainy"] },
      { label: "大会前メニューを探す", query: "大会前", contentFilter: "feed", conditions: ["preTournament"] },
      { label: "道具少なめメニューを探す", query: "道具", contentFilter: "feed", conditions: ["fewTools"] },
      { label: "体力差ありメニューを探す", query: "体力差", contentFilter: "feed", conditions: ["mixedAbility"] },
      { label: "守備強化メニューを探す", query: "守備", contentFilter: "feed", conditions: ["defense"] },
      { label: "実戦形式メニューを探す", query: "実戦", contentFilter: "feed", conditions: ["gameSituation"] },
    ];
  }

  if (article.screen === "feature-rainy-day-practice") {
    return [
      { label: "雨の日メニューを探す", query: "雨の日", contentFilter: "feed", conditions: ["rainy"] },
      { label: "室内メニューを探す", query: "室内", contentFilter: "feed", conditions: ["rainy"] },
      { label: "怪我予防メニューを探す", query: "怪我予防", contentFilter: "feed", conditions: ["injuryPrevention"] },
      { label: "省スペースメニューを探す", query: "省スペース", contentFilter: "feed", conditions: ["smallSpace"] },
    ];
  }

  if (article.screen === "feature-practice-menu-template") {
    return [
      { label: "60分以内メニューを探す", query: "60分", contentFilter: "feed", conditions: ["under60"] },
      { label: "道具少なめメニューを探す", query: "道具", contentFilter: "feed", conditions: ["fewTools"] },
      { label: "初心者向けメニューを探す", query: "初心者", contentFilter: "feed", conditions: ["beginner"] },
      { label: "実戦形式メニューを探す", query: "実戦", contentFilter: "feed", conditions: ["gameSituation"] },
    ];
  }

  if (article.screen === "feature-60-minute-practice") {
    return [
      { label: "60分以内メニューを探す", query: "60分", contentFilter: "feed", conditions: ["under60"] },
      { label: "ウォームアップを探す", query: "ウォームアップ", contentFilter: "feed", conditions: ["warmup"] },
      { label: "省スペース練習を探す", query: "省スペース", contentFilter: "feed", conditions: ["smallSpace"] },
      { label: "実戦形式メニューを探す", query: "実戦", contentFilter: "feed", conditions: ["gameSituation"] },
      { label: "守備強化メニューを探す", query: "守備", contentFilter: "feed", conditions: ["defense"] },
      { label: "攻撃づくりメニューを探す", query: "攻撃", contentFilter: "feed", conditions: ["offense"] },
    ];
  }

  if (article.screen === "feature-beginner-practice") {
    return [
      { label: "初心者向けメニューを探す", query: "初心者", contentFilter: "feed", conditions: ["beginner"] },
      { label: "基礎づくりメニューを探す", query: "基礎", contentFilter: "feed", conditions: ["basicPractice"] },
      { label: "怪我予防メニューを探す", query: "怪我予防", contentFilter: "feed", conditions: ["injuryPrevention"] },
      { label: "体力差に対応するメニューを探す", query: "体力差", contentFilter: "feed", conditions: ["mixedAbility"] },
      { label: "ウォームアップを探す", query: "ウォームアップ", contentFilter: "feed", conditions: ["warmup"] },
    ];
  }

  if (article.screen === "feature-small-space-practice") {
    return [
      { label: "少人数メニューを探す", query: "少人数", contentFilter: "feed", conditions: ["fewPeople"] },
      { label: "省スペース練習を探す", query: "省スペース", contentFilter: "feed", conditions: ["smallSpace"] },
      { label: "道具少なめメニューを探す", query: "道具", contentFilter: "feed", conditions: ["fewTools"] },
      { label: "室内メニューを探す", query: "室内", contentFilter: "feed", conditions: ["rainy", "smallSpace"] },
      { label: "実戦形式メニューを探す", query: "実戦", contentFilter: "feed", conditions: ["gameSituation"] },
    ];
  }

  return article.keywords.slice(0, 3).map((keyword) => ({
    label: `${keyword}を探す`,
    query: keyword,
    contentFilter: "all",
  }));
};

type FeatureDetailScreenProps = {
  styles: Record<string, any>;
  article: FeatureArticleConfig;
  onGoToScreen: (screen: ScreenKey) => void;
  onOpenSearchPreset: (preset: SearchPreset) => void;
};

/**
 * 特集記事の詳細画面です。
 * 1URLにつき1テーマへ絞り、検索意図と内部リンクを明確にします。
 */
export function FeatureDetailScreen({
  styles,
  article,
  onGoToScreen,
  onOpenSearchPreset,
}: FeatureDetailScreenProps) {
  const searchShortcuts = getArticleSearchShortcuts(article);

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
            {section.points.map((point) => {
              const searchPreset = createPointSearchPreset(point, article);
              return (
                <Pressable
                  key={point}
                  accessibilityRole="link"
                  style={styles.pill}
                  onPress={() => onOpenSearchPreset(searchPreset)}
                >
                  <Text style={styles.pillText}>{point}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.heroCard}>
        <Text style={styles.sectionTitle}>検索キーワード</Text>
        <Text style={styles.heroText}>
          気になる言葉を押すと、検索画面で関連記事や投稿を探せます。
        </Text>
        <View style={styles.tagRow}>
          {article.keywords.map((keyword) => (
            <Pressable
              key={`${article.screen}-${keyword}`}
              accessibilityRole="link"
              style={styles.pill}
              onPress={() => onOpenSearchPreset({
                query: keyword,
                contentFilter: article.category.includes("練習") ? "feed" : "all",
              })}
            >
              <Text style={styles.pillText}>{keyword}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.sectionTitle}>条件からすぐ探す</Text>
        <Text style={styles.heroText}>
          気になる条件を押すと、検索画面で絞り込み済みの投稿を確認できます。
        </Text>
        <View style={styles.topShortcutGrid}>
          {searchShortcuts.map((shortcut) => (
            <Pressable
              key={`${article.screen}-${shortcut.label ?? shortcut.query}`}
              style={styles.shortcutCard}
              onPress={() => onOpenSearchPreset(shortcut)}
            >
              <Text style={styles.shortcutTitle}>
                {shortcut.label ?? `${shortcut.query}を探す`}
              </Text>
              <Text style={styles.shortcutText}>
                検索画面で関連する投稿を絞り込みます。
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

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
