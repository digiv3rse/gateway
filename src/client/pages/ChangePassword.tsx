import React, { useEffect, useState } from 'react';
import { Button } from '@guardian/src-button';
import {
  SvgCross,
  SvgAlertTriangle,
  SvgTickRound,
  SvgArrowRightStraight,
} from '@guardian/src-icons';
import { palette } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { button, form } from '@/client/styles/Shared';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { space } from '@guardian/src-foundations';
import { css } from '@emotion/react';

import sha1 from 'js-sha1';
import { PasswordInput } from '@/client/components/PasswordInput';
import { FieldError } from '@/shared/model/ClientState';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { FontWeight } from '@guardian/src-foundations/dist/types/typography/types';

type ChangePasswordProps = {
  submitUrl: string;
  email: string;
  fieldErrors: FieldError[];
};

enum Validation {
  SUCCESS,
  FAILURE,
  ERROR,
}

const ValidationSymbol = ({ result }: { result: Validation }) => {
  const baseStyles = css`
    display: inline-block;
    position: relative;
    top: 3px;
    svg {
      width: 16px;
      height: 16px;
    }
  `;

  const successStyles = css`
    svg {
      fill: ${palette.success['400']};
      height: 30px;
      width: 30px;
      margin-bottom: -6px;
    }
  `;

  const errorStyles = css`
    svg {
      fill: ${palette.error['400']};
      height: 30px;
      width: 30px;
      margin-bottom: -6px;
    }
  `;

  const failureStyles = css`
    svg {
      color: ${palette.neutral['7']};
    }
  `;

  switch (result) {
    case Validation.SUCCESS: {
      return (
        <div css={[baseStyles, successStyles]}>
          <SvgTickRound />
        </div>
      );
    }
    case Validation.ERROR: {
      return (
        <div css={[baseStyles, errorStyles]}>
          <SvgAlertTriangle />
        </div>
      );
    }
    case Validation.FAILURE:
    default: {
      return (
        <div css={[baseStyles, failureStyles]}>
          <SvgCross />
        </div>
      );
    }
  }
};

const baseMessageStyles = css`
  ${textSans.small()}
  margin-bottom: 4px;
  margin-left: 3px;
  display: inline-block;
`;

const TooLong = () => {
  return (
    <div>
      <ValidationSymbol result={Validation.FAILURE} />
      <div
        css={[
          baseMessageStyles,
          css`
            color: ${palette.neutral['7']};
          `,
        ]}
      >
        {ChangePasswordErrors.MAXIMUM_72_SHORT}
      </div>
    </div>
  );
};

const TooShort = () => {
  return (
    <div>
      <ValidationSymbol result={Validation.FAILURE} />
      <div
        css={[
          baseMessageStyles,
          css`
            color: ${palette.neutral['7']};
          `,
        ]}
      >
        {ChangePasswordErrors.AT_LEAST_8_SHORT}
      </div>
    </div>
  );
};

const Valid = () => {
  return (
    <div>
      <ValidationSymbol result={Validation.SUCCESS} />
      <div
        css={css`
          ${textSans.small({ fontWeight: 'bold' })}
          margin-bottom: 4px;
          margin-left: 3px;
          display: inline-block;
          color: ${palette.success['400']};
        `}
      >
        Valid password
      </div>
    </div>
  );
};

const Checking = () => {
  return (
    <div>
      <div
        css={css`
          ${textSans.small()}
          margin-top: 8px;
          margin-bottom: 3px;
          margin-left: 3px;
          display: inline-block;
          color: ${palette.neutral['7']};
        `}
      >
        Checking...
      </div>
    </div>
  );
};

const Weak = () => {
  const smallFont = css`
    ${textSans.small()}
    color: ${palette.neutral['7']};
  `;

  const redText = css`
    color: ${palette.error['400']};
    font-weight: bold;
  `;

  return (
    <div css={smallFont}>
      <ValidationSymbol result={Validation.ERROR} />
      <span css={redText}>Weak password:</span>{' '}
      {ChangePasswordErrors.COMMON_PASSWORD_SHORT}
    </div>
  );
};

const ValidationMessage = ({
  isWeak,
  isTooShort,
  isTooLong,
  isChecking,
}: {
  isWeak: boolean;
  isTooShort: boolean;
  isTooLong: boolean;
  isChecking: boolean;
}) => {
  if (isTooShort) {
    return <TooShort />;
  } else if (isTooLong) {
    return <TooLong />;
  } else if (isWeak) {
    return <Weak />;
  } else if (isChecking) {
    return <Checking />;
  } else {
    return <Valid />;
  }
};

const isBreached = AwesomeDebouncePromise(
  (password: string): Promise<boolean> => {
    const hashedPassword = sha1(password);
    const firstFive = hashedPassword.substr(0, 5);
    const remainingHash = hashedPassword.substr(5, hashedPassword.length);
    return fetch(`https://api.pwnedpasswords.com/range/${firstFive}`)
      .then((r) =>
        r.text().then((results) => {
          if (results.includes(remainingHash.toUpperCase())) {
            return true;
          } else {
            return false;
          }
        }),
      )
      .catch(() => {
        return false;
      });
  },
  300,
);

export const ChangePassword = ({
  submitUrl,
  email,
  fieldErrors,
}: ChangePasswordProps) => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | undefined>(
    fieldErrors.find((fieldError) => fieldError.field === 'password')?.message,
  );
  const [isWeak, setIsWeak] = useState<boolean>(false);
  const [isTooShort, setIsTooShort] = useState<boolean>(true);
  const [isTooLong, setIsTooLong] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    // Typing anything clears the big red error, falling back to the dynamic validation message
    if (password.length > 0) setError(undefined);
    setIsTooShort(password.length < 8);
    setIsTooLong(password.length > 72);

    if (password.length >= 8 && password.length <= 72) {
      // Only make api calls to check if breached when length rules are not broken
      setIsChecking(true);
      isBreached(password)
        .then((breached) => {
          if (breached) {
            // Password is breached ❌
            setIsWeak(true);
          } else {
            // Password is valid ✔
            setIsWeak(false);
          }
        })
        .finally(() => setIsChecking(false));
    } else {
      // Password is not an acceptable length ❌
      setIsWeak(false);
    }
  }, [password]);

  return (
    <>
      <Header />
      <Main subTitle="Sign in">
        <PageBox>
          <PageHeader>Set Password</PageHeader>
          <PageBody>
            <PageBodyText>
              Please enter your new password for {email}
            </PageBodyText>
            <form
              css={form}
              method="post"
              action={submitUrl}
              onSubmit={(e) => {
                if (isTooShort) {
                  setError(ChangePasswordErrors.AT_LEAST_8);
                  e.preventDefault();
                } else if (isTooLong) {
                  setError(ChangePasswordErrors.MAXIMUM_72);
                  e.preventDefault();
                } else if (isWeak) {
                  setError(ChangePasswordErrors.COMMON_PASSWORD);
                  e.preventDefault();
                }
              }}
            >
              <CsrfFormField />

              <PasswordInput
                label="New Password"
                name="password"
                error={error}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                supporting="Must be between 8 and 72 characters"
              />

              {!error && (
                <div
                  css={css`
                    margin-bottom: ${space[9]}px;
                  `}
                >
                  <ValidationMessage
                    isWeak={isWeak}
                    isTooShort={isTooShort}
                    isTooLong={isTooLong}
                    isChecking={isChecking}
                  />
                </div>
              )}

              <Button
                css={button}
                type="submit"
                icon={<SvgArrowRightStraight />}
                iconSide="right"
              >
                Save Password
              </Button>
            </form>
          </PageBody>
        </PageBox>
      </Main>
      <Footer />
    </>
  );
};
