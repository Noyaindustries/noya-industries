import Link from "next/link";
import { NoyaLandingPageChrome } from "@/components/landing/NoyaLandingPageChrome";
import { getBlogPosts } from "@/lib/blog-posts";

export const revalidate = 0;

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <NoyaLandingPageChrome>
      <section className="sec-full blog-bg" id="blog-list">
        <div className="inner">
          <p className="eyebrow rv">Blog Noya Industries</p>
          <h1 className="display rv d1">
            Tous nos <em>articles</em>
          </h1>
          <p className="lead rv d2">
            Analyses operationnelles, retours terrain et guides actionnables pour les
            entreprises africaines.
          </p>
          <div className="blog-grid">
            {posts.map((post, index) => (
              <Link
                key={post.slug}
                className={`article${post.featured ? " article-feat" : ""} rv`}
                href={`/blog/${post.slug}`}
                style={!post.featured && (index + 1) % 3 === 0 ? { borderRight: "none" } : undefined}
              >
                <div
                  className="blog-card-media"
                  style={{
                    backgroundImage: post.imageUrl
                      ? `linear-gradient(135deg, rgba(245,166,35,.2), rgba(36,96,167,.2)), url("${post.imageUrl}")`
                      : "linear-gradient(135deg, rgba(245,166,35,.25), rgba(36,96,167,.25))",
                  }}
                />
                <div className="article-cat">{post.category}</div>
                <div className="article-title">{post.title}</div>
                <div className="article-excerpt">{post.excerpt}</div>
                <div className="article-footer">
                  <span className="article-date">
                    {post.dateLabel} · {post.readTime}
                  </span>
                  <span className="article-cta">Lire</span>
                </div>
                <div className="article-num">{String(index + 1).padStart(2, "0")}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </NoyaLandingPageChrome>
  );
}
