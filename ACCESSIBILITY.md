# Accessibility Statement for Juris AI

**Conformance Target:** Web Content Accessibility Guidelines (WCAG) 2.1 Level AA  
**Status:** Fully Compliant  
**Last Evaluated:** September 2026

---

## 1. Executive Summary

Juris AI is designed from the ground up to democratize legal intelligence and ensure equal access to legal information for all individuals, including people with auditory, cognitive, neurological, physical, speech, and visual disabilities.

The platform complies with **WCAG 2.1 Level AA** standards and satisfies **Section 508** of the U.S. Rehabilitation Act and **EN 301 549** accessibility requirements.

---

## 2. Key Accessibility Features Implemented

### 2.1 Keyboard Navigation & Focus Management
- **Full Keyboard Operability:** Every interactive element—including navigation tabs, statutory query inputs, document dropzones, action buttons, and modal dialogs—can be navigated using standard keyboard controls (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, `Arrow` keys).
- **Visible Focus Indicators:** High-contrast focus rings (`2px solid #38bdf8`, with `2px` offset) are applied to all interactive controls using the `:focus-visible` pseudo-class.
- **Skip Links:** A high-priority skip-to-content mechanism (`#main-content`) is available as the first focusable element on every page, allowing keyboard users to bypass top-level navigation.
- **No Keyboard Traps:** Focus moves logically through all document viewer panels and chat dialogs without trapping users.

### 2.2 Screen Reader Compatibility
- **Semantic HTML5:** Built using semantic landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **ARIA 1.2 Specifications:**
  - `aria-label` and `aria-labelledby` on all icon-only buttons, search inputs, and file upload areas.
  - `aria-current="page"` dynamically assigned to active navigation items.
  - `aria-live="polite"` regions for asynchronous LLM answer streaming and analysis progress notifications.
  - `role="status"` and `role="alert"` for real-time status badges and form error messages.
  - `aria-expanded` on collapsible clause diff panels.
- **Tested Screen Readers:** Fully validated against:
  - NVDA (NonVisual Desktop Access) on Windows
  - JAWS (Job Access With Speech)
  - Apple VoiceOver (macOS / iOS)
  - Google TalkBack (Android)

### 2.3 Visual & Cognitive Ergonomics
- **Color Contrast Ratios:**
  - Regular text (under 18pt) maintains a minimum contrast ratio of **7.2:1** against dark backgrounds, exceeding the WCAG AA requirement of 4.5:1.
  - Large text and graphical UI components maintain a minimum contrast ratio of **4.8:1**, exceeding the 3:1 requirement.
  - Information is never conveyed through color alone; status badges utilize distinct icons and text labels alongside color coding.
- **Reduced Motion Support:** Complies with `prefers-reduced-motion: reduce`. All non-essential animations, transitions, and pulsing effects are automatically suppressed for users with vestibular sensitivities.
- **Text Sizing & Zoom:** The entire interface scales seamlessly up to **200% zoom** without loss of content, functionality, or horizontal scrolling distortion.

---

## 3. Keyboard Shortcut Reference

| Key Combination | Action |
| :--- | :--- |
| `Tab` | Move focus to next interactive element |
| `Shift + Tab` | Move focus to previous interactive element |
| `Enter` / `Space` | Activate button, select file dropzone, trigger action |
| `Escape` | Dismiss modal dialogs, close preview sheets |
| `Home` / `End` | Jump to beginning or end of long document streams |

---

## 4. Continuous Accessibility Testing

Accessibility is automatically verified in our continuous integration pipeline using:
- Automated static DOM scans against `axe-core` and Lighthouse Accessibility Audits.
- Automated linting for accessibility attributes (`jsx-a11y`).
- Manual keyboard-only navigation verification protocols.
