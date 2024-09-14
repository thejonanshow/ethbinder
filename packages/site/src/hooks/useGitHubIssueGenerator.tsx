// This hook will generate the issue URL with the correct body
export const useGitHubIssueGenerator = () => {
  // Function to generate the issue body
  const constructIssueBody = ({ githubHandle, ethAddress, signature }) => {
    const verifiedBadge = encodeURIComponent('https://img.shields.io/badge/eth-verified-51D06A?logo=ethereum&labelColor=5177D0');
    const failedBadge = encodeURIComponent('https://img.shields.io/badge/eth-failed-E74C3C?logo=ethereum&labelColor=5177D0');

    // Construct the issue body in Markdown
    const issueBody = `
### Ethereum Signature Verification

The following **GitHub handle** has been signed and can be verified. This signature confirms the association between the GitHub handle and the provided Ethereum address.

To verify the signature, please follow the [verification steps](https://ethbinder.io/repo#verification-steps) in the README file.

\`\`\`json
{
  "githubHandle": "${githubHandle}",
  "ethAddress": "${ethAddress}",
  "signature": "${signature}"
}
\`\`\`

You can download and run the verification script from [here](https://ethbinder.io/verifier/verify-signature.sh).

**Steps for Verification**:
1. Copy the JSON payload above.
2. Follow the instructions in the README to verify the signature.

**Note**: Only the **GitHub handle** (${githubHandle}) has been signed. The Ethereum address (${ethAddress}) is provided for reference.

### Verification Status

If the signature verification passes, the badge will reflect the success:

![Verified Badge](https://img.shields.io/endpoint?url=${verifiedBadge})

If the signature verification fails, the badge will be updated to show the failure:

![Failed Badge](https://img.shields.io/endpoint?url=${failedBadge})
    `;

    return issueBody;
  };

  // Function to generate the complete issue creation URL
  const generateIssueUrl = (githubHandle, ethAddress, signature) => {
    const issueBody = constructIssueBody({ githubHandle, ethAddress, signature });
    const encodedBody = encodeURIComponent(issueBody);

    // Generate the GitHub issue creation URL
    const repo = 'ethbinder'; // The forked repo
    const issueUrl = `https://github.com/${githubHandle}/${repo}/issues/new?title=Ethereum%20Signature%20Verification&body=${encodedBody}`;

    return issueUrl;
  };

  return { generateIssueUrl };
};

