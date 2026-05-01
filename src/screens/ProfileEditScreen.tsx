import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { sportGroups } from "../constants/app";
import {
  FeedbackBanner,
  FormField,
  ImageField,
  RegistrationHeader,
  SportSelector,
} from "../components/shared";
import type {
  AccountDeleteConfirmStep,
  ExternalLink,
  ProfileState,
} from "../types/app";

type SharedStyles = Record<string, any>;
type EditableProfileTextField = Exclude<
  keyof ProfileState,
  "selectedSports" | "externalLinks" | "consultationAvailable" | "paidConsultationAvailable"
>;

/**
 * プロフィール編集画面です。
 * 画像、表示情報、指導者向けプロフィール、外部リンク、興味種目を編集します。
 */
export function ProfileEditScreen({
  styles,
  profileDraft,
  authMessage,
  authError,
  onBack,
  onPickImage,
  onRemoveAvatar,
  onRemoveCover,
  onUpdateProfileDraft,
  onUpdateProfileAvailability,
  onUpdateProfileLink,
  onAddProfileLink,
  onToggleProfileSport,
  onSaveProfileEdits,
  onSetAccountDeleteConfirmStep,
}: {
  styles: SharedStyles;
  profileDraft: ProfileState;
  authMessage: string;
  authError: string;
  onBack: () => void;
  onPickImage: (kind: "profile" | "profile-cover") => void;
  onRemoveAvatar: () => void;
  onRemoveCover: () => void;
  onUpdateProfileDraft: (key: EditableProfileTextField, value: string) => void;
  onUpdateProfileAvailability: (
    key: "consultationAvailable" | "paidConsultationAvailable",
    value: boolean
  ) => void;
  onUpdateProfileLink: (id: string, key: keyof Omit<ExternalLink, "id">, value: string) => void;
  onAddProfileLink: () => void;
  onToggleProfileSport: (sport: string) => void;
  onSaveProfileEdits: () => void;
  onSetAccountDeleteConfirmStep: (step: AccountDeleteConfirmStep) => void;
}) {
  const isCoachProfile = profileDraft.role.includes("指導員");

  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <RegistrationHeader
        title="プロフィール編集"
        description="表示名、自己紹介、興味のある種目を編集できます。ここで選んだ種目が投稿表示にも反映されます。"
        onBack={onBack}
      />
      {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
      {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
      <View style={styles.registrationCard}>
        <ImageField
          title="アイコン"
          detail="任意項目"
          imageUri={profileDraft.avatarUrl || null}
          kind="avatar"
          onPress={() => onPickImage("profile")}
          onRemove={onRemoveAvatar}
        />
        <ImageField
          title="ヘッダー画像"
          detail="任意項目"
          imageUri={profileDraft.coverUrl || null}
          kind="cover"
          onPress={() => onPickImage("profile-cover")}
          onRemove={onRemoveCover}
        />
        <FormField
          label="表示名"
          detail="必須"
          placeholder="例: Coach Nexus"
          multiline={false}
          value={profileDraft.name}
          onChangeText={(value) => onUpdateProfileDraft("name", value)}
        />
        <FormField
          label="表示ID"
          detail="必須"
          placeholder="例: @coach_nexus"
          multiline={false}
          value={profileDraft.handle}
          onChangeText={(value) => onUpdateProfileDraft("handle", value)}
        />
        <FormField
          label="自己紹介"
          detail="任意"
          placeholder="活動内容や相談対応の方針を入力"
          multiline={true}
          value={profileDraft.bio}
          onChangeText={(value) => onUpdateProfileDraft("bio", value)}
        />

        {isCoachProfile ? (
          <>
            <View style={styles.practiceTemplateCard}>
              <Text style={styles.formLabel}>指導者プロフィール強化</Text>
              <Text style={styles.fieldSupport}>
                得意分野や相談可否を整えると、顧問の先生が「何を相談できる人か」を判断しやすくなります。
              </Text>
              <FormField
                label="得意分野"
                detail="任意"
                placeholder="例: 初心者指導、守備戦術、怪我予防"
                multiline={true}
                value={profileDraft.strengths}
                onChangeText={(value) => onUpdateProfileDraft("strengths", value)}
              />
              <FormField
                label="対応できる悩み"
                detail="任意"
                placeholder="例: 練習時間が短い、部員の体力差が大きい"
                multiline={true}
                value={profileDraft.supportTopics}
                onChangeText={(value) => onUpdateProfileDraft("supportTopics", value)}
              />
              <FormField
                label="資格"
                detail="任意"
                placeholder="例: 公認指導者資格、トレーナー資格"
                multiline={false}
                value={profileDraft.certifications}
                onChangeText={(value) => onUpdateProfileDraft("certifications", value)}
              />
              <FormField
                label="所属スクール"
                detail="任意"
                placeholder="例: Komonityスポーツスクール"
                multiline={false}
                value={profileDraft.organization}
                onChangeText={(value) => onUpdateProfileDraft("organization", value)}
              />
              <FormField
                label="YouTube"
                detail="任意"
                placeholder="例: https://youtube.com/@komonity"
                multiline={false}
                value={profileDraft.youtubeUrl}
                onChangeText={(value) => onUpdateProfileDraft("youtubeUrl", value)}
              />
              <FormField
                label="X / Instagram"
                detail="任意"
                placeholder="X URL"
                multiline={false}
                value={profileDraft.xUrl}
                onChangeText={(value) => onUpdateProfileDraft("xUrl", value)}
              />
              <FormField
                label="Instagram"
                detail="任意"
                placeholder="Instagram URL"
                multiline={false}
                value={profileDraft.instagramUrl}
                onChangeText={(value) => onUpdateProfileDraft("instagramUrl", value)}
              />
              <AvailabilityField
                styles={styles}
                title="相談受付"
                enabled={profileDraft.consultationAvailable}
                enabledLabel="受付可"
                disabledLabel="受付不可"
                onChange={(value) =>
                  onUpdateProfileAvailability("consultationAvailable", value)
                }
              />
              <AvailabilityField
                styles={styles}
                title="有料相談"
                enabled={profileDraft.paidConsultationAvailable}
                enabledLabel="対応可"
                disabledLabel="対応不可"
                onChange={(value) =>
                  onUpdateProfileAvailability("paidConsultationAvailable", value)
                }
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabel}>外部サイト情報</Text>
                <Text style={styles.formDetail}>任意項目 / 複数可</Text>
              </View>
              <Text style={styles.fieldSupport}>
                YouTube、Instagram、公式サイトなどを、名前とURLのセットで編集できます。
              </Text>
              <View style={styles.linkStack}>
                {profileDraft.externalLinks.map((link, index) => (
                  <View key={link.id} style={styles.linkCard}>
                    <Text style={styles.linkIndex}>リンク {index + 1}</Text>
                    <TextInput
                      placeholder="Webサイト名 例: YouTube"
                      placeholderTextColor="#94a3b8"
                      style={styles.input}
                      value={link.label}
                      onChangeText={(value) =>
                        onUpdateProfileLink(link.id, "label", value)
                      }
                    />
                    <TextInput
                      placeholder="URL 例: https://youtube.com/..."
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="none"
                      style={styles.input}
                      value={link.url}
                      onChangeText={(value) =>
                        onUpdateProfileLink(link.id, "url", value)
                      }
                    />
                  </View>
                ))}
                <Pressable style={styles.addButton} onPress={onAddProfileLink}>
                  <Text style={styles.addButtonText}>+ 入力欄を追加する</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : null}

        <SportSelector
          title="表示したい種目"
          detail="必須 / 複数選択"
          groups={sportGroups}
          selectedSports={profileDraft.selectedSports}
          onToggle={onToggleProfileSport}
        />
        <View style={styles.registrationFooter}>
          <Pressable style={styles.primaryButton} onPress={onSaveProfileEdits}>
            <Text style={styles.primaryButtonText}>変更を保存する</Text>
          </Pressable>
        </View>
        <View style={styles.accountDeleteSection}>
          <Text style={styles.accountDeleteTitle}>アカウント削除</Text>
          <Text style={styles.accountDeleteBody}>
            アカウントを削除すると、ログイン情報も利用できなくなります。必要な情報は事前に確認してください。
          </Text>
          <Pressable
            style={styles.accountDeleteButton}
            onPress={() => onSetAccountDeleteConfirmStep("confirm-first")}
          >
            <Text style={styles.accountDeleteButtonText}>アカウントを削除する</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function AvailabilityField({
  styles,
  title,
  enabled,
  enabledLabel,
  disabledLabel,
  onChange,
}: {
  styles: SharedStyles;
  title: string;
  enabled: boolean;
  enabledLabel: string;
  disabledLabel: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{title}</Text>
      <View style={styles.sportChipRow}>
        <Pressable
          style={[styles.postTargetChip, enabled && styles.postTargetChipActive]}
          onPress={() => onChange(true)}
        >
          <Text
            style={[
              styles.postTargetChipText,
              enabled && styles.postTargetChipTextActive,
            ]}
          >
            {enabledLabel}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.postTargetChip, !enabled && styles.postTargetChipActive]}
          onPress={() => onChange(false)}
        >
          <Text
            style={[
              styles.postTargetChipText,
              !enabled && styles.postTargetChipTextActive,
            ]}
          >
            {disabledLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
