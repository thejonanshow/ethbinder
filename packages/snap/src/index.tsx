import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { Box, Heading, Text } from '@metamask/snaps-sdk/jsx';

/**
 * The Snap's RPC request handler.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  console.log('Received request:', request);

  try {
    switch (request.method) {
      case 'getGitHubHandle':
        const storedState = await snap.request({
          method: 'snap_manageState',
          params: { operation: 'get' },
        });

        let handle = storedState?.handle ?? null;

        if (handle) {
          const response = await snap.request({
            method: 'snap_dialog',
            params: {
              type: 'confirmation',
              content: (
                <Box>
                  <Heading>Use this GitHub handle?</Heading>
                  <Text>{handle}</Text>
                </Box>
              ),
            },
          });

          if (response) {
            return { handle };
          }
        }

        handle = await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'prompt',
            content: (
              <Box>
                <Heading>Please enter your GitHub handle:</Heading>
                <Text>This will be used to verify your identity.</Text>
              </Box>
            ),
            placeholder: 'GitHub handle...',
          },
        });

        if (!handle || handle.trim() === '') {
          console.log('No valid input received.');
          return { handle: null };
        }

        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: { handle: String(handle) },
          },
        });

        return { handle };

      default:
        throw new Error(`Method ${request.method} not supported.`);
    }
  } catch (error: any) {
    console.error('Error in Snap execution:', error);
    throw new Error(`Snap execution failed: ${error.message}`);
  }
};

