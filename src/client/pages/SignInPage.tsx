import React from 'react';
import { SignIn } from '@/client/pages/SignIn';
import useClientState from '@/client/lib/hooks/useClientState';
import { useRemoveEncryptedEmailParam } from '@/client/lib/hooks/useRemoveEncryptedEmailParam';

interface Props {
  isReauthenticate?: boolean;
}

export const SignInPage = ({ isReauthenticate = false }: Props) => {
  const clientState = useClientState();
  const {
    pageData = {},
    globalMessage = {},
    queryParams,
    recaptchaConfig,
  } = clientState;
  const { email } = pageData;
  const { error } = globalMessage;
  const { recaptchaSiteKey } = recaptchaConfig;

  // we use the encryptedEmail parameter to pre-fill the email field, but then want to remove it from the url
  useRemoveEncryptedEmailParam();
  return (
    <SignIn
      email={email}
      error={error}
      queryParams={queryParams}
      recaptchaSiteKey={recaptchaSiteKey}
      isReauthenticate={isReauthenticate}
    />
  );
};
