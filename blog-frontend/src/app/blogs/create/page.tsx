import Navigation from '@/components/layout/Navigation';
import CreateBlogForm from '@/components/blog/CreateBlogForm';

export default function CreateBlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yeni Blog Yazısı</h1>
          <p className="mt-2 text-gray-600">
            Düşüncelerinizi paylaşın ve blog yazınızı oluşturun.
          </p>
        </div>
        
        <CreateBlogForm />
      </div>
    </div>
  );
}
