
import { Env } from '../src/index';

describe('Worker Request Handling', () => {
  const request = new Request('https://example.com/?repo=ethbinder&debug=true', { method: 'GET' });
  const env: Env = { GITHUB_API_KEY: 'fake-key' };
  
  test('should extract GitHub handle from referrer', async () => {
    request.headers.set('Referer', 'https://github.com/testuser/repo');
    const response = await fetch(request, env);
    const logs = await response.text();
    expect(logs).toContain('GitHub handle found from referrer: testuser');
  });

  test('should return error for malformed referrer', async () => {
    request.headers.set('Referer', 'https://malformed.com/invalidpath');
    const response = await fetch(request, env);
    const logs = await response.text();
    expect(logs).toContain('GitHub handle could not be extracted');
  });

  test('should handle missing GitHub handle gracefully', async () => {
    request.headers.delete('Referer');
    const response = await fetch(request, env);
    const logs = await response.text();
    expect(logs).toContain('GitHub handle could not be extracted');
  });
});
