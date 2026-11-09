# Service visual identity brief

Visual direction accepted, 9 November 2026. All four dedicated-page illustrations are implemented
locally for review.
Continue on `feat/website-content-and-design`.

## Shared system

Retain navy, turquoise, white and the existing pale backgrounds. Retain Manrope and Inter,
accessible text colours, navigation, breadcrumbs and calls to action. Differentiate services through
subject matter, geometry and content-led composition. Do not assign arbitrary service colours.

Each service gets a recognisable compact symbol on Home and Services and a related substantial
illustration on its dedicated page. Concepts use existing approved copy as excerpts. The study
shows composition and relationships, not final artwork or a complete page redesign.

## Financial technology

Visual theme: shared connections and configuration-driven bank integration.

Founder-provided context: at Ecospend, bank differences were managed through bank-specific
configuration injected at runtime into a unified integration layer. Public-facing AIS/PIS services
were exposed through APIs, with a multi-tenant architecture and a merchant dashboard for operational
configuration and testing. This is background about prior experience, not an existing ModusFi product.

The conceptual diagram should show client products accessing platform services through an API,
with AIS/PIS, tenant access, consent handling and unified bank integration inside the platform.
Bank-specific configuration belongs to the integration mechanism. Banks appear as separate external
systems. Consent handling in this platform view does not imply that the platform replaces the bank's
authorisation server or customer authentication. Bank authorisation flows are omitted from this
integration overview and would need a separate, accurate flow if added.

Do not label bank profiles as separate bespoke code adapters. Do not suggest that the UK Standard
itself supplies the abstraction layer. Generic Bank A/B/C labels do not imply actual integrations.
A merchant dashboard can be a secondary control surface in a later detailed diagram; omit its
feature list and avoid invented dashboard screenshots in the initial hero.

The reported bank coverage, integration timing and competitor comparisons are background context,
not approved public claims or ModusFi performance promises. Future ModusFi architecture is a proposed
approach, not a shipped platform. Technical relationships require founder review before publication.

Reviewed official references:

- [UK Open Banking Standard](https://standards.openbanking.org.uk/)
- [Read-Write API Profile, v4.0.1](https://openbankinguk.github.io/read-write-api-site3/v4.0.1/profiles/read-write-data-api-profile.html)
- [Security profiles](https://standards.openbanking.org.uk/security-profiles/)

The API profile categorises implementation requirements as mandatory, conditional and optional.
It requires banks to document implemented conditional/optional endpoints and fields. This supports
allowing for bank differences; the configuration architecture comes from founder-provided context.

## Other service concepts

- AI & Intelligent Systems: relationships between agents, knowledge and tools, with human oversight.
  Use an interconnected composition, three capabilities and a spacious applied-research section.
- Software & Product Engineering: modular product composition with clear interfaces and maintainable
  foundations. Give product delivery and evolution their own visual structure.
- Cloud & Platform Modernisation: controlled evolution from an existing estate to an organised
  platform. Use a wider illustration and layered operational foundations, followed by staged change.

## Review sequence

Review the four opening compositions and entry-point symbols together. Refine the Financial
Technology concept into one complete desktop and mobile page proposal. After review, extend the
same visual grammar to the other pages. Validate technical accuracy, responsive reading order,
contrast, useful alternative text and image weight before website integration.

## Implementation

- Financial Technology has an illustrated hero containing a conceptual Open Banking platform and
  configuration-driven bank integration. The figure is semantic HTML/CSS with readable labels and
  no new image download, browser JavaScript or dependency.
- A shared ServiceIcon component carries the financial connection motif through Home and Services.
  All four symbols now reflect their respective illustration geometry and appear on both Home
  and Services.
- Broader banking experience uses editorial rows instead of a second three-card grid. Existing
  approved service copy remains intact.
- Full verification passed. Browser checks covered 1440px, 768px, 390px and 320px layouts, plus
  Home/Services entry links and symbols. Nothing committed or deployed.

- AI uses an agents/knowledge/tools illustration, with human oversight and a wider editorial
  applied-research section.
- Software uses modular product geometry, a reversed desktop hero and horizontal delivery stages.
  On mobile the heading and summary precede the illustration in reading and visual order.
- Cloud uses a full-width platform-transition illustration and editorial capability rows. Its
  transition stacks vertically on mobile.
- The shared service layout supports split, reversed and wide hero arrangements.
- Full verification passes after implementation. Responsive browser checks cover all four service
  pages at 320px and 768px, with desktop and 390px visual review of the new treatments. Home and
  Services retain all four icons and their existing links. No commit or deployment performed.
