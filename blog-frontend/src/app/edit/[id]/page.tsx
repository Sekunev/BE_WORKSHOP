'use client';

import { useParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import EditBlogForm from '@/components/blog/EditBlogForm';

export default function EditBlogPage() {
  const params = useParams();
  const blogId = params.id as string;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Düzenle</h1>
          <p className="mt-2 text-gray-600">
            Blog yazınızı düzenleyin ve güncelleyin.
          </p>
        </div>
        
        <EditBlogForm blogId={blogId} />
      </div>
    </div>
  );
}
