# Responsive Support

`@nextide/ui` supports fluid Nextide product interfaces across four required
CSS viewport-width checkpoints:

|    Width | Scope                              |
| -------: | ---------------------------------- |
|  `320px` | Narrow mobile floor                |
|  `390px` | Common mobile                      |
|  `768px` | Tablet and narrow-desktop boundary |
| `1440px` | Desktop                            |

These are acceptance widths, not four mandatory CSS breakpoints. Components and
blocks should reflow continuously between them and consuming applications may
choose the smallest breakpoint set that produces the required behavior.

Shared UI changes must preserve:

- complete keyboard operation and visible focus;
- readable content without horizontal page scrolling;
- deliberate overflow inside data tables, timelines, charts, or other bounded
  regions whose content cannot usefully stack;
- touch-usable controls at narrow widths;
- the same required information and actions when desktop density recomposes into
  stacked, scrollable, collapsible, or progressively disclosed layouts; and
- zoom, text wrapping, reduced motion, and safe-area behavior without clipped or
  unreachable controls.

Validate every changed responsive boundary in the playground at the affected
checkpoints. Consuming applications remain responsible for complete workflow
acceptance at all four widths.
