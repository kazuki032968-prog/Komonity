import type { ReactNode } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";

import { colors } from "../constants/theme";
import { sharedStyles } from "../styles/shared";
import type {
  ActivityBadge,
  AdvisorFormState,
  CoachFormState,
  ExternalLink,
  LocalMediaAsset,
  MediaAttachment,
  Reply,
  RichFormatAction,
} from "../types/app";
import {
  MARKDOWN_LINK_REGEX,
  URL_REGEX,
  buildUrlPreviewLabel,
  createCoverToneFromName,
  extractFirstUrl,
  getCollapsedBody,
  shouldCollapseBody,
} from "../utils/appUtils";

type SharedStyles = Record<string, any>;
const EMPTY_STYLES: SharedStyles = sharedStyles;

type RenderLinkableTextSegmentsOptions = {
  text: string;
  baseStyle: object;
  boldStyle: object;
  linkStyle: object;
  onOpenUrl: (url: string, label?: string) => void;
};

const renderLinkableTextSegments = ({
  text,
  baseStyle,
  boldStyle,
  linkStyle,
  onOpenUrl,
}: RenderLinkableTextSegmentsOptions) => {
  const output: ReactNode[] = [];

  const pushPlainText = (segment: string, keyPrefix: string, isBold: boolean) => {
    if (!segment) {
      return;
    }

    let plainCursor = 0;
    const markdownMatches = Array.from(segment.matchAll(MARKDOWN_LINK_REGEX));
    markdownMatches.forEach((match, index) => {
      const full = match[0] ?? "";
      const label = match[1] ?? "";
      const url = match[2] ?? "";
      const matchIndex = match.index ?? 0;

      if (matchIndex > plainCursor) {
        const before = segment.slice(plainCursor, matchIndex);
        if (before) {
          output.push(
            <Text
              key={`${keyPrefix}-plain-${index}-${plainCursor}`}
              style={isBold ? [baseStyle, boldStyle] : baseStyle}
            >
              {before}
            </Text>
          );
        }
      }

      output.push(
        <Text
          key={`${keyPrefix}-markdown-${index}`}
          style={isBold ? [baseStyle, boldStyle, linkStyle] : [baseStyle, linkStyle]}
          onPress={() => onOpenUrl(url, label)}
        >
          {label}
        </Text>
      );
      plainCursor = matchIndex + full.length;
    });

    const remainingText = segment.slice(plainCursor);
    let rawCursor = 0;
    const rawMatches = Array.from(remainingText.matchAll(URL_REGEX));
    rawMatches.forEach((match, index) => {
      const url = match[1] ?? "";
      const matchIndex = match.index ?? 0;
      if (matchIndex > rawCursor) {
        const before = remainingText.slice(rawCursor, matchIndex);
        if (before) {
          output.push(
            <Text
              key={`${keyPrefix}-raw-plain-${index}-${rawCursor}`}
              style={isBold ? [baseStyle, boldStyle] : baseStyle}
            >
              {before}
            </Text>
          );
        }
      }

      output.push(
        <Text
          key={`${keyPrefix}-raw-link-${index}`}
          style={isBold ? [baseStyle, boldStyle, linkStyle] : [baseStyle, linkStyle]}
          onPress={() => onOpenUrl(url)}
        >
          {url}
        </Text>
      );
      rawCursor = matchIndex + url.length;
    });

    const tail = remainingText.slice(rawCursor);
    if (tail) {
      output.push(
        <Text
          key={`${keyPrefix}-tail-${rawCursor}`}
          style={isBold ? [baseStyle, boldStyle] : baseStyle}
        >
          {tail}
        </Text>
      );
    }
  };

  text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .forEach((segment, index) => {
      const isBold = segment.startsWith("**") && segment.endsWith("**");
      const displayText = isBold ? segment.slice(2, -2) : segment;
      pushPlainText(displayText, `seg-${index}`, isBold);
    });

  return output;
};

const getImageDisplayStyle = (
  styles: SharedStyles,
  media: Pick<MediaAttachment, "width" | "height">,
  compact = false
) => {
  const fallbackHeight = compact ? 180 : 240;

  if (!media.width || !media.height) {
    return compact ? styles.postMediaImageCompact : styles.postMediaImage;
  }

  return {
    width: "100%" as const,
    aspectRatio: media.width / media.height,
    maxHeight: compact ? 180 : 420,
    minHeight: fallbackHeight,
    borderRadius: 18,
    backgroundColor: colors.brandSoft,
  };
};

/**
 * 登録系画面で共通利用するヘッダーです。
 */
export function RegistrationHeader({
  title,
  description,
  onBack,
  styles = EMPTY_STYLES,
}: {
  title: string;
  description: string;
  onBack: () => void;
  styles?: SharedStyles;
}) {
  return (
    <View style={styles.pageHeaderCard}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>戻る</Text>
      </Pressable>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{description}</Text>
    </View>
  );
}

export function PageIntro({
  title,
  description,
  styles = EMPTY_STYLES,
}: {
  title: string;
  description: string;
  styles?: SharedStyles;
}) {
  return (
    <View style={styles.pageIntroCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{description}</Text>
    </View>
  );
}

export function LegalSection({
  title,
  body,
  styles = EMPTY_STYLES,
}: {
  title: string;
  body: string;
  styles?: SharedStyles;
}) {
  return (
    <View style={styles.legalSection}>
      <Text style={styles.legalSectionTitle}>{title}</Text>
      <Text style={styles.legalSectionBody}>{body}</Text>
    </View>
  );
}

export function RichTextToolbar({
  onFormat,
  styles = EMPTY_STYLES,
}: {
  onFormat: (action: RichFormatAction) => void;
  styles?: SharedStyles;
}) {
  const actions: Array<{ key: RichFormatAction; label: string }> = [
    { key: "bold", label: "太字" },
    { key: "bullet", label: "箇条書き" },
    { key: "quote", label: "引用" },
  ];

  return (
    <View style={styles.richToolbar}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          style={styles.richToolbarButton}
          onPress={() => onFormat(action.key)}
        >
          <Text style={styles.richToolbarButtonText}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function ActivityBadgeSection({
  badges,
  onOpen,
  styles = EMPTY_STYLES,
}: {
  badges: ActivityBadge[];
  onOpen: () => void;
  styles?: SharedStyles;
}) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <View style={styles.badgeSection}>
      <Text style={styles.badgeSectionTitle}>活動バッジ</Text>
      <Pressable style={styles.badgeLauncher} onPress={onOpen}>
        <View style={styles.badgePreviewRow}>
          {badges.slice(0, 4).map((badge) => (
            <View key={`${badge.id}-${badge.tier}`} style={styles.badgeStackedWrap}>
              <View
                style={[
                  styles.kBadge,
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
              <View style={styles.badgeRibbon}>
                <Text style={styles.badgeRibbonText}>
                  {badge.tier === "bronze"
                    ? "B"
                    : badge.tier === "silver"
                      ? "S"
                      : "G"}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.badgeLauncherTextWrap}>
          <Text style={styles.badgeLauncherTitle}>{badges.length}個のバッジを確認</Text>
          <Text style={styles.badgeLauncherMeta}>押すと詳細が開きます</Text>
        </View>
      </Pressable>
    </View>
  );
}

/**
 * Slack ライクな簡易記法を表示用の UI に整形します。
 */
export function RichTextRenderer({
  content,
  styles = EMPTY_STYLES,
  variant = "body",
  compact = false,
  onOpenUrl,
}: {
  content: string;
  styles?: SharedStyles;
  variant?: "body" | "detail" | "reply";
  compact?: boolean;
  onOpenUrl?: (url: string, label?: string) => void;
}) {
  if (!content.trim()) {
    return null;
  }

  const handleOpenUrl = onOpenUrl ?? (() => {});
  const lines = content.split("\n");
  const baseStyle =
    variant === "detail"
      ? styles.postDetailBody
      : variant === "reply"
        ? styles.replyBody
        : styles.cardBody;

  return (
    <View style={[styles.richTextStack, compact && styles.richTextStackCompact]}>
      {lines.map((rawLine, index) => {
        const line = rawLine.trimEnd();

        if (!line.trim()) {
          return <View key={`space-${index}`} style={styles.richTextSpacer} />;
        }

        const quoteMatch = line.match(/^>\s?(.*)$/);
        if (quoteMatch) {
          return (
            <View key={`quote-${index}`} style={styles.richQuoteBlock}>
              <Text style={[baseStyle, compact && styles.richTextCompact]}>
                {renderLinkableTextSegments({
                  text: quoteMatch[1],
                  baseStyle: [baseStyle, compact && styles.richTextCompact],
                  boldStyle: styles.richTextBold,
                  linkStyle: styles.richTextLink,
                  onOpenUrl: handleOpenUrl,
                })}
              </Text>
            </View>
          );
        }

        const bulletMatch = line.match(/^[-*]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <View key={`bullet-${index}`} style={styles.richListRow}>
              <Text style={styles.richBullet}>•</Text>
              <Text style={[baseStyle, styles.richListText, compact && styles.richTextCompact]}>
                {renderLinkableTextSegments({
                  text: bulletMatch[1],
                  baseStyle: [baseStyle, styles.richListText, compact && styles.richTextCompact],
                  boldStyle: styles.richTextBold,
                  linkStyle: styles.richTextLink,
                  onOpenUrl: handleOpenUrl,
                })}
              </Text>
            </View>
          );
        }

        return (
          <Text key={`text-${index}`} style={[baseStyle, compact && styles.richTextCompact]}>
            {renderLinkableTextSegments({
              text: line,
              baseStyle: [baseStyle, compact && styles.richTextCompact],
              boldStyle: styles.richTextBold,
              linkStyle: styles.richTextLink,
              onOpenUrl: handleOpenUrl,
            })}
          </Text>
        );
      })}
    </View>
  );
}

export function LinkPreviewCard({
  url,
  styles = EMPTY_STYLES,
  onOpenUrl,
}: {
  url: string;
  styles?: SharedStyles;
  onOpenUrl: (url: string, label?: string) => void;
}) {
  const domainLabel = buildUrlPreviewLabel(url);

  return (
    <Pressable style={styles.linkPreviewCard} onPress={() => onOpenUrl(url, domainLabel)}>
      <Text style={styles.linkPreviewDomain}>{domainLabel}</Text>
      <Text style={styles.linkPreviewUrl}>{url}</Text>
      <Text style={styles.linkPreviewHint}>外部サイトを開く</Text>
    </Pressable>
  );
}

export function ExpandableBody({
  id,
  content,
  styles = EMPTY_STYLES,
  compact = false,
  onToggle,
  expanded,
  onOpenUrl,
}: {
  id: string;
  content: string;
  styles?: SharedStyles;
  compact?: boolean;
  onToggle: (id: string) => void;
  expanded: boolean;
  onOpenUrl: (url: string, label?: string) => void;
}) {
  const collapsed = shouldCollapseBody(content) && !expanded;
  const visibleContent = collapsed ? getCollapsedBody(content) : content;
  const previewUrl = extractFirstUrl(content);

  return (
    <View>
      <RichTextRenderer
        content={visibleContent}
        styles={styles}
        compact={compact}
        onOpenUrl={onOpenUrl}
      />
      {previewUrl ? <LinkPreviewCard url={previewUrl} styles={styles} onOpenUrl={onOpenUrl} /> : null}
      {shouldCollapseBody(content) ? (
        <Pressable onPress={() => onToggle(id)}>
          <Text style={styles.expandToggleText}>{expanded ? "閉じる" : "もっと見る"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ReplyList({
  replies,
  styles = EMPTY_STYLES,
  compact = false,
}: {
  replies: Reply[];
  styles?: SharedStyles;
  compact?: boolean;
}) {
  if (replies.length === 0) {
    return null;
  }

  return (
    <View style={styles.replyList}>
      {replies.map((reply) => (
        <View key={reply.id} style={styles.replyItem}>
          <Text style={styles.replyAuthor}>{reply.author}</Text>
          <RichTextRenderer content={reply.body} styles={styles} variant="reply" compact={compact} />
          <MediaGallery media={reply.media} styles={styles} compact={compact} />
        </View>
      ))}
    </View>
  );
}

export function FeedbackBanner({
  kind,
  message,
  styles = EMPTY_STYLES,
}: {
  kind: "success" | "error";
  message: string;
  styles?: SharedStyles;
}) {
  return (
    <View
      style={[
        styles.feedbackBanner,
        kind === "success" ? styles.feedbackSuccess : styles.feedbackError,
      ]}
    >
      <Text
        style={[
          styles.feedbackText,
          kind === "success" ? styles.feedbackSuccessText : styles.feedbackErrorText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

export function MediaGallery({
  media,
  styles = EMPTY_STYLES,
  compact = false,
}: {
  media?: MediaAttachment[];
  styles?: SharedStyles;
  compact?: boolean;
}) {
  if (!media || media.length === 0) {
    return null;
  }

  return (
    <View style={styles.mediaGallery}>
      {media.map((item) =>
        item.kind === "image" ? (
          <Image
            key={`${item.url}-${item.fileName}`}
            source={{ uri: item.url }}
            style={getImageDisplayStyle(styles, item, compact)}
            resizeMode="contain"
          />
        ) : (
          <View key={`${item.url}-${item.fileName}`} style={styles.videoCard}>
            <Text style={styles.videoCardLabel}>動画を添付済み</Text>
            <Text style={styles.videoCardName}>{item.fileName}</Text>
          </View>
        )
      )}
    </View>
  );
}

export function ComposeMediaPreview({
  media,
  styles = EMPTY_STYLES,
  onRemove,
}: {
  media: LocalMediaAsset[];
  styles?: SharedStyles;
  onRemove: (id: string) => void;
}) {
  if (media.length === 0) {
    return null;
  }

  return (
    <View style={styles.mediaPreviewStack}>
      {media.map((item) => (
        <View key={item.id} style={styles.mediaPreviewCard}>
          {item.kind === "image" ? (
            <Image
              source={{ uri: item.uri }}
              style={getImageDisplayStyle(styles, item)}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.mediaPreviewVideo}>
              <Text style={styles.videoCardLabel}>動画を選択済み</Text>
              <Text style={styles.videoCardName}>{item.fileName}</Text>
            </View>
          )}
          <Pressable style={styles.mediaRemoveButton} onPress={() => onRemove(item.id)}>
            <Text style={styles.mediaRemoveButtonText}>削除</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

export function SportSelector({
  title,
  detail,
  groups,
  selectedSports,
  styles = EMPTY_STYLES,
  onToggle,
}: {
  title: string;
  detail: string;
  groups: ReadonlyArray<{ category: string; items: ReadonlyArray<string> }>;
  selectedSports: string[];
  styles?: SharedStyles;
  onToggle: (sport: string) => void;
}) {
  return (
    <View style={styles.formGroup}>
      <View style={styles.formLabelRow}>
        <Text style={styles.formLabel}>{title}</Text>
        <Text style={styles.formDetail}>{detail}</Text>
      </View>
      <Text style={styles.fieldSupport}>
        現在担当していない種目でも、見ておきたいものは複数選択できます。
      </Text>
      <View style={styles.sportGroupStack}>
        {groups.map((group) => (
          <View key={group.category} style={styles.sportGroupCard}>
            <Text style={styles.sportGroupTitle}>{group.category}</Text>
            <View style={styles.sportSelectorGrid}>
              {group.items.map((sport) => {
                const selected = selectedSports.includes(sport);
                return (
                  <Pressable
                    key={sport}
                    style={[
                      styles.sportSelectorChip,
                      selected && styles.sportSelectorChipActive,
                    ]}
                    onPress={() => onToggle(sport)}
                  >
                    <Text
                      style={[
                        styles.sportSelectorChipText,
                        selected && styles.sportSelectorChipTextActive,
                      ]}
                    >
                      {sport}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function KomonityLogo({
  styles = EMPTY_STYLES,
}: {
  styles?: SharedStyles;
}) {
  return (
    <View style={styles.logoWrap}>
      <Text style={styles.logoText}>Komonity</Text>
      <View style={styles.logoUnderlineWrap}>
        <View style={styles.logoUnderline} />
        <View style={[styles.logoDot, styles.logoDotOne]} />
        <View style={[styles.logoDot, styles.logoDotTwo]} />
        <View style={[styles.logoDot, styles.logoDotThree]} />
      </View>
    </View>
  );
}

export function ImageField({
  title,
  detail,
  imageUri,
  kind,
  styles = EMPTY_STYLES,
  onPress,
  onRemove,
}: {
  title: string;
  detail: string;
  imageUri: string | null;
  kind: "avatar" | "cover";
  styles?: SharedStyles;
  onPress: () => void;
  onRemove?: () => void;
}) {
  return (
    <View style={styles.formGroup}>
      <View style={styles.formLabelRow}>
        <Text style={styles.formLabel}>{title}</Text>
        <Text style={styles.formDetail}>{detail}</Text>
      </View>
      <Pressable style={styles.imagePickerCard} onPress={onPress}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={kind === "cover" ? styles.coverPreview : styles.avatarPreview}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>画像を選択</Text>
            <Text style={styles.fieldSupport}>
              {kind === "cover"
                ? "デバイス内の写真からプロフィール上部のヘッダー画像を設定します"
                : "デバイス内の写真からアイコン画像を設定します"}
            </Text>
          </View>
        )}
      </Pressable>
      {imageUri && onRemove ? (
        <Pressable style={styles.removeImageButton} onPress={onRemove}>
          <Text style={styles.removeImageButtonText}>
            {kind === "cover"
              ? "ヘッダー画像を削除してデフォルトに戻す"
              : "アイコン画像を削除してデフォルトに戻す"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function FormField({
  label,
  detail,
  placeholder,
  multiline,
  value,
  styles = EMPTY_STYLES,
  onChangeText,
  maxLength,
}: {
  label: string;
  detail: string;
  placeholder: string;
  multiline: boolean;
  value: string;
  styles?: SharedStyles;
  onChangeText: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <View style={styles.formGroup}>
      <View style={styles.formLabelRow}>
        <Text style={styles.formLabel}>{label}</Text>
        <Text style={styles.formDetail}>
          {maxLength ? `${detail} / ${value.length}/${maxLength}` : detail}
        </Text>
      </View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        multiline={multiline}
        secureTextEntry={label.includes("パスワード")}
        autoCapitalize={label.includes("メールアドレス") ? "none" : "sentences"}
        keyboardType={label.includes("メールアドレス") ? "email-address" : "default"}
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
      />
    </View>
  );
}

export function DefaultAvatarIcon({
  size,
  tone = "brand",
}: {
  size: number;
  tone?: "brand" | "light";
}) {
  const fillColor = tone === "light" ? "#fff7ed" : colors.brand;
  const accentColor = tone === "light" ? "rgba(255, 247, 237, 0.72)" : "#e2b276";

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: size * 0.38,
          height: size * 0.38,
          borderRadius: 999,
          backgroundColor: fillColor,
          marginBottom: size * 0.05,
        }}
      />
      <View
        style={{
          width: size * 0.66,
          height: size * 0.34,
          borderTopLeftRadius: size * 0.24,
          borderTopRightRadius: size * 0.24,
          borderBottomLeftRadius: size * 0.12,
          borderBottomRightRadius: size * 0.12,
          backgroundColor: fillColor,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: size * 0.08,
          width: size * 0.78,
          height: size * 0.2,
          borderRadius: 999,
          backgroundColor: accentColor,
          opacity: 0.8,
        }}
      />
    </View>
  );
}

export function AvatarVisual({
  size,
  imageUri,
  tone = "brand",
}: {
  size: number;
  imageUri?: string;
  tone?: "brand" | "light";
}) {
  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={{
          width: size,
          height: size,
          borderRadius: 999,
        }}
      />
    );
  }

  return <DefaultAvatarIcon size={size} tone={tone} />;
}

export function ProfileBannerVisual({
  imageUri,
  tone,
  styles = EMPTY_STYLES,
}: {
  imageUri?: string;
  tone: string;
  styles?: SharedStyles;
}) {
  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={styles.profileBannerImage}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[styles.profileBanner, { backgroundColor: createCoverToneFromName(tone) }]}
    />
  );
}
