import React, {
  createRef,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { css } from '@emotion/react';
import { Button } from '@guardian/source-react-components';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { GuardianTerms, RecaptchaTerms } from '@/client/components/Terms';
import { space } from '@guardian/source-foundations';
import { buttonStyles } from '@/client/layouts/Main';
import {
  Recaptcha,
  UseRecaptchaReturnValue,
} from '@/client/lib/hooks/useRecaptcha';
import { CaptchaErrors } from '@/shared/model/Errors';
import { DetailedRecaptchaError } from './DetailedRecaptchaError';

export interface MainFormProps {
  formAction: string;
  submitButtonText: string;
  submitButtonPriority?: 'primary' | 'tertiary';
  submitButtonHalfWidth?: boolean;
  recaptchaSiteKey?: string;
  setRecaptchaErrorMessage?: (error: string) => void;
  setRecaptchaErrorContext?: (context: ReactNode | string) => void;
  hasGuardianTerms?: boolean;
  onSubmitOverride?: React.FormEventHandler<HTMLFormElement>;
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

export const inputMarginBottomSpacingStyle = css`
  margin-bottom: ${space[3]}px;
`;

export const belowFormMarginTopSpacingStyle = css`
  margin-top: ${space[6]}px;
`;

export const MainForm = ({
  children,
  formAction,
  submitButtonText,
  submitButtonPriority = 'primary',
  submitButtonHalfWidth,
  recaptchaSiteKey,
  setRecaptchaErrorMessage,
  setRecaptchaErrorContext,
  hasGuardianTerms = false,
  onSubmitOverride,
}: PropsWithChildren<MainFormProps>) => {
  const recaptchaEnabled = !!recaptchaSiteKey;
  const hasTerms = recaptchaEnabled || hasGuardianTerms;

  const registerFormRef = createRef<HTMLFormElement>();
  const [recaptchaState, setRecaptchaState] =
    useState<UseRecaptchaReturnValue>();

  /**
   * Executes the reCAPTCHA check.
   * Prevents the form from submitting until the reCAPTCHA check is complete.
   */
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (onSubmitOverride) {
        onSubmitOverride(event);
      }

      if (recaptchaEnabled && !recaptchaState?.token) {
        event.preventDefault();
        recaptchaState?.executeCaptcha();
      }
    },
    [onSubmitOverride, recaptchaEnabled, recaptchaState],
  );

  /**
   * Submits the form once the reCAPTCHA check has been successfully completed.
   */
  useEffect(() => {
    if (recaptchaEnabled) {
      const registerFormElement = registerFormRef.current;
      if (recaptchaState?.token) {
        registerFormElement?.submit();
      }
    }
  }, [
    recaptchaEnabled,
    recaptchaState,
    recaptchaState?.token,
    registerFormRef,
  ]);

  useEffect(() => {
    if (recaptchaEnabled) {
      // Determine is something went wrong with the check.
      const recaptchaCheckFailed =
        recaptchaState?.error || recaptchaState?.expired;

      // Used to show a more detailed reCAPTCHA error if
      // the user has requested a check more than once.
      const showErrorContext =
        recaptchaCheckFailed && recaptchaState?.requestCount > 1;

      // Default to generic reCAPTCHA error message.
      // Show the retry message if the user has requested a check more than once.
      const recaptchaErrorMessage = showErrorContext
        ? CaptchaErrors.RETRY
        : CaptchaErrors.GENERIC;

      const recaptchaErrorContext = showErrorContext ? (
        <DetailedRecaptchaError />
      ) : undefined;

      // Pass the error states back to the parent component if setters are provided.
      if (recaptchaCheckFailed && setRecaptchaErrorMessage) {
        setRecaptchaErrorMessage(recaptchaErrorMessage);
      }
      if (showErrorContext && setRecaptchaErrorContext) {
        setRecaptchaErrorContext(recaptchaErrorContext);
      }
    }
  }, [
    recaptchaEnabled,
    recaptchaState,
    recaptchaState?.error,
    recaptchaState?.expired,
    recaptchaState?.requestCount,
    setRecaptchaErrorContext,
    setRecaptchaErrorMessage,
  ]);

  return (
    <form
      css={formStyles}
      method="post"
      action={formAction}
      onSubmit={handleSubmit}
      ref={registerFormRef}
    >
      {recaptchaEnabled && (
        <Recaptcha
          recaptchaSiteKey={recaptchaSiteKey}
          setRecaptchaState={setRecaptchaState}
        />
      )}
      <CsrfFormField />
      <div css={inputStyles(hasTerms)}>{children}</div>
      {hasGuardianTerms && <GuardianTerms />}
      {recaptchaEnabled && <RecaptchaTerms />}
      <Button
        css={buttonStyles({ hasTerms, halfWidth: submitButtonHalfWidth })}
        type="submit"
        priority={submitButtonPriority}
        data-cy="main-form-submit-button"
      >
        {submitButtonText}
      </Button>
    </form>
  );
};
