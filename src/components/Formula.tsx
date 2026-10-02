import type { ReactNode } from 'react'

export function Formula({ children, small }: { children: ReactNode; small?: boolean }) {
  return <div className={'formula' + (small ? ' small' : '')}>{children}</div>
}

export const Num = ({ children }: { children: ReactNode }) => <span className="num">{children}</span>
export const Op = ({ children }: { children: ReactNode }) => <span className="op">{children}</span>
