/* ═══════════════════════════════════════════════════════════════
   config.js — D365 Practice Platform
   All environment-sensitive values and platform configuration
   live here. When Azure environment variables are wired in,
   this is the only file that needs to change.
   ═══════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ── SESSION SETTINGS ─────────────────────────────────────────
     SESSION_TOTAL is the ONE number to change.
     Acceptable values: 20 | 30 | 40 | 50 | 60
     Min: 20 (no case studies)  |  Max: 60 (full exam simulation)

     Verified totals — no overshoot:
       20 → MCQ:14  DD:6  CS:0   raw max: 360pts
       30 → MCQ:18  DD:9  CS:3   raw max: 532pts
       40 → MCQ:24  DD:12 CS:4   raw max: 710pts
       50 → MCQ:30  DD:15 CS:5   raw max: 888pts
       60 → MCQ:36  DD:18 CS:6   raw max: 1065pts
     All results scale to /1000. Future: user-overridable from profile.
  ──────────────────────────────────────────────────────────── */
  SESSION_TOTAL  : 20,   // ← 20 | 30 | 40 | 50 | 60
  SESSION_MINUTES: 25,   // ← 25 | 35 | 50 | 60 | 75
  PASSING_SCORE  : 700,
  MAX_SCORE      : 1000,

  /* ── QUESTION TYPE POINTS ───────────────────────────────────── */
  POINTS: {
    mcq      : 15,
    tf       : 12,
    dragdrop : 25,
    casestudy: 12.5
  },

  /* ── DERIVED — do not edit directly ─────────────────────────
     COUNTS and SCORE_MAX derive from SESSION_TOTAL automatically.
     Case studies excluded below 30 to avoid scenario overflow.
  ──────────────────────────────────────────────────────────── */
  get COUNTS() {
    const t  = this.SESSION_TOTAL;
    const dd = Math.floor(t * 0.30);
    const cs = t >= 30 ? Math.floor(t * 0.10) : 0;
    return { mcq: t - dd - cs, tf: 0, dragdrop: dd, casestudy: cs };
  },

  get SCORE_MAX() {
    const c = this.COUNTS, p = this.POINTS;
    return (c.mcq * p.mcq) + (c.dragdrop * p.dragdrop) + (c.casestudy * p.casestudy);
  },

  get SESSION_QUESTIONS() { return this.SESSION_TOTAL; },

  TYPE_WEIGHTS: { mcq: 0.60, tf: 0.00, dragdrop: 0.30, casestudy: 0.10 },

  /* ── TOPIC-SPECIFIC OVERRIDES ───────────────────────────────── */
  TOPIC_PROFILES: {
    sla: {
      minutes: 75,
      counts: { mcq: 25, tf: 10, dragdrop: 10, casestudy: 10 },
      weights: { mcq: 0.45, tf: 0.15, dragdrop: 0.25, casestudy: 0.15 },
      balance: { sla: 0.55, entitlements: 0.45 }
    }
  },

  /* ── LEAF TOPICS ─────────────────────────────────────────────
     Each maps to a question bank JSON file.
     locked: true  → shown on home but gated behind access.
  ────────────────────────────────────────────────────────────── */
  TOPICS: [
    { id: 'delegation', title: 'Delegation in Power Apps', icon: '⚡', desc: 'Delegable vs non-delegable functions, data source behaviour, performance implications.', file: 'Questions/delegation.json' },
    { id: 'archlimits', title: 'Architectural Limits', icon: '📐', desc: 'Platform limits, throttling thresholds, Dataverse capacity, API call limits, and design constraints for scalable D365 solutions.', file: 'Questions/archlimits.json', locked: true },
    { id: 'mdaconfig', title: 'Configure Data Model & UI', icon: '🧩', desc: 'Tables, columns, forms, views, site map, app components, Dataverse search, notifications.', file: 'Questions/mdaconfig.json', locked: true },
    { id: 'bpf', title: 'Business Process Flows', icon: '🔀', desc: 'Stages, branches, merge logic, workflows, action steps, entity limits, and BPF automation patterns.', file: 'Questions/bpf.json' },
    { id: 'cases', title: 'Cases & Case Management', icon: '📋', desc: 'Case lifecycle, resolution, merging, subject tree, routing rules, and case configuration.', file: 'Questions/cases.json' },
    { id: 'queues', title: 'Unified Routing & Assignment', icon: '📬', desc: 'Unified routing, workstreams, queues, classification, assignment, skills, overflow, diagnostics, and best practices.', file: 'Questions/unifiedrouting.json' },
    { id: 'sla', title: 'SLAs & Entitlements', icon: '⏱️', desc: 'Enhanced vs standard SLAs, KPI timers, pause/resume, schedules, entitlements, channels, templates, and support terms.', file: 'Questions/sla.json' },
    { id: 'knowledge', title: 'Knowledge Management', icon: '📖', desc: 'Article lifecycle, subject tree, search configuration, and linking articles to cases.', file: 'Questions/knowledge.json' },
    { id: 'rcrules', title: 'Record Creation & Update Rules', icon: '⚙️', desc: 'Automated case creation from email, inbound channels, conditions, and Power Automate integration.', file: 'Questions/rcrules.json' },
    { id: 'timeline', title: 'Timeline & Agent Experience', icon: '🕐', desc: 'Timeline control configuration, card forms, notes, highlights, and activity type display.', file: 'Questions/timeline.json' },
    { id: 'usermgmt', title: 'User Management & Security', icon: '👤', desc: 'Security roles, access levels, business units, teams, field-level security, and user administration.', file: 'Questions/usermgmt.json' },
    { id: 'powerfx', title: 'Power Fx Formulas', icon: '🔷', desc: 'Functions, expressions, and formula patterns in canvas apps.', file: 'Questions/powerfx.json', locked: true },
    { id: 'canvasui', title: 'Canvas App UI', icon: '🎨', desc: 'Galleries, forms, controls and layout patterns.', file: 'Questions/canvasui.json', locked: true },
    { id: 'automate', title: 'Power Automate', icon: '🔄', desc: 'Flow types, triggers, actions, and error handling.', file: 'Questions/automate.json', locked: true },
    { id: 'dataverse', title: 'Dataverse', icon: '🗄️', desc: 'Tables, relationships, security roles, and metadata.', file: 'Questions/dataverse.json', locked: true },

    // ── Solution Envisioning ──────────────────────────────────
    { id: 'sol-initiate', title: 'Initiate Solution Planning', icon: '🚀', desc: 'Kickoff activities, stakeholder alignment, project charter, and planning prerequisites.', file: 'Questions/sol-initiate.json', locked: true },
    { id: 'sol-eval-biz', title: 'Evaluate Business Requirements', icon: '📊', desc: 'Techniques for analysing and validating business requirements against organisational goals.', file: 'Questions/sol-eval-biz.json', locked: true },
    { id: 'sol-identify-components', title: 'Identify Power Platform Solution Components', icon: '🧩', desc: 'Mapping business needs to Power Apps, Power Automate, Power BI, Copilot Studio, and Dataverse.', file: 'Questions/sol-identify-components.json', locked: true },
    { id: 'sol-select-components', title: 'Identify and Select Components', icon: '✅', desc: 'Decision criteria for selecting platform components, licensing, and trade-offs.', file: 'Questions/sol-select-components.json', locked: true },
    { id: 'sol-migration', title: 'Migration and Integration Efforts', icon: '🔀', desc: 'Estimating migration complexity, integration patterns, data migration strategies, and effort alternatives.', file: 'Questions/sol-migration.json', locked: true },
    { id: 'sol-org-info', title: 'Identify Organisation Information and Metrics', icon: '📈', desc: 'Gathering KPIs, business metrics, org structure data, and success indicators.', file: 'Questions/sol-org-info.json', locked: true },
    { id: 'sol-current-state', title: 'Understanding Current State Business Processes', icon: '🗺️', desc: 'Process mapping, as-is analysis, pain point identification, and documenting current workflows.', file: 'Questions/sol-current-state.json', locked: true },
    { id: 'sol-org-risk', title: 'Assess Organisational Risk Factors', icon: '⚠️', desc: 'Risk identification, risk registers, change readiness, adoption barriers, and mitigation strategies.', file: 'Questions/sol-org-risk.json', locked: true },
    { id: 'sol-success-criteria', title: 'Review Key Success Criteria', icon: '🎯', desc: 'Defining measurable success criteria, acceptance criteria, and KPIs aligned to project outcomes.', file: 'Questions/sol-success-criteria.json', locked: true },
    { id: 'sol-existing-systems', title: 'Identify Existing Solutions and Systems', icon: '🔍', desc: 'Inventory of existing applications, integrations, data stores, and legacy systems.', file: 'Questions/sol-existing-systems.json', locked: true },
    { id: 'sol-enterprise-arch', title: 'Evaluate the Organisation Enterprise Architecture', icon: '🏗️', desc: 'Assessing technology landscape, architecture principles, governance standards, and enterprise strategy alignment.', file: 'Questions/sol-enterprise-arch.json', locked: true },
    { id: 'sol-data-sources', title: 'Identify Data Sources Needed for a Solution', icon: '🗄️', desc: 'Data source discovery, connector availability, data residency requirements, and volume/velocity assessment.', file: 'Questions/sol-data-sources.json', locked: true },
    { id: 'sol-data-quality', title: 'Define Use Cases and Quality Standards for Existing Data', icon: '📋', desc: 'Data profiling, data quality rules, cleansing requirements, and use case validation.', file: 'Questions/sol-data-quality.json', locked: true },
    { id: 'sol-capture-req', title: 'Capture Requirements', icon: '📝', desc: 'Workshop facilitation, user story writing, requirement elicitation techniques, and documentation standards.', file: 'Questions/sol-capture-req.json', locked: true },
    { id: 'sol-refine-req', title: 'Refine High-Level Requirements', icon: '🔧', desc: 'Iterative refinement, backlog grooming, prioritisation frameworks, and requirement traceability.', file: 'Questions/sol-refine-req.json', locked: true },
    { id: 'sol-functional-req', title: 'Identify Functional Requirements', icon: '⚙️', desc: 'Functional decomposition, use case modelling, acceptance criteria, and functional specification techniques.', file: 'Questions/sol-functional-req.json', locked: true },
    { id: 'sol-nonfunctional-req', title: 'Identify Non-Functional Requirements', icon: '🛡️', desc: 'Performance, scalability, security, availability, and compliance requirements.', file: 'Questions/sol-nonfunctional-req.json', locked: true },
    { id: 'sol-future-biz', title: 'Guide Future State Business Process Design', icon: '🔮', desc: 'To-be process design, improvement facilitation, change management, and future-state documentation.', file: 'Questions/sol-future-biz.json', locked: true },
    { id: 'sol-fitgap', title: 'Performing Fit/Gap Analyses', icon: '📐', desc: 'Structured fit/gap methodology, gap categorisation, workaround identification, and build-vs-buy analysis.', file: 'Questions/sol-fitgap.json', locked: true },
    { id: 'sol-feasibility', title: 'Feasibility Assessment', icon: '⚖️', desc: 'Technical, financial, and operational feasibility evaluation for proposed solutions.', file: 'Questions/sol-feasibility.json', locked: true },
    { id: 'sol-functional-gaps', title: 'Addressing Functional Gaps', icon: '🔩', desc: 'Gap resolution strategies, customisation vs configuration decisions, ISV solutions, and escalation paths.', file: 'Questions/sol-functional-gaps.json', locked: true },

    // ── Architect a Solution ──────────────────────────────────
    { id: 'arc-lead-design', title: 'Lead the Solution Design', icon: '🏛️', desc: 'Leading design workshops, facilitating architectural decisions, and producing solution blueprints.', file: 'Questions/arc-lead-design.json', locked: true },

    // ── Implementing the Solution ─────────────────────────────
    { id: 'impl-validate-design', title: 'Validating Your Solution Design', icon: '✅', desc: 'Design review techniques, validation checkpoints, solution health scoring, and pre-build validation gates.', file: 'Questions/impl-validate-design.json', locked: true },
    { id: 'impl-eval-design', title: 'Evaluating Your Designs and Implementation', icon: '🔍', desc: 'Post-build evaluation, implementation quality assessment, design drift identification, and corrective action.', file: 'Questions/impl-eval-design.json', locked: true },
    { id: 'impl-api-limits', title: 'Power Platform API Limits', icon: '⚡', desc: 'Service protection API limits, entitlement limits, throttling behaviour, retry patterns.', file: 'Questions/impl-api-limits.json', locked: true },
    { id: 'impl-perf-impact', title: 'Assessing Solution Performance and Resource Impact', icon: '📈', desc: 'Performance profiling, resource consumption analysis, Dataverse capacity planning.', file: 'Questions/impl-perf-impact.json', locked: true },
    { id: 'impl-automation-conf', title: 'Resolving Automation Conflicts', icon: '⚙️', desc: 'Flow conflict detection, concurrency handling, duplicate detection rules, and resolving conflicting automation.', file: 'Questions/impl-automation-conf.json', locked: true },
    { id: 'impl-integration-conf', title: 'Resolving Integration Conflicts', icon: '🔀', desc: 'Integration conflict diagnosis, duplicate sync resolution, error loop prevention.', file: 'Questions/impl-integration-conf.json', locked: true },
    { id: 'impl-golive', title: 'Supporting Go-Live', icon: '🚀', desc: 'Go-live planning, cutover execution, hypercare period management, stakeholder communication.', file: 'Questions/impl-golive.json', locked: true },
    { id: 'impl-perf-issues', title: 'Identify and Resolve Performance Issues', icon: '🔧', desc: 'Performance issue triage, root cause analysis, query optimisation, plugin profiling.', file: 'Questions/impl-perf-issues.json', locked: true },
    { id: 'impl-data-mig-issues', title: 'Escalating Data Migration Issues', icon: '📦', desc: 'Migration issue classification, escalation paths, data reconciliation failures, rollback triggers.', file: 'Questions/impl-data-mig-issues.json', locked: true },
    { id: 'impl-deploy-issues', title: 'Resolving Issues with Deployment Plans', icon: '🛠️', desc: 'Deployment failure diagnosis, solution import errors, dependency resolution.', file: 'Questions/impl-deploy-issues.json', locked: true },
    { id: 'impl-golive-readiness', title: 'Impact Assessment: Go-Live Readiness', icon: '🎯', desc: 'Readiness scoring frameworks, risk-based go/no-go decisions, impact assessment criteria.', file: 'Questions/impl-golive-readiness.json', locked: true },
  ],

  /* ── INTERVIEW PACKS ─────────────────────────────────────────── */
  INTERVIEW_PACKS: [
    {
      id: 'technicalconsultant',
      title: 'D365 CE Technical Consultant',
      icon: '🎯',
      desc: '',
      file: 'Interviewsim/CE_Technical_Consultant_Interview.json'
    },
    {
      id: 'kpmg-mbs',
      title: 'KPMG MBS — Dynamics CE Consultant',
      icon: '🏢',
      desc: 'KPMG MBS Malta stage-2 technical interview. 77 questions across plugin development, ALM, Dataverse, integrations, security, stakeholder delivery, and behavioural proof.',
      file: 'Interviewsim/kpmg_interview_prep.json',
      isQuizBank: true
    },
    {
      id: 'kpmg-ii-advanced',
      title: 'KPMG II Advanced',
      icon: '🧠',
      desc: 'Advanced KPMG-style sequence scenarios focused on architecture, ALM, integration, migration, Customer Service, Power Pages, Field Service, and technical leadership.',
      file: 'Interviewsim/kpmg_ii_advanced.json',
      isQuizBank: true
    }
  ],

  /* ── GROUPS ──────────────────────────────────────────────────
     Parent cards on the home screen that open a sub-topic picker.
  ────────────────────────────────────────────────────────────── */
  GROUPS: [
    {
      id: 'cs-app',
      title: 'D365 Customer Service App',
      icon: '🎧',
      desc: 'Full Customer Service configuration — BPF, Cases, Unified Routing, SLAs & Entitlements, Knowledge, Record Creation Rules, Timeline, and User Management.',
      subtopics: ['bpf', 'cases', 'queues', 'sla', 'knowledge', 'rcrules', 'timeline', 'usermgmt'],
    },
    {
      id: 'solution-architect',
      title: 'Solution Architect',
      icon: '🏛️',
      desc: 'Architecture patterns, platform limits, and design decisions for enterprise-scale Dynamics 365 and Power Platform solutions.',
      subtopics: [],
      subgroups: ['sol-envisioning', 'arc-solution', 'impl-solution'],
    },
    {
      id: 'pp-developer',
      title: 'Power Platform Developer',
      icon: '⚙️',
      desc: 'Canvas app development, Power Fx formulas, delegation, UI patterns, Power Automate flows, and Dataverse integration.',
      subtopics: ['delegation', 'powerfx', 'canvasui', 'automate', 'dataverse'],
    },
  ],

  /* ── SUBGROUPS ───────────────────────────────────────────────
     Rendered as nested group cards inside a parent group's
     subtopic screen.
  ────────────────────────────────────────────────────────────── */
  SUBGROUPS: [
    {
      id: 'sol-envisioning',
      parentGroup: 'solution-architect',
      title: 'Solution Envisioning & Requirement Analysis',
      icon: '🔭',
      desc: 'End-to-end requirement gathering, fit/gap analysis, feasibility assessment, and solution scoping.',
      subtopics: [
        'archlimits',
        'sol-initiate', 'sol-eval-biz', 'sol-identify-components', 'sol-select-components',
        'sol-migration', 'sol-org-info', 'sol-current-state', 'sol-org-risk',
        'sol-success-criteria', 'sol-existing-systems', 'sol-enterprise-arch',
        'sol-data-sources', 'sol-data-quality', 'sol-capture-req', 'sol-refine-req',
        'sol-functional-req', 'sol-nonfunctional-req', 'sol-future-biz',
        'sol-fitgap', 'sol-feasibility', 'sol-functional-gaps', 'sol-scope',
      ],
    },
    {
      id: 'arc-solution',
      parentGroup: 'solution-architect',
      title: 'Architect a Solution',
      icon: '🏗️',
      desc: 'Solution design across topology, data models, integrations, security, automation, environment strategy, and collaboration.',
      subtopics: [
        'arc-lead-design', 'arc-topology', 'arc-ux-proto', 'arc-comms',
        'arc-data-migration', 'arc-data-viz', 'arc-automation', 'arc-env-strategy',
        'arc-data-model', 'arc-relationships', 'arc-complex-dm',
        'arc-integrations', 'arc-collab', 'arc-int-d365', 'arc-int-existing', 'arc-int-thirdparty',
        'arc-auth', 'arc-bcp', 'arc-rpa',
        'arc-sec-model', 'arc-sec-roles', 'arc-bu-teams', 'arc-col-row-sec', 'arc-dlp', 'arc-external-users',
      ],
    },
    {
      id: 'impl-solution',
      parentGroup: 'solution-architect',
      title: 'Implementing the Solution',
      icon: '🔨',
      desc: 'Solution validation, performance assessment, conflict resolution, go-live support, and readiness evaluation.',
      subtopics: [
        'impl-validate-design', 'impl-eval-design', 'impl-api-limits', 'impl-perf-impact',
        'impl-automation-conf', 'impl-integration-conf', 'impl-golive',
        'impl-perf-issues', 'impl-data-mig-issues', 'impl-deploy-issues', 'impl-golive-readiness',
      ],
    },
  ],

};

/* ── REPORT CONFIG ───────────────────────────────────────────────
   Used for GitHub issue reporting from within the app.
   Token is a placeholder — replace via Azure environment variable
   before deploying. Never commit a real token here.
────────────────────────────────────────────────────────────────── */
const REPORT_CFG = {
  owner: 'ondiek-source',
  repo: 'D365QnA',
  token: window.__ENV__?.GITHUB_PAT || 'REPLACE_WITH_GITHUB_PAT'
};

/* ── Window exports ──────────────────────────────────────────────
   const declarations are script-scoped and invisible to other
   script tags. Explicitly attach to window so all modules can
   read CONFIG and REPORT_CFG via window.CONFIG / window.REPORT_CFG.
────────────────────────────────────────────────────────────────── */
window.CONFIG = CONFIG;
window.REPORT_CFG = REPORT_CFG;