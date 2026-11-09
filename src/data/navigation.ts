export const primaryNavigation = [
  { href: '/services', label: 'Services' },
  { href: '/expertise', label: 'Expertise' },
  { href: '/experience', label: 'Experience' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact us', footerLabel: 'Contact' },
];

export const footerNavigation = [...primaryNavigation, { href: '/privacy', label: 'Privacy' }];

// A service detail belongs to Services, but is not the overview page itself.
export function navigationCurrent(pathname: string, href: string): 'page' | 'location' | undefined {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === href) return 'page';
  if (path.startsWith(`${href}/`)) return 'location';
  return undefined;
}
