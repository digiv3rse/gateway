import React from 'react';
import { MinimalLayout, MinimalLayoutProps } from './MinimalLayout';
import {
	InformationBox,
	InformationBoxText,
} from '../components/InformationBox';

export default {
	title: 'Layout/Minimal',
	component: MinimalLayout,
	parameters: { layout: 'fullscreen' },
};

export const Default = (args: MinimalLayoutProps) => (
	<MinimalLayout {...args} />
);

Default.args = {
	pageHeader: 'A heading',
	pageSubText: "This is subtext. You might not get it, it's pretty subtle.",
};

export const WithInfoBox = (args: MinimalLayoutProps) => (
	<MinimalLayout {...args}>
		<InformationBox>
			<InformationBoxText>This text is here to inform you.</InformationBoxText>
			<InformationBoxText>Consider yourself informed.</InformationBoxText>
		</InformationBox>
	</MinimalLayout>
);
WithInfoBox.storyName = 'with info box';

WithInfoBox.args = {
	pageHeader: 'A heading',
	pageSubText: "This is subtext. You might not get it, it's pretty subtle.",
};

export const WithErrorMessage = (args: MinimalLayoutProps) => (
	<MinimalLayout
		{...args}
		errorOverride="An error occurred"
		errorContext="Some additional context."
	/>
);

WithErrorMessage.args = {
	pageHeader: 'A heading',
	pageSubText: "This is subtext. You might not get it, it's pretty subtle.",
};

export const WithSuccessMessage = (args: MinimalLayoutProps) => (
	<MinimalLayout {...args} successOverride="Success!" />
);

WithSuccessMessage.args = {
	pageHeader: 'A heading',
	pageSubText: "This is subtext. You might not get it, it's pretty subtle.",
};
