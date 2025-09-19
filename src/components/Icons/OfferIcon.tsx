import { createIcon } from '@chakra-ui/react'
import { Fragment } from 'react'

export const OfferIcon = createIcon({
  displayName: 'OfferIcon',
  viewBox: '0 0 20 20',
  defaultProps: { fill: 'none' },

  path: (
    <Fragment>
      <g clipPath="url(#clip0_931_8069)">
        <path
          d="M10.4882 2.15533C10.1757 1.84274 9.75183 1.66709 9.30984 1.66699H3.33317C2.89114 1.66699 2.46722 1.84259 2.15466 2.15515C1.8421 2.46771 1.6665 2.89163 1.6665 3.33366V9.31033C1.6666 9.75232 1.84225 10.1762 2.15484 10.4887L9.40817 17.742C9.78693 18.1184 10.2992 18.3296 10.8332 18.3296C11.3671 18.3296 11.8794 18.1184 12.2582 17.742L17.7415 12.2587C18.1179 11.8799 18.3291 11.3676 18.3291 10.8337C18.3291 10.2997 18.1179 9.78742 17.7415 9.40866L10.4882 2.15533Z"
          stroke="currentColor"
          strokeOpacity="0.6"
          strokeWidth="1.45833"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.25016 6.66634C6.48028 6.66634 6.66683 6.47979 6.66683 6.24967C6.66683 6.01956 6.48028 5.83301 6.25016 5.83301C6.02004 5.83301 5.8335 6.01956 5.8335 6.24967C5.8335 6.47979 6.02004 6.66634 6.25016 6.66634Z"
          fill="currentColor"
          fillOpacity="0.6"
          stroke="currentColor"
          strokeOpacity="0.6"
          strokeWidth="1.45833"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_931_8069">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </Fragment>
  ),
})
