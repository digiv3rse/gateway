import React, { createRef, useEffect, useRef } from 'react';
import { css } from '@emotion/react';
import { MainGrid } from '@/client/layouts/MainGrid';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { PasswordInput } from '@/client/components/PasswordInput';
import { Nav } from '@/client/components/Nav';
import { Button, Link } from '@guardian/source-react-components';

import { PageTitle } from '@/shared/model/PageTitle';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { Terms } from '@/client/components/Terms';
import { SocialButtons } from '@/client/components/SocialButtons';
import { gridItemSignInAndRegistration } from '@/client/styles/Grid';
import { from, textSans, border, space } from '@guardian/source-foundations';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { CaptchaErrors, SignInErrors } from '@/shared/model/Errors';
import { EmailInput } from '@/client/components/EmailInput';
import { buildUrl, buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { GeoLocation } from '@/shared/model/Geolocation';
import { QueryParams } from '@/shared/model/QueryParams';
import { DetailedRecaptchaError } from '@/client/components/DetailedRecaptchaError';
import useRecaptcha, {
  RecaptchaElement,
} from '@/client/lib/hooks/useRecaptcha';
import locations from '@/shared/lib/locations';

export type SignInProps = {
  returnUrl?: string;
  queryParams: QueryParams;
  email?: string;
  error?: string;
  oauthBaseUrl: string;
  geolocation?: GeoLocation;
  recaptchaSiteKey: string;
};

const passwordInput = css`
  margin-top: ${space[2]}px;

  ${from.mobileMedium} {
    margin-top: ${space[3]}px;
  }
`;

const resetPassword = css`
  ${textSans.small()}
`;

const signInButton = css`
  width: 100%;
  justify-content: center;
  margin-top: ${space[5]}px;
  ${from.mobileMedium} {
    margin-top: 16px;
  }
`;

const divider = css`
  /* Undoes the negative margin */
  margin-bottom: 0;
  margin-top: ${space[4]}px;
  ${from.mobileMedium} {
    margin-top: ${space[6]}px;
  }
  :before,
  :after {
    content: '';
    flex: 1 1;
    border-bottom: 1px solid ${border.secondary};
    margin: 8px;
  }
`;

const Links = ({ children }: { children: React.ReactNode }) => (
  <div
    css={css`
      margin-top: ${space[2]}px;
      ${from.tablet} {
        margin-top: 6px;
      }
    `}
  >
    {children}
  </div>
);

const getErrorContext = (error: string | undefined) => {
  if (error === SignInErrors.ACCOUNT_ALREADY_EXISTS) {
    return (
      <>
        We cannot sign you in with your social account credentials. Please enter
        your account password below to sign in.
      </>
    );
  }
};

const showSocialButtons = (
  error: string | undefined,
  returnUrl: string | undefined,
  oauthBaseUrl: string,
) => {
  if (error !== SignInErrors.ACCOUNT_ALREADY_EXISTS) {
    return (
      <>
        <Divider
          spaceAbove="loose"
          displayText="or continue with"
          cssOverrides={divider}
        />
        <SocialButtons returnUrl={returnUrl} oauthBaseUrl={oauthBaseUrl} />
      </>
    );
  } else {
    return (
      // force a minimum bottom margin if social buttons are not present
      <span
        css={css`
          display: inline-block;
          height: 60px;
          ${from.desktop} {
            height: ${space[24]}px;
          }
        `}
      />
    );
  }
};

// TODO: migrate to use the MainForm component
export const SignIn = ({
  returnUrl,
  email,
  error: pageLevelError,
  oauthBaseUrl,
  queryParams,
  geolocation,
  recaptchaSiteKey,
}: SignInProps) => {
  const signInFormRef = createRef<HTMLFormElement>();
  const recaptchaElementRef = useRef<HTMLDivElement>(null);
  const captchaElement = recaptchaElementRef.current ?? 'signin-recaptcha';

  const {
    token,
    error: recaptchaError,
    expired,
    requestCount,
    executeCaptcha,
  } = useRecaptcha(recaptchaSiteKey, captchaElement);

  // We want to show a more detailed reCAPTCHA error if
  // the user has requested a check more than once.
  const recaptchaCheckFailed = recaptchaError || expired;
  const showErrorContext = recaptchaCheckFailed && requestCount > 1;
  const reCaptchaErrorMessage = showErrorContext
    ? CaptchaErrors.RETRY
    : CaptchaErrors.GENERIC;
  const reCaptchaErrorContext = showErrorContext ? (
    <DetailedRecaptchaError />
  ) : undefined;

  // Form is only submitted when a valid recaptcha token is returned.
  useEffect(() => {
    const registerFormElement = signInFormRef.current;
    if (token) {
      registerFormElement?.submit();
    }
  }, [signInFormRef, token]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    executeCaptcha();
  };

  return (
    <>
      <Header geolocation={geolocation} />
      <Nav
        tabs={[
          {
            displayText: PageTitle.SIGN_IN,
            linkTo: '/signin',
            isActive: true,
          },
          {
            displayText: PageTitle.REGISTRATION,
            linkTo: '/register',
            isActive: false,
          },
        ]}
      />
      <MainGrid
        gridSpanDefinition={gridItemSignInAndRegistration}
        errorOverride={
          recaptchaCheckFailed ? reCaptchaErrorMessage : pageLevelError
        }
        errorContext={
          reCaptchaErrorContext
            ? reCaptchaErrorContext
            : getErrorContext(pageLevelError)
        }
        errorReportUrl={showErrorContext ? locations.REPORT_ISSUE : undefined}
      >
        <form
          method="post"
          action={buildUrlWithQueryParams('/signin', {}, queryParams)}
          ref={signInFormRef}
          onSubmit={handleSubmit}
        >
          <RecaptchaElement id="signin-recaptcha" />
          <CsrfFormField />
          <EmailInput defaultValue={email} />
          <div css={passwordInput}>
            <PasswordInput label="Password" />
          </div>
          <Links>
            <Link
              subdued={true}
              href={buildUrl('/reset')}
              cssOverrides={resetPassword}
            >
              Reset password
            </Link>
          </Links>
          <Terms />
          <Button css={signInButton} type="submit" data-cy="sign-in-button">
            Sign in
          </Button>
        </form>
        {showSocialButtons(pageLevelError, returnUrl, oauthBaseUrl)}
      </MainGrid>
      <Footer />
    </>
  );
};
