import { Meta } from '@storybook/react';
import React from 'react';

import MinimalHeader from '@/client/components/MinimalHeader';

export default {
	title: 'Components/MinimalHeader',
	component: MinimalHeader,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Desktop = () => <MinimalHeader />;
Desktop.storyName = 'desktop';
Desktop.parameters = {
	viewport: {
		defaultViewport: 'DESKTOP',
	},
};

export const Tablet = () => <MinimalHeader />;
Tablet.storyName = 'tablet';
Tablet.parameters = {
	viewport: {
		defaultViewport: 'TABLET',
	},
};

export const Mobile = () => <MinimalHeader />;
Mobile.storyName = 'mobile';
Mobile.parameters = {
	viewport: {
		defaultViewport: 'MOBILE',
	},
};

export const IsJobs = () => <MinimalHeader isJobs={true} />;
IsJobs.storyName = 'with isJobs=true';
