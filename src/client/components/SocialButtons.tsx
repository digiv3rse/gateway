import React from 'react';
import { css } from '@emotion/react';
import { space, brand, from } from '@guardian/source-foundations';
import {
	LinkButton,
	SvgGoogleBrand,
	SvgAppleBrand,
} from '@guardian/source-react-components';
import { QueryParams } from '@/shared/model/QueryParams';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { IsNativeApp } from '@/shared/model/ClientState';

type SocialButtonContext = 'Sign in' | 'Sign up';

type SocialButtonsProps = {
	context: SocialButtonContext;
	queryParams: QueryParams;
	marginTop?: boolean;
	isNativeApp?: IsNativeApp;
};

type SocialButtonProps = {
	label: string;
	icon: React.ReactElement;
	socialProvider: string;
	context: SocialButtonContext;
	queryParams: QueryParams;
	isNativeApp?: IsNativeApp;
};

const containerStyles = (marginTop = false) => css`
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: ${space[3]}px;
	margin-top: ${marginTop ? space[5] : 0}px;
	${from.mobileMedium} {
		margin-top: ${marginTop ? space[6] : 0}px;
	}
	width: 100%;
`;

const buttonOverrides = css`
	border-color: ${brand[400]};
	justify-content: center;
	${from.tablet} {
		min-width: 145px;
		flex-grow: 1;
	}
`;

// TODO: If the issue below is fixed and a new version of Source published with that fix in it, then
// you should remove this iconOverrides css
// https://github.com/guardian/source/issues/835
const iconOverrides = css`
	svg {
		margin-top: 3px;
	}
`;

const SocialButton = ({
	label,
	icon,
	socialProvider,
	context,
	queryParams,
	isNativeApp,
}: SocialButtonProps) => {
	return (
		<>
			<LinkButton
				priority="tertiary"
				cssOverrides={[buttonOverrides, iconOverrides]}
				icon={icon}
				href={buildUrlWithQueryParams(
					'/signin/:social',
					{
						social: socialProvider,
					},
					queryParams,
				)}
				data-cy={`${socialProvider}-sign-in-button`}
				data-link-name={`${socialProvider}-social-button`}
			>
				{socialButtonLabel(label, context, isNativeApp)}
			</LinkButton>
		</>
	);
};

const socialButtonLabel = (
	label: string,
	context: string,
	isNativeApp?: IsNativeApp,
) => {
	const capitalisedLabel = label.charAt(0).toUpperCase() + label.slice(1);
	if (isNativeApp) {
		return `Continue with ${capitalisedLabel}`;
	} else {
		return `${context} with ${capitalisedLabel}`;
	}
};

const socialButtonIcon = (socialProvider: string): React.ReactElement => {
	switch (socialProvider) {
		case 'google':
			return <SvgGoogleBrand />;
		case 'apple':
			return <SvgAppleBrand />;
		default:
			// null is the officially recommended way to return nothing from a React component,
			// but LinkButton doesn't accept it, so we return an empty JSX element instead
			// cf. https://stackoverflow.com/a/47192387
			return <></>;
	}
};

const getButtonOrder = (isNativeApp?: IsNativeApp): string[] => {
	switch (isNativeApp) {
		case 'ios':
			return ['apple', 'google'];
		case 'android':
			return ['google', 'apple'];
		default:
			return ['google', 'apple'];
	}
};

export const SocialButtons = ({
	context,
	queryParams,
	marginTop,
	isNativeApp,
}: SocialButtonsProps) => {
	const buttonOrder = getButtonOrder(isNativeApp);
	return (
		<div css={containerStyles(marginTop)}>
			{buttonOrder.map((socialProvider) => (
				<SocialButton
					key={socialProvider}
					label={socialProvider}
					icon={socialButtonIcon(socialProvider)}
					socialProvider={socialProvider}
					context={context}
					queryParams={queryParams}
					isNativeApp={isNativeApp}
				/>
			))}
		</div>
	);
};
