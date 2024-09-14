import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { Box, Heading, Text } from '@metamask/snaps-sdk/jsx';

/**
 * The Snap's RPC request handler.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  try {
    console.log('Received request:', request);

    switch (request.method) {
      case 'getGitHubHandle':
        console.log('Fetching GitHub handle...');

        // Retrieve the current stored state and log it
        const storedState = await snap.request({
          method: 'snap_manageState',
          params: { operation: 'get' },
        });
        console.log('Current stored state:', JSON.stringify(storedState));

        let handle = storedState ? storedState.handle : null;

        if (handle) {
          console.log('Stored GitHub handle found:', handle);

          // Show the handle confirmation dialog
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

          console.log('User response:', response);

          if (response) {
            // User confirmed, return the GitHub handle
            return { handle };
          }
        }

        // If no handle is stored or the user chooses to edit, prompt for a new handle
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

        console.log('New GitHub handle input:', handle);

        if (!handle || handle.trim() === '') {
          console.log('No input received or user canceled the dialog.');
          return { handle: null };
        }

        // Store the new handle in the Snap's state
        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: { handle: String(handle) },
          },
        });

        console.log('GitHub handle stored in Snap state:', handle);

        // Return the new handle
        return { handle };

      default:
        console.log(`Unknown method: ${request.method}`);
        throw new Error(`Method ${request.method} not found.`);
    }
  } catch (error: any) {
    console.error('Error during Snap execution:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('Error stack trace:', error.stack || 'No stack trace available');

    const errorMessage = error.message || 'Unknown error occurred';
    throw new Error(`Snap dialog failed: ${errorMessage}`);
  }
};

