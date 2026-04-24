import type { User } from "firebase/auth";
import { Pressable, ScrollView, Text, View } from "react-native";

import { FeedbackBanner } from "../components/shared";
import type { ScreenKey } from "../types/app";

type OverviewStat = {
  label: string;
  value: string;
  note: string;
};

type ServiceDetailScreenProps = {
  styles: Record<string, any>;
  authUser: User | null;
  authMessage: string;
  authError: string;
  overviewStats: OverviewStat[];
  onGoToScreen: (screen: ScreenKey) => void;
  onLogout: () => void;
};

/**
 * サービス紹介と利用導線をまとめた画面です。
 * 将来的には marketing / onboarding 系 screen をこの層に集約します。
 */
export function ServiceDetailScreen({
  styles,
  authUser,
  authMessage,
  authError,
  overviewStats,
  onGoToScreen,
  onLogout,
}: ServiceDetailScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>サービス詳細</Text>
        <Text style={styles.heroTitle}>顧問の先生と指導者をつなぐ、相談と実践共有のサービス</Text>
        <Text style={styles.heroText}>
          練習メニューの相談、ベストアンサー、毎日の知見投稿、顧問同士の相互支援、
          指導者の実績可視化までをひとつにまとめたプロトタイプです。
        </Text>
        <View style={styles.heroActions}>
          <Pressable style={styles.primaryButton} onPress={() => onGoToScreen("post-compose")}>
            <Text style={styles.primaryButtonText}>投稿する</Text>
          </Pressable>
          {!authUser ? (
            <Pressable style={styles.secondaryButton} onPress={() => onGoToScreen("registration-role")}>
              <Text style={styles.secondaryButtonText}>登録する</Text>
            </Pressable>
          ) : null}
          {authUser ? (
            <Pressable style={styles.ghostButton} onPress={onLogout}>
              <Text style={styles.ghostButtonText}>ログアウト</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.ghostButton} onPress={() => onGoToScreen("login")}>
              <Text style={styles.ghostButtonText}>ログイン</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>登録フロー</Text>
          <Text style={styles.flowText}>
            まず役割を選ぶページへ進み、その後に顧問用または指導員用の専用登録ページへ遷移する流れです。
          </Text>
          <Text style={styles.flowHint}>ホーム → 役割選択 → 専用登録ページ → アカウント登録</Text>
        </View>
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>活動バッジ制度</Text>
          <Text style={styles.flowText}>
            指導者は、投稿数、継続投稿日数、フォロワー数、いいね・再投稿・保存の獲得数、返信実績、
            ベストアンサー獲得数、プロフィール完成などの活動に応じてバッジを獲得できます。
          </Text>
          <Text style={styles.flowText}>
            バッジは `K` マークのメダルとして表示され、ブロンズ、シルバー、ゴールドの3段階で成長します。
            顧問アカウントからも確認できるため、どのような分野で継続的に活動している指導者かが分かりやすくなります。
          </Text>
          <Text style={styles.flowHint}>例: 投稿実績 / 継続投稿 / 反応獲得 / ベストアンサー / プロフィール完成</Text>
        </View>
      </View>

      {authMessage ? <FeedbackBanner kind="success" message={authMessage} styles={styles} /> : null}
      {authError ? <FeedbackBanner kind="error" message={authError} styles={styles} /> : null}

      <View style={styles.statsRow}>
        {overviewStats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statNote}>{stat.note}</Text>
          </View>
        ))}
      </View>

      <View style={styles.topShortcutGrid}>
        <Pressable style={styles.shortcutCard} onPress={() => onGoToScreen("top")}>
          <Text style={styles.shortcutTitle}>タイムライン</Text>
          <Text style={styles.shortcutText}>すべての投稿を新しい順でまとめて確認できます。</Text>
        </Pressable>
        <Pressable style={styles.shortcutCard} onPress={() => onGoToScreen("feed")}>
          <Text style={styles.shortcutTitle}>メニュー・戦術</Text>
          <Text style={styles.shortcutText}>指導者によるおすすめの練習メニューや戦術投稿だけを確認できます。</Text>
        </Pressable>
        <Pressable style={styles.shortcutCard} onPress={() => onGoToScreen("questions")}>
          <Text style={styles.shortcutTitle}>相談広場</Text>
          <Text style={styles.shortcutText}>顧問の先生の悩みとベストアンサーをまとめて見られます。</Text>
        </Pressable>
        <Pressable style={styles.shortcutCard} onPress={() => onGoToScreen("experts")}>
          <Text style={styles.shortcutTitle}>話題の指導者</Text>
          <Text style={styles.shortcutText}>全種目の指導者を、反応と更新頻度をもとに確認できます。</Text>
        </Pressable>
        <Pressable style={styles.shortcutCard} onPress={() => onGoToScreen("community")}>
          <Text style={styles.shortcutTitle}>コミュニティ</Text>
          <Text style={styles.shortcutText}>顧問同士の公開相談や資料共有の場に移動します。</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
