import React from 'react';
import { RegistrationConsentsFormFields } from '@/shared/model/Consent';
import { RegistrationNewslettersFormFields } from '@/shared/model/Newsletter';
import { RegistrationNewsletterFormField } from '@/client/components/RegistrationNewsletterFormField';
import { GeoLocation } from '@/shared/model/Geolocation';
import { AppName } from '@/shared/lib/appNameUtils';
import { RegistrationMarketingConsentFormField } from '@/client/components/RegistrationMarketingConsentFormField';
import { ToggleSwitchList } from '@/client/components/ToggleSwitchList';

interface RegistrationConsentsProps {
	geolocation?: string;
	useIdapi?: boolean;
	noMarginBottom?: boolean;
	appName?: AppName;
}

export const RegistrationConsents = ({
	geolocation,
	useIdapi,
	appName,
}: RegistrationConsentsProps) => {
	// check if the app is Feast or not
	const isFeast = appName === 'Feast';

	// don't show the Saturday Edition newsletter option for US and AUS or if using Feast app
	const showSaturdayEdition = (() => {
		const isValidLocation = !(['US', 'AU'] satisfies GeoLocation[]).some(
			(location: GeoLocation) => location === geolocation,
		);

		return isValidLocation && !isFeast;
	})();

	// show the Feast newsletter option if the app is Feast and Saturday Edition is not shown
	const showFeast = isFeast && !showSaturdayEdition;

	// Show marketing consent if not showing Feast
	const showMarketingConsent = !showFeast;

	if (useIdapi) {
		return <></>;
	}

	return (
		<ToggleSwitchList>
			{showSaturdayEdition && (
				<RegistrationNewsletterFormField
					id={RegistrationNewslettersFormFields.saturdayEdition.id}
					title={`${RegistrationNewslettersFormFields.saturdayEdition.label} newsletter`}
					description={
						RegistrationNewslettersFormFields.saturdayEdition.context
					}
				/>
			)}
			{showFeast && (
				<RegistrationNewsletterFormField
					id={RegistrationNewslettersFormFields.feast.id}
					title={`${RegistrationNewslettersFormFields.feast.label} newsletter`}
					description={RegistrationNewslettersFormFields.feast.context}
				/>
			)}
			{showMarketingConsent && (
				<RegistrationMarketingConsentFormField
					id={RegistrationConsentsFormFields.similarGuardianProducts.id}
					description={
						RegistrationConsentsFormFields.similarGuardianProducts.label
					}
				/>
			)}
		</ToggleSwitchList>
	);
};
