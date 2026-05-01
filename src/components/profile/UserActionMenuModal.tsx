import { Modal, Pressable, Text, TextInput, View } from "react-native";

import type { UserActionMenuState } from "../../types/app";

type SharedStyles = Record<string, any>;

/**
 * ユーザーページの「投稿通知・ブロック・スパム報告」をまとめた操作モーダルです。
 * 具体的な保存処理は画面側から渡し、UI と入力管理だけをここに閉じ込めます。
 */
export function UserActionMenuModal({
  styles,
  state,
  spamReason,
  currentPostAlertUserIds,
  currentBlockedUserIds,
  onChangeSpamReason,
  onClose,
  onTogglePostAlert,
  onToggleBlock,
  onReportSpam,
}: {
  styles: SharedStyles;
  state: UserActionMenuState;
  spamReason: string;
  currentPostAlertUserIds: string[];
  currentBlockedUserIds: string[];
  onChangeSpamReason: (value: string) => void;
  onClose: () => void;
  onTogglePostAlert: (targetUid?: string, targetName?: string) => void;
  onToggleBlock: (targetUid?: string, targetName?: string) => void;
  onReportSpam: (targetUid?: string, targetName?: string, reason?: string) => void;
}) {
  return (
    <Modal transparent visible={state.open} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalFill} onPress={onClose} />
        <View style={styles.userActionMenuCard}>
          <Text style={styles.modalTitle}>
            {state.targetName || "このアカウント"}への操作
          </Text>
          <Pressable
            style={styles.userActionMenuItem}
            onPress={() => {
              onTogglePostAlert(state.targetUid, state.targetName);
              onClose();
            }}
          >
            <Text style={styles.userActionMenuItemText}>
              {state.targetUid && currentPostAlertUserIds.includes(state.targetUid)
                ? "投稿通知を解除"
                : "投稿を通知"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.userActionMenuItem}
            onPress={() => {
              onToggleBlock(state.targetUid, state.targetName);
              onClose();
            }}
          >
            <Text style={styles.userActionMenuItemText}>
              {state.targetUid && currentBlockedUserIds.includes(state.targetUid)
                ? "ブロックを解除"
                : "ブロック"}
            </Text>
          </Pressable>
          <TextInput
            placeholder="スパム報告の理由を入力"
            placeholderTextColor="#94a3b8"
            style={[styles.input, styles.textArea]}
            multiline
            value={spamReason}
            onChangeText={onChangeSpamReason}
          />
          <Pressable
            style={[styles.primaryButton, styles.userActionMenuSubmit]}
            onPress={() => {
              onReportSpam(state.targetUid, state.targetName, spamReason);
              onClose();
            }}
          >
            <Text style={styles.primaryButtonText}>スパム報告を送信</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
