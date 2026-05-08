import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { User } from "firebase/auth";

import { COLLECTIONS, REPLY_BODY_MAX_LENGTH } from "../constants/app";
import {
  ComposeMediaPreview,
  DefaultAvatarIcon,
  FeedbackBanner,
  LinkPreviewCard,
  MediaGallery,
  RichTextRenderer,
  RichTextToolbar,
} from "../components/shared";
import type {
  LocalMediaAsset,
  PostDetailState,
  ProfileState,
  Reply,
  ReplyDetailState,
  RichFormatAction,
  ScreenKey,
  TextSelectionRange,
} from "../types/app";
import {
  createHandleFromName,
  extractDisplayBodyAndTags,
  extractFirstUrl,
  formatDateTimeWithSeconds,
} from "../utils/appUtils";

type SharedStyles = Record<string, any>;

/**
 * 投稿詳細画面です。
 * 本文、メディア、リアクション、返信一覧、ベストアンサー選択を表示します。
 */
export function PostDetailScreen({
  styles,
  authUser,
  profileState,
  authMessage,
  authError,
  postDetail,
  backScreen,
  isLiked,
  isReposted,
  isBookmarked,
  likeCount,
  repostCount,
  bookmarkCount,
  isQuestionOwner,
  replyDraft,
  replySelection,
  replyMedia,
  isReplySubmitting,
  renderPracticeMenu,
  renderHashtagChips,
  getReplyInteractionSummary,
  onBack,
  onOpenUserProfile,
  onOpenReplyDetail,
  onOpenExternalUrl,
  onDeletePost,
  onTogglePostInteraction,
  onChangeReplyDraft,
  onChangeReplySelection,
  onApplyReplyFormatting,
  onPickReplyMedia,
  onRemoveReplyMedia,
  onSubmitReply,
  onSelectBestAnswer,
}: {
  styles: SharedStyles;
  authUser: User | null;
  profileState: ProfileState;
  authMessage: string;
  authError: string;
  postDetail: PostDetailState;
  backScreen: ScreenKey;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
  likeCount: number;
  repostCount: number;
  bookmarkCount: number;
  isQuestionOwner: boolean;
  replyDraft: string;
  replySelection: TextSelectionRange;
  replyMedia: LocalMediaAsset[];
  isReplySubmitting: boolean;
  renderPracticeMenu: (
    menu: PostDetailState["practiceMenu"],
    strategy: PostDetailState["strategyTemplate"],
    variant?: "summary" | "detail"
  ) => ReactNode;
  renderHashtagChips: (tags: string[]) => ReactNode;
  getReplyInteractionSummary: (payload: {
    rootPostId: string;
    source: PostDetailState["source"];
    path: string[];
    reply: Reply;
  }) => {
    replyCount: number;
    liked: boolean;
    reposted: boolean;
    bookmarked: boolean;
    likeCount: number;
    repostCount: number;
    bookmarkCount: number;
    interactionPostId: string;
  };
  onBack: (screen: ScreenKey) => void;
  onOpenUserProfile: (profile: {
    uid?: string;
    name: string;
    role: string;
    handle?: string;
    selectedSports?: string[];
  }) => void;
  onOpenReplyDetail: (payload: Omit<ReplyDetailState, "open"> & { backScreen: ScreenKey }) => void;
  onOpenExternalUrl: (url: string, label?: string) => void;
  onDeletePost: () => void;
  onTogglePostInteraction: (payload: {
    collectionName: typeof COLLECTIONS.likes | typeof COLLECTIONS.reposts | typeof COLLECTIONS.bookmarks;
    detail: PostDetailState;
  }) => void;
  onChangeReplyDraft: (value: string) => void;
  onChangeReplySelection: (selection: TextSelectionRange) => void;
  onApplyReplyFormatting: (action: RichFormatAction) => void;
  onPickReplyMedia: () => void;
  onRemoveReplyMedia: (id: string) => void;
  onSubmitReply: () => void;
  onSelectBestAnswer: (reply: Reply) => void;
}) {
  const display = extractDisplayBodyAndTags(postDetail.body);

  return (
    <ScrollView contentContainerStyle={styles.searchPageContainer}>
      <View style={styles.postDetailShell}>
        <View style={styles.postDetailHeaderBar}>
          <Pressable style={styles.searchBackButton} onPress={() => onBack(backScreen)}>
            <Text style={styles.searchBackButtonText}>戻る</Text>
          </Pressable>
          <Text style={styles.postDetailHeaderTitle}>投稿の詳細</Text>
          <View style={styles.postDetailHeaderSpacer} />
        </View>
        {authMessage ? <FeedbackBanner kind="success" message={authMessage} /> : null}
        {authError ? <FeedbackBanner kind="error" message={authError} /> : null}

        <View style={styles.postDetailCard}>
          <View style={styles.postDetailAuthorRow}>
            <Pressable
              style={styles.postDetailAvatar}
              onPress={() =>
                onOpenUserProfile({
                  uid: postDetail.createdByUid,
                  name: postDetail.author,
                  role: postDetail.role,
                  handle: postDetail.authorHandle,
                  selectedSports: postDetail.sports,
                })
              }
            >
              <DefaultAvatarIcon size={32} />
            </Pressable>
            <View style={styles.postDetailAuthorText}>
              <Pressable
                onPress={() =>
                  onOpenUserProfile({
                    uid: postDetail.createdByUid,
                    name: postDetail.author,
                    role: postDetail.role,
                    handle: postDetail.authorHandle,
                    selectedSports: postDetail.sports,
                  })
                }
              >
                <Text style={styles.postDetailAuthorName}>{postDetail.author}</Text>
                <Text style={styles.postDetailAuthorMeta}>
                  {postDetail.authorHandle ?? createHandleFromName(postDetail.author)} ・{" "}
                  {postDetail.role}
                </Text>
              </Pressable>
            </View>
            <View style={styles.profileSourceBadge}>
              <Text style={styles.profileSourceBadgeText}>{postDetail.sourceLabel}</Text>
            </View>
          </View>

          <Text style={styles.postDetailTitle}>{postDetail.title}</Text>
          {display.bodyText ? (
            <RichTextRenderer
              content={display.bodyText}
              variant="detail"
              onOpenUrl={onOpenExternalUrl}
            />
          ) : null}
          {extractFirstUrl(display.bodyText) ? (
            <LinkPreviewCard
              url={extractFirstUrl(display.bodyText)!}
              onOpenUrl={onOpenExternalUrl}
            />
          ) : null}
          {renderPracticeMenu(
            postDetail.practiceMenu,
            postDetail.strategyTemplate,
            "detail"
          )}
          <MediaGallery media={postDetail.media} />
          {renderHashtagChips(display.tags)}

          {postDetail.source === "questions" &&
          postDetail.bestAnswer &&
          postDetail.bestAnswer !== "まだベストアンサーはありません。" ? (
            <View style={styles.bestAnswerBox}>
              <Text style={styles.bestAnswerLabel}>ベストアンサー</Text>
              <RichTextRenderer content={postDetail.bestAnswer} onOpenUrl={onOpenExternalUrl} />
            </View>
          ) : null}

          <Text style={styles.postDetailMetaLine}>
            {formatDateTimeWithSeconds(postDetail.createdAtMs)}
          </Text>
          {((postDetail.createdByUid && postDetail.createdByUid === authUser?.uid) ||
            postDetail.author === profileState.name) ? (
            <Pressable style={styles.postDeleteButton} onPress={onDeletePost}>
              <Text style={styles.postDeleteButtonText}>この投稿を削除する</Text>
            </Pressable>
          ) : null}

          <View style={styles.postDetailMetricRow}>
            <View style={styles.metricChip}>
              <Text style={styles.metricText}>
                返信 {postDetail.comments ?? postDetail.answers ?? postDetail.replies.length}
              </Text>
            </View>
            <Pressable
              style={[styles.metricButton, isLiked && styles.metricButtonActive]}
              onPress={() =>
                onTogglePostInteraction({
                  collectionName: COLLECTIONS.likes,
                  detail: postDetail,
                })
              }
            >
              <Text style={[styles.metricText, isLiked && styles.metricTextActive]}>
                いいね {likeCount}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.metricButton, isReposted && styles.metricButtonActive]}
              onPress={() =>
                onTogglePostInteraction({
                  collectionName: COLLECTIONS.reposts,
                  detail: postDetail,
                })
              }
            >
              <Text style={[styles.metricText, isReposted && styles.metricTextActive]}>
                再投稿 {repostCount}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.metricButton, isBookmarked && styles.metricButtonActive]}
              onPress={() =>
                onTogglePostInteraction({
                  collectionName: COLLECTIONS.bookmarks,
                  detail: postDetail,
                })
              }
            >
              <Text style={[styles.metricText, isBookmarked && styles.metricTextActive]}>
                保存 {bookmarkCount}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.postDetailReplyComposer}>
          <View style={styles.postDetailReplyAvatar}>
            <DefaultAvatarIcon size={28} />
          </View>
          <View style={styles.postDetailReplyComposerBody}>
            <TextInput
              style={styles.postDetailReplyInput}
              placeholder="返信を投稿"
              placeholderTextColor="#8a8f99"
              value={replyDraft}
              onChangeText={onChangeReplyDraft}
              onSelectionChange={(event) =>
                onChangeReplySelection(event.nativeEvent.selection)
              }
              selection={replySelection}
              maxLength={REPLY_BODY_MAX_LENGTH}
            />
            <Text style={styles.inlineCountText}>
              {replyDraft.length}/{REPLY_BODY_MAX_LENGTH}
            </Text>
            <RichTextToolbar onFormat={onApplyReplyFormatting} />
            <View style={styles.postDetailReplyActionRow}>
              <Pressable style={styles.secondaryButton} onPress={onPickReplyMedia}>
                <Text style={styles.secondaryButtonText}>画像・動画を追加</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.postDetailReplyButton,
                  isReplySubmitting && styles.disabledButton,
                ]}
                onPress={onSubmitReply}
                disabled={isReplySubmitting}
              >
                <Text style={styles.postDetailReplyButtonText}>
                  {isReplySubmitting ? "送信中..." : "返信"}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.mediaWarningText}>
              画像や動画を添付する際は、肖像権・著作権・学校や個人が特定される情報に十分注意してください。
            </Text>
            <ComposeMediaPreview media={replyMedia} onRemove={onRemoveReplyMedia} />
          </View>
        </View>

        <View style={styles.postDetailReplies}>
          {postDetail.replies.length === 0 ? (
            <View style={styles.searchTopicCard}>
              <Text style={styles.searchTopicTitle}>返信はまだありません</Text>
              <Text style={styles.searchTopicMeta}>
                最初の返信を投稿すると、ここに会話が表示されます。
              </Text>
            </View>
          ) : null}
          {postDetail.replies.map((reply, index) => {
            const replyStats = getReplyInteractionSummary({
              rootPostId: postDetail.id,
              source: postDetail.source,
              path: [reply.id],
              reply,
            });

            return (
              <View key={reply.id} style={styles.postDetailReplyCard}>
                {index < postDetail.replies.length - 1 ? (
                  <View style={styles.postDetailThreadLine} />
                ) : null}
                <View style={styles.postDetailReplyRow}>
                  <Pressable
                    style={styles.postDetailReplyAvatar}
                    onPress={() =>
                      onOpenUserProfile({
                        uid: reply.createdByUid,
                        name: reply.author,
                        role: "Komonityユーザー",
                        handle: reply.authorHandle,
                        selectedSports: postDetail.sports,
                      })
                    }
                  >
                    <DefaultAvatarIcon size={28} />
                  </Pressable>
                  <View style={styles.postDetailReplyContent}>
                    <Pressable
                      onPress={() =>
                        onOpenUserProfile({
                          uid: reply.createdByUid,
                          name: reply.author,
                          role: "Komonityユーザー",
                          handle: reply.authorHandle,
                          selectedSports: postDetail.sports,
                        })
                      }
                    >
                      <Text style={styles.postDetailReplyAuthor}>{reply.author}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.detailTapArea}
                      onPress={() =>
                        onOpenReplyDetail({
                          rootPostId: postDetail.id,
                          source: postDetail.source,
                          sourceLabel: postDetail.sourceLabel,
                          path: [reply.id],
                          reply,
                          backScreen: "post-detail",
                        })
                      }
                    >
                      <RichTextRenderer
                        content={reply.body}
                        variant="reply"
                        onOpenUrl={onOpenExternalUrl}
                      />
                      {extractFirstUrl(reply.body) ? (
                        <LinkPreviewCard
                          url={extractFirstUrl(reply.body)!}
                          onOpenUrl={onOpenExternalUrl}
                        />
                      ) : null}
                      <MediaGallery media={reply.media} compact={true} />
                    </Pressable>
                    <View style={styles.replyMetricRow}>
                      <View style={styles.metricChip}>
                        <Text style={styles.metricText}>返信 {replyStats.replyCount}</Text>
                      </View>
                      <Pressable
                        style={[
                          styles.metricButton,
                          replyStats.liked && styles.metricButtonActive,
                        ]}
                        onPress={() =>
                          onTogglePostInteraction({
                            collectionName: COLLECTIONS.likes,
                            detail: { ...postDetail, id: replyStats.interactionPostId },
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.metricText,
                            replyStats.liked && styles.metricTextActive,
                          ]}
                        >
                          いいね {replyStats.likeCount}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.metricButton,
                          replyStats.reposted && styles.metricButtonActive,
                        ]}
                        onPress={() =>
                          onTogglePostInteraction({
                            collectionName: COLLECTIONS.reposts,
                            detail: { ...postDetail, id: replyStats.interactionPostId },
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.metricText,
                            replyStats.reposted && styles.metricTextActive,
                          ]}
                        >
                          再投稿 {replyStats.repostCount}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.metricButton,
                          replyStats.bookmarked && styles.metricButtonActive,
                        ]}
                        onPress={() =>
                          onTogglePostInteraction({
                            collectionName: COLLECTIONS.bookmarks,
                            detail: { ...postDetail, id: replyStats.interactionPostId },
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.metricText,
                            replyStats.bookmarked && styles.metricTextActive,
                          ]}
                        >
                          保存 {replyStats.bookmarkCount}
                        </Text>
                      </Pressable>
                    </View>
                    {postDetail.source === "questions" &&
                    postDetail.bestAnswerReplyId === reply.id ? (
                      <View style={styles.bestAnswerInlineBadge}>
                        <Text style={styles.bestAnswerInlineBadgeText}>
                          ベストアンサー
                        </Text>
                      </View>
                    ) : null}
                    {postDetail.source === "questions" &&
                    isQuestionOwner &&
                    !postDetail.bestAnswerReplyId &&
                    reply.author !== "Komonity Bot" ? (
                      <Pressable
                        style={styles.bestAnswerSelectButton}
                        onPress={() => onSelectBestAnswer(reply)}
                      >
                        <Text style={styles.bestAnswerSelectButtonText}>
                          ベストアンサーにする
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
