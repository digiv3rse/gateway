import React from 'react';
import {
	EMAIL_LIGHT,
	EMAIL_DARK,
	WELCOME_LIGHT,
	WELCOME_DARK,
	DecorativeImageId,
} from '@/client/assets/decorative';
import { css } from '@emotion/react';

export interface Props {
	id: DecorativeImageId;
}

const imageStyles = (id: DecorativeImageId) => css`
	@media (prefers-color-scheme: dark) {
		content: url(${id === 'email' ? EMAIL_DARK : WELCOME_DARK});
	}
	@media (prefers-color-scheme: light) {
		content: url(${id === 'email' ? EMAIL_LIGHT : WELCOME_LIGHT});
	}
`;

export const MinimalLayoutImage = ({ id }: Props) => {
	return <img alt="" css={imageStyles(id)} />;
};
