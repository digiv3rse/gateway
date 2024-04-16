import { Meta } from '@storybook/react';
import React from 'react';

import Link from '@/client/components/Link';

export default {
	title: 'Components/Link',
	component: Link,
} as Meta;

export const Default = () => <Link>Click me!</Link>;
Default.storyName = 'default';
