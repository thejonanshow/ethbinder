import { utils } from '@ethersproject/sha2'; // Use @ethersproject for lightweight signature verification
import { verifyMessage } from '@ethersproject/wallet'; // Function to verify signatures

export interface Env {
  GITHUB_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const logs: string[] = []; // Collect logs to return in the response
    const url = new URL(request.url);
    const repo = url.searchParams.get('repo') || 'ethbinder';
    const debug = url.searchParams.get('debug') === 'true';
    logs.push(`Debug is set to: ${debug}`);
    logs.push(`Repo is set to: ${repo}`);

    // Attempt to extract the GitHub handle from the referrer
    const setGitHubHandle = () => {
      const referrer = request.headers.get('Referer');
      logs.push(`Referrer: ${referrer}`);

      if (referrer) {
        const referrerUrl = new URL(referrer);
        const referrerPath = referrerUrl.pathname;

        const pathParts = referrerPath.split('/');
        logs.push(`Referrer path parts: ${pathParts.join('/')}`);

        if (pathParts.length >= 2 && pathParts[1]) {
          logs.push(`GitHub handle found from referrer: ${pathParts[1]}`);
          return pathParts[1]; // GitHub handle should be in the second part of the path
        } else {
          logs.push('GitHub handle could not be extracted from referrer');
          return null;
        }
      }
      return null;
    };

    const sendResponse = (message: string, options: Object) => {
      const respData = debug ? { message, logs } : { message }
      return new Response(JSON.stringify(respData), options)
    }

    const sendBadgeResponse = (isVerified: string, options: Object) => {
      const badgeData = {
        label: 'ethbinder',
        message: isVerified ? 'verified' : 'failed',  // Dynamic based on verification
        labelColor: '#555',  // Optional label color
        color: isVerified ? '#4c1' : '#e05d44',  // Green for verified, red for invalid
        logo: 'ethereum',
        links: ['https://github.com/thejonanshow/ethbinder'],  // Optional links
        style: 'flat'  // Optional badge style
      };

      const respData = debug ? { badgeData, logs } : { badgeData }
      return new Response(JSON.stringify(respData), options)
    }

    const githubHandle = url.searchParams.get('handle') || setGitHubHandle();
    logs.push(`GitHub handle: ${githubHandle}`);

    if (!githubHandle || !repo) {
      logs.push('Missing handle or repo query parameters');
      return sendResponse(
        "Missing handle or repo query parameters",
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const githubToken = env.GITHUB_API_KEY;
    logs.push(`GitHub token presence: ${!!githubToken}`);

    if (!githubToken) {
      logs.push('GitHub token is not set');
      return sendResponse(
        "GitHub token is not set",
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Fetch issues from GitHub repo
    logs.push(`Fetching issues from GitHub for repo: ${githubHandle}/${repo}`);
    const response = await fetch(`https://api.github.com/repos/${githubHandle}/${repo}/issues`, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'eth-verification-worker'

      }
    });

    logs.push(`GitHub API response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      logs.push(`Failed to fetch issues from GitHub: ${response.statusText} (${response.status})`);
      logs.push(`Error body: ${errorText}`);

      return sendResponse(
        `Failed to fetch issues from GitHub: ${response.statusText}`,
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const issues = await response.json();
    logs.push(`Fetched ${issues.length} issues from ${githubHandle}/${repo}`);

    // Search for an issue containing the required JSON payload
    let validIssue;
    for (const issue of issues) {
      logs.push(`Checking issue: ${issue.title}`);

      const jsonMatch = issue.body?.match(/```json\s+([\s\S]+?)```/);
      if (jsonMatch) {
        try {
          logs.push(`Found JSON in issue: ${issue.title}`);
          const parsedPayload = JSON.parse(jsonMatch[1]);

          if (parsedPayload.githubHandle && parsedPayload.ethAddress && parsedPayload.signature) {
            logs.push(`Valid payload found in issue: ${issue.title}`);

            // Validate signature
            const message = parsedPayload.githubHandle; // Assuming handle is signed
            const signature = parsedPayload.signature;
            const address = parsedPayload.ethAddress;

            logs.push(`Verifying signature for handle: ${message}`);
            const recoveredAddress = verifyMessage(message, signature);

            logs.push(`Recovered address: ${recoveredAddress}`);
            if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
              logs.push('Signature verified successfully.');
              return sendBadgeResponse(
                true,
                { status: 200, headers: { 'Content-Type': 'application/json' } }
              );
            } else {
              logs.push('Signature verification failed.');
              return sendBadgeResponse(
                false,
                { status: 400, headers: { 'Content-Type': 'application/json' } }
              );
            }
          } else {
            logs.push('Required fields missing in JSON payload.');
          }
        } catch (err) {
          logs.push(`Error parsing issue body: ${err.message}`);
        }
      } else {
        logs.push(`No valid JSON found in issue: ${issue.title}`);
      }
    }

    logs.push("No valid issue found with signature verification.");
    return sendResponse(
      'No valid issue found with signature verification.',
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  },
} satisfies ExportedHandler<Env>;

