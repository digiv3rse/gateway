import React from 'react';
import { PasswordForm } from '@/client/components/PasswordForm';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { FieldError } from '@/shared/model/ClientState';

type Props = {
  submitUrl: string;
  email: string;
  fieldErrors: FieldError[];
};

export const Welcome = ({ submitUrl, email, fieldErrors }: Props) => {
  return (
    <>
      <Header />
      <Main subTitle="Welcome">
        <PageBox>
          <PageHeader>Welcome</PageHeader>
          <PageBody>
            <PageBodyText>
              Please enter your new password for {email}
            </PageBodyText>
            <PasswordForm submitUrl={submitUrl} fieldErrors={fieldErrors} />
          </PageBody>
        </PageBox>
      </Main>
      <Footer />
    </>
  );
};
