import { recoverAddress } from '@ethersproject/transactions';
import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { arrayify } from '@ethersproject/bytes';

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request): Promise<Response> {
  const referer = request.headers.get('Referer');
  if (!referer || !referer.includes('github.com')) {
    return new Response('Request must come from a GitHub page.', { status: 400 });
  }

  const matches = referer.match(/github\.com\/([^\/]+)\//);
  if (!matches || matches.length < 2) {
    return new Response('Unable to extract GitHub handle.', { status: 400 });
  }

  const githubHandle = matches[1];
  const issueUrl = `https://api.github.com/repos/${githubHandle}/ethbinder/issues/1`;
  const response = await fetch(issueUrl, {
    headers: { 'User-Agent': 'eth-verification-worker', 'Accept': 'application/vnd.github.v3+json' }
  });

  if (!response.ok) return new Response('Unable to fetch issue from GitHub.', { status: 500 });
  const { ethAddress, signature } = JSON.parse(await response.json().body);

  const messageHash = keccak256(toUtf8Bytes(githubHandle));
  const recoveredAddress = recoverAddress(arrayify(messageHash), signature);

  const badge = recoveredAddress.toLowerCase() === ethAddress.toLowerCase()
    ? { schemaVersion: 1, label: 'eth', message: 'verified', color: '51D06A' }
    : { schemaVersion: 1, label: 'eth', message: 'failed', color: 'E74C3C' };

  return new Response(JSON.stringify(badge), { headers: { 'content-type': 'application/json' } });
}

