export const MISSION_COLORS = {
  borders: {
    default: '#DEE6F2',
    header: '#c8d4e6',
    combos: '#FF9E93',
    level: '#C7DEFF',
    card: '#E6E6E6',
    progress: '#DCD0C5',
  },
  backgrounds: {
    white: 'white',
    lightBlue: '#DFEFFF',
    lightGreen: '#E1FFDF',
    lightOrange: '#FFE1CD',
    purple: '#C085FF4D',
    progress: '#D7E4FF',
    progressBar: '#B5C6EB',
    container: '#EEF2FD',
    gray: '#F4F6F9',
  },
  text: {
    primary: '#131D53',
    secondary: '#131D5399',
    success: '#054400',
    warning: '#AA4100',
    purple: '#2F0062',
    gray: '#676B8C',
    white: 'white',
  },
  gradients: {
    combos: 'linear(110deg, #F66B27 -4.7%, #FF4F46 106.4%)',
    boosts: 'linear(110deg, #A463FC -4.7%, #914BF0 106.4%)',
    missions: 'linear(110deg, #FF9500 -4.7%, #FFD293 106.4%)',
    level: 'linear(110deg, #195DBC -4.7%, #3E89F2 106.4%)',
    progress: 'linear(90deg, #60A5FA 0%, #3B82F6 100%)',
    button: 'linear-gradient(180deg, #f5f9fe 47.86%, #d5e9ff 123.81%)',
  },
  icon: {
    combos: '#D63925',
    boosts: '#7331CE',
    missions: '#B67E05',
    level: '#05439B',
  },
} as const

export const MISSION_SPACING = {
  header: {
    top: '100px',
    height: '58px',
    sidebarOffset: '240px',
  },
  card: {
    padding: '12px',
    borderRadius: '12px',
    gap: '12px',
    smallGap: '8px',
  },
  grid: {
    gap: '2px',
    templateColumns: 'repeat(2, 1fr)',
    autoFill: 'repeat(auto-fill, 1fr)',
  },
  content: {
    marginTop: '58px',
    marginTopLarge: '65px',
  },
} as const

export const MISSION_ASSETS = {
  bgIcons: {
    combos: '/assets/mission-combos-bg-icon.svg',
    boosts: '/assets/mission-boosts-bg-icon.svg',
    missions: '/assets/mission-missoes-bg-icon.svg',
    level: '/assets/mission-level-bg-icon.svg',
  },
} as const

export const MISSION_SIZES = {
  icon: {
    small: 24,
    medium: 32,
    large: 48,
    xlarge: 120,
  },
  progress: {
    height: '20px',
  },
  card: {
    width: '180.5px',
  },
} as const
