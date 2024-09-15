// This hook will generate the issue URL with the correct body
export const useGitHubIssueGenerator = () => {
  // Function to generate the issue body
  const constructIssueBody = ({ githubHandle, ethAddress, signature }) => {
    const verifiedBadge = encodeURIComponent('https://img.shields.io/badge/eth-verified-51D06A?logo=ethereum&labelColor=5177D0');
    const failedBadge = encodeURIComponent('https://img.shields.io/badge/eth-failed-E74C3C?logo=ethereum&labelColor=5177D0');

    // Construct the issue body in Markdown
    const issueBody = `
\`\`\`json
{
  "githubHandle": "thejonanshow",
  "ethAddress": "0xc70996e3e3994014148925008cad166a3e855917",
  "signature": "0xa7eb043c4ac0ae5e0239e5918aa6de59194644d734aba06538bd9703876f87e7715d9687acd98db4e3325da6843be9e99bf427c14f06986ba8dc4a8750a442741c"
}
\`\`\`

### Ethereum Signature Verification

The following **GitHub handle** has been signed and can be verified. This signature confirms the association between the GitHub handle and the provided Ethereum address.

To verify the signature, please follow the [verification steps](https://ethbinder.io/repo#verification-steps) in the README file.

You can download and run the verification script from [here](https://ethbinder.io/verifier/verify-signature.sh).

**Steps for Verification**:
1. Copy the JSON payload above.
2. Follow the instructions in the README to verify the signature.

**Note**: Only the **GitHub handle** (\`thejonanshow\`) has been signed. The Ethereum address (\`0xc70996e3e3994014148925008cad166a3e855917\`) is provided for reference.

### Verification Status

If the signature verification passes, the badge will reflect the success:

![Verified Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fimg.shields.io%2Fbadge%2Feth-verified-51D06A%3Flogo%3Dethereum%26labelColor%3D5177D0)

If the signature verification fails, the badge will be updated to show the failure:

![Failed Badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fimg.shields.io%2Fbadge%2Feth-failed-E74C3C%3Flogo%3Dethereum%26labelColor%3D5177D0)
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

