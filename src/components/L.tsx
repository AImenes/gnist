import { Link as RLink, NavLink as RNavLink, useParams, type LinkProps, type NavLinkProps } from 'react-router-dom'

/** Prefix an app path with the current language segment, e.g. "/circuits" → "/nb/circuits". */
export function useP() {
  const { lang } = useParams()
  const l = lang === 'en' ? 'en' : 'nb'
  return (to: string) => (to === '/' ? `/${l}` : `/${l}${to}`)
}

export function Link({ to, ...rest }: LinkProps) {
  const p = useP()
  return <RLink to={typeof to === 'string' && to.startsWith('/') ? p(to) : to} {...rest} />
}

export function NavLink({ to, ...rest }: NavLinkProps) {
  const p = useP()
  return <RNavLink to={typeof to === 'string' && to.startsWith('/') ? p(to) : to} {...rest} />
}
