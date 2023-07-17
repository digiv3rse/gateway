import React from 'react';
import { Meta } from '@storybook/react';

import { DetailedRecaptchaError } from './DetailedRecaptchaError';

export default {
	title: 'Components/DetailedRecaptchaError',
	component: DetailedRecaptchaError,
} as Meta;

export const Default = () => <DetailedRecaptchaError />;
Default.storyName = 'default';
