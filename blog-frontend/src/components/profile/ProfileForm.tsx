'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/services/auth';
import { toast } from 'sonner';
import { Loader2, User, Mail, Calendar, Edit3, Save, X, Image } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ChangePasswordForm from './ChangePasswordForm';
import BlogStats from './BlogStats';

const profileSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır').max(50, 'İsim en fazla 50 karakter olabilir'),
  email: z.string().email('Geçerli bir email adresi giriniz'),
  bio: z.string().max(500, 'Bio en fazla 500 karakter olabilir').optional(),
  avatar: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user, refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('bio', user.bio || '');
      setValue('avatar', user.avatar || '');
      setIsLoading(false);
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const updatedUser = await authService.updateProfile({
        name: data.name,
        bio: data.bio,
        avatar: data.avatar || undefined
      });
      
      await refreshUser();
      toast.success('Profil bilgileri güncellendi!');
      setIsEditing(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profil güncellenirken bir hata oluştu';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('bio', user.bio || '');
      setValue('avatar', user.avatar || '');
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Kullanıcı bilgileri yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profil Kartı */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profil Bilgileri</span>
          </CardTitle>
          <CardDescription>
            Hesap bilgilerinizi görüntüleyin ve düzenleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Üye olma: {user.lastLogin ? format(new Date(user.lastLogin), 'dd MMMM yyyy', { locale: tr }) : 'Bilinmiyor'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>İsim</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  disabled={!isEditing || isSaving}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={!isEditing || isSaving}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar" className="flex items-center space-x-2">
                <Image className="h-4 w-4" alt="Avatar icon" />
                <span>Avatar URL</span>
              </Label>
              <Input
                id="avatar"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                {...register('avatar')}
                disabled={!isEditing || isSaving}
                className={!isEditing ? 'bg-gray-50' : ''}
              />
              {errors.avatar && (
                <p className="text-sm text-red-500">{errors.avatar.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center space-x-2">
                <Edit3 className="h-4 w-4" />
                <span>Bio</span>
              </Label>
              <textarea
                id="bio"
                placeholder="Hakkınızda kısa bir açıklama yazın..."
                {...register('bio')}
                disabled={!isEditing || isSaving}
                className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${!isEditing ? 'bg-gray-50' : ''}`}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              {!isEditing ? (
                <Button type="button" onClick={handleEdit} variant="outline">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Düzenle
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="mr-2 h-4 w-4" />
                    İptal
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Blog İstatistikleri */}
      <BlogStats />

      {/* Güvenlik */}
      <Card>
        <CardHeader>
          <CardTitle>Güvenlik</CardTitle>
          <CardDescription>
            Hesap güvenliğinizi yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Şifre Değiştir</h4>
              <ChangePasswordForm />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">İki Faktörlü Kimlik Doğrulama</h4>
              <p className="text-sm text-gray-600">Hesabınızı ekstra güvenlik ile koruyun</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Yakında
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
