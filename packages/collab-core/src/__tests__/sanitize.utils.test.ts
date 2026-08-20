import { describe, expect, it } from 'vitest';
import { escapeHtmlText, sanitizeCollabUser } from '../utils/sanitize.utils';

describe('sanitize.utils', () => {
  it('should escape HTML characters properly', () => {
    const input = '<script>alert("xss")</script>&"\'';
    const escaped = escapeHtmlText(input);
    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&amp;');
  });

  it('should sanitize user name and strip HTML tags', () => {
    const user = sanitizeCollabUser({
      name: '<img src=x onerror=alert(1)>Duc',
      color: '#ff0000',
    });
    expect(user.name).toBe('Duc');
    expect(user.color).toBe('#ff0000');
    expect(user.initials).toBe('DU');
  });

  it('should fix invalid hex color with fallback', () => {
    const user = sanitizeCollabUser({
      name: 'Tester',
      color: 'invalid-color-value',
    });
    expect(user.color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should ignore non-https/data avatar URLs', () => {
    const user = sanitizeCollabUser({
      name: 'Tester',
      avatarUrl: 'javascript:alert(1)',
    });
    expect(user.avatarUrl).toBeUndefined();

    const secureUser = sanitizeCollabUser({
      name: 'Tester',
      avatarUrl: 'https://example.com/avatar.png',
    });
    expect(secureUser.avatarUrl).toBe('https://example.com/avatar.png');
  });
});
