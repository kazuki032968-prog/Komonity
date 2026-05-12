import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const distDir = resolve(rootDir, "dist");
const indexPath = resolve(distDir, "index.html");
const ogImageSourcePath = resolve(rootDir, "assets", "logo-komonity-header.png");
const ogImageOutputPath = resolve(distDir, "ogp.png");
const searchConsoleVerificationSourcePath = resolve(rootDir, "assets", "googlea718f0af9c496860.html");
const searchConsoleVerificationOutputPath = resolve(distDir, "googlea718f0af9c496860.html");
const adsTxtOutputPath = resolve(distDir, "ads.txt");
const robotsTxtOutputPath = resolve(distDir, "robots.txt");
const sitemapOutputPath = resolve(distDir, "sitemap.xml");

const siteUrl = "https://komonity-510b7.web.app";
const title = "Komonity | 顧問の先生と指導者をつなぐ部活支援SNS";
const description =
  "Komonityは、専門外の部活指導で悩む顧問の先生と知見を持つ指導者をつなぎ、練習メニュー・戦術・相談・コミュニティで現場の知見を共有できるサービスです。";
const ogImageUrl = `${siteUrl}/ogp.png`;
const googleSiteVerification = "w9-kPf_JrwFTgLsZf1etFMNbG0pPycKx5WNQpVC7yIc";
const keywords = [
  "Komonity",
  "コモニティ",
  "部活 顧問",
  "部活 顧問 悩み",
  "部活 顧問 相談",
  "専門外 部活 顧問",
  "教員 部活 負担",
  "部活指導",
  "部活動 指導",
  "中学校 部活 指導",
  "高校 部活 指導",
  "部活 練習メニュー",
  "部活動 練習メニュー",
  "今日の練習メニュー",
  "部活 戦術",
  "大会前 練習",
  "短時間 練習メニュー",
  "雨の日 練習",
  "初心者 指導",
  "少人数 練習",
  "道具 少ない 練習",
  "怪我予防 部活",
  "ストレッチ 部活",
  "顧問同士 コミュニティ",
  "部活 コミュニティ",
  "部活 Q&A",
  "外部指導者 探す",
  "部活 外部コーチ",
  "指導者 登録",
  "部活 指導者",
  "外部指導者",
  "スポーツ指導者",
  "文化部 指導者",
  "コーチ 集客",
  "指導者 プロフィール",
  "練習メニュー 投稿",
  "戦術 解説",
  "指導経験 発信",
  "指導者 バッジ",
  "ベストアンサー 指導者",
  "オンライン相談 指導者",
  "有料相談 指導者",
  "スクール 宣伝",
  "サッカー 部活",
  "野球 部活",
  "バスケットボール 部活",
  "テニス 部活",
  "バレーボール 部活",
  "吹奏楽 部活",
  "美術 部活",
  "演劇 部活",
];
const adsenseClientId = "ca-pub-5628186161852570";
const adsensePublisherId = adsenseClientId.replace(/^ca-/, "");
const adsTxtContent = `google.com, ${adsensePublisherId}, DIRECT, f08c47fec0942fa0\n`;
const sitemapPaths = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/service-detail", priority: "0.9", changefreq: "weekly" },
  { path: "/timeline/all", priority: "0.9", changefreq: "daily" },
  { path: "/timeline/menu-strategy", priority: "0.8", changefreq: "daily" },
  { path: "/timeline/questions", priority: "0.8", changefreq: "daily" },
  { path: "/timeline/community", priority: "0.7", changefreq: "daily" },
  { path: "/featured-coaches", priority: "0.8", changefreq: "daily" },
  { path: "/search", priority: "0.7", changefreq: "weekly" },
  { path: "/register", priority: "0.7", changefreq: "monthly" },
  { path: "/register/advisor", priority: "0.7", changefreq: "monthly" },
  { path: "/register/coach", priority: "0.8", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.4", changefreq: "yearly" },
  { path: "/terms", priority: "0.4", changefreq: "yearly" },
];
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Komonity",
    alternateName: "コモニティ",
    url: siteUrl,
    inLanguage: "ja-JP",
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Komonity",
    url: siteUrl,
    logo: ogImageUrl,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Komonity",
    alternateName: "コモニティ",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: siteUrl,
    image: ogImageUrl,
    inLanguage: "ja-JP",
    description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    audience: [
      {
        "@type": "Audience",
        audienceType: "部活顧問・教員",
      },
      {
        "@type": "Audience",
        audienceType: "部活指導者・外部コーチ・競技経験者",
      },
    ],
  },
];

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

if (!existsSync(indexPath)) {
  throw new Error("dist/index.html が見つかりません。先に expo export を実行してください。");
}

if (existsSync(ogImageSourcePath)) {
  copyFileSync(ogImageSourcePath, ogImageOutputPath);
}

if (existsSync(searchConsoleVerificationSourcePath)) {
  copyFileSync(searchConsoleVerificationSourcePath, searchConsoleVerificationOutputPath);
}

let html = readFileSync(indexPath, "utf8");

html = html.replace("<html lang=\"en\">", "<html lang=\"ja\">");
html = html.replace(/<title>.*?<\/title>/u, `<title>${escapeHtml(title)}</title>`);
html = html.replace(
  "You need to enable JavaScript to run this app.",
  "Komonityを利用するにはJavaScriptを有効にしてください。"
);

const metaBlock = `
    <!-- komonity-seo:start -->
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywords.join(", "))}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta name="google-site-verification" content="${googleSiteVerification}" />
    <link rel="canonical" href="${siteUrl}" />
    <meta property="og:site_name" content="Komonity" />
    <meta property="og:locale" content="ja_JP" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${siteUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:alt" content="Komonity のロゴ" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <script id="komonity-structured-data" type="application/ld+json">${JSON.stringify(structuredData).replaceAll("</", "<\\/")}</script>
    <!-- komonity-seo:end -->`;

const adsenseBlock = `
    <!-- komonity-adsense:start -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}" crossorigin="anonymous"></script>
    <!-- komonity-adsense:end -->`;

html = html.replace(
  /\n\s*<!-- komonity-seo:start -->[\s\S]*?<!-- komonity-seo:end -->/u,
  ""
);
html = html.replace(
  /\n\s*<!-- komonity-adsense:start -->[\s\S]*?<!-- komonity-adsense:end -->/u,
  ""
);
html = html.replace(
  /(<meta name="viewport"[^>]*\/>)/u,
  `$1${metaBlock}`
);
html = html.replace(
  /(\n\s*<!-- The `react-native-web` recommended style reset:)/u,
  `${adsenseBlock}$1`
);

writeFileSync(indexPath, html);
writeFileSync(adsTxtOutputPath, adsTxtContent);
writeFileSync(
  robotsTxtOutputPath,
  `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`
);
writeFileSync(
  sitemapOutputPath,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths
    .map(
      (entry) =>
        `  <url>\n    <loc>${siteUrl}${entry.path === "/" ? "" : entry.path}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
    )
    .join("\n")}\n</urlset>\n`
);
