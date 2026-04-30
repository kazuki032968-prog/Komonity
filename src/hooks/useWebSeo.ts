import { useEffect } from "react";
import { Platform } from "react-native";

import type { SeoMeta } from "../navigation/seo";

const ensureMetaTag = (selector: string, attribute: "name" | "property", value: string) => {
  if (typeof document === "undefined") {
    return null;
  }

  const existing = document.head.querySelector(selector);
  if (existing instanceof HTMLMetaElement) {
    return existing;
  }

  const element = document.createElement("meta");
  element.setAttribute(attribute, value);
  document.head.appendChild(element);
  return element;
};

const ensureCanonicalTag = () => {
  if (typeof document === "undefined") {
    return null;
  }

  const existing = document.head.querySelector("link[rel='canonical']");
  if (existing instanceof HTMLLinkElement) {
    return existing;
  }

  const element = document.createElement("link");
  element.setAttribute("rel", "canonical");
  document.head.appendChild(element);
  return element;
};

/**
 * Web で document title と主要 meta tags を更新します。
 * SPA でも共有時の最低限の情報を揃えられるようにしています。
 */
export function useWebSeo(meta: SeoMeta) {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    document.title = meta.title;
    document.documentElement.lang = "ja";

    const descriptionTag = ensureMetaTag("meta[name='description']", "name", "description");
    const ogTitleTag = ensureMetaTag("meta[property='og:title']", "property", "og:title");
    const ogDescriptionTag = ensureMetaTag(
      "meta[property='og:description']",
      "property",
      "og:description"
    );
    const ogTypeTag = ensureMetaTag("meta[property='og:type']", "property", "og:type");
    const ogUrlTag = ensureMetaTag("meta[property='og:url']", "property", "og:url");
    const ogSiteNameTag = ensureMetaTag(
      "meta[property='og:site_name']",
      "property",
      "og:site_name"
    );
    const ogLocaleTag = ensureMetaTag("meta[property='og:locale']", "property", "og:locale");
    const ogImageTag = ensureMetaTag("meta[property='og:image']", "property", "og:image");
    const ogImageAltTag = ensureMetaTag(
      "meta[property='og:image:alt']",
      "property",
      "og:image:alt"
    );
    const twitterCardTag = ensureMetaTag("meta[name='twitter:card']", "name", "twitter:card");
    const twitterTitleTag = ensureMetaTag("meta[name='twitter:title']", "name", "twitter:title");
    const twitterDescriptionTag = ensureMetaTag(
      "meta[name='twitter:description']",
      "name",
      "twitter:description"
    );
    const twitterImageTag = ensureMetaTag(
      "meta[name='twitter:image']",
      "name",
      "twitter:image"
    );
    const robotsTag = ensureMetaTag("meta[name='robots']", "name", "robots");
    const canonicalTag = ensureCanonicalTag();

    if (descriptionTag) {
      descriptionTag.setAttribute("content", meta.description);
    }
    if (ogTitleTag) {
      ogTitleTag.setAttribute("content", meta.title);
    }
    if (ogDescriptionTag) {
      ogDescriptionTag.setAttribute("content", meta.description);
    }
    if (ogTypeTag) {
      ogTypeTag.setAttribute("content", "website");
    }
    if (ogUrlTag) {
      ogUrlTag.setAttribute("content", meta.canonicalUrl);
    }
    if (ogSiteNameTag) {
      ogSiteNameTag.setAttribute("content", "Komonity");
    }
    if (ogLocaleTag) {
      ogLocaleTag.setAttribute("content", "ja_JP");
    }
    if (ogImageTag) {
      ogImageTag.setAttribute("content", meta.imageUrl);
    }
    if (ogImageAltTag) {
      ogImageAltTag.setAttribute("content", "Komonity のロゴ");
    }
    if (twitterCardTag) {
      twitterCardTag.setAttribute("content", "summary_large_image");
    }
    if (twitterTitleTag) {
      twitterTitleTag.setAttribute("content", meta.title);
    }
    if (twitterDescriptionTag) {
      twitterDescriptionTag.setAttribute("content", meta.description);
    }
    if (twitterImageTag) {
      twitterImageTag.setAttribute("content", meta.imageUrl);
    }
    if (robotsTag) {
      robotsTag.setAttribute("content", "index,follow,max-image-preview:large");
    }
    if (canonicalTag) {
      canonicalTag.setAttribute("href", meta.canonicalUrl);
    }
  }, [meta]);
}
