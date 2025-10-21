import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import {COLORS, TYPOGRAPHY, SPACING} from '@/constants/theme';
import {CustomInput, CustomButton, Loading} from '@/components/ui';
import {useGetProfileQuery, useUpdateProfileMutation, useUploadAvatarMutation} from '@/store/api/userApi';
import {useAuth} from '@/hooks/useAuth';
import {UpdateProfileData} from '@/types/user';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const {user, updateUser} = useAuth();
  
  const {data: profile, isLoading: profileLoading} = useGetProfileQuery();
  const [updateProfile, {isLoading: updateLoading}] = useUpdateProfileMutation();
  const [uploadAvatar, {isLoading: uploadLoading}] = useUploadAvatarMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
      });
      setAvatarUri(profile.avatar || null);
    }
  }, [profile]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const handleAvatarPress = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 400,
        maxHeight: 400,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.uri) {
            setAvatarUri(asset.uri);
            handleUploadAvatar(asset);
          }
        }
      }
    );
  };

  const handleUploadAvatar = async (asset: any) => {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || 'avatar.jpg',
      } as any);

      const result = await uploadAvatar(formData).unwrap();
      setAvatarUri(result.avatarUrl);
      
      // Update user context
      if (user) {
        updateUser({...user, avatar: result.avatarUrl});
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const updateData: UpdateProfileData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
      };

      const updatedProfile = await updateProfile(updateData).unwrap();
      
      // Update user context
      updateUser(updatedProfile);
      
      Alert.alert('Success', 'Profile updated successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.data?.message || 'Failed to update profile');
    }
  };

  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading size="large" text="Loading profile..." />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{width: 24}} />
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
          {avatarUri ? (
            <Image source={{uri: avatarUri}} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={40} color={COLORS.text.secondary} />
            </View>
          )}
          <View style={styles.avatarOverlay}>
            <Icon name="camera-alt" size={20} color={COLORS.background.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarText}>Tap to change avatar</Text>
        {uploadLoading && <Loading size="small" />}
      </View>

      {/* Form */}
      <View style={styles.form}>
        <CustomInput
          label="Name"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          placeholder="Enter your name"
          error={errors.name}
        />

        <CustomInput
          label="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <CustomInput
          label="Bio"
          value={formData.bio}
          onChangeText={(value) => handleInputChange('bio', value)}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={4}
          error={errors.bio}
        />
      </View>

      {/* Save Button */}
      <CustomButton
        title="Save Changes"
        onPress={handleSave}
        loading={updateLoading}
        style={styles.saveButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  } as any,
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border.primary,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.primary,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: SPACING.xl,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});

export default EditProfileScreen;