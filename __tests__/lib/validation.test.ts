import {
  isValidUrl,
  isValidEmail,
  isValidUsername,
  sanitizeString,
  validateLinkData,
  validateProfileData,
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    it('should validate correct usernames', () => {
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('user_name')).toBe(true);
      expect(isValidUsername('user-name')).toBe(true);
      expect(isValidUsername('abc')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(isValidUsername('ab')).toBe(false); // too short
      expect(isValidUsername('User123')).toBe(false); // uppercase
      expect(isValidUsername('user@name')).toBe(false); // invalid char
      expect(isValidUsername('user name')).toBe(false); // space
      expect(isValidUsername('')).toBe(false);
      expect(isValidUsername('a'.repeat(31))).toBe(false); // too long
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
      expect(sanitizeString('Hello <b>World</b>')).toBe('Hello bWorld/b');
      expect(sanitizeString('  spaces  ')).toBe('spaces');
    });

    it('should preserve safe content', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World');
      expect(sanitizeString('user@example.com')).toBe('user@example.com');
    });
  });

  describe('validateLinkData', () => {
    it('should validate correct link data', () => {
      const errors = validateLinkData({
        title: 'My Link',
        url: 'https://example.com',
        description: 'A description',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject missing title', () => {
      const errors = validateLinkData({
        title: '',
        url: 'https://example.com',
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('title');
    });

    it('should reject invalid URL', () => {
      const errors = validateLinkData({
        title: 'My Link',
        url: 'not-a-url',
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('url');
    });

    it('should reject too long title', () => {
      const errors = validateLinkData({
        title: 'a'.repeat(101),
        url: 'https://example.com',
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('title');
    });

    it('should reject too long description', () => {
      const errors = validateLinkData({
        title: 'My Link',
        url: 'https://example.com',
        description: 'a'.repeat(501),
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('description');
    });
  });

  describe('validateProfileData', () => {
    it('should validate correct profile data', () => {
      const errors = validateProfileData({
        username: 'testuser',
        display_name: 'Test User',
        bio: 'A bio',
        avatar_url: 'https://example.com/avatar.jpg',
      });
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid username', () => {
      const errors = validateProfileData({
        username: 'ab',
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('username');
    });

    it('should reject too long display name', () => {
      const errors = validateProfileData({
        display_name: 'a'.repeat(51),
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('display_name');
    });

    it('should reject too long bio', () => {
      const errors = validateProfileData({
        bio: 'a'.repeat(501),
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('bio');
    });

    it('should reject invalid avatar URL', () => {
      const errors = validateProfileData({
        avatar_url: 'not-a-url',
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('avatar_url');
    });
  });
});