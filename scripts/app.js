(function () {
  const siteName = "副業スタート案内所";
  const siteDescription = "副業初心者がnote教材、Brain教材、作業環境、AI活用を目的別に探せるブログ型ガイドです。";
  const defaultImage = "./assets/images/side-hustle-desk-banner-v2.webp";
  const articles = [...(window.SALES_SITE_ARTICLES || [])].sort((a, b) => b.priority - a.priority);
  const categories = ["すべて", ...new Set(articles.map((article) => article.category))];
  const mediaTags = ["すべて", ...new Set(articles.flatMap((article) => article.mediaTags || []))];
  const purposeTags = ["すべて", ...new Set(articles.flatMap((article) => article.purposeTags || []))];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    return value ? value.replaceAll("-", ".") : "";
  }

  function affiliateLabel(type) {
    const labels = {
      note: "note",
      brain: "Brain",
      product: "商品紹介",
      other: "外部リンク"
    };
    return labels[type] || labels.other;
  }

  function isAffiliateArticle(article) {
    return article.isPr === true;
  }

  function renderPrBadge(article) {
    if (article.isPr === false && !article.disclosure) {
      return `<span class="neutral-badge">当サイトリンクは非PR</span>`;
    }

    if (!article.disclosure && !isAffiliateArticle(article)) {
      return "";
    }

    const label = article.disclosure || "PR: アフィリエイト広告を含みます";
    return `<span class="pr-badge">${escapeHtml(label)}</span>`;
  }

  function renderDateMeta(article) {
    const listed = article.listedAt || article.publishedAt;
    const source = article.sourcePublishedAt;
    const sourceStatus = article.sourcePublishedAtStatus;

    return `
      <time datetime="${escapeHtml(listed)}">掲載 ${escapeHtml(formatDate(listed))}</time>
      ${source ? `<time datetime="${escapeHtml(source)}">元記事 ${escapeHtml(formatDate(source))}</time>` : ""}
      ${!source && sourceStatus ? `<span class="date-note">元記事日 ${escapeHtml(sourceStatus)}</span>` : ""}
    `;
  }

  function renderReviewBasis(article) {
    if (!article.reviewBasis) {
      return "";
    }

    return `<span class="basis-badge">${escapeHtml(article.reviewBasis)}</span>`;
  }

  function articleUrl(article) {
    return `./articles/${encodeURIComponent(article.id)}/`;
  }

  function ctaRel(article) {
    return article.isPr ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer";
  }

  function absoluteUrl(value) {
    return new URL(value, window.location.href).href;
  }

  function setMeta(selector, content) {
    const meta = document.querySelector(selector);
    if (meta && content) {
      meta.setAttribute("content", content);
    }
  }

  function upsertStructuredData(id, data) {
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  function articleTags(article) {
    return [...(article.mediaTags || []), ...(article.purposeTags || [])];
  }

  function articleImage(article) {
    return absoluteUrl(article.thumbnail || defaultImage);
  }

  function updateIndexSeo() {
    upsertStructuredData("articleListStructuredData", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "副業初心者向け記事一覧",
      "description": siteDescription,
      "itemListElement": articles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": absoluteUrl(articleUrl(article)),
        "name": article.title,
        "description": article.summary
      }))
    });
  }

  function updateArticleSeo(article) {
    const title = `${article.title} | ${siteName}`;
    const url = absoluteUrl(articleUrl(article));
    const image = articleImage(article);

    document.title = title;
    setMeta('meta[name="description"]', article.summary);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', article.summary);
    setMeta('meta[property="og:image"]', image);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', article.summary);
    setMeta('meta[name="twitter:image"]', image);

    upsertStructuredData("articleStructuredData", {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.summary,
      "image": [image],
      "datePublished": article.sourcePublishedAt || article.listedAt || article.publishedAt,
      "dateModified": article.listedAt || article.publishedAt,
      "inLanguage": "ja",
      "isAccessibleForFree": true,
      "about": articleTags(article),
      "author": {
        "@type": "Organization",
        "name": siteName
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName
      },
      "mainEntityOfPage": url
    });
  }

  function renderThumbnail(article) {
    if (article.thumbnail) {
      return `
        <div class="thumb image-thumb">
          <img src="${escapeHtml(article.thumbnail)}" alt="${escapeHtml(article.title)}">
        </div>
      `;
    }

    return `
      <div class="thumb thumb-${escapeHtml(article.thumbnailTone || "mint")}" aria-hidden="true">
        <span>${escapeHtml(article.category)}</span>
        <strong>${escapeHtml(affiliateLabel(article.affiliateType))}</strong>
      </div>
    `;
  }

  function renderCard(article, featured) {
    return `
      <article class="article-card${featured ? " featured-card" : ""}">
        <a class="card-image-link" href="${articleUrl(article)}" aria-label="${escapeHtml(article.title)}を読む">
          ${renderThumbnail(article)}
        </a>
        <div class="card-body">
          <div class="meta-row">
            <span class="pill">${escapeHtml(article.category)}</span>
            ${renderDateMeta(article)}
            ${renderPrBadge(article)}
            ${renderReviewBasis(article)}
          </div>
          <h3><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h3>
          <p>${escapeHtml(article.summary)}</p>
          ${renderTags(article)}
          <div class="card-actions">
            <a class="text-link" href="${articleUrl(article)}">記事を読む</a>
            <a class="button small" href="${escapeHtml(article.ctaUrl)}" target="_blank" rel="${ctaRel(article)}" data-analytics-event="${article.isPr ? "affiliate_click" : "cta_click"}" data-article-id="${escapeHtml(article.id)}">${escapeHtml(article.ctaLabel)}</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderTags(article) {
    const allTags = articleTags(article);
    if (allTags.length === 0) {
      return "";
    }

    return `
      <div class="tag-list">
        ${allTags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
    `;
  }

  function renderIndex() {
    const featuredEl = document.getElementById("featuredArticles");
    const tabsEl = document.getElementById("categoryTabs");
    const mediaTabsEl = document.getElementById("mediaTabs");
    const purposeTabsEl = document.getElementById("purposeTabs");
    const gridEl = document.getElementById("articleGrid");
    const countEl = document.getElementById("articleCount");

    if (!featuredEl || !tabsEl || !mediaTabsEl || !purposeTabsEl || !gridEl || !countEl) {
      return;
    }

    let activeCategory = "すべて";
    let activeMediaTag = "すべて";
    let activePurposeTag = "すべて";

    function paintArticles() {
      const filtered = articles.filter((article) => {
        const categoryMatched = activeCategory === "すべて" || article.category === activeCategory;
        const mediaMatched = activeMediaTag === "すべて" || (article.mediaTags || []).includes(activeMediaTag);
        const purposeMatched = activePurposeTag === "すべて" || (article.purposeTags || []).includes(activePurposeTag);
        return categoryMatched && mediaMatched && purposeMatched;
      });

      gridEl.innerHTML = filtered.map((article) => renderCard(article, false)).join("");
      countEl.textContent = `${filtered.length}件の記事`;

      [...tabsEl.querySelectorAll("button")].forEach((button) => {
        button.classList.toggle("active", button.dataset.category === activeCategory);
      });

      [...mediaTabsEl.querySelectorAll("button")].forEach((button) => {
        button.classList.toggle("active", button.dataset.mediaTag === activeMediaTag);
      });

      [...purposeTabsEl.querySelectorAll("button")].forEach((button) => {
        button.classList.toggle("active", button.dataset.purposeTag === activePurposeTag);
      });
    }

    featuredEl.innerHTML = articles.slice(0, 2).map((article) => renderCard(article, true)).join("");
    updateIndexSeo();
    tabsEl.innerHTML = categories.map((category) => (
      `<button type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
    )).join("");
    mediaTabsEl.innerHTML = mediaTags.map((tag) => (
      `<button type="button" data-media-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`
    )).join("");
    purposeTabsEl.innerHTML = purposeTags.map((tag) => (
      `<button type="button" data-purpose-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`
    )).join("");

    tabsEl.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) {
        return;
      }
      activeCategory = button.dataset.category;
      activeMediaTag = "すべて";
      activePurposeTag = "すべて";
      if (window.trackSiteEvent) {
        window.trackSiteEvent("filter_click", { filter_type: "category", filter_value: activeCategory });
      }
      paintArticles();
    });

    mediaTabsEl.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) {
        return;
      }
      activeCategory = "すべて";
      activeMediaTag = button.dataset.mediaTag;
      activePurposeTag = "すべて";
      if (window.trackSiteEvent) {
        window.trackSiteEvent("filter_click", { filter_type: "media", filter_value: activeMediaTag });
      }
      paintArticles();
    });

    purposeTabsEl.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) {
        return;
      }
      activeCategory = "すべて";
      activeMediaTag = "すべて";
      activePurposeTag = button.dataset.purposeTag;
      if (window.trackSiteEvent) {
        window.trackSiteEvent("filter_click", { filter_type: "purpose", filter_value: activePurposeTag });
      }
      paintArticles();
    });

    paintArticles();
  }

  function renderArticle() {
    const pageEl = document.getElementById("articlePage");
    const relatedEl = document.getElementById("relatedArticles");

    if (!pageEl || !relatedEl) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const article = articles.find((item) => item.id === id) || articles[0];

    updateArticleSeo(article);

    pageEl.innerHTML = `
      <header class="article-hero">
        <a class="back-link" href="./index.html#articles">記事一覧へ戻る</a>
        <div class="meta-row">
          <span class="pill">${escapeHtml(article.category)}</span>
          ${renderDateMeta(article)}
          ${renderPrBadge(article)}
          ${renderReviewBasis(article)}
        </div>
        <h1>${escapeHtml(article.title)}</h1>
        <p>${escapeHtml(article.summary)}</p>
        ${renderTags(article)}
        <a class="button primary" href="${escapeHtml(article.ctaUrl)}" target="_blank" rel="${ctaRel(article)}" data-analytics-event="${article.isPr ? "affiliate_click" : "cta_click"}" data-article-id="${escapeHtml(article.id)}">${escapeHtml(article.ctaLabel)}</a>
      </header>
      ${renderThumbnail(article)}
      <div class="article-body">
        ${article.body.map((paragraph, index) => `
          <p>${escapeHtml(paragraph)}</p>
          ${index === 1 ? `<aside class="inline-cta"><strong>次の行動に進む</strong><a class="button small" href="${escapeHtml(article.ctaUrl)}" target="_blank" rel="${ctaRel(article)}" data-analytics-event="${article.isPr ? "affiliate_click" : "cta_click"}" data-article-id="${escapeHtml(article.id)}">${escapeHtml(article.ctaLabel)}</a></aside>` : ""}
        `).join("")}
      </div>
      <footer class="article-cta">
        <p>内容が今の悩みに近ければ、外部ページで詳細を確認できます。</p>
        <a class="button primary" href="${escapeHtml(article.ctaUrl)}" target="_blank" rel="${ctaRel(article)}" data-analytics-event="${article.isPr ? "affiliate_click" : "cta_click"}" data-article-id="${escapeHtml(article.id)}">${escapeHtml(article.ctaLabel)}</a>
      </footer>
    `;

    if (window.trackSiteEvent) {
      window.trackSiteEvent("article_view", { article_id: article.id, category: article.category });
    }

    const currentTags = new Set(articleTags(article));
    const related = articles
      .filter((item) => item.id !== article.id)
      .map((item) => ({
        item,
        score: articleTags(item).filter((tag) => currentTags.has(tag)).length + (item.category === article.category ? 1 : 0)
      }))
      .sort((a, b) => b.score - a.score || b.item.priority - a.item.priority)
      .map((entry) => entry.item)
      .slice(0, 3);
    relatedEl.innerHTML = related.map((item) => renderCard(item, false)).join("");
  }

  renderIndex();
  renderArticle();
}());
