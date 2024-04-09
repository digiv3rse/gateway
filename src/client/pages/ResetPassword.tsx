import React, { PropsWithChildren, ReactNode, useState } from 'react';

import { MinimalLayout } from '../layouts/MinimalLayout';
import {
	belowFormMarginTopSpacingStyle,
	MainForm,
} from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { InfoSummary } from '@guardian/source-react-components-development-kitchen';
import locations from '@/shared/lib/locations';
import { ExternalLink } from '@/client/components/ExternalLink';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';

interface ResetPasswordProps {
	email?: string;
	headerText: string;
	buttonText: string;
	queryString: QueryParams;
	formActionOverride?: string;
	emailInputLabel?: string;
	showRecentEmailSummary?: boolean;
	recaptchaSiteKey?: string;
	formPageTrackingName?: string;
	formError?: string;
}

export const ResetPassword = ({
	email = '',
	headerText,
	buttonText,
	queryString,
	formActionOverride,
	emailInputLabel,
	showRecentEmailSummary,
	children,
	recaptchaSiteKey,
	formPageTrackingName,
	formError,
}: PropsWithChildren<ResetPasswordProps>) => {
	// track page/form load
	usePageLoadOphanInteraction(formPageTrackingName);

	const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
	const [recaptchaErrorContext, setRecaptchaErrorContext] =
		useState<ReactNode>(null);

	return (
		<MinimalLayout
			pageHeader={headerText}
			errorContext={recaptchaErrorContext}
			errorOverride={recaptchaErrorMessage}
		>
			{children}
			<MainForm
				formAction={
					formActionOverride
						? addQueryParamsToUntypedPath(formActionOverride, queryString)
						: buildUrlWithQueryParams('/reset-password', {}, queryString)
				}
				submitButtonText={buttonText}
				recaptchaSiteKey={recaptchaSiteKey}
				setRecaptchaErrorMessage={setRecaptchaErrorMessage}
				setRecaptchaErrorContext={setRecaptchaErrorContext}
				formTrackingName={formPageTrackingName}
				disableOnSubmit
				formErrorMessageFromParent={formError}
			>
				<EmailInput label={emailInputLabel} defaultValue={email} />
			</MainForm>
			{showRecentEmailSummary && (
				<InfoSummary
					cssOverrides={belowFormMarginTopSpacingStyle}
					message="Please make sure that you are opening the most recent email we sent."
					context={
						<>
							If you are having trouble, please contact our customer service
							team using our{' '}
							<ExternalLink href={locations.REPORT_ISSUE}>
								Help Centre
							</ExternalLink>
							.
						</>
					}
				/>
			)}
		</MinimalLayout>
	);
};
