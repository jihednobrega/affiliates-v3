export interface NavigationItem {
  label: string
  href: string
  icon: React.ElementType
}

export interface NavigationSection {
  label: string
  items: NavigationItem[]
}

export interface NavigationProps {
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}