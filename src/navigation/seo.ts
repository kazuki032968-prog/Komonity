import { DEFAULT_PUBLIC_SITE_URL, timelineSections } from "../constants/app";
import type {
  PostDetailState,
  ProfileState,
  ReplyDetailState,
  ScreenKey,
  TimelineSectionKey,
  UserProfileState,
} from "../types/app";
import { formatDateTimeWithSeconds } from "../utils/appUtils";

type BuildSeoMetaParams = {
  currentScreen: ScreenKey;
  activeTimelineSection: TimelineSectionKey;
  searchQuery: string;
  profileState: ProfileState;
  selectedUserProfile: UserProfileState;
  postDetail: PostDetailState;
  replyDetail: ReplyDetailState;
  pathname: string;
};

export type SeoMeta = {
  title: string;
  description: string;
  canonicalUrl: string;
};

const createAbsoluteUrl = (pathname: string) => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${DEFAULT_PUBLIC_SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
};

const sectionLabelMap = Object.fromEntries(
  timelineSections.map((section) => [section.key, section.label])
) as Record<TimelineSectionKey, string>;

/**
 * 画面状態から Web 向けの title / description / canonical を生成します。
 * 完全な SEO を保証するものではありませんが、共有時と検索時の基礎情報を整えます。
 */
export function buildSeoMeta({
  currentScreen,
  activeTimelineSection,
  searchQuery,
  profileState,
  selectedUserProfile,
  postDetail,
  replyDetail,
  pathname,
}: BuildSeoMetaParams): SeoMeta {
  const canonicalUrl = createAbsoluteUrl(pathname);

  if (currentScreen === "top") {
    const sectionLabel = sectionLabelMap[activeTimelineSection];
    return {
      title:
        activeTimelineSection === "all"
          ? "Komonity | タイムライン"
          : `Komonity | ${sectionLabel}`,
      description:
        activeTimelineSection === "all"
          ? "メニュー・戦術、相談広場、コミュニティなどの投稿をまとめて確認できる Komonity のタイムラインです。"
          : `${sectionLabel} に関する投稿を確認できる Komonity のタイムラインです。`,
      canonicalUrl,
    };
  }

  if (currentScreen === "service-detail") {
    return {
      title: "Komonity | サービス詳細",
      description:
        "専門外の部活指導で悩む顧問の先生と、知見を持つ指導者をつなぐ Komonity のサービス詳細ページです。",
      canonicalUrl,
    };
  }

  if (currentScreen === "search") {
    return {
      title: searchQuery ? `Komonity | 「${searchQuery}」の検索結果` : "Komonity | 検索",
      description: searchQuery
        ? `Komonity 内で「${searchQuery}」に関する投稿やアカウントを検索した結果です。`
        : "Komonity 内の投稿やアカウントを検索できるページです。",
      canonicalUrl,
    };
  }

  if (currentScreen === "user-profile") {
    return {
      title: `Komonity | ${selectedUserProfile.name}`,
      description:
        selectedUserProfile.bio?.trim() ||
        `${selectedUserProfile.name} さんのプロフィールと投稿一覧です。`,
      canonicalUrl,
    };
  }

  if (currentScreen === "mypage") {
    return {
      title: `Komonity | ${profileState.name} のマイページ`,
      description: "Komonity における自分の投稿、回答、通知状況を確認できるマイページです。",
      canonicalUrl,
    };
  }

  if (currentScreen === "post-detail" && postDetail.id) {
    return {
      title: `Komonity | ${postDetail.title || "投稿詳細"}`,
      description:
        postDetail.body.slice(0, 120) ||
        `${postDetail.author} さんによる投稿詳細ページです。`,
      canonicalUrl,
    };
  }

  if (currentScreen === "reply-detail" && replyDetail.reply.id) {
    return {
      title: `Komonity | 返信の詳細`,
      description:
        replyDetail.reply.body.slice(0, 120) ||
        `返信の詳細ページです。最終更新 ${formatDateTimeWithSeconds(Date.now())}`,
      canonicalUrl,
    };
  }

  if (currentScreen === "privacy-policy") {
    return {
      title: "Komonity | プライバシーポリシー",
      description: "Komonity の個人情報の取扱い方針です。",
      canonicalUrl,
    };
  }

  if (currentScreen === "terms") {
    return {
      title: "Komonity | 利用規約",
      description: "Komonity を利用する際の基本的なルールです。",
      canonicalUrl,
    };
  }

  return {
    title: "Komonity",
    description:
      "顧問の先生と指導者をつなぎ、メニュー・戦術、相談、コミュニティを通じて知見を共有できるサービスです。",
    canonicalUrl,
  };
}
