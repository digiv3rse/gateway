import { injectAndCheckAxe } from '../../../support/cypress-axe';
import { randomMailosaurEmail } from '../../../support/commands/testUser';

describe('Registration email sent page', () => {
  // This needs to remain static for now, because we can't generate a PLAY_SESSION_2 encrypted email.
  const existingWithoutPassword = {
    serverId: Cypress.env('MAILOSAUR_SERVER_ID'),
    serverDomain: Cypress.env('MAILOSAUR_SERVER_ID') + '.mailosaur.net',
    email:
      'registrationEmailSentPage@' +
      Cypress.env('MAILOSAUR_SERVER_ID') +
      '.mailosaur.net',
  };

  // PLAY_SESSION_2 encrypted email is generated by identity-frontend when you start a guest registration.
  // If the test email changes, copy this cookie from the browser to the encryptedEmail variable.
  const encryptedEmail =
    'eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7ImVtYWlsIjoicmVnaXN0cmF0aW9uRW1haWxTZW50UGFnZUAxc25zdW91bS5tYWlsb3NhdXIubmV0In0sImV4cCI6MTY0MTU2NDE3MCwibmJmIjoxNjQxNTYyMzcwLCJpYXQiOjE2NDE1NjIzNzB9.DqajlxjvqHhavmC8A8LqCs9EA9MD4VuP2hKxmNa-Ljs';

  context('A11y checks', () => {
    it('has no detectable a11y violations on the registration email sent page', () => {
      cy.setCookie('PLAY_SESSION_2', encryptedEmail, {
        log: true,
      });
      cy.visit(`/register/email-sent`);
      injectAndCheckAxe();
    });
  });

  it('should load the page with a success banner given a valid PLAY_SESSION_2 encrypted email cookie', () => {
    cy.setCookie('PLAY_SESSION_2', encryptedEmail, {
      log: true,
    });
    cy.visit(`/register/email-sent`);
    cy.contains('Check your email inbox');
    cy.contains(existingWithoutPassword.email);
    cy.contains('Resend email');
    cy.contains('Change email address');
  });

  // Depends on a Guest account already created using this email.
  it('should resend the email when the resend button is clicked given a valid PLAY_SESSION_2 encrypted email cookie', () => {
    cy.setCookie('PLAY_SESSION_2', encryptedEmail, {
      log: true,
    });

    cy.visit(`/register/email-sent`);
    cy.contains(existingWithoutPassword.email);

    const timeRequestWasMade = new Date();
    cy.contains('Resend email').click();

    cy.checkForEmailAndGetDetails(
      existingWithoutPassword.email,
      timeRequestWasMade,
      /welcome\/([^"]*)/,
    ).then(({ body, token }) => {
      expect(body).to.have.string('Complete registration');
      cy.visit(`/welcome/${token}`);
      cy.contains('Create password');
    });
  });

  it('should resend "Complete Registration" email when a new user registers which is same as initial email sent', () => {
    const unregisteredEmail = randomMailosaurEmail();

    cy.visit('/register');
    cy.get('input[name=email]').type(unregisteredEmail);
    const timeRequestWasMadeInitialEmail = new Date();
    cy.get('[data-cy="register-button"]').click();

    cy.contains('Check your email inbox');
    cy.contains(unregisteredEmail);
    cy.contains('Resend email');
    cy.contains('Change email address');

    // test and delete initial email
    cy.checkForEmailAndGetDetails(
      unregisteredEmail,
      timeRequestWasMadeInitialEmail,
    ).then(({ body }) => {
      expect(body).to.have.string('Complete registration');
    });

    const timeRequestWasMade = new Date();
    cy.contains('Resend email').click();
    cy.contains('Check your email inbox');
    cy.contains(unregisteredEmail);

    // test and delete resent email
    cy.checkForEmailAndGetDetails(unregisteredEmail, timeRequestWasMade).then(
      ({ body }) => {
        expect(body).to.have.string('Complete registration');
      },
    );
  });

  it('should resend account exists without password email when an existing user without password registers which is same as initial email sent', () => {
    cy.createTestUser({
      isUserEmailValidated: false,
      isGuestUser: true,
    })?.then(({ emailAddress }) => {
      cy.visit('/register');
      cy.get('input[name=email]').type(emailAddress);
      const timeRequestWasMadeInitialEmail = new Date();
      cy.get('[data-cy="register-button"]').click();

      cy.contains('Check your email inbox');
      cy.contains(emailAddress);
      cy.contains('Resend email');
      cy.contains('Change email address');

      // test and delete initial email
      cy.checkForEmailAndGetDetails(
        emailAddress,
        timeRequestWasMadeInitialEmail,
      ).then(({ body }) => {
        expect(body).to.have.string('This account already exists');
        expect(body).to.have.string(
          'To continue to your account please click below to create a password.',
        );
        expect(body).to.have.string('This link is only valid for 30 minutes.');
        expect(body).to.have.string('Create password');
      });

      const timeRequestWasMade = new Date();
      cy.contains('Resend email').click();
      cy.contains('Check your email inbox');
      cy.contains(emailAddress);

      // test and delete resent email
      cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
        ({ body }) => {
          expect(body).to.have.string('This account already exists');
          expect(body).to.have.string(
            'To continue to your account please click below to create a password.',
          );
          expect(body).to.have.string(
            'This link is only valid for 30 minutes.',
          );
          expect(body).to.have.string('Create password');
        },
      );
    });
  });

  it('should resend "Account Exists" email when an existing user with password registers which is same as initial email sent', () => {
    cy.createTestUser({
      isUserEmailValidated: false,
    })?.then(({ emailAddress }) => {
      cy.visit('/register');
      cy.get('input[name=email]').type(emailAddress);
      const timeRequestWasMadeInitialEmail = new Date();
      cy.get('[data-cy="register-button"]').click();

      cy.contains('Check your email inbox');
      cy.contains(emailAddress);
      cy.contains('Resend email');
      cy.contains('Change email address');

      cy.checkForEmailAndGetDetails(
        emailAddress,
        timeRequestWasMadeInitialEmail,
      ).then(({ body }) => {
        expect(body).to.have.string(
          'You are already registered with the Guardian.',
        );
      });

      const timeRequestWasMade = new Date();
      cy.contains('Resend email').click();
      cy.contains('Check your email inbox');
      cy.contains(emailAddress);

      // test and delete resent email
      cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade).then(
        ({ body }) => {
          expect(body).to.have.string(
            'You are already registered with the Guardian.',
          );
        },
      );
    });
  });

  it('should navigate back to the correct page when change email is clicked', () => {
    cy.setCookie('PLAY_SESSION_2', encryptedEmail, {
      log: true,
    });
    cy.visit(`/register/email-sent`);
    cy.contains('Change email address').click();
    cy.contains('Sign in');
    cy.title().should('eq', 'Sign in | The Guardian');
  });

  it('should render properly if the encrypted email cookie is not set', () => {
    cy.visit(`/register/email-sent`);
    cy.contains('Change email address');
    cy.contains('Check your email inbox');
  });

  it('shows reCAPTCHA errors when the request fails', () => {
    cy.createTestUser({
      isUserEmailValidated: false,
    })?.then(({ emailAddress }) => {
      cy.visit('/register');
      cy.get('input[name=email]').type(emailAddress);

      const timeRequestWasMadeInitialEmail = new Date();

      cy.get('[data-cy="register-button"]').click();

      cy.contains('Check your email inbox');
      cy.contains(emailAddress);
      cy.contains('Resend email');
      cy.contains('Change email address');

      cy.checkForEmailAndGetDetails(
        emailAddress,
        timeRequestWasMadeInitialEmail,
      );

      // Simulate going offline by failing the reCAPTCHA POST request.
      cy.intercept({
        method: 'POST',
        url: 'https://www.google.com/recaptcha/api2/**',
        times: 1,
      });
      cy.contains('Resend email').click();
      cy.contains('Google reCAPTCHA verification failed. Please try again.');

      // On second click, an expanded error is shown.
      cy.contains('Resend email').click();

      cy.contains('Google reCAPTCHA verification failed.');
      cy.contains('If the problem persists please try the following:');
      cy.contains('userhelp@');

      const timeRequestWasMade = new Date();
      cy.contains('Resend email').click();

      cy.contains(
        'Google reCAPTCHA verification failed. Please try again.',
      ).should('not.exist');

      cy.contains('Check your email inbox');
      cy.contains(emailAddress);

      cy.checkForEmailAndGetDetails(emailAddress, timeRequestWasMade);
    });
  });
});
