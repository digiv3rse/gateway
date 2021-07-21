import React from 'react';
import { Link } from '@guardian/src-link';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { ApiRoutes } from '@/shared/model/Routes';
import { SourceType } from '@/shared/model/Source';
import { button } from '@/client/styles/Shared';
import { CsrfFormField } from '../components/CsrfFormField';

type Props = {
  email?: string;
  source: SourceType;
};

const decideRoute = (source: SourceType) => {
  switch (source) {
    case 'reset':
      return ApiRoutes.RESEND_RESET_EMAIL;
    case 'magic-link':
      return ApiRoutes.RESEND_MAGIC_LINK_EMAIL;
  }
};

export const EmailSent = ({ email, source }: Props) => {
  return (
    <>
      <Header />
      <Main subTitle="Sign in">
        <PageBox>
          <PageHeader>Check your email inbox</PageHeader>
          <PageBody>
            <PageBodyText>We’ve sent an email to {email}.</PageBodyText>
            <PageBodyText>
              Please follow the instructions in this email. If you can&apos;t
              find it, it may be in your spam folder.
            </PageBodyText>
            <PageBodyText>The link is only valid for 30 minutes.</PageBodyText>
            <form method="post" action={decideRoute(source)}>
              <CsrfFormField />
              <TextInput
                label=""
                name="email"
                type="email"
                value={email}
                hidden={true}
              />
              <br />
              <br />
              <Button css={button} type="submit" data-cy="resend-email-button">
                Resend email
              </Button>
              <br />
              <br />
              <PageBodyText>
                Wrong email address?{' '}
                <Link subdued={true} href={`/${source}`}>
                  Change email address
                </Link>
              </PageBodyText>
            </form>
          </PageBody>
        </PageBox>
      </Main>
      <Footer />
    </>
  );
};
