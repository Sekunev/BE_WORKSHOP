// Validation utilities
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { isValid: false, error: 'E-posta adresi gerekli' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Geçerli bir e-posta adresi giriniz' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Şifre gerekli' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Şifre en az 6 karakter olmalı' };
  }
  
  return { isValid: true };
};

export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: 'İsim gerekli' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'İsim en az 2 karakter olmalı' };
  }
  
  return { isValid: true };
};

export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Şifre tekrarı gerekli' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Şifreler eşleşmiyor' };
  }
  
  return { isValid: true };
};

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const validateLoginForm = (data: LoginFormData): Record<keyof LoginFormData, string> => {
  const errors: Record<keyof LoginFormData, string> = {
    email: '',
    password: '',
  };
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error || '';
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error || '';
  }
  
  return errors;
};

export const validateRegisterForm = (data: RegisterFormData): Record<keyof RegisterFormData, string> => {
  const errors: Record<keyof RegisterFormData, string> = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };
  
  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error || '';
  }
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error || '';
  }
  
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error || '';
  }
  
  const confirmPasswordValidation = validateConfirmPassword(data.password, data.confirmPassword);
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error || '';
  }
  
  return errors;
};

export const hasFormErrors = (errors: Record<string, string>): boolean => {
  return Object.values(errors).some(error => error.length > 0);
};