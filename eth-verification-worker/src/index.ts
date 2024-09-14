addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  let githubHandle = url.searchParams.get('handle');

  if (!githubHandle) {
    const referer = request.headers.get('Referer');
    if (!referer || !referer.includes('github.com')) {
      return new Response('Request must come from a GitHub page or provide a handle.', { status: 400 });
    }

    const matches = referer.match(/github\.com\/([^\/]+)\//);
    if (!matches || matches.length < 2) {
      return new Response('Unable to extract GitHub handle.', { status: 400 });
    }

    githubHandle = matches[1];
  }

  try {
    const issueUrl = `https://api.github.com/repos/${githubHandle}/ethbinder/issues/1`;
    const response = await fetch(issueUrl, {
      headers: { 'User-Agent': 'eth-verification-worker', 'Accept': 'application/vnd.github.v3+json' }
    });

    if (!response.ok) return new Response('Unable to fetch issue from GitHub.', { status: 500 });
    const { ethAddress, signature } = JSON.parse(await response.json().body);

    const isVerified = verifySignature(githubHandle, ethAddress, signature);
    const message = isVerified ? 'verified' : 'failed';
    const color = isVerified ? 'brightgreen' : 'red';

    // Return JSON for Shields.io
    const badgeData = {
      schemaVersion: 1,
      label: 'eth',
      message: message,
      color: color
    };

    return new Response(JSON.stringify(badgeData), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (error) {
    const badgeData = {
      schemaVersion: 1,
      label: 'eth',
      message: 'failed',
      color: 'red'
    };
    return new Response(JSON.stringify(badgeData), {
      headers: { 'content-type': 'application/json' }
    });
  }
}

function verifySignature(githubHandle: string, ethAddress: string, signature: string): boolean {
  // Signature verification logic here (mocked for example)
  return ethAddress === '0x123';  // Mock check
}

