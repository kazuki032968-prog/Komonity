import { Pressable, ScrollView, Text, View } from "react-native";
import type { User } from "firebase/auth";

import type { ScreenKey } from "../../types/app";

type SharedStyles = Record<string, any>;

/**
 * 右側から開くグローバルメニューです。
 * 遷移先だけを受け取り、ログイン状態に応じた表示切り替えを担当します。
 */
export function SideMenu({
  styles,
  authUser,
  onClose,
  onGoToScreen,
  onLogout,
}: {
  styles: SharedStyles;
  authUser: User | null;
  onClose: () => void;
  onGoToScreen: (screen: ScreenKey) => void;
  onLogout: () => void;
}) {
  const navigate = (screen: ScreenKey) => {
    onGoToScreen(screen);
  };

  return (
    <View style={styles.menuOverlay}>
      <Pressable style={styles.menuBackdrop} onPress={onClose} />
      <ScrollView style={styles.sideMenu} contentContainerStyle={styles.sideMenuContent}>
        <View style={styles.sideMenuHeader}>
          <Text style={styles.sideMenuTitle}>メニュー</Text>
          <Pressable
            accessibilityLabel="サイドメニューを閉じる"
            style={styles.sideMenuCloseButton}
            onPress={onClose}
          >
            <Text style={styles.sideMenuCloseButtonText}>×</Text>
          </Pressable>
        </View>
        <Pressable style={styles.sideMenuItem} onPress={() => navigate("top")}>
          <Text style={styles.sideMenuItemText}>タイムライン</Text>
        </Pressable>
        <Pressable
          style={styles.sideMenuItem}
          onPress={() => navigate("service-detail")}
        >
          <Text style={styles.sideMenuItemText}>サービス詳細</Text>
        </Pressable>
        <Pressable style={styles.sideMenuItem} onPress={() => navigate("post-compose")}>
          <Text style={styles.sideMenuItemText}>投稿する</Text>
        </Pressable>
        <Pressable style={styles.sideMenuItem} onPress={() => navigate("search")}>
          <Text style={styles.sideMenuItemText}>検索</Text>
        </Pressable>
        <Pressable style={styles.sideMenuItem} onPress={() => navigate("notifications")}>
          <Text style={styles.sideMenuItemText}>通知</Text>
        </Pressable>
        <Pressable style={styles.sideMenuItem} onPress={() => navigate("experts")}>
          <Text style={styles.sideMenuItemText}>話題の指導者</Text>
        </Pressable>
        <Pressable style={styles.sideMenuItem} onPress={() => navigate("mypage")}>
          <Text style={styles.sideMenuItemText}>マイページ</Text>
        </Pressable>
        <Pressable style={styles.sideMenuItem} onPress={() => navigate("contact")}>
          <Text style={styles.sideMenuItemText}>お問い合わせ</Text>
        </Pressable>
        <Pressable style={styles.sideMenuItem} onPress={() => navigate("privacy-policy")}>
          <Text style={styles.sideMenuItemText}>プライバシーポリシー</Text>
        </Pressable>
        <Pressable style={styles.sideMenuItem} onPress={() => navigate("terms")}>
          <Text style={styles.sideMenuItemText}>利用規約</Text>
        </Pressable>
        {!authUser ? (
          <Pressable
            style={styles.sideMenuItem}
            onPress={() => navigate("registration-role")}
          >
            <Text style={styles.sideMenuItemText}>新規登録</Text>
          </Pressable>
        ) : null}
        {authUser ? (
          <Pressable style={styles.sideMenuItem} onPress={onLogout}>
            <Text style={styles.sideMenuItemText}>ログアウト</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.sideMenuItem} onPress={() => navigate("login")}>
            <Text style={styles.sideMenuItemText}>ログイン</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
