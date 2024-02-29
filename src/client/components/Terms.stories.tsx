import React from 'react';
import { Meta } from '@storybook/react';

import { GuardianTerms, JobsTerms, RecaptchaTerms } from './Terms';
import { InformationBox } from './InformationBox';

export default {
	title: 'Components/Terms',
	component: GuardianTerms,
} as Meta;

export const Default = () => (
	<InformationBox>
		<GuardianTerms />
		<RecaptchaTerms />
	</InformationBox>
);

Default.storyName = 'Terms';

export const Jobs = () => (
	<InformationBox>
		<JobsTerms />
		<RecaptchaTerms />
	</InformationBox>
);

Jobs.storyName = 'Jobs terms';
