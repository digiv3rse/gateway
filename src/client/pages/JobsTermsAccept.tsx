import React from 'react';

import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { css } from '@emotion/react';
import { neutral, space, textSans } from '@guardian/source-foundations';
import { getAutoRow, gridItemYourData } from '../styles/Grid';
import { Link } from '@guardian/source-react-components';
import { MainForm } from '@/client/components/MainForm';
import NameInputField from '@/client/components/NameInputField';
import { useNameInputFieldError } from '@/client/lib/hooks/useNameFieldInputError';

const listBullets = css`
  list-style: none;
  padding-left: 0;
  text-indent: -${space[5]}px; /* second line indentation */
  margin-left: ${space[5]}px; /* second line indentation */
  li {
    font-size: 17px;
  }
  li:first-of-type {
    /* margin-top: 6px; */
  }
  /* ::marker is not supported in IE11 */
  li::before {
    content: '';
    margin-right: ${space[2]}px;
    margin-top: ${space[2]}px;
    background-color: ${neutral[86]};
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
`;

export const text = css`
  margin: 0;
  ${textSans.medium()}
`;

const belowFormMarginTopSpacingStyle = css`
  margin-top: ${space[4]}px;
`;

const heading = css`
  color: ${neutral[0]};
  margin: 0 0 ${space[3]}px;
  font-weight: bold;
`;

interface JobsTermsAcceptProps {
  submitUrl: string;
  firstName?: string;
  secondName?: string;
}

export const JobsTermsAccept: React.FC<JobsTermsAcceptProps> = ({
  firstName,
  secondName,
  submitUrl,
}) => {
  const autoYourDataRow = getAutoRow(1, gridItemYourData);

  const {
    nameFieldError,
    nameFieldErrorContext,
    setGroupError,
    setFormSubmitAttempted,
  } = useNameInputFieldError();

  return (
    <MainLayout
      pageHeader="Welcome to Guardian&nbsp;Jobs"
      errorOverride={nameFieldError}
      errorContext={nameFieldErrorContext}
    >
      <MainBodyText cssOverrides={heading}>
        Click &lsquo;continue&rsquo; to automatically use your existing Guardian
        account to sign in with Guardian&nbsp;Jobs.
      </MainBodyText>
      <MainBodyText>
        By activating your Guardian&nbsp;Jobs account you will receive a welcome
        email detailing the range of career-enhancing features that can be set
        up on our jobs site. These include:
      </MainBodyText>
      <ul css={[text, listBullets, autoYourDataRow()]}>
        <li>
          Creating a job alert and receiving relevant jobs straight to your
          inbox
        </li>
        <li>
          Shortlisting jobs that interest you so you can access them later on
          different devices
        </li>
        <li>Uploading your CV and let employers find you</li>
      </ul>
      <MainForm
        submitButtonText="Continue"
        hasJobsTerms={true}
        formAction={submitUrl}
        onInvalid={() => setFormSubmitAttempted(true)}
      >
        <NameInputField
          onGroupError={setGroupError}
          firstName={firstName}
          secondName={secondName}
        />
      </MainForm>
      <MainBodyText cssOverrides={belowFormMarginTopSpacingStyle}>
        Or{' '}
        <Link subdued={true} href={'/signout'}>
          sign out
        </Link>{' '}
        to browse jobs anonymously.
      </MainBodyText>
    </MainLayout>
  );
};
