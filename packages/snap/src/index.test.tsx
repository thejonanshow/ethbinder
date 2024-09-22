import { onRpcRequest } from './onUserInput';

describe('onRpcRequest', () => {
  const originalLog = console.log;
  const originalError = console.error;

  beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  it('handles valid request with method confirm', async () => {
    const result = await onRpcRequest({
      origin: 'origin',
      request: {
        id: 1,
        jsonrpc: '2.0',
        method: 'confirm',
        params: { userInput: 'test input', interfaceId: 'expectedId' },
      },
    });
    expect(result).toEqual({
      status: 'success',
      message: 'GitHub handle confirmed',
    });
  });

  it('handles valid request with method edit', async () => {
    const result = await onRpcRequest({
      origin: 'origin',
      request: {
        id: 2,
        jsonrpc: '2.0',
        method: 'edit',
        params: { userInput: 'test input', interfaceId: 'anotherInterfaceId' },
      },
    });
    expect(result).toEqual({
      status: 'success',
      message: 'GitHub handle editing initiated',
    });
  });

  it('throws error for unknown method', async () => {
    await expect(
      onRpcRequest({
        origin: 'origin',
        request: {
          id: 3,
          jsonrpc: '2.0',
          method: 'unknownMethod',
          params: { userInput: 'test input', interfaceId: 'unknownId' },
        },
      }),
    ).rejects.toThrow('Unknown method: unknownMethod');
  });

  it('throws error for empty user input', async () => {
    await expect(
      onRpcRequest({
        origin: 'origin',
        request: {
          id: 4,
          jsonrpc: '2.0',
          method: 'confirm',
          params: { userInput: '', interfaceId: 'expectedId' },
        },
      }),
    ).rejects.toThrow('Invalid user input');
  });

  it('throws error for non-string user input', async () => {
    await expect(
      onRpcRequest({
        origin: 'origin',
        request: {
          id: 5,
          jsonrpc: '2.0',
          method: 'confirm',
          params: { userInput: 123 as any, interfaceId: 'expectedId' },
        },
      }),
    ).rejects.toThrow('Invalid user input');
  });
});

