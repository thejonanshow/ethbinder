import { OnUserInputHandler } from '@metamask/snaps-types';

/**
 * The Snap's user input handler.
 */
export const onUserInput: OnUserInputHandler = async ({ userInput, interfaceId }) => {
  try {
    console.log('User input received:', userInput);

    if (userInput === 'confirm') {
      console.log('User confirmed GitHub handle.');
      // Handle confirmation logic, e.g., signing the handle, returning the result
      // Add logic to sign the handle and return a response
    } else if (userInput === 'edit') {
      console.log('User wants to edit the GitHub handle.');
      // Handle edit logic, e.g., showing a prompt to input a new handle
      // Add logic to show a new input prompt and update the handle
    }

    return { status: 'success' };
  } catch (error: any) {
    console.error('Error during user input handling:', error);
    throw new Error(`Failed to handle user input for action \${userInput}: \${error.message}`);
  }
};

