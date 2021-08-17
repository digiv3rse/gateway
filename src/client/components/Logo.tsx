import React from 'react';
import { css } from '@emotion/react';

import { brandText } from '@guardian/src-foundations/palette';
import { SvgGuardianLogo } from '@guardian/src-brand';
import { Link } from '@guardian/src-link';
import { from } from '@guardian/src-foundations/mq';
import { visuallyHidden } from '@guardian/src-foundations/accessibility';

type LogoType = 'standard' | 'anniversary' | 'bestWebsite';

type Props = { logoType?: LogoType };

const svgSize = css`
  svg {
    width: 149px;
    height: 50px;
    ${from.tablet} {
      width: 200px;
      height: 67px;
    }
    ${from.desktop} {
      width: 234px;
      height: 78px;
    }
  }
`;

const svgColour = css`
  svg {
    fill: ${brandText.primary};
  }
`;

const StandardLogo = () => {
  return (
    <div css={[svgSize, svgColour]}>
      <SvgGuardianLogo />
    </div>
  );
};

const BestWebsiteLogo = () => {
  return (
    <div css={svgSize}>
      <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 236 92">
        <path
          d="M53.627 41.257l4.038-2.096V7.513h-3.054l-7.46 9.867h-.842l.476-10.999h32.341l.468 10.999h-.885L71.4 7.513h-3.128v31.581l4.063 2.138v1.073H53.627v-1.048zM82.84 39.86V4.783l-3.138-1.248v-.657l11.34-2.03h1.193v16.597l.317-.266c2.512-2.188 6.116-3.594 9.721-3.594 4.965 0 7.159 2.795 7.159 8.003v18.27l2.654 1.44v1.065H97.258v-1.057l2.662-1.448V21.523c0-2.862-1.252-4.01-3.605-4.01-1.569 0-2.92.49-3.921 1.29V39.9l2.611 1.44v1.014H80.17V41.35l2.67-1.49zM120.721 29.086c.309 5.799 2.913 10.283 9.087 10.283 2.987 0 5.107-1.381 7.101-2.43v1.14c-1.544 2.105-5.457 5.059-10.906 5.059-9.57 0-14.46-5.3-14.46-14.485 0-8.977 5.349-14.568 13.993-14.568 8.127 0 12.349 4.052 12.349 14.718v.274h-17.164v.009zm-.158-1.331l8.419-.516c0-7.18-1.235-11.947-3.705-11.947-2.62 0-4.714 5.532-4.714 12.463zM.225 56.349c0-15.267 10.138-20.7 21.427-20.7 4.79 0 9.312.766 11.84 1.814l.217 10.657h-1.076l-6.625-10.307c-1.135-.483-2.211-.674-4.197-.674-6 0-9.07 6.913-8.979 18.253.117 13.56 2.479 19.717 7.986 19.717 1.435 0 2.536-.216 3.304-.549V60.026l-3.638-2.08v-1.215h17.573v1.298l-3.58 1.997V74.36c-2.97 1.157-7.985 2.255-13.275 2.255C8.368 76.615.225 70.683.225 56.35zM37.439 49.227v-.881l11.815-2.08 1.294.108v23.211c0 2.796 1.351 3.661 3.612 3.661 1.46 0 2.78-.549 3.83-1.805V50.625l-3.237-1.398v-.915l11.815-2.08 1.185.109v26.606l3.187 1.33v.85l-11.656 1.43-1.185-.108v-3.494h-.325c-2.162 1.988-5.182 3.71-8.854 3.71-5.665 0-8.26-3.336-8.26-8.394V50.625l-3.221-1.398zM112.127 46.216l.968.108v8.594h.267c1.26-6.298 4.047-8.652 7.443-8.652.542 0 1.135.05 1.46.216v8.794c-.542-.158-1.51-.216-2.428-.216-2.695 0-4.681.482-6.425 1.28v16.99l2.687 1.489v1.098h-15.32v-1.09l2.762-1.49V50.152l-3.237-.965v-.79l11.823-2.18z"
          fill="#fff"
        />
        <path
          d="M141.799 46.94V37.87l-3.238-1.131v-.724l11.924-2.188 1.135.158V72.93l3.295 1.19v1.007l-11.765 1.58-.918-.108v-3.22h-.267c-1.727 1.723-4.105 3.278-7.826 3.278-6.425 0-11.115-4.891-11.115-14.9 0-10.55 5.449-15.732 13.71-15.732 2.361 0 4.147.432 5.065.915zm-.025 24.934V48.595c-.76-.482-1.302-1.081-3.263-1.015-3.187.109-5.157 4.917-5.157 13.47 0 7.696 1.419 11.997 5.666 11.855 1.193-.041 2.161-.466 2.754-1.031zM168.016 46.19l1.026.109V73.32l2.695 1.489v1.098h-15.32v-1.09l2.754-1.489V50.567l-3.296-1.29v-.898l12.141-2.188zm1.084-7.296c0 2.854-2.428 5-5.231 5-2.912 0-5.182-2.154-5.182-5 0-2.853 2.27-5.058 5.182-5.058 2.803 0 5.231 2.205 5.231 5.058zM205.155 73.33V50.316l-3.238-1.131V48.07l11.766-2.188 1.184.108v3.444h.326c2.537-2.263 6.316-3.71 10.038-3.71 5.123 0 7.393 2.42 7.393 7.803V73.28l2.745 1.53v1.1h-15.32v-1.09l2.754-1.49V54.07c0-2.962-1.294-4.143-3.722-4.143-1.568 0-2.853.4-4.047 1.281v22.114l2.696 1.489v1.098h-15.329v-1.09l2.754-1.489zM188.158 58.87v-3.86c0-5.816-1.268-7.721-4.873-7.721-.425 0-.792.05-1.218.108l-6.417 8.669h-.901v-7.979c2.754-.848 6.2-1.847 10.764-1.847 7.844 0 12.408 2.172 12.408 8.72v18.818l2.812.74v.741c-1.11.69-3.338 1.323-5.783 1.323-3.871 0-5.724-1.265-6.575-3.386h-.267c-1.644 2.221-3.972 3.486-7.635 3.486-4.664 0-7.843-2.904-7.843-7.929 0-4.867 3.02-7.504 9.17-8.669l6.358-1.215zm0 13.003v-11.63l-1.961.157c-3.079.266-4.188 2.221-4.188 6.556 0 4.7 1.535 5.924 3.713 5.924 1.218-.009 1.911-.375 2.436-1.007zM86.603 58.87v-3.86c0-5.816-1.269-7.721-4.882-7.721-.425 0-.792.05-1.218.108l-6.416 8.669h-.902v-7.979c2.754-.848 6.2-1.847 10.764-1.847 7.844 0 12.408 2.172 12.408 8.72v18.818l2.812.74v.741c-1.11.69-3.338 1.323-5.783 1.323-3.871 0-5.724-1.265-6.575-3.386h-.267c-1.644 2.221-3.98 3.486-7.635 3.486-4.664 0-7.843-2.904-7.843-7.929 0-4.867 3.02-7.504 9.17-8.669l6.367-1.215zm0 13.003v-11.63l-1.961.157c-3.08.266-4.189 2.221-4.189 6.556 0 4.7 1.535 5.924 3.713 5.924 1.21-.009 1.903-.375 2.437-1.007z"
          fill="#fff"
        />
        <path
          d="M194.942 41.323h-4.748v-.033l1.586-.832c2.094-1.098 3.095-2.096 3.095-3.594 0-1.506-1.093-2.288-3.012-2.288-1.009 0-1.952.142-2.628.408l-.059 2.42h.201l1.794-2.595c.984 0 1.418.732 1.418 2.022 0 1.273-.526 2.363-1.836 3.61l-1.702 1.614v1.024h5.733l.158-1.756zM199.039 43.212c1.986 0 3.638-1.448 3.638-4.351 0-2.887-1.618-4.293-3.563-4.293-1.969 0-3.696 1.414-3.696 4.36.008 2.82 1.669 4.284 3.621 4.284zm.034-.208c-.851 0-1.16-1.331-1.16-4.16 0-2.729.325-4.06 1.151-4.06.851 0 1.127 1.298 1.127 4.177 0 2.72-.276 4.043-1.118 4.043zM206.899 43.212c1.986 0 3.638-1.448 3.638-4.351 0-2.887-1.619-4.293-3.563-4.293-1.969 0-3.696 1.414-3.696 4.36.008 2.82 1.669 4.284 3.621 4.284zm.034-.208c-.852 0-1.16-1.331-1.16-4.16 0-2.729.325-4.06 1.151-4.06.851 0 1.127 1.298 1.127 4.177 0 2.72-.276 4.043-1.118 4.043z"
          fill="#FFE604"
        />
        <path
          d="M175.634 36.157c.367-1.223.384-1.38-.284-1.539l-.225-.05c-.075-.108-.058-.274.075-.324.409.025.826.041 1.335.041h2.303c.793 0 1.385 0 1.744-.041a36.3 36.3 0 00-.509 1.738c-.05.109-.275.092-.309-.016.075-.682.109-1.007-.434-1.165-.283-.075-.667-.116-1.31-.116h-.684c-.35 0-.35.041-.467.44l-.851 2.854c-.084.275-.059.325.2.325h.851c1.177 0 1.41-.092 1.694-.641l.209-.408c.058-.075.3-.066.325.025-.083.233-.275.757-.417 1.24-.15.482-.276.982-.326 1.306-.075.092-.233.075-.325 0l.008-.5c.009-.432-.258-.573-1.276-.573h-.918c-.276 0-.301.041-.392.366l-.543 1.88c-.35 1.215-.392 1.498.234 1.556l.484.041c.075.092.033.275-.05.325-.718-.025-1.152-.042-1.686-.042a26 26 0 00-1.402.042c-.1-.067-.1-.25-.008-.325l.384-.041c.592-.067.718-.225 1.11-1.556l1.46-4.842zM181.116 38.586c-.718 1.015-1.201 2.571-1.235 3.262-.025.457.15.831.509.831.275 0 .584-.116.976-.682.543-.773 1.127-2.495 1.152-3.186.008-.408-.059-.857-.492-.857-.259.008-.551.125-.91.632zm2.253.624c-.033.716-.392 1.972-1.31 2.962-.768.832-1.435.899-1.769.899-.793 0-1.31-.616-1.235-1.74.05-.806.509-2.07 1.352-2.92.642-.648 1.201-.848 1.71-.848.868.008 1.302.699 1.252 1.647zM185.814 38.81l-.535 1.648h.059c.367-.732.976-1.772 1.302-2.204.283-.392.592-.683.901-.683.434 0 .492.441.492.64 0 .2-.108.575-.259.783-.15.2-.342.208-.392-.067-.058-.34-.133-.507-.258-.507-.109 0-.251.133-.434.39-.751 1.016-1.444 2.613-2.103 4.11-.05.109-.109.159-.209.159-.133 0-.492-.05-.409-.341.159-.524.943-2.829 1.277-4.11.033-.142.008-.275-.1-.275-.325 0-.659.366-.876.682-.125.026-.209-.05-.2-.207.392-.708.867-1.257 1.46-1.257.617 0 .4.882.284 1.24zM213.916 39.277c.009.832-.008 1.789-.183 2.87h.05c.409-.64.768-1.447 1.043-2.246.259-.757.442-2.072.459-2.413.025-.374.208-.407.3-.407.084 0 .251.05.351.116.075.05.108.117.108.258.008.325-.325 2.013-1.435 3.977-.609 1.081-1.051 1.947-2.044 3.128-.918 1.106-1.536 1.314-1.928 1.314-.392 0-.642-.274-.642-.599 0-.324.225-.557.492-.557.125 0 .25.075.334.208.033.067.15.233.342.233.158 0 .384-.108.684-.366.309-.275.851-1.098 1.085-1.955.175-.666.258-1.864.25-2.979-.025-1.447-.234-1.955-.467-1.955-.251 0-.459.441-.718.99-.133.042-.208-.05-.233-.166.258-.874.801-1.68 1.41-1.68.617.008.717 1.314.742 2.229zM218.063 38.087a5.312 5.312 0 00-.917 1.522c.817-.258 1.201-.507 1.66-.965.384-.374.484-.773.484-.89 0-.133-.058-.3-.284-.3-.175.009-.5.125-.943.633zm1.961-.241c0 .99-1.226 1.647-3.004 2.163-.083.224-.175.64-.175 1.164 0 .441.259.74.593.74.442 0 .751-.257 1.301-.756.109 0 .184.108.159.225-.751.981-1.46 1.19-1.978 1.19-.742 0-1.001-.733-1.001-1.374 0-.823.492-2.412 1.844-3.51.642-.525 1.126-.624 1.485-.624.493-.009.776.44.776.782zM222.169 38.245c-.793.74-1.544 2.455-1.544 3.378 0 .158.075.25.184.25.125 0 .492-.167 1.202-.849.942-.923 1.46-2.046 1.66-2.82-.083-.25-.3-.466-.617-.466-.301 0-.501.141-.885.508zm2.153-1.489c.208-.108.534.025.609.2-.184.482-1.26 3.37-1.661 4.55-.075.225-.008.3.084.3.208 0 .567-.224 1.277-.873.083 0 .175.066.175.166-.518.732-1.402 1.464-2.078 1.464-.284 0-.359-.25-.359-.35 0-.09.025-.207.125-.507l.409-1.173-.033-.016c-.876 1.148-2.136 2.046-2.72 2.046-.351 0-.543-.366-.543-.732 0-.3.276-1.348 1.085-2.529.593-.865 1.127-1.381 1.636-1.68.484-.292.792-.383 1.109-.383.134 0 .226.041.301.075a.75.75 0 01.25.274l.334-.832zM227.167 38.295l-.534 1.648h.058c.368-.733.977-1.773 1.302-2.205.284-.391.593-.682.901-.682.434 0 .493.44.493.64s-.109.574-.259.782c-.15.2-.351.208-.392-.066-.059-.341-.134-.508-.259-.508-.108 0-.25.133-.434.391-.751 1.015-1.443 2.613-2.103 4.11-.05.108-.108.158-.208.158-.134 0-.492-.05-.409-.34.159-.525.943-2.83 1.277-4.11.033-.142.008-.275-.1-.275-.326 0-.66.366-.877.682-.125.025-.208-.05-.2-.208.392-.707.868-1.256 1.46-1.256.618 0 .392.89.284 1.24zM231.99 37.804c0 .208-.125.35-.226.408-.083.025-.158 0-.233-.109-.209-.224-.367-.415-.751-.415-.359 0-.509.324-.509.524 0 .274.058.549.417 1.19.309.548.492.873.467 1.447-.008.35-.183.832-.642 1.256-.317.3-.776.466-1.252.466-.467 0-.751-.39-.751-.69 0-.133.05-.275.184-.433a.238.238 0 01.334 0c.158.191.534.524.851.524.3 0 .592-.324.592-.74 0-.225-.15-.624-.459-1.148-.325-.55-.434-.99-.434-1.215 0-.508.209-.89.743-1.373.359-.324.751-.432.918-.432.467-.009.751.416.751.74z"
          fill="#fff"
        />
        <path
          d="M58.107 79.478h1.761l2.311 3.993c.726 1.248 1.536 3.095 1.536 3.095h.041s-.125-1.939-.125-3.245v-3.843h1.427v9.176h-1.544l-2.536-4.443c-.718-1.248-1.535-3.128-1.535-3.128h-.05s.15 1.997.15 3.287v4.292h-1.427v-9.184h-.009zM66.535 85.542v-.624c0-2.238 1.302-3.27 3.03-3.27 2.002 0 2.836 1.032 2.836 3.17v.849h-4.28c.041 1.53.692 1.855 2.002 1.855.893 0 1.469-.2 2.053-.483v1.107c-.46.291-1.202.64-2.362.64-2.236 0-3.279-1.14-3.279-3.244zm1.569-.957h2.753c0-1.372-.459-1.797-1.318-1.797-.692 0-1.393.308-1.435 1.797zM73.018 81.773h1.594l.609 2.546c.267 1.098.559 3.212.559 3.212h.05s.292-2.089.6-3.212l.693-2.546H78.5l.693 2.546c.292 1.098.642 3.212.642 3.212h.05s.284-2.089.55-3.212l.602-2.546h1.393l-1.852 6.89h-1.56l-.776-2.805c-.293-1.031-.476-2.878-.476-2.878h-.05s-.167 1.847-.46 2.878l-.775 2.804h-1.594l-1.869-6.889zM83.115 88.33v-1.224c.576.233 1.06.416 2.019.416.918 0 1.285-.266 1.285-.765 0-.458-.125-.674-.885-.857l-.75-.175c-1.018-.241-1.66-.765-1.66-1.997 0-1.272.792-2.088 2.486-2.088.918 0 1.51.166 1.952.383v1.198a4.809 4.809 0 00-1.81-.341c-.776 0-1.177.258-1.177.74 0 .458.217.65.818.79l.75.175c1.319.308 1.778.84 1.778 2.047 0 1.414-.918 2.138-2.595 2.138-.86 0-1.652-.15-2.211-.44zM91.717 81.773h1.594l.61 2.546c.266 1.098.558 3.212.558 3.212h.05s.292-2.089.601-3.212l.693-2.546h1.376l.693 2.546c.292 1.098.642 3.212.642 3.212h.05s.284-2.089.551-3.212l.6-2.546h1.394l-1.852 6.89h-1.56l-.776-2.805c-.292-1.031-.476-2.878-.476-2.878h-.05s-.167 1.847-.459 2.878l-.776 2.804h-1.594l-1.869-6.889zM101.839 85.542v-.624c0-2.238 1.302-3.27 3.029-3.27 2.002 0 2.837 1.032 2.837 3.17v.849h-4.281c.042 1.53.693 1.855 2.003 1.855.893 0 1.468-.2 2.052-.483v1.107c-.458.291-1.201.64-2.361.64-2.236 0-3.279-1.14-3.279-3.244zm1.569-.957h2.753c0-1.372-.459-1.797-1.318-1.797-.693 0-1.402.308-1.435 1.797zM108.948 88.263V78.87h1.535v3.503h.067a2.827 2.827 0 011.952-.724c1.252 0 2.529.724 2.529 3.128v.557c0 2.355-1.16 3.478-3.396 3.478-.977 0-2.053-.233-2.687-.55zm4.481-2.712v-.64c0-1.606-.509-1.998-1.661-1.998-.534 0-1.018.2-1.293.341v4.102c.258.125.584.266 1.235.266.901 0 1.719-.34 1.719-2.071zM115.94 88.33v-1.224c.576.233 1.06.416 2.02.416.918 0 1.285-.266 1.285-.765 0-.458-.125-.674-.876-.857l-.751-.175c-1.018-.241-1.661-.765-1.661-1.997 0-1.272.793-2.088 2.487-2.088.917 0 1.51.166 1.952.383v1.198a4.81 4.81 0 00-1.811-.341c-.776 0-1.176.258-1.176.74 0 .458.217.65.818.79l.751.175c1.318.308 1.777.84 1.777 2.047 0 1.414-.918 2.138-2.595 2.138-.868 0-1.661-.15-2.22-.44zM121.915 79.086h1.585v1.464h-1.585v-1.464zm.025 2.687h1.535v6.889h-1.535v-6.889zM125.611 86.99v-4.01h-1.135v-1.207h1.135V80.11h1.535v1.664h1.777v1.207h-1.777v3.768c0 .6.2.774.86.774.283 0 .767-.075 1.009-.175v1.04c-.283.175-.843.358-1.51.358-1.152 0-1.894-.433-1.894-1.755zM129.8 85.542v-.624c0-2.238 1.301-3.27 3.029-3.27 2.002 0 2.837 1.032 2.837 3.17v.849h-4.281c.042 1.53.693 1.855 2.003 1.855.893 0 1.468-.2 2.052-.483v1.107c-.459.291-1.201.64-2.361.64-2.236 0-3.279-1.14-3.279-3.244zm1.568-.957h2.754c0-1.372-.459-1.797-1.318-1.797-.693 0-1.394.308-1.436 1.797zM139.771 85.542v-.582c0-2.163 1.352-3.312 3.162-3.312 1.953 0 3.113 1.124 3.113 3.245v.582c0 2.189-1.327 3.312-3.129 3.312-1.978 0-3.146-1.14-3.146-3.245zm4.681.058v-.699c0-1.722-.693-2.071-1.544-2.071-.959 0-1.543.599-1.543 2.013v.716c0 1.689.701 2.046 1.585 2.046.951-.008 1.502-.566 1.502-2.005zM147.831 82.98h-1.126v-1.207h1.126v-.848c0-1.506.918-2.163 2.211-2.163.626 0 1.102.116 1.327.241v1.073c-.175-.05-.534-.1-.918-.1-.701 0-1.085.317-1.085 1.099v.715h1.644v1.206h-1.644v5.674h-1.535v-5.69zM155.808 86.99v-4.01h-1.135v-1.207h1.135V80.11h1.535v1.664h1.778v1.207h-1.778v3.768c0 .6.201.774.86.774.284 0 .768-.075 1.009-.175v1.04c-.283.175-.842.358-1.51.358-1.151 0-1.894-.433-1.894-1.755zM160.289 78.87h1.535v3.602h.067c.484-.474 1.293-.823 2.12-.823 1.276 0 1.919.557 1.919 1.897v5.116h-1.536v-4.734c0-.69-.217-.965-1.101-.965-.501 0-1.076.167-1.469.366v5.333h-1.535V78.87zM167.173 85.542v-.624c0-2.238 1.302-3.27 3.029-3.27 2.002 0 2.837 1.032 2.837 3.17v.849h-4.281c.042 1.53.693 1.855 2.003 1.855.893 0 1.468-.2 2.052-.483v1.107c-.459.291-1.201.64-2.361.64-2.236 0-3.279-1.14-3.279-3.244zm1.569-.957h2.753c0-1.372-.459-1.797-1.318-1.797-.701 0-1.402.308-1.435 1.797zM177.06 91.075v-1.082c.176.042.434.067.676.067.609 0 .993-.242 1.235-.89l.242-.65-2.403-6.747h1.619l.751 2.238c.484 1.423.792 3.32.792 3.32h.042s.342-1.897.801-3.32l.718-2.238h1.518l-2.645 7.638c-.45 1.298-1.101 1.88-2.336 1.88-.35 0-.809-.091-1.01-.216zM183.527 85.542v-.624c0-2.238 1.302-3.27 3.029-3.27 2.003 0 2.837 1.032 2.837 3.17v.849h-4.28c.041 1.53.692 1.855 2.002 1.855.893 0 1.469-.2 2.053-.483v1.107c-.459.291-1.202.64-2.361.64-2.228 0-3.28-1.14-3.28-3.244zm1.577-.957h2.754c0-1.372-.459-1.797-1.318-1.797-.701 0-1.402.308-1.436 1.797zM190.228 86.807c0-1.273.792-1.872 2.136-2.039l1.535-.2v-.523c0-.882-.359-1.107-1.494-1.107-.651 0-1.235.1-1.643.191v-1.106c.625-.258 1.368-.383 2.244-.383 1.544 0 2.428.608 2.428 2.063v4.95h-1.26l-.125-.69h-.075c-.317.45-.826.815-1.685.815-1.227.009-2.061-.632-2.061-1.971zm3.663.474v-1.747l-1.185.116c-.651.067-.943.416-.943 1.082 0 .665.384.94.984.94.468.008.893-.158 1.144-.391zM196.97 81.774h1.468v.94h.075c.343-.574 1.102-1.04 1.803-1.04.192 0 .359.025.409.066v1.398a3.745 3.745 0 00-.534-.05c-.601 0-1.26.2-1.686.474v5.109h-1.535v-6.897z"
          fill="#F9E44C"
        />
      </svg>
    </div>
  );
};

const AnniversaryLogo = () => {
  return (
    <div css={svgSize}>
      <svg
        width="301"
        height="113"
        viewBox="0 0 301 113"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M116.783 104.968h-8.791v-.065l2.933-1.549c3.879-2.052 5.736-3.903 5.736-6.687 0-2.805-2.029-4.247-5.578-4.247-1.879 0-3.621.258-4.869.753l-.107 4.506h.365l3.32-4.829c1.836 0 2.631 1.356 2.631 3.753 0 2.374-.968 4.397-3.405 6.708l-3.148 2.998v1.902h10.626l.287-3.243zM124.44 108.096c-1.57 0-2.158-2.482-2.158-7.741 0-5.065.602-7.548 2.137-7.548 1.57 0 2.093 2.418 2.093 7.763-.007 5.072-.523 7.526-2.072 7.526zm-.064.387c3.685 0 6.747-2.697 6.747-8.085 0-5.367-2.997-7.978-6.597-7.978-3.642 0-6.854 2.633-6.854 8.107 0 5.244 3.083 7.956 6.704 7.956zM139.003 108.16c-1.57 0-2.158-2.482-2.158-7.741 0-5.065.602-7.547 2.136-7.547 1.57 0 2.094 2.418 2.094 7.763-.007 5.065-.524 7.525-2.072 7.525zm-.065.388c3.686 0 6.747-2.698 6.747-8.086 0-5.366-2.997-7.978-6.596-7.978-3.643 0-6.855 2.634-6.855 8.108 0 5.237 3.083 7.956 6.704 7.956z"
          fill="#FFE500"
        />
        <path
          d="M67.475 47.867l5.098-2.475v-37.5h-3.857l-9.429 11.694h-1.054l.588-13.029H99.69l.595 13.029h-1.126L89.931 7.892h-3.957v37.414l5.133 2.533v1.27H67.475v-1.242zM104.945 46.21V4.663l-3.965-1.478v-.774L115.313 0h1.513v19.658l.394-.316c3.169-2.59 7.722-4.261 12.282-4.261 6.274 0 9.041 3.307 9.041 9.477v21.645l3.349 1.707v1.263h-18.735v-1.256l3.363-1.714v-21.71c0-3.393-1.585-4.75-4.553-4.75-1.979 0-3.686.582-4.948 1.529v24.995l3.299 1.708v1.205h-18.742v-1.19l3.369-1.78zM153.55 31.868l10.633-.61c0-8.508-1.563-14.154-4.681-14.154-3.313.007-5.952 6.564-5.952 14.764zm.194 1.586c.387 6.866 3.678 12.182 11.479 12.182 3.771 0 6.446-1.636 8.97-2.877v1.349c-1.951 2.49-6.891 5.99-13.781 5.99-12.088 0-18.262-6.284-18.262-17.16 0-10.633 6.762-17.255 17.681-17.255 10.268 0 15.602 4.8 15.602 17.44v.331h-21.689zM0 65.746c0-18.087 12.805-24.522 27.066-24.522 6.052 0 11.759.91 14.964 2.145l.28 12.62h-1.363l-8.374-12.211c-1.434-.574-2.797-.804-5.299-.804-7.585 0-11.457 8.186-11.335 21.617.143 16.07 3.133 23.36 10.088 23.36 1.806 0 3.205-.259 4.172-.654V70.093l-4.588-2.46V66.19H47.8v1.535l-4.524 2.367v16.982c-3.757 1.363-10.088 2.669-16.77 2.669C10.296 89.75 0 82.727 0 65.746zM47.587 57.309v-1.04l14.935-2.461 1.634.129v27.499c0 3.314 1.707 4.333 4.568 4.333 1.842 0 3.506-.653 4.84-2.138V58.966l-4.095-1.657v-1.084l14.935-2.46 1.499.129v31.524l4.022 1.578v1.005l-14.727 1.693-1.498-.13v-4.14h-.41c-2.724 2.361-6.545 4.399-11.177 4.399-7.155 0-10.432-3.953-10.432-9.944V58.973l-4.094-1.664zM143.054 53.743l1.226.13v10.18h.337c1.599-7.462 5.112-10.253 9.407-10.253.681 0 1.434.065 1.842.259v10.417c-.681-.194-1.907-.258-3.068-.258-3.406 0-5.916.573-8.117 1.513v20.124l3.392 1.758v1.306h-19.359v-1.291l3.484-1.765V58.406l-4.094-1.14v-.933l14.95-2.59z"
          fill="#fff"
        />
        <path
          d="M180.516 84.133v-27.57c-.953-.575-1.641-1.285-4.115-1.199-4.03.137-6.517 5.819-6.517 15.956 0 9.112 1.792 14.205 7.155 14.04 1.506-.05 2.732-.552 3.477-1.227zm.022-29.53v-10.74l-4.087-1.34v-.862l15.064-2.582 1.434.193v46.131l4.159 1.414v1.19l-14.864 1.873-1.161-.129v-3.817h-.344c-2.18 2.038-5.184 3.889-9.888 3.889-8.116 0-14.045-5.804-14.045-17.656 0-12.498 6.89-18.64 17.322-18.64 3.004-.006 5.256.503 6.41 1.077zM215.039 45.07c0 3.378-3.069 5.925-6.618 5.925-3.678 0-6.546-2.547-6.546-5.926s2.868-5.99 6.546-5.99c3.549 0 6.618 2.611 6.618 5.99zm-1.363 8.644l1.298.13v32.011l3.406 1.765v1.306h-19.359v-1.291l3.477-1.765V58.908l-4.158-1.528v-1.069l15.336-2.597zM261.844 85.855V58.6l-4.094-1.342v-1.32l14.863-2.59 1.506.13v4.082h.409c3.204-2.676 7.98-4.398 12.683-4.398 6.474 0 9.342 2.87 9.342 9.24v23.403l3.471 1.808v1.306h-19.359v-1.292l3.477-1.772V63.041c0-3.508-1.634-4.907-4.703-4.907-1.979 0-3.607.466-5.112 1.52v26.194l3.413 1.765v1.306h-19.366v-1.292l3.47-1.772zM240.363 84.133V70.36l-2.473.186c-3.886.316-5.292 2.633-5.292 7.763 0 5.574 1.943 7.01 4.689 7.01 1.542.006 2.409-.431 3.076-1.184zm0-15.403v-4.57c0-6.887-1.606-9.14-6.159-9.14-.537 0-1.003.065-1.541.13l-8.102 10.266h-1.14V55.96c3.484-1.005 7.836-2.196 13.594-2.196 9.916 0 15.673 2.569 15.673 10.332v22.29l3.549.876v.875c-1.405.81-4.223 1.564-7.299 1.564-4.889 0-7.234-1.5-8.302-4.01h-.337c-2.08 2.632-5.026 4.132-9.644 4.132-5.893 0-9.916-3.444-9.916-9.391 0-5.761 3.815-8.89 11.587-10.267l8.037-1.435zM110.803 84.133V70.36l-2.48.186c-3.887.316-5.292 2.633-5.292 7.763 0 5.574 1.943 7.01 4.689 7.01 1.542.006 2.417-.431 3.083-1.184zm0-15.403v-4.57c0-6.887-1.606-9.14-6.159-9.14-.537 0-1.003.065-1.541.13l-8.102 10.266h-1.14V55.96c3.484-1.005 7.837-2.196 13.594-2.196 9.916 0 15.673 2.569 15.673 10.332v22.29l3.549.876v.875c-1.405.81-4.223 1.564-7.299 1.564-4.889 0-7.234-1.5-8.302-4.01h-.337c-2.079 2.632-5.026 4.132-9.644 4.132-5.893 0-9.909-3.444-9.909-9.391 0-5.761 3.815-8.89 11.587-10.267l8.03-1.435zM149.772 112.422l-1.155-2.238v-.309h4.152l-4.833-12.684-.939-.474v-.351h6.03v.351l-1.212.538 2.603 7.562 2.251-7.21-1.527-.89v-.351h3.112v.351l-1.176.826-3.542 11.163c-.631 1.973-1.828 3.278-3.764 3.716zm11.335-10.776c.137 2.798.976 4.513 3.722 4.513.903 0 1.663-.122 2.387-.459v.33c-.609.975-2.093 1.987-4.23 1.987-3.621 0-5.478-2.317-5.478-6.026 0-3.623 2.036-5.883 5.32-5.883 3.305 0 4.696 1.865 4.696 5.244v.287h-6.417v.007zm0-.416l3.033-.143c0-3.566-.451-4.578-1.391-4.578-1.018 0-1.642 1.45-1.642 4.721zm12.469-.186V99.53c0-2.303-.473-3.042-1.664-3.042-.136 0-.251.021-.394.043l-2.638 3.788h-.337l.078-3.523c1.019-.33 2.288-.703 3.973-.703 2.896 0 4.581.847 4.581 3.415v7.375l1.04.287v.287c-.409.273-1.233.517-2.137.517-1.427 0-2.115-.495-2.423-1.327h-.101c-.609.868-1.47 1.37-2.817 1.37-1.721 0-2.897-1.141-2.897-3.106 0-1.909 1.118-2.942 3.384-3.401l2.352-.466zm0 5.1v-4.555l-.724.064c-1.133.101-1.549.868-1.549 2.569 0 1.844.566 2.317 1.369 2.317.452 0 .703-.151.904-.395zm9.658-9.986l.351.043v3.228h.1c.545-2.468 1.449-3.4 2.66-3.4.194 0 .409.021.531.086v3.415c-.194-.065-.545-.086-.882-.086-.975 0-1.699.1-2.33.373v7.231l1.448.309v.352h-6.144v-.352l1.118-.309v-9.384l-1.176-.495v-.351l4.324-.66zm12.719 8.078c0 2.339-1.549 3.752-4.402 3.752-1.291 0-2.624-.165-3.657-.581l-.115-3.357h.33l2.796 3.458c.194.064.409.1.588.1 1.198 0 1.743-.682 1.743-1.743 0-.933-.474-1.285-1.7-1.909l-.645-.308c-1.957-.976-3.09-1.987-3.09-3.896 0-2.317 1.527-3.688 4.151-3.688 1.076 0 2.252.101 3.148.374l.1 3.128h-.33l-2.136-3.028a2.024 2.024 0 00-.689-.122c-1.054 0-1.527.646-1.527 1.571 0 1.012.452 1.35 1.764 1.988l.609.287c2.001 1.011 3.062 1.901 3.062 3.974zM73.541 107.673l1.312-.287V93.754l-1.29-.308v-.352h11.392l.1 4.85h-.329l-2.545-4.455h-3.19v7.024h1.562l1.778-2.755h.33v5.947h-.33l-1.778-2.776H78.99v6.485l1.527.273v.352h-6.969v-.366h-.007zM84.29 102.313c0-3.644 2.193-5.904 5.477-5.904 3.284 0 5.52 2.26 5.52 5.926 0 3.688-2.193 6.005-5.499 6.005-3.27 0-5.499-2.339-5.499-6.027zm3.856.022c0 4.477.567 5.632 1.664 5.632 1.075 0 1.627-1.184 1.627-5.654 0-4.455-.53-5.531-1.641-5.531-1.083 0-1.65 1.098-1.65 5.553zM99.69 96.474l.351.043v3.228h.1c.545-2.468 1.449-3.393 2.66-3.393.194 0 .409.021.531.086v3.415c-.194-.065-.545-.087-.882-.087-.975 0-1.706.101-2.33.374v7.231l1.448.309v.351h-6.144v-.351l1.118-.309v-9.39l-1.176-.496v-.351l4.324-.66z"
          fill="#fff"
        />
      </svg>
    </div>
  );
};

const DecideLogo = ({ logoType }: { logoType: LogoType }) => {
  switch (logoType) {
    case 'anniversary':
      return <AnniversaryLogo />;
    case 'standard':
      return <StandardLogo />;
    case 'bestWebsite':
      return <BestWebsiteLogo />;
  }
};

export const Logo = ({ logoType = 'standard' }: Props) => (
  <Link
    href="https://www.theguardian.com"
    title="The Guardian Homepage"
    subdued={true}
    cssOverrides={css`
      color: ${brandText.primary};
      :hover {
        color: ${brandText.primary};
      }
    `}
  >
    <span
      css={css`
        ${visuallyHidden};
      `}
    >
      The Guardian - Back to home
    </span>
    <DecideLogo logoType={logoType} />
  </Link>
);
