import { Modal, Pressable, Text, View } from "react-native";

import type {
  AccountDeleteConfirmStep,
  BadgeModalState,
  ExternalLinkModalState,
  Reply,
} from "../../types/app";

type AppModalsProps = {
  styles: Record<string, any>;
  accountDeleteConfirmStep: AccountDeleteConfirmStep;
  bestAnswerCandidate: Reply | null;
  badgeModalState: BadgeModalState;
  externalLinkModalState: ExternalLinkModalState;
  onCloseAccountDelete: () => void;
  onProceedAccountDelete: () => void;
  onConfirmAccountDelete: () => void;
  onCloseBestAnswer: () => void;
  onConfirmBestAnswer: () => void;
  onCloseBadgeModal: () => void;
  onCloseExternalLink: () => void;
  onConfirmExternalLink: () => void;
};

/**
 * App全体で使う確認モーダルをまとめて描画します。
 * 画面本体からモーダルの詳細JSXを分離し、App.tsxをルーティングと状態管理へ寄せます。
 */
export function AppModals({
  styles,
  accountDeleteConfirmStep,
  bestAnswerCandidate,
  badgeModalState,
  externalLinkModalState,
  onCloseAccountDelete,
  onProceedAccountDelete,
  onConfirmAccountDelete,
  onCloseBestAnswer,
  onConfirmBestAnswer,
  onCloseBadgeModal,
  onCloseExternalLink,
  onConfirmExternalLink,
}: AppModalsProps) {
  return (
    <>
      <Modal
        transparent={true}
        visible={accountDeleteConfirmStep === "confirm-first"}
        animationType="fade"
        onRequestClose={onCloseAccountDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>アカウントを削除しますか</Text>
            <Text style={styles.modalBody}>
              この操作を行うと、Komonity に登録したプロフィールとログイン情報が削除対象になります。
            </Text>
            <View style={styles.modalButtonRow}>
              <Pressable style={styles.modalSecondaryButton} onPress={onCloseAccountDelete}>
                <Text style={styles.modalSecondaryButtonText}>やめる</Text>
              </Pressable>
              <Pressable style={styles.modalDangerButton} onPress={onProceedAccountDelete}>
                <Text style={styles.modalDangerButtonText}>削除に進む</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={accountDeleteConfirmStep === "confirm-final"}
        animationType="fade"
        onRequestClose={onCloseAccountDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>本当に削除してよいですか</Text>
            <Text style={styles.modalBody}>
              この削除は取り消せません。アカウント、プロフィール画像、ヘッダー画像、認証情報が完全に削除されます。
            </Text>
            <View style={styles.modalButtonRow}>
              <Pressable style={styles.modalSecondaryButton} onPress={onCloseAccountDelete}>
                <Text style={styles.modalSecondaryButtonText}>キャンセル</Text>
              </Pressable>
              <Pressable style={styles.modalDangerButton} onPress={onConfirmAccountDelete}>
                <Text style={styles.modalDangerButtonText}>完全に削除する</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={bestAnswerCandidate !== null}
        animationType="fade"
        onRequestClose={onCloseBestAnswer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>ベストアンサーを登録しますか</Text>
            <Text style={styles.modalBody}>
              ベストアンサーは一度登録すると、削除や別の回答への変更はできません。
              内容を確認して問題なければ登録してください。
            </Text>
            <View style={styles.modalButtonRow}>
              <Pressable style={styles.modalSecondaryButton} onPress={onCloseBestAnswer}>
                <Text style={styles.modalSecondaryButtonText}>キャンセル</Text>
              </Pressable>
              <Pressable style={styles.modalPrimaryButton} onPress={onConfirmBestAnswer}>
                <Text style={styles.modalPrimaryButtonText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={badgeModalState.badges.length > 0}
        animationType="fade"
        onRequestClose={onCloseBadgeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{badgeModalState.title}</Text>
            <Text style={styles.modalBody}>
              活動実績に応じて獲得したバッジです。ブロンズ、シルバー、ゴールドの順で成長します。
            </Text>
            <View style={styles.badgeModalStack}>
              {badgeModalState.badges.map((badge) => (
                <View
                  key={`${badge.id}-${badge.tier}`}
                  style={[
                    styles.badgeModalCard,
                    badge.tier === "bronze"
                      ? styles.badgeModalCardBronze
                      : badge.tier === "silver"
                        ? styles.badgeModalCardSilver
                        : styles.badgeModalCardGold,
                  ]}
                >
                  <View style={styles.badgeStackedWrap}>
                    <View
                      style={[
                        styles.kBadge,
                        styles.kBadgeLarge,
                        badge.tier === "bronze"
                          ? styles.badgeBronze
                          : badge.tier === "silver"
                            ? styles.badgeSilver
                            : styles.badgeGold,
                      ]}
                    >
                      <View style={styles.kBadgeInner}>
                        <Text style={styles.kBadgeText}>K</Text>
                      </View>
                    </View>
                    <View style={[styles.badgeRibbon, styles.badgeRibbonLarge]}>
                      <Text style={styles.badgeRibbonText}>
                        {badge.tier === "bronze"
                          ? "BRONZE"
                          : badge.tier === "silver"
                            ? "SILVER"
                            : "GOLD"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.badgeModalTextWrap}>
                    <Text style={styles.badgeTierText}>
                      {badge.tier === "bronze"
                        ? "ブロンズ"
                        : badge.tier === "silver"
                          ? "シルバー"
                          : "ゴールド"}
                    </Text>
                    <Text style={styles.badgeLabelText}>{badge.label}</Text>
                    <Text style={styles.badgeDescriptionText}>{badge.description}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Pressable style={styles.modalPrimaryButton} onPress={onCloseBadgeModal}>
              <Text style={styles.modalPrimaryButtonText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={externalLinkModalState.visible}
        animationType="fade"
        onRequestClose={onCloseExternalLink}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>外部サイトを開きます</Text>
            <Text style={styles.modalBody}>
              {externalLinkModalState.label || "外部サイト"} を別タブで開きます。移動先の内容にはご注意ください。
            </Text>
            <Text style={styles.externalLinkModalUrl}>{externalLinkModalState.url}</Text>
            <View style={styles.modalActionRow}>
              <Pressable style={styles.modalSecondaryButton} onPress={onCloseExternalLink}>
                <Text style={styles.modalSecondaryButtonText}>キャンセル</Text>
              </Pressable>
              <Pressable style={styles.modalPrimaryButton} onPress={onConfirmExternalLink}>
                <Text style={styles.modalPrimaryButtonText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
