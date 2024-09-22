import { OnRpcRequestHandler } from '@metamask/snaps-types';

interface UserInputParams {
  userInput: string;
  interfaceId: string;
}

/**
 * Handles RPC requests, including custom user input actions.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  const { method, params } = request;

  // Validate that params contains required fields
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    throw new Error('Invalid parameters: expected an object');
  }

  const { userInput, interfaceId } = params as Record<string, any>;

  // Input validation
  if (!userInput || typeof userInput !== 'string' || !userInput.trim()) {
    throw new Error('Invalid user input');
  }
  if (!interfaceId || typeof interfaceId !== 'string') {
    throw new Error('Invalid interface ID');
  }

  switch (method) {
    case 'confirm':
      return { status: 'success', message: 'GitHub handle confirmed' };

    case 'edit':
      return { status: 'success', message: 'GitHub handle editing initiated' };

    default:
      throw new Error(`Unknown method: ${method}`);
  }
};

