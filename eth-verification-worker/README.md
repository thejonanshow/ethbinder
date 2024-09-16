# Ethereum Signature Verification Worker

This Cloudflare Worker dynamically verifies an Ethereum signature from a GitHub repository issue and displays a shield indicating whether the signature is verified or failed. The worker can extract the GitHub handle from the `Referer` header or take it as a query parameter for easier testing.

## Usage

### Embed the Verification Badge

You can embed the dynamic verification shield directly into your GitHub repository's README file. The badge will update based on whether the Ethereum signature for the GitHub handle is successfully verified.

#### Example Badge

![ETHbinder Verification Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Feth-verification-worker.jonanscheffler.workers.dev%3Fhandle%3Dthejonanshow)

![ETHbinder Verification Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Feth-verification-worker.jonanscheffler.workers.dev%3Fhandle%3Ddefunkt)

Add the following code to your repository's `README.md` file to display the badge:

```markdown
![ETHbinder Verification Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Feth-verification-worker.jonanscheffler.workers.dev)
