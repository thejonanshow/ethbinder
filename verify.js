const { verifyMessage } = require('@ethersproject/wallet');

// Inputs from the GitHub issue
const githubHandle = "thejonanshow";
const ethAddress = "0xc70996e3e3994014148925008cad166a3e855917";
const signature = "0xa7eb043c4ac0ae5e0239e5918aa6de59194644d734aba06538bd9703876f87e7715d9687acd98db4e3325da6843be9e99bf427c14f06986ba8dc4a8750a442741c";

// Verify signature
const recoveredAddress = verifyMessage(githubHandle, signature);

if (recoveredAddress.toLowerCase() === ethAddress.toLowerCase()) {
  console.log("Signature is valid.");
  process.exit(0);
} else {
  console.log("Signature verification failed.");
  process.exit(1);
}
