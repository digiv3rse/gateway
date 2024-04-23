import React from 'react';
import { RegistrationErrors, SignInErrors } from '@/shared/model/Errors';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainForm } from '@/client/components/MainForm';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { EmailInput } from '@/client/components/EmailInput';
import { PasswordInput } from '@/client/components/PasswordInput';
import { css } from '@emotion/react';
import { space, textSans } from '@guardian/source-foundations';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { AuthProviderButtons } from '@/client/components/AuthProviderButtons';
import { divider } from '@/client/styles/Shared';
import { GuardianTerms, JobsTerms } from '@/client/components/Terms';
import { MainBodyText } from '@/client/components/MainBodyText';
import { InformationBox } from '@/client/components/InformationBox';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import Link from '@/client/components/Link';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';

export type SignInProps = {
	queryParams: QueryParams;
	email?: string;
	// An error to be displayed at the top of the page
	pageError?: string;
	// An error to be displayed at the top of the MainForm component
	formError?: string;
	recaptchaSiteKey: string;
	isReauthenticate?: boolean;
};

const resetPassword = css`
	${textSans.small()}
`;

const socialButtonDivider = css`
	margin-top: ${space[2]}px;
	margin-bottom: 0;
	color: var(--color-divider);
	:before,
	:after {
		content: '';
		flex: 1 1;
		border-bottom: 1px solid var(--color-divider);
		margin: 8px;
	}
`;

const getErrorContext = (error: string | undefined) => {
	if (error === SignInErrors.ACCOUNT_ALREADY_EXISTS) {
		return (
			<>
				We cannot sign you in with your social account credentials. Please enter
				your account password below to sign in.
			</>
		);
	} else if (error === RegistrationErrors.PROVISIONING_FAILURE) {
		return (
			<>
				Please try signing in with your new account. If you are still having
				trouble, please contact our customer service team at{' '}
				<a href={locations.SUPPORT_EMAIL_MAILTO}>{SUPPORT_EMAIL}</a>
			</>
		);
	}
};

const showAuthProviderButtons = (
	socialSigninBlocked: boolean,
	queryParams: QueryParams,
	isJobs: boolean,
) => {
	if (socialSigninBlocked === false) {
		return (
			<>
				<InformationBox>
					{!isJobs && <GuardianTerms />}
					{isJobs && <JobsTerms />}
				</InformationBox>
				<AuthProviderButtons queryParams={queryParams} providers={['social']} />
				<Divider
					spaceAbove="loose"
					displayText="or continue with"
					cssOverrides={socialButtonDivider}
				/>
			</>
		);
	}
};

export const SignIn = ({
	email,
	pageError,
	formError,
	queryParams,
	recaptchaSiteKey,
	isReauthenticate = false,
}: SignInProps) => {
	const formTrackingName = 'sign-in';

	// The page level error is equivalent to this enum if social signin has been blocked.
	const socialSigninBlocked = pageError === SignInErrors.ACCOUNT_ALREADY_EXISTS;

	const { clientId } = queryParams;
	const isJobs = clientId === 'jobs';

	usePageLoadOphanInteraction(formTrackingName);

	return (
		<MinimalLayout
			errorOverride={pageError}
			errorContext={getErrorContext(pageError)}
			pageHeader="Sign in"
		>
			<MainBodyText>One account to access all Guardian products.</MainBodyText>
			{/* AuthProviderButtons component with show boolean */}
			{showAuthProviderButtons(socialSigninBlocked, queryParams, isJobs)}
			<MainForm
				formErrorMessageFromParent={formError}
				formErrorContextFromParent={getErrorContext(formError)}
				formAction={buildUrlWithQueryParams(
					isReauthenticate ? '/reauthenticate' : '/signin',
					{},
					queryParams,
				)}
				submitButtonText="Sign in"
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				disableOnSubmit
				// If social signin is blocked, terms and conditions appear inside MainForm
				// instead of being handled by showAuthProviderButtons(), above.
				hasGuardianTerms={!isJobs && socialSigninBlocked}
				hasJobsTerms={isJobs && socialSigninBlocked}
			>
				<EmailInput defaultValue={email} />
				<PasswordInput label="Password" autoComplete="current-password" />
				<Link
					href={buildUrlWithQueryParams('/reset-password', {}, queryParams)}
					cssOverrides={resetPassword}
				>
					Reset password
				</Link>
			</MainForm>
			<Divider size="full" cssOverrides={divider} />
			<MainBodyText>
				Not signed in before?{' '}
				<Link href={buildUrlWithQueryParams('/register', {}, queryParams)}>
					Create a free account
				</Link>
			</MainBodyText>
		</MinimalLayout>
	);
};
