import React, { ReactNode, useState } from 'react';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
	belowFormMarginTopSpacingStyle,
	MainForm,
} from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { ExternalLink } from '@/client/components/ExternalLink';
import { buildUrl } from '@/shared/lib/routeUtils';
import locations from '@/shared/lib/locations';

type Props = {
	email?: string;
	recaptchaSiteKey?: string;
	formError?: string;
};

export const MagicLink = ({ email, recaptchaSiteKey, formError }: Props) => {
	const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
	const [recaptchaErrorContext, setRecaptchaErrorContext] =
		useState<ReactNode>(null);
	return (
		<MainLayout
			pageHeader="Link to sign in"
			errorOverride={recaptchaErrorMessage}
			errorContext={recaptchaErrorContext}
		>
			<MainBodyText>
				We can email you a one time link to sign into your account
			</MainBodyText>
			<MainForm
				formAction={buildUrl('/magic-link')}
				submitButtonText="Email me a link"
				recaptchaSiteKey={recaptchaSiteKey}
				setRecaptchaErrorContext={setRecaptchaErrorContext}
				setRecaptchaErrorMessage={setRecaptchaErrorMessage}
				formErrorMessageFromParent={formError}
			>
				<EmailInput defaultValue={email} />
			</MainForm>
			<MainBodyText cssOverrides={belowFormMarginTopSpacingStyle}>
				If you no longer have access to this email account please{' '}
				<ExternalLink href={locations.REPORT_ISSUE}>
					contact our help department
				</ExternalLink>
			</MainBodyText>
		</MainLayout>
	);
};
