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

    const buildBadge = (badgeMessage: string, success: Boolean, options: Object) => {
      return {
        schemaVersion: 1,
        label: 'ethbinder',
        message: badgeMessage,
        labelColor: '#5177D0',  // Optional label color
        color: success ? '#51D06A' : '#D06A51',  // Green for verified, red for invalid
        namedLogo: 'ethereum',
        style: 'flat'  // Optional badge style
      };
    }

    const sendBadgeResponse = (message: string, success: Boolean, options: Object) => {
      const badgeData = buildBadge(message, success, options);
      const respData = debug ? { ...badgeData, logs } : { ...badgeData }
      return new Response(JSON.stringify(respData), options)
    }

    const githubHandle = url.searchParams.get('handle') || setGitHubHandle();
    logs.push(`GitHub handle: ${githubHandle}`);

    if (!githubHandle || !repo) {
      logs.push('Missing handle or repo query parameters');
      return sendBadgeResponse(
        "missing handle",
        false,
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const validHandle = githubHandle ? await verifyGitHubHandle(githubHandle) : false;
    if (validHandle) {
      logs.push(`Handle is valid, validHandle: ${JSON.stringify(validHandle)}, handle: ${githubHandle}`);
    } else {
      return sendBadgeResponse(
        `invalid handle: ${githubHandle}`,
        false,
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    if (validHandle) {
      const validRepo = await verifyRepo(githubHandle);
        logs.push(`verifyRepo result: ${JSON.stringify(validRepo)}`);

      if (validRepo === true) {
        logs.push(`User has an ethbinder repo: ${githubHandle}`);
      } else {
        logs.push(`User ${githubHandle} does not have an ethbinder repo`);
        return sendBadgeResponse(
          `missing repo ethbinder`,
          false,
          { status: 500, headers: { 'Content-Type': 'application/json' }}
        );
      }
    }

    const githubToken = env.GITHUB_API_KEY;
    logs.push(`GitHub token presence: ${!!githubToken}`);

    if (!githubToken) {
      logs.push('GitHub token is not set');
      return sendBadgeResponse(
        "missing github token",
        false,
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    async function verifyGitHubHandle(handle: string) {
      const url = `https://api.github.com/users/${handle}`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'YourAppName',  // GitHub API requires a user-agent
          },
        });

        // Await and log the actual JSON response
        const responseData = await response.json();
        logs.push(`GitHub handle verification response ${response.status}: ${JSON.stringify(responseData)}`);

        // Check if the user exists by looking at the status code
        if (response.status === 200) {
          logs.push(`GitHub user ${handle} found`);
          return true;
        } else {
          logs.push(`GitHub user ${handle} not found. Status: ${response.status}`);
          return false;
        }
      } catch (error) {
        logs.push(`Error while verifying GitHub handle ${handle}: ${error.message}`);
        return false;
      }
    }


    async function verifyRepo(handle: string) {
      const baseUrl = `https://api.github.com/users/${handle}/repos`;
      let page = 1;
      let repos = [];
      let hasEthBinderRepo = false;

      logs.push(`Fetching repos for handle: ${handle} from ${baseUrl}`);

      try {
        while (true) {
          const url = `${baseUrl}?per_page=100&page=${page}`;
          logs.push(`Fetching page ${page} from ${url}`);

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'YourAppName',  // GitHub API requires a user-agent
            },
          });

          logs.push(`GitHub API response status for user ${handle} on page ${page}: ${response.status}`);

          if (response.status !== 200) {
            if (response.status === 404) {
              logs.push(`GitHub user ${handle} not found (404)`);
            } else {
              logs.push(`Error: GitHub API returned status ${response.status} for user ${handle}`);
            }
            return false;
          }

          const pageRepos = await response.json();
          logs.push(`Fetched ${pageRepos.length} repositories on page ${page}`);

          repos = repos.concat(pageRepos);

          // Check if any repo is named 'ethbinder' (on the current page)
          if (pageRepos.some(repo => repo.name.toLowerCase() === 'ethbinder')) {
            logs.push(`User ${handle} has an ethbinder repository`);
            hasEthBinderRepo = true;
            break;
          }

          // If fewer than 100 repos were fetched, there are no more pages
          if (pageRepos.length < 100) {
            break;
          }

          page++;
        }

        logs.push(`User ${handle} has a total of ${repos.length} repositories`);
        logs.push(`Repositories: ${repos.map(r => r.name.toLowerCase()).join(', ')}`);

        if (!hasEthBinderRepo) {
          logs.push(`User ${handle} does not have an ethbinder repository`);
        }

        return hasEthBinderRepo;

      } catch (error) {
        logs.push(`Error while fetching repos for user ${handle}: ${error.message}`);
        return false;
      }
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

      return sendBadgeResponse(
        `issue fetch failed: ${response.statusText}`,
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
                "verified",
                true,
                { status: 200, headers: { 'Content-Type': 'application/json' } }
              );
            } else {
              logs.push('Signature verification failed.');
              return sendBadgeResponse(
                "failed",
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
    return sendBadgeResponse(
      'no issue found',
      false,
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  },
} satisfies ExportedHandler<Env>;

