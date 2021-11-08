import React from 'react';
import { Meta } from '@storybook/react';

import { ResetPassword } from './ResetPassword';
import { MainBodyText } from '../components/MainBodyText';

export default {
  title: 'Pages/ResetPassword',
  component: ResetPassword,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <ResetPassword
    headerText="Forgot password"
    buttonText="Reset password"
    showNoAccessEmail
  >
    <MainBodyText>
      Forgot your password? Enter your email address and we’ll send you a link
      to create a new one.
    </MainBodyText>
  </ResetPassword>
);
Default.story = {
  name: 'with defaults',
};

export const Email = () => (
  <ResetPassword
    email="cleo@theguardian.com"
    headerText="Forgot password"
    buttonText="Reset password"
    showNoAccessEmail
  >
    <MainBodyText>
      Forgot your password? Enter your email address and we’ll send you a link
      to create a new one.
    </MainBodyText>
  </ResetPassword>
);
Email.story = {
  name: 'with email',
};

export const LinkExpired = () => (
  <ResetPassword
    email="test@theguardian.com"
    headerText="Link expired"
    buttonText="Send me a link"
    inputLabel="Email address"
    showRecentEmailSummary
  >
    <MainBodyText>This link has expired.</MainBodyText>
    <MainBodyText>
      Please enter your email address below and we will send you a new link.
    </MainBodyText>
  </ResetPassword>
);
LinkExpired.story = {
  name: 'link expired copy',
};

export const SessionExpired = () => (
  <ResetPassword
    email="test@theguardian.com"
    headerText="Session timed out"
    buttonText="Send me a link"
    inputLabel="Email address"
  >
    <MainBodyText>
      The link we sent you was valid for 30 minutes and it has now expired.
    </MainBodyText>
    <MainBodyText>
      Please enter your email address below and we will send you a new link.
    </MainBodyText>
  </ResetPassword>
);
SessionExpired.story = {
  name: 'session expired/timed out copy',
};
