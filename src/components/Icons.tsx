import type { SVGProps } from 'react'

type NavIconProps = SVGProps<SVGSVGElement>

export function SearchIcon(props: NavIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export function CartIcon(props: NavIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 3h2.25l2.2 11.02A2.5 2.5 0 0 0 9.9 16h6.84a2.5 2.5 0 0 0 2.4-1.8L21 7H6.05"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M10 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function MenuIcon(props: NavIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}
export function CloseIcon(props: NavIconProps) {
    return (
        <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 18 18 6M6 6l12 12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
            </svg>
    )
}

export function HexagonIcon(props: NavIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 2.5 20.23 7.25v9.5L12 21.5l-8.23-4.75v-9.5L12 2.5Z" />
    </svg>
  )
}

export const HamburgerMenuIcon = MenuIcon
