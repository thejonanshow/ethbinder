#!/bin/bash

# Function to prompt for the GitHub handle if not provided
prompt_github_handle() {
  read -p "Enter GitHub handle: " GITHUB_HANDLE
}

# Ensure required dependencies are installed
if ! command -v node &> /dev/null; then
  echo "Node.js is required to run this script. Please install Node.js and try again."
  exit 1
fi

# Parameters: If no GitHub handle is provided, prompt for it
GITHUB_HANDLE=$1
if [ -z "$GITHUB_HANDLE" ]; then
  prompt_github_handle
fi

# Define the repo and issue URL
ISSUE_URL="https://api.github.com/repos/${GITHUB_HANDLE}/ethbinder/issues?state=open"

# Fetch the issue from the GitHub repo
response=$(curl -s $ISSUE_URL)

# Check if the issue exists
if [[ $response == *"API rate limit exceeded"* ]]; then
  echo "GitHub API rate limit exceeded. Please try again later."
  exit 1
fi

if [[ $response == "[]" ]]; then
  echo "No open issues found for this GitHub handle. Make sure the issue exists."
  exit 1
fi

# Extract the body of the first issue, assuming it's the verification issue
issue_body=$(echo $response | jq -r '.[0].body')

# Parse the GitHub handle, Ethereum address, and signature from the issue
github_handle=$(echo $issue_body | jq -r '.githubHandle')
eth_address=$(echo $issue_body | jq -r '.ethAddress')
signature=$(echo $issue_body | jq -r '.signature')

# Verify all necessary fields are present
if [ -z "$github_handle" ] || [ -z "$eth_address" ] || [ -z "$signature" ]; then
  echo "Failed to extract the necessary data (GitHub handle, Ethereum address, or signature) from the issue."
  exit 1
fi

# Create the Node.js verification script
verify_signature() {
  cat <<EOF > verify.js
const { verifyMessage } = require('@ethersproject/wallet');

// Inputs from the GitHub issue
const githubHandle = "$github_handle";
const ethAddress = "$eth_address";
const signature = "$signature";

// Verify signature
const recoveredAddress = verifyMessage(githubHandle, signature);

if (recoveredAddress.toLowerCase() === ethAddress.toLowerCase()) {
  console.log("Signature is valid.");
  process.exit(0);
} else {
  console.log("Signature verification failed.");
  process.exit(1);
}
EOF

  # Run the verification script
  node verify.js
}

# Run the verification
verify_signature

