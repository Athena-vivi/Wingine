import type { UITemplate } from "../types/builder.ts"

export const defaultTemplate: UITemplate = {
  id: "constraintlab-default-v1",
  name: "ConstraintLab Default Layout v1",
  description: "Single three-column structure with workspace and homepage output rules.",
  prompt: `Use the following UI template strictly. Do not redesign layout.

[UI TEMPLATE: ConstraintLab Default Layout v1]

Structure:
- TopBar (status/navigation)
- LeftPanel (secondary info, low interaction)
- CenterPanel (main interaction area, primary focus)
- RightPanel (output/display, mostly read-only)

Layout rules:
- Three-column layout (Left / Center / Right)
- Center is dominant and widest
- Left and Right are supportive, not interactive-heavy
- Avoid full page scrolling; allow only center or section scrolling

Interaction rules:
- All user inputs must happen in CenterPanel
- Left/Right panels are not primary action areas
- Keep one shared structure and switch only the output strategy by mode

Visual style:
- Minimalist (similar to Medium/Substack)
- Low contrast, soft colors
- Card-based but with light borders

Modes:
- Workspace mode: fixed layout, no full-page scroll
- Homepage mode: center expands into a content flow and page scroll is allowed

Output rules:
- In Workspace mode:
  Output must appear ONLY in RightPanel

- In SEO/Homepage mode:
  Output appears below input in CenterPanel as a scrollable content feed

Important:
- Do NOT change layout structure
- Only adjust colors if necessary`
}


