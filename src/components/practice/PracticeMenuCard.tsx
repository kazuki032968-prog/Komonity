import { Text, View } from "react-native";

import { todayMenuConditionOptions } from "../../constants/app";
import { sharedStyles } from "../../styles/shared";
import type {
  PracticeMenuTemplate,
  PracticeStrategyTemplate,
} from "../../types/app";

type SharedStyles = Record<string, any>;

/**
 * 練習メニューテンプレートを、一覧/詳細どちらでも読みやすいカードとして表示します。
 */
export function PracticeMenuCard({
  menu,
  variant = "summary",
  styles = sharedStyles,
}: {
  menu?: PracticeMenuTemplate;
  variant?: "summary" | "detail";
  styles?: SharedStyles;
}) {
  if (!menu) {
    return null;
  }

  const rows = [
    ["対象レベル", menu.targetLevel],
    ["学年", menu.grade],
    ["人数", menu.participants],
    ["練習時間", menu.durationMinutes],
    ["必要な道具", menu.tools],
    ["目的", menu.purpose],
    ["手順", menu.steps],
    ["注意点", menu.cautions],
    ["よくある失敗", menu.commonMistakes],
    ["アレンジ", menu.arrangements],
  ].filter(([, value]) => value);
  const visibleRows = variant === "summary" ? rows.slice(0, 5) : rows;

  return (
    <View style={styles.practiceMenuBox}>
      <View style={styles.practiceMenuHeader}>
        <Text style={styles.practiceMenuTitle}>練習メニュー</Text>
        {menu.sport ? (
          <View style={styles.searchSourceBadge}>
            <Text style={styles.searchSourceBadgeText}>{menu.sport}</Text>
          </View>
        ) : null}
      </View>
      {visibleRows.map(([label, value]) => (
        <View key={label} style={styles.practiceMenuRow}>
          <Text style={styles.practiceMenuLabel}>{label}</Text>
          <Text style={styles.practiceMenuValue}>{value}</Text>
        </View>
      ))}
      {menu.conditionTags.length > 0 ? (
        <View style={styles.sportChipRow}>
          {menu.conditionTags.map((key) => {
            const condition = todayMenuConditionOptions.find(
              (option) => option.key === key
            );
            return condition ? (
              <View key={key} style={styles.sportChip}>
                <Text style={styles.sportChipText}>{condition.label}</Text>
              </View>
            ) : null;
          })}
        </View>
      ) : null}
    </View>
  );
}

/**
 * 戦術テンプレートを、局面・役割・判断基準が追いやすいカードとして表示します。
 */
export function PracticeStrategyCard({
  strategy,
  variant = "summary",
  styles = sharedStyles,
}: {
  strategy?: PracticeStrategyTemplate;
  variant?: "summary" | "detail";
  styles?: SharedStyles;
}) {
  if (!strategy) {
    return null;
  }

  const rows = [
    ["対象レベル", strategy.targetLevel],
    ["学年", strategy.grade],
    ["人数", strategy.participants],
    ["局面", strategy.phase],
    ["目的", strategy.objective],
    ["配置・形", strategy.formation],
    ["役割", strategy.roles],
    ["判断基準", strategy.triggers],
    ["実行手順", strategy.steps],
    ["注意点", strategy.cautions],
    ["よくある失敗", strategy.commonMistakes],
    ["練習への落とし込み", strategy.practiceDrill],
  ].filter(([, value]) => value);
  const visibleRows = variant === "summary" ? rows.slice(0, 5) : rows;

  return (
    <View style={styles.practiceMenuBox}>
      <View style={styles.practiceMenuHeader}>
        <Text style={styles.practiceMenuTitle}>戦術テンプレート</Text>
        {strategy.sport ? (
          <View style={styles.searchSourceBadge}>
            <Text style={styles.searchSourceBadgeText}>{strategy.sport}</Text>
          </View>
        ) : null}
      </View>
      {visibleRows.map(([label, value]) => (
        <View key={label} style={styles.practiceMenuRow}>
          <Text style={styles.practiceMenuLabel}>{label}</Text>
          <Text style={styles.practiceMenuValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}
