const fs = require('fs');
const path = 'C:\\Users\\BoTa\\.gemini\\antigravity\\brain\\2c638798-aaf1-4512-a156-65402694459b\\implementation_plan.md';

const mdContent = `# Implementation Plan - WordFlow Dashboard & Sidebar Redesign (99% Visual Match)

Reconstruct the **WordFlow Dashboard** and **AppSidebar** to achieve a **99% visual match** with the provided reference wireframe image. The layout features dark mode (\`#0B0F19\`), cyan/magenta neon accents, glowing circular progress rings, 4 quick stat cards with sparklines, interactive hero cards, vocabulary review FSRS indicators, story library horizontal carousel, and weekly challenge with 3D golden trophy visual.

---

## User Review Required

> [!IMPORTANT]
> - The new sidebar and dashboard header include exact Arabic labels, icons, badge counters, search bar with shortcut, and WordFlow Premium CTA card at the bottom of the sidebar.
> - The Hero banner uses custom generated cozy desk reading lamp image (desk-lamp-book.jpg) and a glowing circular SVG progress ring (73% today progress, 120 XP).
> - The Weekly Challenge card features custom 3D golden trophy asset (golden-trophy.jpg) and a 3/5 progress tracker with +250 XP reward badge.

---

## Proposed Changes

### 1. Sidebar Component
#### [MODIFY] AppSidebar.tsx
- Add 7 navigation links matching reference image:
  1. الرئيسية (Home / Dashboard) - Active cyan glow pill
  2. القصص (Stories) - BookOpen icon
  3. المفردات (Vocabulary) - Book icon
  4. المسارات (Paths) - Layers icon
  5. الإحصائيات (Analytics) - BarChart3 icon
  6. التحديات (Challenges) - Target icon
  7. الإعدادات (Settings) - Settings icon
- Add bottom WordFlow Premium card with crown icon, description, and vibrant gradient Upgrade button.

---

### 2. Dashboard Header & Top Bar
#### [MODIFY] page.tsx (Dashboard)
- Search Bar: Search input with shortcut badge.
- Streak Counter: 12 Days Streak.
- Notification Bell: Bell icon with red badge 3.
- User Profile: Username, Level B1, Avatar W.

---

### 3. Hero Section (Complete Today's Journey)
#### [MODIFY] page.tsx (Dashboard)
- Greeting text & main heading.
- 73% Circular progress ring with 120 XP badge.
- Cozy reading lamp desk image.

---

### 4. 4 Quick Stat Cards
#### [MODIFY] page.tsx (Dashboard)
1. Learning Streak: 12 days + Red bar chart sparkline.
2. Total Points: 3,420 XP + Golden line chart sparkline.
3. Completed Stories: 18 + Cyan bar chart sparkline.
4. Accuracy: 96% + Purple line chart sparkline.

---

### 5. Middle Row Cards
#### [MODIFY] page.tsx (Dashboard)
- Story of the Day: Titanic image background, title, progress 65%, CTA button.
- Vocab Review: 95% FSRS circular gauge, stats, purple gradient CTA button.

---

### 6. Bottom Row Cards
#### [MODIFY] page.tsx (Dashboard)
- All Stories: Carousel of story cards with CEFR tags.
- Weekly Challenge: Goal 3/5 stories, +250 XP badge, 3D Golden trophy image.

---

## Verification Plan

### Manual Verification
1. Open /dashboard in browser.
2. Verify 99% layout match with reference image.
`;

fs.writeFileSync(path, mdContent, 'utf8');
console.log('Implementation plan written successfully.');
