import { loginSchema, registerSchema } from '@/utils/validation';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate a correct login form', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });
  });

  describe('registerSchema', () => {
    const validRegisterData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      phone: '+1 555-123-4567',
      zipCode: '12345',
      terms: true,
    };

    it('should validate a correct registration form', () => {
      const result = registerSchema.safeParse(validRegisterData);
      expect(result.success).toBe(true);
    });

    it('should reject when passwords do not match', () => {
      const invalidData = {
        ...validRegisterData,
        confirmPassword: 'DifferentPassword',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });

    it('should reject weak password', () => {
      const invalidData = {
        ...validRegisterData,
        password: 'weakpass',
        confirmPassword: 'weakpass',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });

    it('should reject when terms are not accepted', () => {
      const invalidData = {
        ...validRegisterData,
        terms: false,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('terms');
      }
    });

    it('should validate invalid phone number format', () => {
      const invalidData = {
        ...validRegisterData,
        phone: 'invalid-phone',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phone');
      }
    });

    it('should validate invalid ZIP code format', () => {
      const invalidData = {
        ...validRegisterData,
        zipCode: 'invalid',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('zipCode');
      }
    });
  });
});