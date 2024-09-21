
describe('ETHBinder Site - E2E Tests with Edge Cases', () => {
  it('should handle MetaMask connection failure gracefully', () => {
    cy.visit('/');
    cy.contains('Connect MetaMask').click();
    // Simulate MetaMask connection failure
    cy.get('.metamask-popup').should('contain', 'MetaMask connection failed');
  });

  it('should handle GitHub handle submission error', () => {
    cy.visit('/');
    cy.contains('Edit GitHub Handle').click();
    cy.get('input[placeholder="Enter GitHub Handle"]').type('invalidhandle');
    cy.contains('Submit').click();
    // Simulate GitHub API failure
    cy.get('.error-message').should('contain', 'Failed to update GitHub handle');
  });
});
