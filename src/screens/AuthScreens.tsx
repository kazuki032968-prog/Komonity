import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  advisorRegistrationFields,
  coachRegistrationFields,
  registrationOptions,
  sportGroups,
} from "../constants/app";
import {
  FeedbackBanner,
  FormField,
  ImageField,
  RegistrationHeader,
  SportSelector,
} from "../components/shared";
import type {
  AdvisorFormState,
  CoachFormState,
  ContactFormState,
  ExternalLink,
  LoginFormState,
  ScreenKey,
} from "../types/app";

type SharedStyles = Record<string, any>;

/**
 * 登録タイプ選択画面です。
 */
export function RegistrationRoleScreen({
  styles,
  onBack,
  onGoToScreen,
}: {
  styles: SharedStyles;
  onBack: () => void;
  onGoToScreen: (screen: ScreenKey) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <RegistrationHeader
        title="登録タイプを選択"
        description="ここで役割を選ぶと、それぞれ専用の登録ページへ進みます。"
        onBack={onBack}
      />
      <View style={styles.stack}>
        {registrationOptions.map((option) => (
          <Pressable
            key={option.id}
            style={styles.roleCard}
            onPress={() =>
              onGoToScreen(
                option.id === "advisor" ? "advisor-registration" : "coach-registration"
              )
            }
          >
            <Text style={styles.flowOptionTitle}>{option.title}</Text>
            <Text style={styles.flowOptionText}>{option.description}</Text>
            <Text style={styles.flowOptionCta}>専用登録ページへ進む</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

/**
 * 顧問登録画面です。
 */
export function AdvisorRegistrationScreen({
  styles,
  advisorForm,
  advisorIconUri,
  advisorCoverUri,
  authMessage,
  authError,
  isSubmitting,
  getAdvisorFieldKey,
  getAdvisorFieldValue,
  onBack,
  onPickImage,
  onRemoveIcon,
  onRemoveCover,
  onUpdateAdvisorForm,
  onToggleAdvisorSport,
  onRegisterAdvisor,
}: {
  styles: SharedStyles;
  advisorForm: AdvisorFormState;
  advisorIconUri: string | null;
  advisorCoverUri: string | null;
  authMessage: string;
  authError: string;
  isSubmitting: boolean;
  getAdvisorFieldKey: (label: string) => keyof AdvisorFormState;
  getAdvisorFieldValue: (label: string, form: AdvisorFormState) => string;
  onBack: () => void;
  onPickImage: (kind: "advisor" | "advisor-cover") => void;
  onRemoveIcon: () => void;
  onRemoveCover: () => void;
  onUpdateAdvisorForm: (key: keyof AdvisorFormState, value: string) => void;
  onToggleAdvisorSport: (sport: string) => void;
  onRegisterAdvisor: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <RegistrationHeader
        title="顧問登録ページ"
        description="学校名などの個人情報につながる表現を避けつつ、安心して相談参加できる登録画面を想定しています。ログイン用メールアドレスとパスワードは、ログイン時に使う非公開情報です。"
        onBack={onBack}
      />
      {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
      {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
      <View style={styles.registrationCard}>
        <ImageField
          title="アイコン"
          detail="任意項目"
          imageUri={advisorIconUri}
          kind="avatar"
          onPress={() => onPickImage("advisor")}
          onRemove={onRemoveIcon}
        />
        <ImageField
          title="ヘッダー画像"
          detail="任意項目"
          imageUri={advisorCoverUri}
          kind="cover"
          onPress={() => onPickImage("advisor-cover")}
          onRemove={onRemoveCover}
        />
        {advisorRegistrationFields.map((field) => (
          <FormField
            key={field.label}
            label={field.label}
            detail={field.detail}
            placeholder={field.placeholder}
            multiline={false}
            value={getAdvisorFieldValue(field.label, advisorForm)}
            onChangeText={(value) =>
              onUpdateAdvisorForm(getAdvisorFieldKey(field.label), value)
            }
          />
        ))}
        <SportSelector
          title="表示したい種目"
          detail="必須 / 複数選択"
          groups={sportGroups}
          selectedSports={advisorForm.selectedSports}
          onToggle={onToggleAdvisorSport}
        />
        <View style={styles.registrationFooter}>
          <Pressable
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={onRegisterAdvisor}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "登録中..." : "登録する"}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * 指導員登録画面です。
 */
export function CoachRegistrationScreen({
  styles,
  coachForm,
  coachIconUri,
  coachCoverUri,
  coachLinks,
  authMessage,
  authError,
  isSubmitting,
  getCoachFieldKey,
  getCoachFieldValue,
  onBack,
  onPickImage,
  onRemoveIcon,
  onRemoveCover,
  onUpdateCoachForm,
  onToggleCoachSport,
  onUpdateCoachLink,
  onAddCoachLink,
  onRegisterCoach,
}: {
  styles: SharedStyles;
  coachForm: CoachFormState;
  coachIconUri: string | null;
  coachCoverUri: string | null;
  coachLinks: ExternalLink[];
  authMessage: string;
  authError: string;
  isSubmitting: boolean;
  getCoachFieldKey: (label: string) => keyof CoachFormState;
  getCoachFieldValue: (label: string, form: CoachFormState) => string;
  onBack: () => void;
  onPickImage: (kind: "coach" | "coach-cover") => void;
  onRemoveIcon: () => void;
  onRemoveCover: () => void;
  onUpdateCoachForm: (key: keyof CoachFormState, value: string) => void;
  onToggleCoachSport: (sport: string) => void;
  onUpdateCoachLink: (id: string, key: keyof Omit<ExternalLink, "id">, value: string) => void;
  onAddCoachLink: () => void;
  onRegisterCoach: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <RegistrationHeader
        title="指導員登録ページ"
        description="外部リンクはサービス名とURLをセットで登録でき、複数ある場合は入力欄を追加する流れにしています。電話番号とメールアドレスは任意ですが、入力すると公開されます。ログイン用メールアドレスとパスワードは、ログイン時に使う非公開情報です。"
        onBack={onBack}
      />
      {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
      {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
      <View style={styles.registrationCard}>
        <ImageField
          title="アイコン"
          detail="任意項目"
          imageUri={coachIconUri}
          kind="avatar"
          onPress={() => onPickImage("coach")}
          onRemove={onRemoveIcon}
        />
        <ImageField
          title="ヘッダー画像"
          detail="任意項目"
          imageUri={coachCoverUri}
          kind="cover"
          onPress={() => onPickImage("coach-cover")}
          onRemove={onRemoveCover}
        />
        {coachRegistrationFields.map((field) => (
          <FormField
            key={field.label}
            label={field.label}
            detail={field.detail}
            placeholder={field.placeholder}
            multiline={["今までの経歴や功績", "得意分野", "対応できる悩み"].includes(
              field.label
            )}
            value={getCoachFieldValue(field.label, coachForm)}
            onChangeText={(value) => onUpdateCoachForm(getCoachFieldKey(field.label), value)}
          />
        ))}
        <SportSelector
          title="表示したい種目"
          detail="必須 / 複数選択"
          groups={sportGroups}
          selectedSports={coachForm.selectedSports}
          onToggle={onToggleCoachSport}
        />
        <Text style={styles.fieldSupport}>
          電話番号とメールアドレスは任意項目ですが、入力した場合は閲覧者に公開されます。
        </Text>

        <View style={styles.formGroup}>
          <View style={styles.formLabelRow}>
            <Text style={styles.formLabel}>Webサイト情報</Text>
            <Text style={styles.formDetail}>任意項目 / 複数可</Text>
          </View>
          <Text style={styles.fieldSupport}>
            YouTube、Instagram、公式サイトなど、何のURLか分かる名前とセットで登録します。
          </Text>
          <View style={styles.linkStack}>
            {coachLinks.map((link, index) => (
              <View key={link.id} style={styles.linkCard}>
                <Text style={styles.linkIndex}>リンク {index + 1}</Text>
                <TextInput
                  placeholder="Webサイト名 例: YouTube"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={link.label}
                  onChangeText={(value) => onUpdateCoachLink(link.id, "label", value)}
                />
                <TextInput
                  placeholder="URL 例: https://youtube.com/..."
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  style={styles.input}
                  value={link.url}
                  onChangeText={(value) => onUpdateCoachLink(link.id, "url", value)}
                />
              </View>
            ))}
            <Pressable style={styles.addButton} onPress={onAddCoachLink}>
              <Text style={styles.addButtonText}>+ 入力欄を追加する</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.registrationFooter}>
          <Pressable
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={onRegisterCoach}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "登録中..." : "登録する"}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * ログイン画面です。
 */
export function LoginScreen({
  styles,
  loginForm,
  authMessage,
  authError,
  isSubmitting,
  onBack,
  onUpdateLoginForm,
  onLogin,
  onGoToForgotPassword,
}: {
  styles: SharedStyles;
  loginForm: LoginFormState;
  authMessage: string;
  authError: string;
  isSubmitting: boolean;
  onBack: () => void;
  onUpdateLoginForm: (key: keyof LoginFormState, value: string) => void;
  onLogin: () => void;
  onGoToForgotPassword: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <RegistrationHeader
        title="ログイン"
        description="登録時に設定したログイン用メールアドレスとパスワードでログインします。"
        onBack={onBack}
      />
      {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
      {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
      <View style={styles.registrationCard}>
        <FormField
          label="ログイン用メールアドレス"
          detail="必須 / 非公開"
          placeholder="例: login@example.com"
          multiline={false}
          value={loginForm.email}
          onChangeText={(value) => onUpdateLoginForm("email", value)}
        />
        <FormField
          label="ログイン用パスワード"
          detail="必須 / 非公開"
          placeholder="登録時のパスワード"
          multiline={false}
          value={loginForm.password}
          onChangeText={(value) => onUpdateLoginForm("password", value)}
        />
        <View style={styles.registrationFooter}>
          <Pressable
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={onLogin}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "ログイン中..." : "ログインする"}
            </Text>
          </Pressable>
          <Pressable style={styles.textLinkButton} onPress={onGoToForgotPassword}>
            <Text style={styles.textLinkButtonText}>パスワードを忘れた場合</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * パスワード再設定画面です。
 */
export function ForgotPasswordScreen({
  styles,
  email,
  authMessage,
  authError,
  isSubmitting,
  onBack,
  onChangeEmail,
  onSubmit,
}: {
  styles: SharedStyles;
  email: string;
  authMessage: string;
  authError: string;
  isSubmitting: boolean;
  onBack: () => void;
  onChangeEmail: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <RegistrationHeader
        title="パスワード再設定"
        description="登録済みのメールアドレスを入力すると、パスワード再設定メールを送信します。メール内のリンクから新しいパスワードを設定できます。"
        onBack={onBack}
      />
      {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
      {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
      <View style={styles.registrationCard}>
        <FormField
          label="メールアドレス"
          detail="必須 / 非公開"
          placeholder="例: login@example.com"
          multiline={false}
          value={email}
          onChangeText={onChangeEmail}
        />
        <View style={styles.registrationFooter}>
          <Pressable
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "送信中..." : "再設定メールを送信する"}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * お問い合わせ画面です。
 */
export function ContactScreen({
  styles,
  contactForm,
  authMessage,
  authError,
  isSubmitting,
  onBack,
  onUpdateContactForm,
  onSubmit,
}: {
  styles: SharedStyles;
  contactForm: ContactFormState;
  authMessage: string;
  authError: string;
  isSubmitting: boolean;
  onBack: () => void;
  onUpdateContactForm: (key: keyof ContactFormState, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <RegistrationHeader
        title="お問い合わせ"
        description="不具合報告やご相談はこちらから送信できます。返信が必要な場合は入力されたメールアドレス宛にご連絡します。"
        onBack={onBack}
      />
      {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
      {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
      <View style={styles.registrationCard}>
        <FormField
          label="返信先メールアドレス"
          detail="必須"
          placeholder="例: your-address@example.com"
          multiline={false}
          value={contactForm.email}
          onChangeText={(value) => onUpdateContactForm("email", value)}
        />
        <FormField
          label="件名"
          detail="必須"
          placeholder="例: アカウントについて"
          multiline={false}
          value={contactForm.subject}
          onChangeText={(value) => onUpdateContactForm("subject", value)}
        />
        <FormField
          label="本文"
          detail="必須 / 2000文字まで"
          placeholder="お問い合わせ内容を入力してください"
          multiline={true}
          value={contactForm.body}
          onChangeText={(value) => onUpdateContactForm("body", value)}
          maxLength={2000}
        />
        <View style={styles.registrationFooter}>
          <Pressable
            style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "送信中..." : "お問い合わせを送信する"}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
