import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { User } from "firebase/auth";

import {
  ComposeMediaPreview,
  FeedbackBanner,
  FormField,
  RegistrationHeader,
  RichTextToolbar,
} from "../components/shared";
import {
  POST_BODY_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  feedKindOptions,
  practiceLevelOptions,
  schoolGradeOptions,
  todayMenuConditionOptions,
} from "../constants/app";
import type {
  ComposeState,
  LocalMediaAsset,
  PracticeMenuTemplate,
  PracticeStrategyTemplate,
  ProfileState,
  TextSelectionRange,
  TodayMenuConditionKey,
} from "../types/app";
import { getAvailablePostTargets } from "../utils/appUtils";

type SharedStyles = Record<string, any>;

/**
 * 投稿作成画面です。
 * 指導員向けの練習メニューテンプレと、顧問向け投稿先切り替えをまとめて扱います。
 */
export function PostComposeScreen({
  styles,
  authUser,
  profileState,
  composeState,
  composeMedia,
  composeBodySelection,
  authMessage,
  authError,
  isPublishing,
  onGoToRegister,
  onGoToLogin,
  onUpdateComposeState,
  onUpdatePracticeMenuField,
  onUpdatePracticeStrategyField,
  onToggleComposeSport,
  onTogglePracticeMenuCondition,
  onApplyComposeFormatting,
  onSetComposeBodySelection,
  onPickComposeMedia,
  onRemoveComposeMedia,
  onSubmitPost,
}: {
  styles: SharedStyles;
  authUser: User | null;
  profileState: ProfileState;
  composeState: ComposeState;
  composeMedia: LocalMediaAsset[];
  composeBodySelection: TextSelectionRange;
  authMessage: string;
  authError: string;
  isPublishing: boolean;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
  onUpdateComposeState: (
    key: "target" | "feedKind" | "title" | "body",
    value: string
  ) => void;
  onUpdatePracticeMenuField: (
    key: Exclude<keyof PracticeMenuTemplate, "conditionTags">,
    value: string
  ) => void;
  onUpdatePracticeStrategyField: (
    key: keyof PracticeStrategyTemplate,
    value: string
  ) => void;
  onToggleComposeSport: (sport: string) => void;
  onTogglePracticeMenuCondition: (key: TodayMenuConditionKey) => void;
  onApplyComposeFormatting: (action: any) => void;
  onSetComposeBodySelection: (selection: TextSelectionRange) => void;
  onPickComposeMedia: () => void;
  onRemoveComposeMedia: (id: string) => void;
  onSubmitPost: () => void;
}) {
  const isCoachPostingFeed =
    profileState.role.includes("指導員") && composeState.target === "feed";

  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <RegistrationHeader
        title="投稿を作成"
        description={
          !authUser
            ? "投稿の閲覧はできますが、投稿や返信を行うには登録またはログインが必要です。"
            : profileState.role.includes("指導員")
            ? "指導員はメニュー・戦術へ知見や練習メニューを投稿できます。リプライは全員が参加できます。"
            : "顧問は相談広場またはコミュニティへ投稿できます。リプライは全員が参加できます。"
        }
        collapsible={true}
        showBackButton={false}
      />
      {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
      {authError ? <FeedbackBanner kind="error" message={authError} /> : null}
      <View style={styles.registrationCard}>
        {!authUser ? (
          <View style={styles.formGroup}>
            <View style={styles.formLabelRow}>
              <Text style={styles.formLabel}>投稿先</Text>
              <Text style={styles.formDetail}>登録が必要です</Text>
            </View>
            <Text style={styles.fieldSupport}>
              投稿するには会員登録またはログインが必要です。登録後に、役割に応じた投稿先を選べるようになります。
            </Text>
            <View style={styles.registrationFlowCard}>
              <Text style={styles.registrationFlowText}>
                投稿機能は登録済みユーザーのみ利用できます。まずは登録して、顧問または指導員としてアカウントを作成してください。
              </Text>
              <View style={styles.inlineButtonRow}>
                <Pressable style={styles.primaryButton} onPress={onGoToRegister}>
                  <Text style={styles.primaryButtonText}>登録する</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={onGoToLogin}>
                  <Text style={styles.secondaryButtonText}>ログインする</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
        {authUser ? (
          <>
            <View style={styles.formGroup}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabel}>投稿先</Text>
                <Text style={styles.formDetail}>役割に応じて選択</Text>
              </View>
              <Text style={styles.fieldSupport}>
                指導員はメニュー・戦術のみ、顧問は相談広場とコミュニティに投稿できます。
              </Text>
              <View style={styles.postTargetRow}>
                {getAvailablePostTargets(profileState.role).map((target) => {
                  const active = composeState.target === target.key;
                  return (
                    <Pressable
                      key={target.key}
                      style={[
                        styles.postTargetChip,
                        active && styles.postTargetChipActive,
                      ]}
                      onPress={() => onUpdateComposeState("target", target.key)}
                    >
                      <Text
                        style={[
                          styles.postTargetChipText,
                          active && styles.postTargetChipTextActive,
                        ]}
                      >
                        {target.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <FormField
              label="タイトル"
              detail="必須"
              placeholder="例: 今日の練習で相談したいこと / 共有したいメニュー"
              multiline={false}
              value={composeState.title}
              onChangeText={(value) => onUpdateComposeState("title", value)}
              maxLength={POST_TITLE_MAX_LENGTH}
            />
            {isCoachPostingFeed ? (
              <View style={styles.formGroup}>
                <View style={styles.formLabelRow}>
                  <Text style={styles.formLabel}>投稿する種目</Text>
                  <Text style={styles.formDetail}>必須 / 複数選択</Text>
                </View>
                <Text style={styles.fieldSupport}>
                  プロフィールで登録している種目の中から、この投稿に該当するものを選択してください。
                </Text>
                <View style={styles.sportChipRow}>
                  {profileState.selectedSports.map((sport) => {
                    const selected = composeState.selectedSports.includes(sport);
                    return (
                      <Pressable
                        key={sport}
                        style={[
                          styles.postTargetChip,
                          selected && styles.postTargetChipActive,
                        ]}
                        onPress={() => onToggleComposeSport(sport)}
                      >
                        <Text
                          style={[
                            styles.postTargetChipText,
                            selected && styles.postTargetChipTextActive,
                          ]}
                        >
                          {sport}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
            {isCoachPostingFeed ? (
              <View style={styles.formGroup}>
                <View style={styles.formLabelRow}>
                  <Text style={styles.formLabel}>投稿タイプ</Text>
                  <Text style={styles.formDetail}>必須</Text>
                </View>
                <Text style={styles.fieldSupport}>
                  練習メニューと戦術を分けることで、顧問の先生が目的に合った投稿を探しやすくなります。
                </Text>
                <View style={styles.postTargetRow}>
                  {feedKindOptions.map((option) => {
                    const active = composeState.feedKind === option.key;
                    return (
                      <Pressable
                        key={option.key}
                        style={[
                          styles.postTargetChip,
                          active && styles.postTargetChipActive,
                        ]}
                        onPress={() => onUpdateComposeState("feedKind", option.key)}
                      >
                        <Text
                          style={[
                            styles.postTargetChipText,
                            active && styles.postTargetChipTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.fieldSupport}>
                  {
                    feedKindOptions.find(
                      (option) => option.key === composeState.feedKind
                    )?.description
                  }
                </Text>
              </View>
            ) : null}
            {isCoachPostingFeed && composeState.feedKind === "menu" ? (
              <View style={styles.practiceTemplateCard}>
                <View style={styles.formLabelRow}>
                  <Text style={styles.formLabel}>練習メニュー投稿テンプレ</Text>
                  <Text style={styles.formDetail}>必須</Text>
                </View>
                <Text style={styles.fieldSupport}>
                  顧問の先生がそのまま部活で使えるよう、条件と実施手順を型として残します。
                </Text>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>種目</Text>
                  <View style={styles.sportChipRow}>
                    {profileState.selectedSports.map((sport) => {
                      const selected = composeState.practiceMenu.sport === sport;
                      return (
                        <Pressable
                          key={sport}
                          style={[
                            styles.postTargetChip,
                            selected && styles.postTargetChipActive,
                          ]}
                          onPress={() => onUpdatePracticeMenuField("sport", sport)}
                        >
                          <Text
                            style={[
                              styles.postTargetChipText,
                              selected && styles.postTargetChipTextActive,
                            ]}
                          >
                            {sport}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>対象レベル</Text>
                  <View style={styles.sportChipRow}>
                    {practiceLevelOptions.map((level) => {
                      const selected = composeState.practiceMenu.targetLevel === level;
                      return (
                        <Pressable
                          key={level}
                          style={[
                            styles.postTargetChip,
                            selected && styles.postTargetChipActive,
                          ]}
                          onPress={() =>
                            onUpdatePracticeMenuField("targetLevel", level)
                          }
                        >
                          <Text
                            style={[
                              styles.postTargetChipText,
                              selected && styles.postTargetChipTextActive,
                            ]}
                          >
                            {level}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>学年</Text>
                  <View style={styles.sportChipRow}>
                    {schoolGradeOptions.map((grade) => {
                      const selected = composeState.practiceMenu.grade === grade;
                      return (
                        <Pressable
                          key={grade}
                          style={[
                            styles.postTargetChip,
                            selected && styles.postTargetChipActive,
                          ]}
                          onPress={() => onUpdatePracticeMenuField("grade", grade)}
                        >
                          <Text
                            style={[
                              styles.postTargetChipText,
                              selected && styles.postTargetChipTextActive,
                            ]}
                          >
                            {grade}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.inlineFieldGrid}>
                  <FormField
                    label="人数"
                    detail="必須"
                    placeholder="例: 12〜20人"
                    multiline={false}
                    value={composeState.practiceMenu.participants}
                    onChangeText={(value) =>
                      onUpdatePracticeMenuField("participants", value)
                    }
                  />
                  <FormField
                    label="練習時間"
                    detail="必須"
                    placeholder="例: 60分"
                    multiline={false}
                    value={composeState.practiceMenu.durationMinutes}
                    onChangeText={(value) =>
                      onUpdatePracticeMenuField("durationMinutes", value)
                    }
                  />
                </View>
                <FormField
                  label="必要な道具"
                  detail="必須"
                  placeholder="例: ボール10個、コーン8個、ビブス"
                  multiline={false}
                  value={composeState.practiceMenu.tools}
                  onChangeText={(value) => onUpdatePracticeMenuField("tools", value)}
                />
                <FormField
                  label="練習の目的"
                  detail="必須"
                  placeholder="例: 判断速度を上げる / 基礎フォームを安定させる"
                  multiline={true}
                  value={composeState.practiceMenu.purpose}
                  onChangeText={(value) => onUpdatePracticeMenuField("purpose", value)}
                />
                <FormField
                  label="手順"
                  detail="必須"
                  placeholder="例: 1. 2人組を作る 2. 30秒ごとに交代する"
                  multiline={true}
                  value={composeState.practiceMenu.steps}
                  onChangeText={(value) => onUpdatePracticeMenuField("steps", value)}
                />
                <FormField
                  label="注意点"
                  detail="必須"
                  placeholder="例: フォームが崩れたら一度止めて確認する"
                  multiline={true}
                  value={composeState.practiceMenu.cautions}
                  onChangeText={(value) => onUpdatePracticeMenuField("cautions", value)}
                />
                <FormField
                  label="よくある失敗"
                  detail="必須"
                  placeholder="例: スピードを優先しすぎて確認が雑になる"
                  multiline={true}
                  value={composeState.practiceMenu.commonMistakes}
                  onChangeText={(value) =>
                    onUpdatePracticeMenuField("commonMistakes", value)
                  }
                />
                <FormField
                  label="アレンジ方法"
                  detail="必須"
                  placeholder="例: 人数が少ない時はエリアを狭くする"
                  multiline={true}
                  value={composeState.practiceMenu.arrangements}
                  onChangeText={(value) =>
                    onUpdatePracticeMenuField("arrangements", value)
                  }
                />
                <View style={styles.formGroup}>
                  <View style={styles.formLabelRow}>
                    <Text style={styles.formLabel}>今日の練習検索に使う条件</Text>
                    <Text style={styles.formDetail}>任意 / 複数選択</Text>
                  </View>
                  <View style={styles.sportChipRow}>
                    {todayMenuConditionOptions.map((condition) => {
                      const selected = composeState.practiceMenu.conditionTags.includes(
                        condition.key
                      );
                      return (
                        <Pressable
                          key={condition.key}
                          style={[
                            styles.postTargetChip,
                            selected && styles.postTargetChipActive,
                          ]}
                          onPress={() => onTogglePracticeMenuCondition(condition.key)}
                        >
                          <Text
                            style={[
                              styles.postTargetChipText,
                              selected && styles.postTargetChipTextActive,
                            ]}
                          >
                            {condition.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            ) : null}
            {isCoachPostingFeed && composeState.feedKind === "strategy" ? (
              <View style={styles.practiceTemplateCard}>
                <View style={styles.formLabelRow}>
                  <Text style={styles.formLabel}>戦術投稿テンプレ</Text>
                  <Text style={styles.formDetail}>必須</Text>
                </View>
                <Text style={styles.fieldSupport}>
                  試合で使う局面、配置、役割、判断基準を型として残します。
                </Text>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>種目</Text>
                  <View style={styles.sportChipRow}>
                    {profileState.selectedSports.map((sport) => {
                      const selected = composeState.strategyTemplate.sport === sport;
                      return (
                        <Pressable
                          key={sport}
                          style={[
                            styles.postTargetChip,
                            selected && styles.postTargetChipActive,
                          ]}
                          onPress={() =>
                            onUpdatePracticeStrategyField("sport", sport)
                          }
                        >
                          <Text
                            style={[
                              styles.postTargetChipText,
                              selected && styles.postTargetChipTextActive,
                            ]}
                          >
                            {sport}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>対象レベル</Text>
                  <View style={styles.sportChipRow}>
                    {practiceLevelOptions.map((level) => {
                      const selected =
                        composeState.strategyTemplate.targetLevel === level;
                      return (
                        <Pressable
                          key={level}
                          style={[
                            styles.postTargetChip,
                            selected && styles.postTargetChipActive,
                          ]}
                          onPress={() =>
                            onUpdatePracticeStrategyField("targetLevel", level)
                          }
                        >
                          <Text
                            style={[
                              styles.postTargetChipText,
                              selected && styles.postTargetChipTextActive,
                            ]}
                          >
                            {level}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>学年</Text>
                  <View style={styles.sportChipRow}>
                    {schoolGradeOptions.map((grade) => {
                      const selected = composeState.strategyTemplate.grade === grade;
                      return (
                        <Pressable
                          key={grade}
                          style={[
                            styles.postTargetChip,
                            selected && styles.postTargetChipActive,
                          ]}
                          onPress={() =>
                            onUpdatePracticeStrategyField("grade", grade)
                          }
                        >
                          <Text
                            style={[
                              styles.postTargetChipText,
                              selected && styles.postTargetChipTextActive,
                            ]}
                          >
                            {grade}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <FormField
                  label="人数"
                  detail="必須"
                  placeholder="例: 11人 / 5人 / パート全体"
                  multiline={false}
                  value={composeState.strategyTemplate.participants}
                  onChangeText={(value) =>
                    onUpdatePracticeStrategyField("participants", value)
                  }
                />
                <FormField
                  label="局面"
                  detail="必須"
                  placeholder="例: 攻撃の組み立て / 守備の切り替え / 本番前の入り"
                  multiline={false}
                  value={composeState.strategyTemplate.phase}
                  onChangeText={(value) =>
                    onUpdatePracticeStrategyField("phase", value)
                  }
                />
                <FormField
                  label="戦術の目的"
                  detail="必須"
                  placeholder="例: 相手の中央突破を防ぎ、サイドへ誘導する"
                  multiline={true}
                  value={composeState.strategyTemplate.objective}
                  onChangeText={(value) =>
                    onUpdatePracticeStrategyField("objective", value)
                  }
                />
                <FormField
                  label="配置・形"
                  detail="必須"
                  placeholder="例: 4-4-2 / 2-3ゾーン / 前列3枚で幅を取る"
                  multiline={true}
                  value={composeState.strategyTemplate.formation}
                  onChangeText={(value) =>
                    onUpdatePracticeStrategyField("formation", value)
                  }
                />
                <FormField
                  label="役割"
                  detail="必須"
                  placeholder="例: 1列目は外切り、2列目は縦パスを消す"
                  multiline={true}
                  value={composeState.strategyTemplate.roles}
                  onChangeText={(value) =>
                    onUpdatePracticeStrategyField("roles", value)
                  }
                />
                <FormField
                  label="判断基準"
                  detail="必須"
                  placeholder="例: 相手の体の向きが外を向いたらプレスを開始"
                  multiline={true}
                  value={composeState.strategyTemplate.triggers}
                  onChangeText={(value) =>
                    onUpdatePracticeStrategyField("triggers", value)
                  }
                />
                <FormField
                  label="実行手順"
                  detail="必須"
                  placeholder="例: 1. 合図を決める 2. 役割を確認する 3. 実戦で試す"
                  multiline={true}
                  value={composeState.strategyTemplate.steps}
                  onChangeText={(value) =>
                    onUpdatePracticeStrategyField("steps", value)
                  }
                />
                <FormField
                  label="注意点"
                  detail="必須"
                  placeholder="例: 全員が同時に動くより、最初の一人の合図を明確にする"
                  multiline={true}
                  value={composeState.strategyTemplate.cautions}
                  onChangeText={(value) =>
                    onUpdatePracticeStrategyField("cautions", value)
                  }
                />
                <FormField
                  label="よくある失敗"
                  detail="必須"
                  placeholder="例: ボールだけを見て、背後のスペースを空けてしまう"
                  multiline={true}
                  value={composeState.strategyTemplate.commonMistakes}
                  onChangeText={(value) =>
                    onUpdatePracticeStrategyField("commonMistakes", value)
                  }
                />
                <FormField
                  label="練習への落とし込み"
                  detail="必須"
                  placeholder="例: 半面ゲームで条件を付け、成功基準を可視化する"
                  multiline={true}
                  value={composeState.strategyTemplate.practiceDrill}
                  onChangeText={(value) =>
                    onUpdatePracticeStrategyField("practiceDrill", value)
                  }
                />
              </View>
            ) : null}
            <View style={styles.formGroup}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabel}>本文</Text>
                <Text style={styles.formDetail}>
                  必須 / {composeState.body.length}/{POST_BODY_MAX_LENGTH}
                </Text>
              </View>
              <Text style={styles.fieldSupport}>
                `太字` `箇条書き` `引用` をボタン1つで挿入できます。選択中の文字があればその部分に適用します。
              </Text>
              <RichTextToolbar onFormat={onApplyComposeFormatting} />
              <TextInput
                placeholder="投稿内容を入力してください"
                placeholderTextColor="#94a3b8"
                multiline={true}
                style={[styles.input, styles.textArea, styles.richEditorInput]}
                value={composeState.body}
                onChangeText={(value) => onUpdateComposeState("body", value)}
                onSelectionChange={(event) =>
                  onSetComposeBodySelection(event.nativeEvent.selection)
                }
                selection={composeBodySelection}
                maxLength={POST_BODY_MAX_LENGTH}
              />
            </View>
            <View style={styles.formGroup}>
              <View style={styles.formLabelRow}>
                <Text style={styles.formLabel}>画像・動画</Text>
                <Text style={styles.formDetail}>任意 / 最大4件</Text>
              </View>
              <Text style={styles.fieldSupport}>
                画像または動画を添付できます。動画はアップロード後に添付済みカードとして表示されます。
              </Text>
              <Text style={styles.mediaWarningText}>
                画像や動画を添付する際は、肖像権・著作権・学校や個人が特定される情報に十分注意してください。
              </Text>
              <View style={styles.mediaActionRow}>
                <Pressable style={styles.secondaryButton} onPress={onPickComposeMedia}>
                  <Text style={styles.secondaryButtonText}>メディアを選択</Text>
                </Pressable>
              </View>
              <ComposeMediaPreview
                media={composeMedia}
                onRemove={onRemoveComposeMedia}
              />
            </View>
            <View style={styles.registrationFooter}>
              <Pressable
                style={[styles.primaryButton, isPublishing && styles.disabledButton]}
                onPress={onSubmitPost}
                disabled={isPublishing}
              >
                <Text style={styles.primaryButtonText}>
                  {isPublishing ? "投稿中..." : "投稿を公開する"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}
