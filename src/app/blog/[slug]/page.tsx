import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogComments } from "@/components/blog/BlogComments";
import { NoyaLandingPageChrome } from "@/components/landing/NoyaLandingPageChrome";
import { getBlogPosts, getPostBySlug } from "@/lib/blog-posts";

export const revalidate = 0;

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <NoyaLandingPageChrome>
      <section className="sec-full blog-bg" id="blog-article">
        <div className="inner">
          <p className="eyebrow rv">{post.category}</p>
          <h1 className="display rv d1">{post.title}</h1>
          <p className="lead rv d2">
            {post.dateLabel} · {post.readTime}
          </p>
          <div
            className="rv d2 blog-hero-media"
            style={{
              backgroundImage: post.imageUrl
                ? `linear-gradient(135deg, rgba(245,166,35,.2), rgba(36,96,167,.2)), url("${post.imageUrl}")`
                : "linear-gradient(135deg, rgba(245,166,35,.25), rgba(36,96,167,.25))",
            }}
          />
          <div className="article-content rv">
            {post.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="blog-more rv">
            <Link className="btn-hero-out" href="/blog">
              Retour au blog
            </Link>
            <Link className="btn-hero" href="/contact">
              Parler a un conseiller
            </Link>
          </div>
          <BlogComments slug={post.slug} />
        </div>
      </section>
    </NoyaLandingPageChrome>
  );
}
