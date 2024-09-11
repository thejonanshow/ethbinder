import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { Box, Text, Bold, Copyable } from '@metamask/snaps-sdk/jsx';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */


function buildGitHubURL(handle: string) {
  return "https://github.com/" + handle + ".keys";
};

function getText(url: string) {
  const response = fetch(url);
  return response;
}

module.exports.onRpcRequest = async ({ origin, request }) => {
  switch (request.method) {
    // Expose a "hello" JSON-RPC method to dapps.
    case "hello":
      return "world!"

    default:
      throw new Error("Method not found.")
  }
}

const url = buildGitHubURL("thejonanshow");
const keyResponse = getText(url);
const key = JSON.stringify(keyResponse);

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Text>
                Hello, <Bold>{origin}</Bold>!
              </Text>
              <Copyable value={url} />
              <Copyable value={key} />
              <Text>
                View your keys on GitHub
              </Text>
            </Box>
          ),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
