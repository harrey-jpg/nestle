# Activity integration review

Implemented six room moments: sitting, reading, studying, gaming, cuddling and standing. New poses are available for user review; the previously approved faces and fuller standing bodies remain locked.

## Verification

- 14 automated tests passed, including local-time activity selection and every shipped pose/expression asset.
- Source pixel comparison passed for every opaque approved head/mole pixel across all 160 new pose variants.
- Browser checks passed on 1440×1000 desktop and 390×844 mobile, both morning and night; six poses captured in each configuration.
- Scene stays settled for ten foreground minutes. A 30-second absence retains it; a 61-second absence chooses a different appropriate activity. Pause blocks return changes.
- Manual next moment works with reduced motion. Both characters stay inside the room; no horizontal page overflow. Fullscreen character height follows room size.
- Both ownership choices, all sixteen expressions, partner read-only behavior, expression persistence, rapid selections, asset failure retention and storage fallback passed the expression regression checks.

Visual inspection covered reading, studying, cuddling, standing and mobile gaming. The sofa poses keep their feet below the sofa, the study poses flank the table, and the closer pair shares a shoulder embrace. No background server simulation, authenticated ownership, or cross-device synchronization is claimed. Physical devices remain untested.
