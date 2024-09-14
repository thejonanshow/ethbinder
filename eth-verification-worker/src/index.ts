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

    const badgeColor = verifySignature(githubHandle, ethAddress, signature) ? '51D06A' : 'E74C3C';
    const badgeMessage = badgeColor === '51D06A' ? 'verified' : 'failed';

    const svgBadge = generateBadge(badgeMessage, badgeColor);

    return new Response(svgBadge, {
      headers: { 'content-type': 'image/svg+xml' }
    });
  } catch (error) {
    const svgBadge = generateBadge('failed', 'E74C3C');
    return new Response(svgBadge, {
      headers: { 'content-type': 'image/svg+xml' }
    });
  }
}

function verifySignature(githubHandle: string, ethAddress: string, signature: string): boolean {
  // Signature verification logic here
  // Mocked for example
  return ethAddress === '0x123';  // Mock check
}

function generateBadge(message: string, color: string): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="20">
      <rect width="100" height="20" fill="#555"/>
      <rect x="50" width="50" height="20" fill="#${color}"/>
      <text x="25" y="14" fill="#fff" font-family="Verdana" font-size="11">eth</text>
      <text x="65" y="14" fill="#fff" font-family="Verdana" font-size="11">${message}</text>
    </svg>
  `;
}

