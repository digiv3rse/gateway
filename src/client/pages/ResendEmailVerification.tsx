import React, { useContext } from 'react';
import { SignInLayout } from '@/client/layouts/SignInLayout';
import { LinkButton, Button } from '@guardian/src-button';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { form, button, linkButton } from '@/client/styles/Shared';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { css } from '@emotion/core';
import { textSans } from '@guardian/src-foundations/typography';
import { Routes } from '@/shared/model/Routes';
import { getProviderById } from '@/shared/lib/emailProvider';
import { EmailProvider } from '@/shared/model/EmailProvider';
import { CsrfFormField } from '@/client/components/CsrfFormField';

const bold = css`
  ${textSans.medium({ lineHeight: 'regular', fontWeight: 'bold' })}
`;

const LoggedOut = ({ signInPageUrl }: { signInPageUrl?: string }) => (
  <PageBox>
    <PageHeader>Link Expired</PageHeader>
    <PageBody>
      <PageBodyText>Your email confirmation link has expired</PageBodyText>
      <PageBodyText>
        The link we sent you was valid for 30 minutes. Please sign in again and
        we will resend a verification email.
      </PageBodyText>
      <div css={form}>
        <LinkButton
          href={signInPageUrl}
          css={button}
          icon={<SvgArrowRightStraight />}
          iconSide="right"
        >
          Sign in
        </LinkButton>
      </div>
    </PageBody>
  </PageBox>
);

const LoggedIn = ({
  email,
  success,
  emailProvider,
}: {
  email: string;
  success?: string;
  emailProvider?: EmailProvider;
}) => (
  <PageBox>
    <PageHeader>Verify Email</PageHeader>
    <PageBody>
      <PageBodyText>
        You need to confirm your email address to continue securely:
      </PageBodyText>
      <PageBodyText>
        <span css={bold}>{email}</span>
      </PageBodyText>
      <PageBodyText>
        We will send you a verification link to your email to ensure that it’s
        you. Please note that the link will expire in 30 minutes.
      </PageBodyText>
      <PageBodyText>
        If you don&apos;t see it in your inbox, please check your spam filter.
      </PageBodyText>
      {success ? (
        <PageBodyText>{success}</PageBodyText>
      ) : (
        <form css={form} method="post" action={Routes.VERIFY_EMAIL}>
          <CsrfFormField />
          <input type="hidden" name="email" value={email} />
          <Button
            css={button}
            type="submit"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
          >
            Send verification link
          </Button>
        </form>
      )}
      {emailProvider && (
        <LinkButton
          css={linkButton}
          href={emailProvider.inboxLink}
          icon={<SvgArrowRightStraight />}
          iconSide="right"
          priority="tertiary"
        >
          Go to your {emailProvider.name} inbox
        </LinkButton>
      )}
    </PageBody>
  </PageBox>
);

export const ResendEmailVerificationPage = () => {
  const {
    email,
    signInPageUrl,
    success,
    emailProvider: emailProviderId,
  } = useContext<GlobalState>(GlobalStateContext);

  const emailProvider = getProviderById(emailProviderId);

  return (
    <SignInLayout>
      {email ? (
        <LoggedIn
          email={email}
          success={success}
          emailProvider={emailProvider}
        />
      ) : (
        <LoggedOut signInPageUrl={signInPageUrl} />
      )}
    </SignInLayout>
  );
};
