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
    if (debug) { logs.push(`Debug is set to: ${debug}`); }
    if (debug) { logs.push(`Repo is set to: ${repo}`); }

    // Attempt to extract the GitHub handle from the referrer
    const setGitHubHandle = () => {
      const referrer = request.headers.get('Referer');
      if (debug) { logs.push(`Referrer: ${referrer}`); }

      if (referrer) {
        const referrerUrl = new URL(referrer);
        const referrerPath = referrerUrl.pathname;

        const pathParts = referrerPath.split('/');
        if (debug) { logs.push(`Referrer path parts: ${pathParts.join('/')}`); }

        if (pathParts.length >= 2 && pathParts[1]) {
          if (debug) { logs.push(`GitHub handle found from referrer: ${pathParts[1]}`); }
          return pathParts[1]; // GitHub handle should be in the second part of the path
        } else {
          if (debug) { logs.push('GitHub handle could not be extracted from referrer'); }
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
        style: 'flat',
        cacheSeconds: 300 // Undocumented min for badges.io per https://github.com/badges/shields/issues/6310
      };
    }

    const sendBadgeResponse = (message: string, success: Boolean, options: Object) => {
      const badgeData = buildBadge(message, success, options);
      const respData = debug ? { ...badgeData, logs } : { ...badgeData }
      options.status = 200;
      options.headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',  // Prevent caching
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString()
      }
      return new Response(JSON.stringify(respData), options)
    }

    const githubHandle = url.searchParams.get('handle') || setGitHubHandle();
    if (debug) { logs.push(`GitHub handle: ${githubHandle}`); }

    if (!githubHandle || !repo) {
      if (debug) { logs.push('Missing handle or repo query parameters'); }
      return sendBadgeResponse(
        "missing handle",
        false,
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const validHandle = githubHandle ? await verifyGitHubHandle(githubHandle) : false;
    if (validHandle) {
      if (debug) { logs.push(`Handle is valid, validHandle: ${JSON.stringify(validHandle)}, handle: ${githubHandle}`); }
    } else {
      return sendBadgeResponse(
        `invalid handle: ${githubHandle}`,
        false,
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    if (validHandle) {
      const validRepo = await verifyRepo(githubHandle);
        if (debug) { logs.push(`verifyRepo result: ${JSON.stringify(validRepo)}`); }

      if (validRepo === true) {
        if (debug) { logs.push(`User has an ethbinder repo: ${githubHandle}`); }
      } else {
        if (debug) { logs.push(`User ${githubHandle} does not have an ethbinder repo`); }
        return sendBadgeResponse(
          `missing repo ethbinder`,
          false,
          { status: 500, headers: { 'Content-Type': 'application/json' }}
        );
      }
    }

    const githubToken = env.GITHUB_API_KEY;
    if (debug) { logs.push(`GitHub token presence: ${!!githubToken}`); }

    if (!githubToken) {
      if (debug) { logs.push('GitHub token is not set'); }
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
        if (debug) { logs.push(`GitHub handle verification response ${response.status}: ${JSON.stringify(responseData)}`); }

        // Check if the user exists by looking at the status code
        if (response.status === 200) {
          if (debug) { logs.push(`GitHub user ${handle} found`); }
          return true;
        } else {
          if (debug) { logs.push(`GitHub user ${handle} not found. Status: ${response.status}`); }
          return false;
        }
      } catch (error) {
        if (debug) { logs.push(`Error while verifying GitHub handle ${handle}: ${error.message}`); }
        return false;
      }
    }


    async function verifyRepo(handle: string) {
      const baseUrl = `https://api.github.com/users/${handle}/repos`;
      let page = 1;
      let repos = [];
      let hasEthBinderRepo = false;

      if (debug) { logs.push(`Fetching repos for handle: ${handle} from ${baseUrl}`); }

      try {
        while (true) {
          const url = `${baseUrl}?per_page=100&page=${page}`;
          if (debug) { logs.push(`Fetching page ${page} from ${url}`); }

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'YourAppName',  // GitHub API requires a user-agent
            },
          });

          if (debug) { logs.push(`GitHub API response status for user ${handle} on page ${page}: ${response.status}`); }

          if (response.status !== 200) {
            if (response.status === 404) {
              if (debug) { logs.push(`GitHub user ${handle} not found (404)`); }
            } else {
              if (debug) { logs.push(`Error: GitHub API returned status ${response.status} for user ${handle}`); }
            }
            return false;
          }

          const pageRepos = await response.json();
          if (debug) { logs.push(`Fetched ${pageRepos.length} repositories on page ${page}`); }

          repos = repos.concat(pageRepos);

          // Check if any repo is named 'ethbinder' (on the current page)
          if (pageRepos.some(repo => repo.name.toLowerCase() === 'ethbinder')) {
            if (debug) { logs.push(`User ${handle} has an ethbinder repository`); }
            hasEthBinderRepo = true;
            break;
          }

          // If fewer than 100 repos were fetched, there are no more pages
          if (pageRepos.length < 100) {
            break;
          }

          page++;
        }

        if (debug) { logs.push(`User ${handle} has a total of ${repos.length} repositories`); }
        if (debug) { logs.push(`Repositories: ${repos.map(r => r.name.toLowerCase()).join(', ')}`); }

        if (!hasEthBinderRepo) {
          if (debug) { logs.push(`User ${handle} does not have an ethbinder repository`); }
        }

        return hasEthBinderRepo;

      } catch (error) {
        if (debug) { logs.push(`Error while fetching repos for user ${handle}: ${error.message}`); }
        return false;
      }
    }


    // Fetch issues from GitHub repo
    if (debug) { logs.push(`Fetching issues from GitHub for repo: ${githubHandle}/${repo}`); }
    const response = await fetch(`https://api.github.com/repos/${githubHandle}/${repo}/issues`, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'eth-verification-worker'

      }
    });

    if (debug) { logs.push(`GitHub API response status: ${response.status}`); }
    if (!response.ok) {
      const errorText = await response.text();
      if (debug) { logs.push(`Failed to fetch issues from GitHub: ${response.statusText} (${response.status})`); }
      if (debug) { logs.push(`Error body: ${errorText}`); }

      return sendBadgeResponse(
        `issue fetch failed: ${response.statusText}`,
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const issues = await response.json();
    if (debug) { logs.push(`Fetched ${issues.length} issues from ${githubHandle}/${repo}`); }

    // Search for an issue containing the required JSON payload
    let validIssue;
    for (const issue of issues) {
      if (debug) { logs.push(`Checking issue: ${issue.title}`); }

      const jsonMatch = issue.body?.match(/```json\s+([\s\S]+?)```/);
      if (jsonMatch) {
        try {
          if (debug) { logs.push(`Found JSON in issue: ${issue.title}`); }
          const parsedPayload = JSON.parse(jsonMatch[1]);

          if (parsedPayload.githubHandle && parsedPayload.ethAddress && parsedPayload.signature) {
            if (debug) { logs.push(`Valid payload found in issue: ${issue.title}`); }

            // Validate signature
            const message = parsedPayload.githubHandle; // Assuming handle is signed
            const signature = parsedPayload.signature;
            const address = parsedPayload.ethAddress;

            if (debug) { logs.push(`Verifying signature for handle: ${message}`); }
            const recoveredAddress = verifyMessage(message, signature);

            if (debug) { logs.push(`Recovered address: ${recoveredAddress}`); }
            if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
              if (debug) { logs.push('Signature verified successfully.'); }
              return sendBadgeResponse(
                "verified",
                true,
                { status: 200, headers: { 'Content-Type': 'application/json' } }
              );
            } else {
              if (debug) { logs.push('Signature verification failed.'); }
              return sendBadgeResponse(
                "failed",
                false,
                { status: 400, headers: { 'Content-Type': 'application/json' } }
              );
            }
          } else {
            if (debug) { logs.push('Required fields missing in JSON payload.'); }
          }
        } catch (err) {
          if (debug) { logs.push(`Error parsing issue body: ${err.message}`); }
        }
      } else {
        if (debug) { logs.push(`No valid JSON found in issue: ${issue.title}`); }
      }
    }

    if (debug) { logs.push("No valid issue found with signature verification."); }
    return sendBadgeResponse(
      'no issue found',
      false,
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  },
} satisfies ExportedHandler<Env>;

