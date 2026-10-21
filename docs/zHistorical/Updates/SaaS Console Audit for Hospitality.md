# **Master Product and UX Audit: Elevating the Serve By Example Manager Console to an Enterprise-Grade Operational Control Plane**

## **Executive Summary**

The Australian hospitality landscape in 2026 operates in an environment of unprecedented regulatory scrutiny and acute operational pressure.1 Frontline team turnover remains a critical cost center, with statistical tracking indicating that approximately 39% of front-of-house and 42% of back-of-house staff depart within their initial 90 days of employment.3 To mitigate this operational drain, modern venues require structured, active-recall mobile training systems that reduce standard onboarding timelines from six months to six weeks.4 While the Serve By Example platform offers a strong visual foundation characterized by an editorial forest green and cream palette, a significant gap remains between its high-end aesthetic and its operational authority \[User Critique\]. The manager console currently functions as a passive training reporter rather than a real-time operational control plane.5  
For a venue manager navigating high-volume pre-service shifts, the primary value driver of any administrative tool is performance-based financial yield.3 This audit outlines a comprehensive plan to transform the current console into an indispensable operational command center \[User Critique\]. By integrating roster-level staff allocations with state-specific legal certifications, such as the Responsible Service of Alcohol and Food Safety Supervisor frameworks, the platform can deliver automated compliance tracking.5 This analysis provides visual, functional, and architectural recommendations designed to elevate the platform's authority, drive immediate operational return on investment, and position the system as an elite enterprise-grade solution in the B2B hospitality market.3

## **1\. Mission Control and Overview Dashboard**

### **The UX Critique**

The primary viewport of the Overview dashboard relies on a uniform, unranked 2×2 key performance indicator grid that dilutes visual hierarchy \[User Critique\]. The metrics—comprising Sales Impact, Average Scenario Score, Training Completion, and Upsell Performance—are presented with equal visual weight, preventing managers from identifying critical operational alerts during a rapid pre-service scan \[User Critique\].  
The sparkline visualizations within these cards lack Y-axis boundaries, scale indicators, or quantitative change-delta labels, rendering them decorative rather than analytical \[User Critique\]. Furthermore, the Staff Health card functions as a simple headcount tool rather than tracking shift-readiness patterns \[User Critique\].  
The Manager Insights panel features an empty state at launch, which can signal a lack of product utility to trialing users \[User Critique\]. The training progression line chart also lacks numeric indicators and tooltips, presenting flat data curves that fail to reflect active venue training engagement \[User Critique\].

### **The Venue Manager Filter**

A venue manager preparing for a busy weekend service must balance shift requirements against immediate regulatory risks.1 The current console layout fails to connect training progression with key business outcomes \[User Critique\].  
To demonstrate clear financial value, the system must link performance metrics, such as SBE's baseline 38% upsell performance, directly to typical venue check sizes (modeled around an industry average of AUD $45).3 This calculation helps illustrate how incremental improvements in upselling can lead to measurable increases in weekly revenue.8  
The primary limitation of the current dashboard is the absence of a live connection between scheduled rosters and individual staff training records, leaving managers exposed to compliance gaps during busy shifts.5

### **The Simplicity Fix**

The visual layout of the dashboard can be simplified and improved without introducing unnecessary elements:

* **Urgency-Tiered Borders:** Accentuate metric cards with vertical left borders using a semantic system: Crimson Red (\#E11D48) for critical issues, Warm Amber (\#F59E0B) for warnings, and Forest Green (\#16A34A) for compliant states \[User Critique\].  
* **Trend-Indicator Chips:** Replace decorative sparklines with compact delta badges (e.g., ↑ \+12% vs last week) rendered in semi-transparent backgrounds to reduce visual noise \[User Critique\].  
* **Active AI Recommendations:** Pre-populate the empty Manager Insights widget with an active recommendation engine using existing telemetry: *"Your bartenders score 18% lower on premium spirits scenarios than floor staff. Tap 'Assign' to push the Gin Pairing Module before tonight's shift."* 9

### **Elite Power Additions**

#### **Power Addition 1: The Shift Readiness Scorecard Widget**

The central feature of the updated Overview dashboard is the Shift Readiness Scorecard. This widget integrates the scheduled roster with staff compliance profiles and training history to compute a real-time readiness index before every service.5  
The composite Floor Readiness Score (![][image1]) for a rostered shift is calculated as:  
![][image2]  
Where:

* ![][image3] represents the total number of scheduled staff members for the upcoming shift.  
* ![][image4] represents the absolute legal compliance state of staff member ![][image5] (e.g., holding a valid state RSA).1  
* $T\_i \\in $ represents the role-specific training completion percentage of staff member ![][image5] for assigned modules.9  
* ![][image6] represents the availability and engagement confirmation status of staff member ![][image5].5  
* ![][image7], ![][image8], and ![][image9] represent normalized weights assigned to compliance, training, and operational availability, respectively (![][image10], ![][image11], ![][image12]), highlighting that regulatory compliance is the primary operating constraint.

This widget displays rostered staff in an interactive table, color-coding operational risk levels:

| Rostered Staff | Scheduled Role | RSA Certification Status | Training Status | Shift Readiness Status |
| :---- | :---- | :---- | :---- | :---- |
| **Mitch** | Shift Supervisor | Valid (NSW Competency) 6 | Mastered (91% Avg) 3 | ● Ready |
| **Cam** | Bartender | Valid (VIC Refresher) 6 | Incomplete (0% Upsell) \[User Critique\] | ◐ Caution |
| **Emmet** | Floor Attendant | Expired (NSW RSA) 6 | Incomplete (Service Recovery) | ○ At Risk |

#### **Power Addition 2: The 30-Day Revenue Impact Projection Banner**

This feature translates training completion rates directly into potential financial returns.8 By using real-time venue variables, such as active seat counts and average check sizes (modeled around the standard AUD $45 baseline), the system projects the revenue lift generated by completing active-recall upselling modules.3  
The banner sits directly below the main KPI grid, demonstrating clear financial returns for Boutique (up to 15 seats) and Commercial (up to 35 seats) venue layouts 8: *"Increasing team training completion to 80% is projected to generate an additional $2,340 in weekly revenue through upsells."* 3

### **Visual Polish Diagnostics and Feature Injection**

| Target Component | Current Layout Deficit | Specific CSS/UI Adjustment | Proposed Feature Addition | Complexity |
| :---- | :---- | :---- | :---- | :---- |
| **KPI Card Grid** | Uniform 2x2 grid with unranked visual weight; decorative sparklines \[User Critique\]. | Apply grid-cols-12 and set hero metrics to col-span-4. Add vertical color-coded borders.11 | Add interactive tooltips displaying rolling 7-day trend differentials \[User Critique\]. | Low |
| **Manager Insights** | Empty card state at launch; static placeholder text \[User Critique\]. | Convert static panel into a dynamic container with standard padding and a clear layout structure.11 | Integrate an AI recommendation engine that triggers action paths based on real-time team performance.9 | Medium |
| **Training Chart** | Flat line chart lacking axes, tooltips, or progression markers \[User Critique\]. | Implement SVG line graphs with custom borders, responsive grid layouts, and active point indicators.11 | Add a historical comparative toggle (e.g., Last 14 Days vs. Prior Period) \[User Critique\]. | Medium |

## **2\. Staff, Teams, and Dynamic Skill Matrixing**

### **The UX Critique**

The primary directory table within the Staff tab (StaffRosterPanel.tsx) suffers from layout imbalances.13 Approximately 30% of the horizontal row width is allocated to the Contact column, which primarily displays standard placeholder emails, leaving limited space for performance-related data.13  
The "Module Mastery" column features an unlabelled 4×5 grid of colored dots that lacks clear tooltips or a structural legend, preventing quick on-floor evaluation.13  
In the Teams interface, performance indicators are rendered as flat, uniform text rows that resemble invoices rather than dynamic team comparison tools \[User Critique\].  
On the Roles and Permissions page, the top-level cards feature unpopulated metrics, which can make the interface look unfinished to new managers \[User Critique\]. Furthermore, the "Bulk assign" button is styled as a secondary action, reducing the visibility of a high-value workflow \[User Critique\].

### **The Venue Manager Filter**

Hospitality group operators manage dynamic rosters subject to the Fair Work Act's strict regulatory boundaries.14 The manager console must account for these complex operational realities:

* **The Restaurant Industry Award 2020 (MA000119) Compliance:** The system must track part-time guaranteed hours, enforce minimum daily shift lengths (3 hours for part-time, 2 hours for casuals), and flag potential overtime penalties when shifts exceed 11.5 hours in a single day.2  
* **Late-Night Loading Calculations:** Roster management must account for flat dollar-per-hour late loadings ($2.81/hour from 10:00 PM to midnight, and $4.22/hour from midnight to 6:00 AM) to optimize labor spend.2  
* **Junior Rate Adjustments:** The system must automatically trigger adult pay rate alerts for junior staff members as soon as they are rostered to serve alcohol, preventing underpayment liabilities.17  
* **Roster Modification Safeguards:** In accordance with Australian employment law, any unilateral roster changes require a minimum of 7 days' written notice.15 The platform must flag immediate shift changes and prompt managers to secure written staff consent to protect the venue from unfair dismissal or breach-of-award claims.19

### **The Simplicity Fix**

The directory layout can be optimized by restructuring high-priority information:

* **Contact Column Reduction:** Reduce the horizontal width of the email column by replacing text strings with a single interactive mail icon and tooltip, reclaiming 20% of the row space for performance indicators \[User Critique\].  
* **Visual Status Identifiers:** Replace text-heavy status badges with highly visible Readiness Pills: ● Ready (emerald), ◐ Caution (amber), and ○ At Risk (crimson) \[User Critique\].  
* **Inactivity Warnings:** Highlight long periods of staff inactivity using red and amber warnings (e.g., "Last Active: 58d ago" in bold red) to flag potential turnover risk or outdated product knowledge \[User Critique\].

### **Elite Power Additions**

\+--------------------------------------------------------------------------------+  
|  SKILL COVERAGE MATRIX                                       |  
\+--------------------------------------------------------------------------------+  
|  Staff Member  |  RSA Cert  |  Cocktail Lib  |  Table Upsell  |  Complaints   |  
\+----------------+------------+----------------+----------------+---------------+  
|  Mitch         |  \[  OK  \]  |  \[Mastered\]    |  \[Mastered\]    |  \[Mastered\]   |  
|  Cam           |  \[  OK  \]  |  \[In Progress\] |  | |  
|  Emmet         |  |  \[Mastered\]    |  \[In Progress\] | |  
|  Heather       |  \[  OK  \]  |  \[Mastered\]    |  \[Mastered\]    |  \[In Progress\]|  
\+--------------------------------------------------------------------------------+  
|  Coverage Gap: 0 bartenders trained in Cocktail Lib rostered for Friday Night. |  
\+--------------------------------------------------------------------------------+

#### **Power Addition 1: The Skill Coverage Matrix View**

The primary Staff Directory can be upgraded with a toggleable Skill Coverage Matrix \[User Critique\]. This interface matches rostered staff against critical venue competencies \[User Critique\]. It uses color-coded cells to represent completion status: Completed (Green), In Progress (Yellow), and Not Started (Red).  
This matrix integrates directly with the platform's 5-dimension performance telemetry (Communication, Hospitality, Problem-solving, Professionalism, and Guest Experience), helping managers identify and address skill gaps before busy services.4

#### **Power Addition 2: The Engagement Velocity and Flight Risk Indicator**

By monitoring engagement trends, such as declining logins or incomplete scenario sessions, the platform can identify disengaged employees.5 This metric is highly valuable for hospitality venues, as up to 42% of FOH and BOH team members quit within their first 90 days.3  
Surfacing these patterns early allows managers to intervene, send re-engagement reminders, and reduce costly turnover.3

### **Visual Polish Diagnostics and Feature Injection**

| Target Component | Current Layout Deficit | Specific CSS/UI Adjustment | Proposed Feature Addition | Complexity |
| :---- | :---- | :---- | :---- | :---- |
| **Directory Table** | Imbalanced column layouts; Contact column uses 30% of horizontal row width.13 | Reduce the width of the email column. Convert status fields into compact visual elements \[User Critique\]. | Integrate dynamic sorting based on compliance status, performance score, or shift readiness \[User Critique\]. | Low |
| **Team Performance** | Team cards use simple text lists that look like invoice line items \[User Critique\]. | Convert metric lists into structured rows with consistent spacing and clear hierarchy \[User Critique\]. | Replace static metric rows with dynamic radar charts displaying team performance across core competencies \[User Critique\]. | Medium |
| **Roles & Permissions** | Unpopulated readiness metrics on top-level role cards \[User Critique\]. | Add loading states or pre-populate cards with team-wide averages to maintain visual structure \[User Critique\]. | Add a one-click "Bulk Assign" workflow that targets entire roles or specific skill gaps \[User Critique\]. | Low |

## **3\. Dynamic Training Pillars and Algorithmic AI Coaching**

### **The UX Critique**

The horizontal progress bars representing the training pillars on the Overview dashboard are visually uniform and lack priority hierarchy \[User Critique\]. A 0% completion rate in Core Compliance or Alcohol Service is displayed with the same visual weight as a minor shortfall in internal Wine Pairing modules, diluting urgent legal risks \[User Critique\].  
The badge system in the coaching drawer uses identical pill styles and muted tones across all levels, making it difficult to distinguish between basic achievements and full module mastery.9  
The leaderboards tab also suffers from low visual contrast; the filters use plain pill toggles with a single, static metric, making the interface resemble a basic spreadsheet rather than an engaging performance tool \[User Critique\].

### **The Venue Manager Filter**

Modern front-of-house staff demand interactive, gamified micro-learning tailored to 6-inch mobile screens.3

                       \+------------------------+  
                       |   SBE Scenario Engine  |  
                       \+-----------+------------+  
                                   |  
                     Scores 5 Key Skill Dimensions  
                     \- Communication  
                     \- Hospitality  
                     \- Problem-Solving  
                     \- Professionalism  
                     \- Guest Experience  
                     \+-------------+------------+  
                                   |  
                     \+-------------v------------+  
                     | GPT-4o-mini Evaluation   |  
                     \+-------------+------------+  
                                   |  
                     Generates Real-Time Feedback  
                     \+-------------v------------+  
                     |   AI Coach Dashboard     |  
                     \+--------------------------+

Managers require immediate, data-driven recommendations that suggest training based on active venue performance gaps, rather than relying on manual staff audits.9  
Furthermore, the console currently lacks visibility into the training catalog itself, omitting critical details such as estimated completion times and difficulty ratings \[User Critique\]. This information is essential for busy managers who need to balance training assignments with tight shift schedules.3

### **The Simplicity Fix**

The presentation of training metrics can be improved through targeted visual changes:

* **Pillar Progress Sizing:** Increase the progress bar height to 14px, display clear fractional completion counts (e.g., 3/14 staff), and apply automated visual thresholds: Red (\<30%), Amber (30% \- 70%), and Green (\>70%) \[User Critique\].  
* **Pillar Categorization:** Group training modules into distinct categories: Legal Certifications and Internal Standards \[User Critique\].  
* **Dual-Metric Leaderboards:** Upgrade the leaderboard table to display both effort (completion rate) and skill (average scenario score across communication, hospitality, and problem-solving), helping managers identify top performers.4

### **Elite Power Additions**

#### **Power Addition 1: The AI-Driven Coaching Queue**

The AI Coaching Queue converts passive performance alerts into actionable, one-tap decisions \[User Critique\]. Accessible from both the Mission Control dashboard and the Staff tab, this widget aggregates performance data and suggests targeted assignments.9

| Recommended Staff Member | Recommended Scenario | Triggering Performance Metric | Action Button |
| :---- | :---- | :---- | :---- |
| **Cam** | Upsell Mastery (3 min) 9 | Upsell score down 12% this week \[User Critique\] | \[Assign Now\] |
| **Emmet** | NSW RSA Refresher (10h) \[22\] | Certificate expiring in 14 days \[User Critique\] | \[Assign Now\] |
| **Heather** | Wine Story Selling (5 min) 4 | Wine sales below venue average 9 | \[Assign Now\] |

This system connects training directly to venue ROI by matching learning modules with live performance gaps, helping managers build a highly capable and compliant workforce.3

### **Visual Polish Diagnostics and Feature Injection**

| Target Component | Current Layout Deficit | Specific CSS/UI Adjustment | Proposed Feature Addition | Complexity |
| :---- | :---- | :---- | :---- | :---- |
| **Progress Bars** | Narrow 8px progress bars with uniform, muted colors \[User Critique\]. | Increase bar height to 14px. Implement responsive semantic color thresholds based on completion \[User Critique\]. | Add text layers showing fractional completion (e.g., 3/14 staff) \[User Critique\]. | Low |
| **Mastery Badges** | Badge designs use identical shapes and colors across all achievement tiers.9 | Create distinct visual styles for badges based on difficulty and progression tiers \[User Critique\]. | Add a public recognition card builder that lets managers share achievements \[User Critique\]. | Low |
| **Leaderboard** | Simple table displaying only a single completion metric per row \[User Critique\]. | Add horizontal grid borders, padding, and subtle hover interactions.11 | Display dual-metric rows showing both module completion and average scenario score \[User Critique\]. | Medium |

## **4\. Compliance Auditing and Risk Remediation**

### **The UX Critique**

Currently, SBE lacks a dedicated compliance workspace. Essential legal certifications (such as the Responsible Service of Alcohol) are combined with internal training standards in a single, basic overview widget \[User Critique\].  
This is a critical product gap; legal and financial liabilities must be managed with higher priority than general service training \[User Critique\].  
The existing dashboard also lacks clear tracking for certificate expiration dates or verification of physical document storage, exposing venues to severe regulatory penalties.6

### **The Venue Manager Filter**

In highly regulated markets like Australia, non-compliance with liquor and food safety laws carries severe legal and financial consequences.1

#### **Australian Legal Requirements**

* **RSA (SITHFAB021) Mandates:** In NSW, RSA competency cards expire every 5 years and require official Liquor & Gaming NSW refresher courses.6 If a card is expired for more than 28 days, the employee must repeat the full training course.6 In Victoria, certificates do not expire, but staff must complete refresher courses every 3 years.1 In Western Australia, Queensland, and South Australia, qualifications do not formally expire, but regular refresher training is strongly recommended.1  
* **Financial and Operating Penalties:** Rostering staff without a valid RSA can result in individual and venue fines of up to $11,000 per offense, along with liquor license demerit points that increase annual renewal fees for 3 years or lead to license suspension.6  
* **Food Safety Supervisor (FSS) Mandates:** NSW, Victoria, Queensland, and South Australia require food businesses to appoint a certified Food Safety Supervisor.26 NSW FSS certificates must be renewed every 5 years, with a strict 30-day grace period to appoint a qualified successor.7 Crucially, venues must keep a physical copy of the FSS certificate on-site for immediate inspection.7

### **The Simplicity Fix**

The presentation of compliance metrics can be improved through targeted visual changes:

* **The Legal vs. Operational Separation:** Split the compliance dashboard into two separate categories: **Legal Certifications** (incorporating RSA, Food Safety, and state licenses) and **Operational Standards** (covering internal venue checklists and service reviews) \[User Critique\].  
* **The Crimson Border Rule:** Ensure that if any legal certification drops below 100% compliance, the entire module card displays a prominent red border \[User Critique\]. Average performance scoring must never be used to mask individual compliance failures.

### **Elite Power Additions**

#### **Power Addition 1: The Compliance Command Centre Dashboard**

A dedicated **Compliance Command Centre** (tab=compliance) must be introduced as a core page in the manager console, structured into three functional areas:

##### **1\. Certification Registry Table**

A comprehensive compliance tracking table designed to manage and verify staff credentials.

| Staff Member | Certificate Type | State Jurisdiction | Expiration Date | Days Remaining | Verification Status | Actions |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Mitch** | RSA (SITHFAB021) | New South Wales | 12 Nov 2028 | 868 Days | Approved (Digital Card Verified) |  |
| **Cam** | RSA (SITHFAB021) | Victoria | 14 Jul 2026 | 16 Days | Pending Review | \[Verify\] |
| **Emmet** | RSA (SITHFAB021) | New South Wales | 10 Jun 2026 | Expired | Non-Compliant |  |
| **Heather** | Food Safety Supervisor | Queensland | 18 Aug 2029 | 1,146 Days | Approved (On-Premises Copy) |  |

##### **2\. The 90-Day Compliance Timeline**

A visual calendar mapping out all upcoming certification expirations. This allows group managers to organize group renewal training sessions and manage training costs effectively \[User Critique\].

##### **3\. Audit-Ready PDF Export Engine**

A single-click export tool that generates a verified compliance report containing all active certifications, verification hashes, and on-premises storage statuses, formatted for immediate submission during licensing audits.7

#### **Power Addition 2: Smart Compliance Alerts with Severity Escalation**

To protect venues from compliance violations, the platform must implement a three-tiered escalation system \[User Critique\]:

* **Level 1 (30 Days Out):** Sends automated push and email notifications to the employee and manager: *"Your NSW RSA expires in 30 days. Complete the refresher to remain on the roster."* 23  
* **Level 2 (7 Days Out):** Displays a prominent warning banner at the top of the Mission Control dashboard \[User Critique\].  
* **Level 3 (Day of Expiration):** Automatically blocks the employee from being rostered on any alcohol-service shifts within the Shift Readiness Scorecard, protecting the venue from compliance violations.6

### **Visual Polish Diagnostics and Feature Injection**

| Target Component | Current Layout Deficit | Specific CSS/UI Adjustment | Proposed Feature Addition | Complexity |
| :---- | :---- | :---- | :---- | :---- |
| **Compliance Card** | Passive presentation; mixes legal requirements and internal standards \[User Critique\]. | Separate legal and operational metrics. Use crimson borders for incomplete states \[User Critique\]. | Add a "Next Expiry" warning row that highlights the next approaching deadline \[User Critique\]. | Low |
| **Roster Control** | Roster allocations lack validation checks against staff certifications.5 | Add warning flags to staff roster selectors when certifications are expired or missing.6 | Implement automated scheduling blocks that prevent non-compliant staff from being rostered.6 | Medium |
| **Document Vault** | SBE does not verify if physical copies of FSS certificates are stored on-site.7 | Add document upload containers with verification flags and on-site storage confirmation prompts.7 | Add an in-app verification tool that lets managers review, flag, and approve uploaded credentials.13 | Medium |

## **5\. Cross-Cutting System Recommendations**

### **Navigation Restructuring**

The sidebar navigation currently displays five ungrouped categories: WORKSPACE, PEOPLE, PERFORMANCE, AI COACH, and ADMIN.13 This structure can create unnecessary cognitive load during busy shifts \[User Critique\].  
The console navigation should be consolidated into three logical groups:

* **Command:** Incorporating the Overview Dashboard \[User Critique\].  
* **People:** Consolidating Staff, Teams, Roles, and the new Compliance page \[User Critique\].  
* **Performance:** Housing Analytics, Reports, Leaderboards, and the AI Coach.13

This organization provides a more intuitive workflow and places the critical Compliance registry alongside staff management \[User Critique\].

### **Global Venue Health Score Elevation**

The "Venue Health Score" is a high-value metric that aggregates training progress, active engagement, and compliance status into a single score.9 Currently, this score sits at the bottom of the Overview tab, reducing its visibility \[User Critique\].  
The Venue Health Score should be elevated to a prominent position in the top navigation bar next to the venue switcher, acting as an operational "Credit Score" \[User Critique\]. This persistent placement helps managers track overall venue health across busy shifts and multi-site locations.9

\+--------------------------------------------------------------------------------+  
|  THE ANCHOR  |  \[Command\]\[People\]\[Performance\]  |  VENUE HEALTH: 78/100 \[\!\]  |  
\+--------------------------------------------------------------------------------+

## **6\. Implementation and Priority Framework**

This priority matrix maps the proposed feature additions, UI adjustments, and complexity ratings against state-specific compliance requirements and Fair Work award constraints.2

| Dashboard Area | Specific Recommendation | Target Interface / Codebase URL | Design Impact | Engineering Complexity | Regulatory & Compliance Alignment |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Overview** | **Shift Readiness Scorecard** | ManagerControlCenter.tsx 13 | 🔴 Critical | Medium | Aligns scheduled roster hours with active training status.5 |
| **Overview** | **Urgency Color-Tiering** | ManagerControlCenter.tsx 13 | 🔴 Critical | Low | Highlights active compliance and operational risks on-screen \[User Critique\]. |
| **Overview** | **Revenue Impact Integration** | ManagerControlCenter.tsx 13 | 🟡 High | Low | Displays performance ROI directly on the dashboard.3 |
| **Staff** | **Readiness Pills & Aging** | StaffRosterPanel.tsx 13 | 🔴 Critical | Low | Identifies inactive staff and potential turnover risk early.3 |
| **Staff** | **Skill Coverage Matrix** | StaffRosterPanel.tsx 13 | 🟡 High | Medium | Tracks venue skill coverage against assigned roles.9 |
| **Staff** | **Flight Risk Indicator** | StaffRosterPanel.tsx 13 | 🟡 High | Medium-High | Reduces costs by flagging disengaged staff early.3 |
| **Training** | **AI Coaching Queue** | ManagerControlCenter.tsx 13 | 🟡 High | Medium-High | Suggests targeted training based on active performance gaps.9 |
| **Training** | **Progress Bar Thresholds** | ManagerControlCenter.tsx 13 | 🟡 High | Low | Improves scannability of team-wide training metrics \[User Critique\]. |
| **Training** | **Dual-Metric Leaderboards** | /components/Leaderboards.tsx | 🟢 Medium | Low | Evaluates both completion rate and scenario score.4 |
| **Compliance** | **Compliance Center Page** | tab=compliance 13 | 🔴 Critical | Medium | Centralizes state-specific RSA and FSS registry tracking.6 |
| **Compliance** | **Severity Escalation Alerts** | /api/compliance/alerts | 🔴 Critical | Medium | Protects venues from compliance violations and demerit points.6 |
| **Global** | **Venue Health Navigation** | WorkspaceHeader.tsx 13 | 🟡 High | Low | Displays overall operational health inside the header \[User Critique\]. |
| **Global** | **Navigation Restructuring** | ManagerControlCenter.tsx 13 | 🟢 Medium | Low | Reduces cognitive load by grouping menu categories \[User Critique\]. |

#### **Works cited**

1. Does an RSA Certificate Expire? (State-by-State Guide) \- Hospitality Courses Australia, accessed on June 28, 2026, [https://hca.edu.au/rsa-certificate-expiry-validity/](https://hca.edu.au/rsa-certificate-expiry-validity/)  
2. Restaurant Award Guide — MA000119 Complete Reference (2026) \- Fitz HR, accessed on June 28, 2026, [https://fitzhr.com/restaurant-award-guide](https://fitzhr.com/restaurant-award-guide)  
3. Built for venue owners, operators and hospitality groups., accessed on June 28, 2026, [https://servebyexample.co/for-venues](https://servebyexample.co/for-venues)  
4. Serve By Example | Train Hospitality Staff 3x Faster, accessed on June 28, 2026, [https://servebyexample.co/](https://servebyexample.co/)  
5. Frontline Hiring Moves From Offer Letter to First Shift \- Gene Dai, accessed on June 28, 2026, [https://digidai.github.io/2026/04/16/frontline-hiring-control-plane-first-shift-readiness/](https://digidai.github.io/2026/04/16/frontline-hiring-control-plane-first-shift-readiness/)  
6. RSA Laws \- Job Trainer Australia, accessed on June 28, 2026, [https://www.jobtraineraustralia.edu.au/blogs/2026/04/rsa-laws](https://www.jobtraineraustralia.edu.au/blogs/2026/04/rsa-laws)  
7. Food Safety Supervisors (FSS) \- NSW Food Authority, accessed on June 28, 2026, [https://www.foodauthority.nsw.gov.au/retail/fss-food-safety-supervisors](https://www.foodauthority.nsw.gov.au/retail/fss-food-safety-supervisors)  
8. Simple plans for individuals and venue teams. \- Serve By Example | Train Hospitality Staff 3x Faster, accessed on June 28, 2026, [https://servebyexample.co/pricing](https://servebyexample.co/pricing)  
9. Train Hospitality Staff 3x Faster \- Serve By Example, accessed on June 28, 2026, [https://servebyexample.co/platform](https://servebyexample.co/platform)  
10. Fortress WFMS \- App Store \- Apple, accessed on June 28, 2026, [https://apps.apple.com/us/app/fortress-wfms/id1548033896?l=zh-Hans-CN](https://apps.apple.com/us/app/fortress-wfms/id1548033896?l=zh-Hans-CN)  
11. Bento Grid Dashboard Design: Complete Guide 2026 \- Orbix Studio, accessed on June 28, 2026, [https://www.orbix.studio/blogs/bento-grid-dashboard-design-aesthetics](https://www.orbix.studio/blogs/bento-grid-dashboard-design-aesthetics)  
12. Designing Bento Grids That Actually Work: A 2026 Practical Guide \- SaaSFrame Blog, accessed on June 28, 2026, [https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide](https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide)  
13. StaffRosterPanel.tsx  
14. Restaurant Industry Award 2020 \[MA000119\] \- Fair Work Ombudsman, accessed on June 28, 2026, [https://awards.fairwork.gov.au/MA000119.html](https://awards.fairwork.gov.au/MA000119.html)  
15. Rostering disputes: prevent Fair Work complaints | RosterElf Blog, accessed on June 28, 2026, [https://www.rosterelf.com/blog/rostering-disputes-fair-work](https://www.rosterelf.com/blog/rostering-disputes-fair-work)  
16. Simple Guide for the Restaurant Industry Award \[MA000119\] \- Employment Hero, accessed on June 28, 2026, [https://employmenthero.com/resources/restaurant-industry-award/](https://employmenthero.com/resources/restaurant-industry-award/)  
17. Restaurant Industry Award \- Fair Work Ombudsman, accessed on June 28, 2026, [https://www.fairwork.gov.au/find-help-for/fast-food-restaurants-cafes/restaurant-cafes-industry](https://www.fairwork.gov.au/find-help-for/fast-food-restaurants-cafes/restaurant-cafes-industry)  
18. Working Hours, Rosters and Public Holidays \- What International Students Need To Know, accessed on June 28, 2026, [https://cht.edu.au/news/working-hours-rosters-public-holidays-hospitality/](https://cht.edu.au/news/working-hours-rosters-public-holidays-hospitality/)  
19. Employee Refusal of New Workplace Roster – Notice Periods & Legal Rules \- DreamstoneHR | Creating People Solutions for your business, accessed on June 28, 2026, [https://dreamstonehr.com.au/blog/employee-refusal-of-new-workplace-roster-notice-periods-legal-rules/](https://dreamstonehr.com.au/blog/employee-refusal-of-new-workplace-roster-notice-periods-legal-rules/)  
20. Can My Boss Change My Roster? Your Rights Explained \- FairWork Mate, accessed on June 28, 2026, [https://fairworkmate.com.au/blog/can-boss-change-roster-rights](https://fairworkmate.com.au/blog/can-boss-change-roster-rights)  
21. Can My Employer Change My Roster Without Asking? Roster Change Rights Australia 2026, accessed on June 28, 2026, [https://fairworkmate.com.au/blog/can-employer-change-my-roster-without-asking](https://fairworkmate.com.au/blog/can-employer-change-my-roster-without-asking)  
22. Renewing Your RSA Certification: When, Why, and How? \- Access All Areas Training, accessed on June 28, 2026, [https://www.accessallareastraining.com.au/news/renewing-your-rsa-certification-when-why-and-how](https://www.accessallareastraining.com.au/news/renewing-your-rsa-certification-when-why-and-how)  
23. Responsible Service of Alcohol (RSA) training \- NSW Government, accessed on June 28, 2026, [https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/training/rsa](https://www.nsw.gov.au/business-and-economy/liquor-and-gaming/training/rsa)  
24. Demerit points and star ratings for licensees \- Victorian Government, accessed on June 28, 2026, [https://www.vic.gov.au/demerit-points-and-star-ratings-for-licensees](https://www.vic.gov.au/demerit-points-and-star-ratings-for-licensees)  
25. Food Safety Supervisor Certificate Renewal NSW | Available Online | AIFS, accessed on June 28, 2026, [https://www.foodsafety.com.au/courses/nsw-recertification](https://www.foodsafety.com.au/courses/nsw-recertification)  
26. How Long Does a Food Safety Supervisor Certificate Last?, accessed on June 28, 2026, [https://www.aia.edu.au/how-long-does-a-food-safety-supervisor-certificate-last/](https://www.aia.edu.au/how-long-does-a-food-safety-supervisor-certificate-last/)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAaCAYAAABCfffNAAABSUlEQVR4Xu2VQStEYRSGjwk1KyPZSGwZ9iykbGxZyA+wldjZ2bCwkIWFbNlJyY7CLxC2UiI/QKGUhXhP53zmm7ebGt+nLOapp+a+73TuzL3nzog0+e90w88ffIAb4c0ptMNFsaGHsA12wEH44vnQ97sTuBYb1kO5foAP75KoiA264QL0S+3SJaHXXIfMcAHOxbo5LhrlUmyQLgETvkULF40SBp3BU3jhx/diC5AFHaj3JObK8zLlzCPchV1cxITnRLcrZtnzScpjSnAbHsAR6urYERs2RfmR5/OUx6zBYQ6LuBW7VJ2UP4mdZJbymBPYyiGja6mDNrmQ2jKM+vFK1OmmDYj1VX9dyJvYT8YzfIXvUv+0j3l3B9fhVtQF9CTJ9MJVsftWBG9kdvT52eMwNxNwgcPc7HOQk3HYJ/Zn9mcswWM4zUWTX/MFRCJNEsTGgRcAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAYAAABVX2cEAAAA8UlEQVR4Xu2TPQoCMRCFH/4fQETwGIIonkIrsfA2grWFlaC9YC0K4gG0sbGytFIs/CsEfyZOlk3GjQh2sh88yMxLHmGyC4T8SoH0EJJsYfsV27ZJkZpwh8VIM7BXtq131OYTqQ8+0LJcZkrqyWYQRdKdlAeH7cC3NTmTGqIXyIjU1us6OHDh2y/WonZyJFX1Oo7g2XVF7WQp6is4LKtrNYacb7tRw/du5VECh210PTa8j6iDadkk5uDABHj4XzGRDU0SHDYkrYTn5CIbBt5DdKQRRIS0l02DATgsIw2TKHgO6pM4kG6kmrXDR/1mISH/wxPc5TX+ZwvzTgAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAaCAYAAABIIVmfAAADjUlEQVR4Xu2ZWahOURTH/2bKEDJkTPLgSUIKKfOUSMns5kGGUqSU8mSMEkUyZCwvQjIUkqEowwNliFBKmccQIax/y+bcZZ/v7HO+417l/Orf7a7//s63z177nL32/oCCgoKCgjLYJ/ok+mCNKqRC9F10QTTSeJloCb0hXvScaI5oo+iGqIPo4++m1cpB0XVRPWv8pLPogOiKaILxssAxWGSDEfZAx6yZNdIwSfRC9Ew0xXjnRXegX/Iv8Bg6KHG8gU6eMaJvolOV7WB6i1ZB73uz8aL0h7bpY41QpkIvsM4aEQ6L7tpgRlqIWkdUq7KdCAd4pQ3+hIPNwXfUEd3Dn5Mqidmi5tC+JiWAiWKbwdYI5YvorKi2iUdZLdpqgymZLzoK7WxUM6KNAngnWm6DQhfojG9v4ptEJ00slJAE9IK2GWqNEI4h7NUyDzpbs9BE9MgGy4Br0TIbFC7Cfy9z4Y+HEJKA7tA2I6yRRE/oB0MW17E2kILd0Mc5Lz6Lltqg8Bz+ga6APx5CSAK6QduMskYSX6EfHG+NHHmA0hVEWjpC+8wF1sK4b6BZYPjiIbgEbLFGhFbQSbHYGknEdTgElnd8tSRxTdQwQTV+tS7NTGh/WYb6cBPKMhn+eAguAUnrHxd7tuOrtofxYglNAN//doXn50JqbPcdpTT9V+t4+kHbcjbH8RT++5kGfzwEl4Bt1vDAMjSuD17cACRx2QZSwI1dIxssg5uI7zMrHZ+3AP54CC4B261hmAVdS/taoxT3oRevb40InZBhcYlwG/oE5UVXaJ8HWQNa5tJrbOLcM7w1sVBcAnZYIwInGGd+6jWggegStK72cVW038R2QRPmq8N91ISWuvyuvIirgsgJ0drI/xxAbtyGRWIV0EHlvSfhErDTGhFcFZT5PGgFfr+OToueQHe+cbAiaGeDCawRHRFNFDVFeQl5D/8+wPEQej7DzSM3Zusr22gLTRSvM9B4jluil9CjGc5u/n0FPTWwcNHl2A2xRhpYii6BDhTfZ3Fw4DijssCZyWMBl2ynvHbCDlZVC6HnRaUmChMVfTKy4nbCccnMFZ61vBYNhx5UVQecmZwo5cKnPQ9Y/TABrNT+OnwU94oOId/dbRp4GrrBBlPCY5W8NqDuNJSHclVCGxuoYgZAb/i4NQKpCz2gywP+BuBepf8VZ6ClJX+nqC7GQRd5ltqjjVdQUFBQUODlB0Uu3LAZzhjPAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAaCAYAAAB7GkaWAAAAdUlEQVR4XmNgGBxgOhDLoQuCgBMQ/wfiBjRxMGAGYmF0QaIAI7oACGgA8V4gfoQuAQLzoPQPII5BltBBYoNcihXwMeCRPAzEG9EFQUCZAaIrCIilgbgUWRKkC2bkCyBWRZJjUADi60D8Eoh5kCWQAci/Iw4AAHbMENrWLTKhAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGEAAAAaCAYAAACn4zKhAAADSklEQVR4Xu2YW6gOURTHl/vlEHKXy4OklAeXPJA6D54UyrOUPPLEA/KgPFCUPAiliFKEUO7CecKDTqGUSxyE3O+Xksv6t/aYmTV7Zvbsme9zZH717zvnv+bbl2/N7L32ENXU1NT8U/RgLdRmJ6E36w3rF+syq2883BS6sq6SjGE7a0A8XA1fSTrojGBcE7UZYSlrN+swVZOgI9pQvKcG/VZotCENV0DWuEaxPrPWsVaxHrBmxq5wA8lbxrrFuq9imvOUPSYvblNjkzCYNSKioqSNay0lY7ssngvzzOd1yk/CCfLrI5NXVH0S+rMWs55S2LZvH2nf6aBkbIHxfJcllyQcp2S/pThAsuncJWl4TDzsxUaSpaGbDniSNmFbUscbb6vyXXFJAvYM3a83rawf5m9UHWh42p+oP5+0UZK0CduSMNJ4eZtrGi5JQAGg+/UGZd8Q8/cekoaXhGEv0E6V4ClNm7AtCdh/4N1QvisuSdhC0scgHSjKXpIJBqwhaRgdaLqw5mrTAur576x+OXIBe8p+kjHNUbEAWxJwU8FrV74rSEKHNi1MJ+nnNHkmYxbrJ+sC6xzrLOsOSaOYuGY+JSdrYzKFP0yW8kDSv5Fcu1PFotjaG2Y8zMsHJOGhNlPYRtJXsKQXAocNXSpOJWnwpvKL0JP1Tpsl2cd6q02DLQmTjLdJ+a4gCY+0qcA877FOsrqrmBPDWSu0yYwlGfwLHSjIDm2UBK9T9A8dYEtCq/Hw6QOS8FibipUkfbTogCt60FFQ1SA+2vw/gXWNdYl1JbjIgdfaKEnamFeTxKJ720XjRcHSCw9LVR5IwhNtKg5Rsg8ncLT/wPpC8p4IpVxAG0kCEMcn1mN4symsThaZa11B5YUEYp8YSnJH+5I14V4k8TMkhyjcMPqsg1M0bowNyo+Ceb9kPTfCivAxdkXIUcoeU0PAHlL0BIok404N7sKoipL3nXEkpfVykk09jc3a8KTyE3MeeD+DF2IDdaCJVDFhLK1Fb6Q0TlE1Y3LmoPlcH3ObS9kJY0lt02YJUP6WHVNh8Lj/TZ6RVCwzdMARPM04XFXBFJIEYEz/FTjToGLB5FGZ9ImHmwKepmMkY0AZ7lJp1dTU1NTUJPgNJmjdKdFdyTcAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAaCAYAAACzdqxAAAAA+0lEQVR4XmNgGAWjYPgBJnQBNMAMxFLogviAGhDvAOKn6BJAcAyJfR+IfyDxCYKVUPo9EJcgiTsA8X8k/js0Pl6ghcQGaUIOjkNAvB2JL8RAgsEwwMKAqokTiH8CcTmSmDgDGQZPAOJXSPx6BoghIAthYBkQdyPxiQKngHgLEn8rA6br3gCxFZoYQbAJiI8j8T8woBrMAcQRSHwQmA/EelA2uiNQwEsgfsIACVs2IA5igGj4DMSLkNSBwHcg3ojEZ0diYwCQqzyAWAJJTAmIlZH4MACyMBFdkBoAZDDIITBghMSmCPwDYmcoG5T2TyDJUQxABqqiC46CIQ4AG10r8dAFfCoAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAaCAYAAABYQRdDAAABBUlEQVR4XmNgGAWjYOgBRnQBNMADxILogriAFhDvA+IHaOIgcBiI5aDsD0D8BEkOL1gIpX8BcSySeCoQ/wFiPij/HxD/R0jjBjpIbHQNT4G4B4nvx4CpBi/gYEDVoArl+yKJBQPxKyQ+ExDXIvExwGwgvonEX8CA6aoHDBDXwkA9A6YaFHAFiBch8a8yYGr4CsScSPy9DKguxwB7gHgrEh8UQciGKgKxCpQNSlqgFAOSb2BApA6s4B0QP2KApAJQmi1ggBh+DYirkdTBwBsGwmmbgQuI3YFYCEkM5CLkyIIBNiBehy5IKQC53BDKnoYsQQmYxABxLShjSKLJUQSU0AVGwRACAA1fLXUoOo5FAAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAbCAYAAACX6BTbAAABGElEQVR4XmNgGAWjYBRQBWgD8QEgvo8mDgIHgVgMyg4E4jtIckSBJ0BcD8RvGBAGgYAmEP8HYiMofweUTzSQBGJ1KBukURlJbiMQ70PigwBJhusisZE1MgHxOwaIj5ABSYbDQBgDqsZcKJ8DSQwEutH4RIHrQDwHiQ+KXHRX2jBAfEQyeArE5Uj8bwyYhi9C48sD8WIg3g/EVkAsgSqNAAlA/AXKVgDicwwQw0WhYteAOAXKBgEBID7FgPDJTiBmQ0hjgvdA/BCIf0P5VVA2yOA8mCIoKADiWCT+KyQ2RYAHiP8h8dMZIL5kRRKjCIDiCAbWMkB8WIQkRhEAZbZtQLwdiEMZIAkAPegoAipALARl8yFLjIJhCADMpjO/+3GPPAAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAAAaCAYAAAAtzKvgAAAC6UlEQVR4Xu2XS8hNURTHl/djIDEiE+9nIRGRiCJEJsqAwkCZMfEeUIqRvIrIY6I8yiuPPMvAK0MxkJEIyWsiEf7/u872rbPa99xzP/nu57Z/9e+7a62999lnffuxjkgikUgkEsX0ho5BZ6B1LlbEIWg11D2zJ0AHW8J/mAptg+5C+12saRkAPYG2QhuhL9DEXIvq/Mr0HfqU/V6Sa6H8hG5BS6Fr0J58uDlhMk5FfFyNtXgPPYUeQvugXvlwhc/QaOf7AQ1yvqaio2gSlzk/fVy5tTjnHRE4lucZtME7i+BEi2C8v3c2kJ2iLz7e+cMWr0WtxPaQ+DhnRY+Pnj7gGQZdhV77ALhnfr+Avhm70fAF+eLDnb/exK6ENkGdTYyMkfg4J0T9NY+D09nfD9B6458m+YF5JsUeVIaBouPzkiir7ZWe1XkkOh+ObSmbWLY5b+yPohdUYJ7Exzks6p/jA5ZR5jcbdzL2HeimsXm484ZsL9yW+Mopm1jPfNF+uzJ7emZ7joj6Z/lADCbUDtIN+gptNr4+En9Qo+BO43yGOH9rEztJtN/jzOaii41zVNQ/1gdi7Bbd6oEtop27GN9xaK+x62UwNKIOsfAvguci5zjZ+csk9qTofcE6ODBStF/Ig19sgYuifbv6QAzWcpeNzc5+0DfQDOcrC89BHiPhpcvoQKVndcaJtlvo/KF/ETxP2Wax8U3JfDeMLzbOA+iKd1bjgmhyA+HBAR4Ny41NuCXCdohNoC3gc3mJed8OYw/NfCz2A1zt/YxNrkPPJV9GvYMWGJtwrL7OV8hb6JXoMmciF4kOwmKbW8fC8/eSscP3dlvD5/JzkyuI8+F8fa3dQfS97H1B7kvLCuU7ciXG4LuyFOUx+BJakQ/XhpOcK/n/JLewvxwIJ8T6r72wClojWnvWAysBlk9rJV8RWbjIZopWC2z/T2Fi+WUS8F8/iVbCi2h29pufuv6cS/wFTCgvhkQikUgkEv87vwEcLr/tOi/4JQAAAABJRU5ErkJggg==>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAAAaCAYAAADG+xDjAAAC/UlEQVR4Xu2XW6iNQRTHl/ul5JYiIpcHlyJ58SCdJ5Hcbw8SkhQRkidFHiTkVoiUk3uhRC6JROIBKRGPeHBNLoXcrb81s8+adebb3961O2e3m1/9O3v9Z+Y7M2vmm5mPKJFIJBKJBgawTrPusuayWoTFRZnPus86zBpL2W03sG6x9hq/ZvnAWsaawvrNuhkWZ9KH9Ya1iLWd9Zd1OaghrGDdYM1hnWcdYLUOatQYV0gG7WnFesxaorwYo0mSeFZ5r5w3WXkfWX9UDL6zfhivZhhIMuD+xt/Gum08y0ySBP5S3kPnrVUe4ucqBvecXzKY6Tzw2lQDdyg+uAUU9y12/0QbqKuL27v4YqGGUO/8HsZvxCDWBdZrW0DhrD8i2beqgbcUT94sivt52JU71HmnlAf2OH+k8Rtxxv1FR9crfwSFHXxh4nLA/lSO5kmzTPzKsuDAivkxFlPDc/qZsgnOP2b8Hc6fbfwAzIgHlduo+BzJVcXTkvVFxc3JT4onbyrF/Tzek7Tr7OIxLj5eqCHsdP5040dBwnRnEGPFbFFeW9ZXFYODrA7GawqwVcWSh8HG/DzqSdrtd/FgF5/0FRy7nY97bS5bWZ9UvJKkcSfl4WQ9oWIkHpfiUkAny1FHaZYJ7pTonz1wcJ3KS2od6yjJIvH419239YvsWqGGgPHD72L8KDiQrqrYN9Y8pXAvwZ67UcXF8B0uVculWSa4n6JeN+OvY30zngUfDGiLLzCPP+D0mPEbVy0NcqTrFAWH1QMV42tDN8bMrVbxMJJVOpzCfbkpucTapWKsnncU7ncLScahv7T8Rb+X8vAseJuUZ3MAENstsCj4Zy9JZhqv3ziSh2BvxaGlGeXKmhtczo+wNpP0Z19Y/D9xuGtOM/4Mki8jLKYnJInSCfVMJNm/cUA9Yy0NSkugHWs8q7fy+rKGqNizhqojqdhTV5HcH9HXcsCKPkRyVnQ3ZZo6kjNnkvErzmfWdfcbHUtUAKxSXC/8bCcqRE9rJBKJRCKRqHL+AfKtzBDqSIjIAAAAAElFTkSuQmCC>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFcAAAAaCAYAAADCDsDeAAADAUlEQVR4Xu2YWahOURTHlylRkiFThgdkSimkSN3yQplfebjlwQsZukXxIERJknl6EVLGFB4IN4mSIV6kyFXGKFMyZPr/79qn1lnfd74p3723r/2rf/es/97nnP3ts/fae1+RSCQSiUQqYx10Gdrt/GKMg65Ct6GVriyhO7QIugOdgrqmi2ubZVAjtBA6D+2DOtgKGWyGvkEHoBvQX2h+qobyEPoKzYJWQc/SxbXLR+iP835CP5zn6Sc6yjsab4FoB78w3hrR0Wo5CB1xXk3Czmhy3v3gF2KOaJ3rxmsfPHtvE1RvYsJ7v0sZ6aHYNGoHDfRmK9NFtCOYCiwcVfR7Ot/SR3TEH3K+71xeTzAxGRr87c7PYTh0AXrtC8BNc/0I+mXitsAY0R95wvn7gz/W+Z4B3pD8nTvaxKR/8E87P4ckn7yD1hp/vKRf8tLFlfBANEeWqnt6WyYzRNt01Pk7g59vcSoEZwDvqzce42EmJr2Cz4UuE/tFWLmTiS9KeuSyjHmmLTFVtN3HnL8r+LOdX4i+kn/w0OPstvQOfrGP3wzzrX0w48/QJuMxvxVbgVuaUaLtPu78PcGf7Pws+Nu4z13hC0SfM8J5zNf0Lzk/L1uhDyZuEL3ZroY7oMMmrgTmqpFlaJDelkmyuvPwYGEOpt/N+Vl8gaaZeLm55nOmmJhwxtPf4vy83JL0V0gaZ3kKzXVeufAZfG6psvvNLFiPudzSGPxS2AhNdN5jc83nzDMxqQs+/xbljKTzBxc32zimiaUmJlz8JoXrUn9INXgrue9nzBNVAreRyQez/IaeiB5/r4me0l5Jut5q6K7oLElg/W0mLsob0R0BFy3moGQl/gSdNfUIG/DexL7RLc1M0a0kT1zPocXp4mbonzQxT15Jh3vZhZww7dDnGnRO9EOURWdouqT3fkNEc5+HL7J7vNbuXFIHbRA9/1cD9sVeaInoTKga7MwkJfQQ7egrUvhEFCkRdi7/A8XdBBfC9aKnvMh/gh2bTI/BtiASiUQikUiN8A+CesrJVgP0DwAAAABJRU5ErkJggg==>