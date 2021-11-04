import React, { PropsWithChildren } from 'react';
import { css } from '@emotion/react';
import { Button } from '@guardian/src-button';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { GuardianTerms, RecaptchaTerms } from '@/client/components/Terms';
import { space } from '@guardian/src-foundations';

interface Props {
  formAction: string;
  submitButtonText: string;
  submitButtonPriority?: 'primary' | 'tertiary';
  submitButtonHalfWidth?: boolean;
  useRecaptcha?: boolean; // to fully implement
  hasGuardianTerms?: boolean;
}

const formStyles = css`
  margin-top: 16px;
`;

const inputStyles = (hasTerms = false) => css`
  ${hasTerms &&
  css`
    margin-bottom: ${space[2]}px;
  `}
`;

const submitButtonStyles = ({ hasTerms = false, halfWidth = false }) => css`
  margin-top: 22px;
  justify-content: center;

  ${halfWidth
    ? css`
        width: 50%;
      `
    : css`
        width: 100%;
      `}

  ${hasTerms &&
  css`
    margin-top: 16px;
  `}
`;

export const inputMarginBottomSpacingStyle = css`
  margin-bottom: ${space[3]}px;
`;

export const MainForm = ({
  children,
  formAction,
  submitButtonText,
  submitButtonPriority = 'primary',
  submitButtonHalfWidth,
  useRecaptcha,
  hasGuardianTerms,
}: PropsWithChildren<Props>) => {
  const hasTerms = !!(useRecaptcha || hasGuardianTerms);

  return (
    <form css={formStyles} method="post" action={formAction}>
      <CsrfFormField />
      <div css={inputStyles(hasTerms)}>{children}</div>
      {hasGuardianTerms && <GuardianTerms />}
      {useRecaptcha && <RecaptchaTerms />}
      <Button
        css={submitButtonStyles({ hasTerms, halfWidth: submitButtonHalfWidth })}
        type="submit"
        priority={submitButtonPriority}
      >
        {submitButtonText}
      </Button>
    </form>
  );
};
