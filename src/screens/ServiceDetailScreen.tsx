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
        <Text style={styles.heroTitle}>
          専門外の部活指導で悩む顧問の先生と、知見を持つ指導者をつなぐサービス
        </Text>
        <Text style={styles.heroText}>
          顧問の先生の悩みを減らし、子どもたちにより良い指導を届けるために、
          練習メニュー、戦術、怪我予防、回答実績をひとつにまとめて見られる場を目指しています。
        </Text>
        <View style={styles.heroActions}>
          <Pressable style={styles.primaryButton} onPress={() => onGoToScreen("coach-registration")}>
            <Text style={styles.primaryButtonText}>指導者として登録する</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => onGoToScreen("contact")}>
            <Text style={styles.secondaryButtonText}>意見を送る</Text>
          </Pressable>
          {authUser ? <Pressable style={styles.ghostButton} onPress={onLogout}><Text style={styles.ghostButtonText}>ログアウト</Text></Pressable> : <Pressable style={styles.ghostButton} onPress={() => onGoToScreen("login")}><Text style={styles.ghostButtonText}>ログイン</Text></Pressable>}
        </View>
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>先行公開中です</Text>
          <Text style={styles.flowText}>
            Komonity は現在、開発・改修を進めながら先行公開中です。いただいた意見をもとに、
            使いやすさと安心感を高める改善を続けています。
          </Text>
          <Text style={styles.flowHint}>投稿数や数値が少ない箇所も、立ち上げ期として育てている最中です。</Text>
        </View>
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>現在、先行して指導者・経験者の方を募集しています</Text>
          <Text style={styles.flowText}>
            競技経験のある方、スクールで教えている方、練習メニューや戦術を伝えられる方、
            ストレッチや怪我予防の知識がある方の参加を歓迎しています。
          </Text>
          <Text style={styles.flowHint}>まずは知見を届けてくださる指導者の方と一緒に土台を育てていきたい段階です。</Text>
        </View>
      </View>

      {authMessage ? <FeedbackBanner kind="success" message={authMessage} styles={styles} /> : null}
      {authError ? <FeedbackBanner kind="error" message={authError} styles={styles} /> : null}

      <View style={styles.topShortcutGrid}>
        <View style={styles.shortcutCard}>
          <Text style={styles.shortcutTitle}>Komonity の特徴</Text>
          <Text style={styles.shortcutText}>無料で使える</Text>
          <Text style={styles.shortcutText}>外部指導者をすぐ雇わなくても知見を得られる</Text>
          <Text style={styles.shortcutText}>練習メニューや戦術を相談しやすい</Text>
          <Text style={styles.shortcutText}>活動実績やバッジで信頼性が見える</Text>
          <Text style={styles.shortcutText}>子どもたちにより良い指導が届く環境を目指している</Text>
        </View>
        <View style={styles.shortcutCard}>
          <Text style={styles.shortcutTitle}>顧問の先生にとって</Text>
          <Text style={styles.shortcutText}>練習メニューや戦術の悩みを相談しやすい</Text>
          <Text style={styles.shortcutText}>専門外の種目でも知見を得やすい</Text>
          <Text style={styles.shortcutText}>怪我予防やストレッチの情報も見つけやすい</Text>
        </View>
        <View style={styles.shortcutCard}>
          <Text style={styles.shortcutTitle}>指導者にとって</Text>
          <Text style={styles.shortcutText}>自分の知見や経験を届けられる</Text>
          <Text style={styles.shortcutText}>実績や貢献が見える</Text>
          <Text style={styles.shortcutText}>スクールや活動の認知につながる</Text>
          <Text style={styles.shortcutText}>将来的な収益化の可能性がある</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>活動バッジ制度</Text>
          <Text style={styles.flowText}>
            活動バッジで、信頼性や継続的な貢献が見えるようになります。顧問の先生は、
            どの分野で継続的に活動している指導者かを判断しやすくなります。
          </Text>
          <Text style={styles.flowHint}>例: 投稿実績 / 継続投稿 / 反応獲得 / ベストアンサー / プロフィール完成</Text>
        </View>
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>使い方</Text>
          <Text style={styles.flowText}>1. 登録する</Text>
          <Text style={styles.flowText}>2. 投稿・相談・知見共有を見る</Text>
          <Text style={styles.flowText}>3. 返信や交流を通じて知見を集める</Text>
        </View>
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>今後追加予定の機能</Text>
          <Text style={styles.flowText}>本人確認 / DM機能 / 練習試合の調整</Text>
          <Text style={styles.flowText}>インプレッション数の可視化 / 指導者の収益化</Text>
        </View>
        <View style={styles.statsRow}>
          {overviewStats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statNote}>{stat.note}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
