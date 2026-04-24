import type { DocumentData } from "firebase/firestore";

import { DEFAULT_PUBLIC_SITE_URL, defaultProfileState } from "../constants/app";
import type { ExternalLink, ProfileState } from "../types/app";
import { createHandleFromName } from "../utils/appUtils";
import { toArrayOfStrings } from "./serializers";

export const getRoleLabel = (roleKeyOrLabel: string) => {
  if (roleKeyOrLabel === "advisor" || roleKeyOrLabel.includes("顧問")) {
    return "顧問アカウント";
  }

  if (roleKeyOrLabel === "coach" || roleKeyOrLabel.includes("指導員")) {
    return "指導員アカウント";
  }

  return roleKeyOrLabel || "Komonityユーザー";
};

export const formatJoinedLabel = (value: unknown) => {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    const date = value.toDate() as Date;
    return `${date.getFullYear()}年${date.getMonth() + 1}月からKomonityを利用`;
  }

  if (typeof value === "string" && value) {
    return value;
  }

  return defaultProfileState.joined;
};

/**
 * users コレクションの生ドキュメントをアプリの ProfileState に正規化します。
 */
export const mapUserDocumentToProfileState = (data: DocumentData): ProfileState => {
  const profile = typeof data.profile === "object" && data.profile ? data.profile : {};
  const profileData = profile as Record<string, unknown>;
  const roleLabel = getRoleLabel(
    typeof data.roleLabel === "string" ? data.roleLabel : String(data.role ?? "")
  );
  const name =
    typeof profileData.nickname === "string" && profileData.nickname
      ? profileData.nickname
      : defaultProfileState.name;
  const rawExternalLinks = Array.isArray(profileData.externalLinks)
    ? profileData.externalLinks
    : [];
  const externalLinks = rawExternalLinks.reduce<ExternalLink[]>((accumulator, item, index) => {
    if (typeof item !== "object" || item === null) {
      return accumulator;
    }

    const link = item as { label?: unknown; url?: unknown };
    accumulator.push({
      id: String(index + 1),
      label: typeof link.label === "string" ? link.label : "",
      url: typeof link.url === "string" ? link.url : "",
    });
    return accumulator;
  }, []);

  const handle =
    typeof profileData.handle === "string" && profileData.handle
      ? profileData.handle
      : createHandleFromName(name);

  return {
    name,
    handle,
    role: roleLabel,
    bio:
      typeof profileData.bio === "string" && profileData.bio
        ? profileData.bio
        : "",
    link:
      typeof profileData.link === "string" && profileData.link
        ? profileData.link
        : `${DEFAULT_PUBLIC_SITE_URL}/profile/${handle.replace(/^@/u, "")}`,
    avatarUrl:
      typeof profileData.iconUrl === "string" && profileData.iconUrl
        ? profileData.iconUrl
        : defaultProfileState.avatarUrl,
    coverUrl:
      typeof profileData.coverUrl === "string" && profileData.coverUrl
        ? profileData.coverUrl
        : defaultProfileState.coverUrl,
    externalLinks:
      externalLinks.length > 0 ? externalLinks : defaultProfileState.externalLinks,
    joined: formatJoinedLabel(data.createdAt),
    following:
      typeof profileData.following === "string" && profileData.following
        ? profileData.following
        : defaultProfileState.following,
    followers:
      typeof profileData.followers === "string" && profileData.followers
        ? profileData.followers
        : defaultProfileState.followers,
    posts:
      typeof profileData.posts === "string" && profileData.posts
        ? profileData.posts
        : defaultProfileState.posts,
    selectedSports:
      toArrayOfStrings(profileData.selectedSports).length > 0
        ? toArrayOfStrings(profileData.selectedSports)
        : defaultProfileState.selectedSports,
  };
};
