
import { renderHook } from '@testing-library/react-hooks';
import { useRequest, useRequestSnap } from '../hooks';
import { MetaMaskProvider } from '../hooks/MetamaskContext';

describe('useRequest Hook', () => {
  test('should return null on MetaMask request failure', async () => {
    const { result } = renderHook(() => useRequest(), { wrapper: MetaMaskProvider });
    const response = await result.current({ method: 'testMethod', params: {} });
    expect(response).toBeNull();
  });
});

describe('useRequestSnap Hook', () => {
  test('should throw error on invalid Snap install', async () => {
    const { result } = renderHook(() => useRequestSnap(), { wrapper: MetaMaskProvider });
    await expect(result.current()).rejects.toThrow('Failed to install Snap');
  });
});
