import Link from "next/link";
import { getBlogPosts, getFeaturedPost, getMiniPosts, getSecondaryPosts } from "@/lib/blog-posts";

const CATEGORY_CLASS: Record<string, string> = {
  Consulting: "ac-gold",
  Tech: "ac-blue",
  Academy: "ac-green",
  "Startup Studio": "ac-purple",
};

function getCategoryClass(category: string): string {
  return CATEGORY_CLASS[category] ?? "ac-gold";
}

function BlogCardImage({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div
      role="img"
      className="blog-card-media"
      style={{
        backgroundImage: src
          ? `linear-gradient(135deg, rgba(245,166,35,.2), rgba(36,96,167,.2)), url("${src}")`
          : "linear-gradient(135deg, rgba(245,166,35,.25), rgba(36,96,167,.25))",
      }}
      aria-label={alt}
    >
      {!src ? (
        <span style={{ display: "none" }}>
          {alt}
        </span>
      ) : null}
    </div>
  );
}

export async function NoyaLandingBlog() {
  const posts = await getBlogPosts();
  const featured = await getFeaturedPost(posts);
  const secondary = await getSecondaryPosts(posts);
  const mini = await getMiniPosts(posts);

  return (
    <>
      <section className="sec-full blog-bg" id="blog">
        <div className="inner">
          <p className="eyebrow rv">Expertise &amp; Insights</p>
          <h2 className="display rv d1">Ce que nous savons,<br /><em>nous le partageons.</em></h2>
          <p className="lead rv d2">Analyses, études de cas et guides pratiques sur la transformation des entreprises africaines — publiés par nos équipes terrain.</p>
          <div className="blog-grid">
            <Link className="article article-feat rv" href={`/blog/${featured.slug}`}>
              <BlogCardImage src={featured.imageUrl} alt={featured.title} />
              <div className={`article-cat ${getCategoryClass(featured.category)}`}>{featured.category}</div>
              <div className="article-title">{featured.title}</div>
              <div className="article-excerpt">{featured.excerpt}</div>
              <div className="article-footer"><span className="article-date">{featured.dateLabel}</span><span className="article-cta">Lire <svg width={11} height={11} fill="none" viewBox="0 0 11 11"><path d="M2 5.5h7M5.5 2.5 8.5 5.5 5.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></span></div>
              <div className="article-num">01</div>
            </Link>
            {secondary.map((post, index) => (
              <Link
                key={post.slug}
                className={`article rv d${index + 1}`}
                style={index === secondary.length - 1 ? { borderRight: "none" } : undefined}
                href={`/blog/${post.slug}`}
              >
                <BlogCardImage src={post.imageUrl} alt={post.title} />
                <div className={`article-cat ${getCategoryClass(post.category)}`}>{post.category}</div>
                <div className="article-title">{post.title}</div>
                <div className="article-excerpt">{post.excerpt}</div>
                <div className="article-footer"><span className="article-date">{post.dateLabel}</span><span className="article-cta">Lire <svg width={11} height={11} fill="none" viewBox="0 0 11 11"><path d="M2 5.5h7M5.5 2.5 8.5 5.5 5.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></span></div>
                <div className="article-num">{String(index + 2).padStart(2, "0")}</div>
              </Link>
            ))}
          </div>
          <div className="blog-row2 rv">
            {mini.map((post) => (
              <Link key={post.slug} className="article-mini" href={`/blog/${post.slug}`}>
                <BlogCardImage src={post.imageUrl} alt={post.title} />
                <div className={`article-cat ${getCategoryClass(post.category)}`} style={{ fontSize: "9.5px" }}>
                  {post.category}
                </div>
                <div style={{ fontFamily: '"Fraunces",serif', fontSize: 15, fontWeight: 600, letterSpacing: "-.02em", lineHeight: "1.35" }}>
                  {post.title}
                </div>
                <div style={{ fontFamily: '"DM Mono",monospace', fontSize: "10.5px", color: "var(--fog)" }}>
                  {post.dateLabel}
                </div>
              </Link>
            ))}
          </div>
          <div className="blog-more rv">
            <Link className="btn-hero" href="/blog">
              Voir tous les articles ({posts.length})
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
