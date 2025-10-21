// Authentication module tests
import {validateEmail, validatePassword, validateLoginForm, validateRegisterForm} from '@/utils/validation';

describe('Authentication Validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('E-posta adresi gerekli');
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
    });

    it('should reject short password', () => {
      const result = validatePassword('123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Şifre en az 6 karakter olmalı');
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Şifre gerekli');
    });
  });

  describe('validateLoginForm', () => {
    it('should validate correct login form', () => {
      const errors = validateLoginForm({
        email: 'test@example.com',
        password: 'password123',
      });
      
      expect(errors.email).toBe('');
      expect(errors.password).toBe('');
    });

    it('should return errors for invalid form', () => {
      const errors = validateLoginForm({
        email: 'invalid-email',
        password: '123',
      });
      
      expect(errors.email).toBeTruthy();
      expect(errors.password).toBeTruthy();
    });
  });

  describe('validateRegisterForm', () => {
    it('should validate correct register form', () => {
      const errors = validateRegisterForm({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      
      expect(errors.name).toBe('');
      expect(errors.email).toBe('');
      expect(errors.password).toBe('');
      expect(errors.confirmPassword).toBe('');
    });

    it('should return error for mismatched passwords', () => {
      const errors = validateRegisterForm({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'different123',
      });
      
      expect(errors.confirmPassword).toBe('Şifreler eşleşmiyor');
    });
  });
});