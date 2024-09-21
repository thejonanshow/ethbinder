
import { onUserInput } from '../src/onUserInput';

describe('Snap User Input Handling', () => {
  test('should handle confirm input', async () => {
    const response = await onUserInput({ userInput: 'confirm', interfaceId: 'test-id' });
    expect(response.status).toBe('success');
  });

  test('should handle edit input', async () => {
    const response = await onUserInput({ userInput: 'edit', interfaceId: 'test-id' });
    expect(response.status).toBe('success');
  });

  test('should throw error for invalid input', async () => {
    await expect(onUserInput({ userInput: 'invalid', interfaceId: 'test-id' })).rejects.toThrow('Failed to handle user input');
  });
});
