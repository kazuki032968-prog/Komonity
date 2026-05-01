import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

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
  Reply,
  ReplyDetailState,
  RichFormatAction,
  ScreenKey,
  TextSelectionRange,
} from "../types/app";
import { createHandleFromName, extractFirstUrl } from "../utils/appUtils";

type SharedStyles = Record<string, any>;

/**
 * 返信詳細画面です。
 * 返信単体を起点に、さらにネストした返信と各種リアクションを表示します。
 */
export function ReplyDetailScreen({
  styles,
  authMessage,
  authError,
  postDetail,
  replyDetail,
  replyDraft,
  replySelection,
  replyMedia,
  isReplySubmitting,
  getReplyInteractionSummary,
  onBack,
  onOpenUserProfile,
  onOpenReplyDetail,
  onOpenExternalUrl,
  onTogglePostInteraction,
  onChangeReplyDraft,
  onChangeReplySelection,
  onApplyReplyFormatting,
  onPickReplyMedia,
  onRemoveReplyMedia,
  onSubmitReply,
}: {
  styles: SharedStyles;
  authMessage: string;
  authError: string;
  postDetail: PostDetailState;
  replyDetail: ReplyDetailState;
  replyDraft: string;
  replySelection: TextSelectionRange;
  replyMedia: LocalMediaAsset[];
  isReplySubmitting: boolean;
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
  onBack: () => void;
  onOpenUserProfile: (profile: {
    uid?: string;
    name: string;
    role: string;
    handle?: string;
    selectedSports?: string[];
  }) => void;
  onOpenReplyDetail: (payload: Omit<ReplyDetailState, "open"> & { backScreen: ScreenKey }) => void;
  onOpenExternalUrl: (url: string, label?: string) => void;
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
}) {
  const replyStats = getReplyInteractionSummary({
    rootPostId: replyDetail.rootPostId,
    source: replyDetail.source,
    path: replyDetail.path,
    reply: replyDetail.reply,
  });

  return (
    <ScrollView contentContainerStyle={styles.searchPageContainer}>
      <View style={styles.postDetailShell}>
        <View style={styles.postDetailHeaderBar}>
          <Pressable style={styles.searchBackButton} onPress={onBack}>
            <Text style={styles.searchBackButtonText}>戻る</Text>
          </Pressable>
          <Text style={styles.postDetailHeaderTitle}>返信の詳細</Text>
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
                  uid: replyDetail.reply.createdByUid,
                  name: replyDetail.reply.author,
                  role: "Komonityユーザー",
                  handle: replyDetail.reply.authorHandle,
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
                    uid: replyDetail.reply.createdByUid,
                    name: replyDetail.reply.author,
                    role: "Komonityユーザー",
                    handle: replyDetail.reply.authorHandle,
                    selectedSports: postDetail.sports,
                  })
                }
              >
                <Text style={styles.postDetailAuthorName}>
                  {replyDetail.reply.author}
                </Text>
                <Text style={styles.postDetailAuthorMeta}>
                  {replyDetail.reply.authorHandle ??
                    createHandleFromName(replyDetail.reply.author)}
                </Text>
              </Pressable>
            </View>
            <View style={styles.profileSourceBadge}>
              <Text style={styles.profileSourceBadgeText}>
                {replyDetail.sourceLabel}
              </Text>
            </View>
          </View>
          <RichTextRenderer
            content={replyDetail.reply.body}
            variant="detail"
            onOpenUrl={onOpenExternalUrl}
          />
          {extractFirstUrl(replyDetail.reply.body) ? (
            <LinkPreviewCard
              url={extractFirstUrl(replyDetail.reply.body)!}
              onOpenUrl={onOpenExternalUrl}
            />
          ) : null}
          <MediaGallery media={replyDetail.reply.media} />
          <View style={styles.postDetailMetricRow}>
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
        </View>

        <View style={styles.postDetailReplyComposer}>
          <View style={styles.postDetailReplyAvatar}>
            <DefaultAvatarIcon size={28} />
          </View>
          <View style={styles.postDetailReplyComposerBody}>
            <TextInput
              style={styles.postDetailReplyInput}
              placeholder="返信に返信する"
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
          {(replyDetail.reply.replies ?? []).map((nestedReply, index) => {
            const nestedPath = [...replyDetail.path, nestedReply.id];
            const nestedStats = getReplyInteractionSummary({
              rootPostId: replyDetail.rootPostId,
              source: replyDetail.source,
              path: nestedPath,
              reply: nestedReply,
            });

            return (
              <View key={nestedReply.id} style={styles.postDetailReplyCard}>
                {index < (replyDetail.reply.replies ?? []).length - 1 ? (
                  <View style={styles.postDetailThreadLine} />
                ) : null}
                <View style={styles.postDetailReplyRow}>
                  <Pressable
                    style={styles.postDetailReplyAvatar}
                    onPress={() =>
                      onOpenUserProfile({
                        uid: nestedReply.createdByUid,
                        name: nestedReply.author,
                        role: "Komonityユーザー",
                        handle: nestedReply.authorHandle,
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
                          uid: nestedReply.createdByUid,
                          name: nestedReply.author,
                          role: "Komonityユーザー",
                          handle: nestedReply.authorHandle,
                          selectedSports: postDetail.sports,
                        })
                      }
                    >
                      <Text style={styles.postDetailReplyAuthor}>
                        {nestedReply.author}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.detailTapArea}
                      onPress={() =>
                        onOpenReplyDetail({
                          rootPostId: replyDetail.rootPostId,
                          source: replyDetail.source,
                          sourceLabel: replyDetail.sourceLabel,
                          path: nestedPath,
                          reply: nestedReply,
                          backScreen: "reply-detail",
                        })
                      }
                    >
                      <RichTextRenderer
                        content={nestedReply.body}
                        variant="reply"
                        onOpenUrl={onOpenExternalUrl}
                      />
                      {extractFirstUrl(nestedReply.body) ? (
                        <LinkPreviewCard
                          url={extractFirstUrl(nestedReply.body)!}
                          onOpenUrl={onOpenExternalUrl}
                        />
                      ) : null}
                      <MediaGallery media={nestedReply.media} compact={true} />
                    </Pressable>
                    <View style={styles.replyMetricRow}>
                      <View style={styles.metricChip}>
                        <Text style={styles.metricText}>
                          返信 {nestedStats.replyCount}
                        </Text>
                      </View>
                      <Pressable
                        style={[
                          styles.metricButton,
                          nestedStats.liked && styles.metricButtonActive,
                        ]}
                        onPress={() =>
                          onTogglePostInteraction({
                            collectionName: COLLECTIONS.likes,
                            detail: { ...postDetail, id: nestedStats.interactionPostId },
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.metricText,
                            nestedStats.liked && styles.metricTextActive,
                          ]}
                        >
                          いいね {nestedStats.likeCount}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.metricButton,
                          nestedStats.reposted && styles.metricButtonActive,
                        ]}
                        onPress={() =>
                          onTogglePostInteraction({
                            collectionName: COLLECTIONS.reposts,
                            detail: { ...postDetail, id: nestedStats.interactionPostId },
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.metricText,
                            nestedStats.reposted && styles.metricTextActive,
                          ]}
                        >
                          再投稿 {nestedStats.repostCount}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.metricButton,
                          nestedStats.bookmarked && styles.metricButtonActive,
                        ]}
                        onPress={() =>
                          onTogglePostInteraction({
                            collectionName: COLLECTIONS.bookmarks,
                            detail: { ...postDetail, id: nestedStats.interactionPostId },
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.metricText,
                            nestedStats.bookmarked && styles.metricTextActive,
                          ]}
                        >
                          保存 {nestedStats.bookmarkCount}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
          {(replyDetail.reply.replies ?? []).length === 0 ? (
            <View style={styles.searchTopicCard}>
              <Text style={styles.searchTopicTitle}>返信はまだありません</Text>
              <Text style={styles.searchTopicMeta}>
                この返信への最初の返信を投稿すると、ここに表示されます。
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
