
#!/bin/bash
# This script ensures Stryker can run in Yarn Workspaces
# You can call this script from each package folder, e.g., ./scripts/stryker-helper.sh

# Set Yarn binary path to ensure proper execution within workspaces
export PATH=$(yarn bin):$PATH

# Run Stryker in the current workspace context
stryker run stryker.conf.json
