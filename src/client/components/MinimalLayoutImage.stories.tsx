import { Meta } from '@storybook/react';
import React from 'react';

import { MinimalLayoutImage } from '@/client/components/MinimalLayoutImage';

export default {
	title: 'Components/MinimalLayoutImage',
	component: MinimalLayoutImage,
} as Meta;

export const Email = () => <MinimalLayoutImage id="email" />;

export const Welcome = () => <MinimalLayoutImage id="welcome" />;
