#!/bin/bash

# Function to prompt for the GitHub handle if not provided
prompt_github_handle() {
  read -p "Enter GitHub handle: " GITHUB_HANDLE
}

# Parameters: If no GitHub handle is provided, prompt for it
GITHUB_HANDLE=$1
if [ -z "$GITHUB_HANDLE" ]; then
  prompt_github_handle
fi

# Define the Cloudflare Worker URL
WORKER_URL="https://eth-verification-worker.jonanscheffler.workers.dev"

# Call the Cloudflare Worker to verify the signature
echo "Calling Cloudflare Worker with GitHub handle: $GITHUB_HANDLE"
response=$(curl -s "$WORKER_URL?handle=$GITHUB_HANDLE")

# Log the entire response for debugging
echo "Worker response: $response"

# Parse the response for status
status=$(echo "$response" | grep -o '"status":"[^"]*' | grep -o '[^"]*$')

# Output the status
if [ "$status" == "verified" ]; then
  echo "Signature is valid."
  exit 0
else
  echo "Signature verification failed."
  exit 1
fi

