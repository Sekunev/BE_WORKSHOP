import Navigation from '@/components/layout/Navigation';
import BlogList from '@/components/blog/BlogList';

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Yazıları</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Teknoloji, yazılım geliştirme, tasarım ve daha birçok konuda kaliteli içerikler.
            İlham alın, öğrenin ve paylaşın.
          </p>
        </div>
        
        <BlogList />
      </div>
    </div>
  );
}
