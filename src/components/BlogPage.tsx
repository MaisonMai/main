import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BlogPageProps {
  onBack: () => void;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string | null;
  author_name: string;
  published_at: string;
  tags: string[];
}

export function BlogPage({ onBack }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSelectedPost(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back to Blog</span>
              </button>
            </div>
          </div>
        </header>

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {selectedPost.featured_image_url && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8">
              <img
                src={selectedPost.featured_image_url}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {selectedPost.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(selectedPost.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{getReadingTime(selectedPost.content)}</span>
              </div>
              <span>By {selectedPost.author_name}</span>
            </div>

            {selectedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPost.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="prose prose-lg max-w-none">
            {selectedPost.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Maison Mai Blog
          </h1>
          <p className="text-xl text-gray-600">
            Insights, tips, and stories about thoughtful gifting
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              >
                {post.featured_image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{getReadingTime(post.content)}</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  )}

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
