# Task Manager

A production-fidelity Task Manager built with React, Vite, TypeScript, and Tailwind CSS, modeled on the supplied Dribbble references. It ships a drag-and-drop Kanban board, a sortable multi-tier list view, and a sliding task-detail drawer with live activity history — all driven by a single pure-TypeScript business logic layer.

## 1. Setup and Initialization

Requires Node 18+.

```bash
npm install && npm run dev
```

Vite will print a local URL (default `http://localhost:5173`). Open it in a browser — no environment variables, database, or backend service are required; all data is seeded in-memory on load.

Other available scripts:

```bash
npm run build    # tsc -b && vite build — production bundle
npm run preview  # serve the production build locally
npm run lint     # eslint .
```

## 2. Core Architecture Overview

### Business logic lives in one class, not in components

All task state and every mutation (`moveTo`, `createTask`, `updateTask`, `deleteTask`, `setFilters`) live inside [`TaskManager`](src/BLL/taskManager/TaskManager.ts), a plain TypeScript class with **zero React imports**. This was a deliberate structural boundary, not a stylistic preference:

- **Testability and clarity of ownership.** A class with explicit methods is trivial to reason about and unit-test in isolation from rendering concerns. Every decision about *what counts as a valid mutation* (e.g., what text an activity-log entry gets when status changes) is made in exactly one place, so the UI layer never has to re-derive or guess at business rules.
- **No accidental logic leakage into JSX.** Components only ever call `manager.<verb>(...)` and render whatever the manager hands back. If two views (the Kanban board and the list view) both need to toggle a task to "done," they call the same `updateTask`, so behavior — including audit-trail entries — never drifts between views.
- **Audit trail as a first-class concern.** The activity ledger shown in the task detail drawer (`getActivity(taskId)`) is populated by the manager itself at the moment a mutation happens, not synthesized after the fact in a component. This guarantees the timeline is always an accurate record of what actually happened, in the order it happened.

### No global store wrapper — direct instance prop-threading

There is no Redux/Zustand/Context provider anywhere in this codebase. A single `TaskManager` instance is created once per page load via `useMemo(() => new TaskManager(), [])` in [`pages/taskManager/index.tsx`](src/pages/taskManager/index.tsx) and passed down explicitly as a `manager` prop through every layer that needs it (`KanbanBoard` → `KanbanColumn` → `TaskCard`, and `ListView`, and `TaskModal`).

This was a deliberate choice given the shape of the problem:

- The component tree is shallow (3–4 levels), so prop-threading doesn't suffer the "prop drilling fatigue" that justifies Context in deeper trees.
- A Context provider would have added an indirection layer (provider component, context object, consumer hook) to solve a problem that doesn't exist here: every consumer of `manager` already legitimately needs it passed down for that exact subtree.
- Explicit props keep the data flow traceable by reading signatures alone — opening any component file shows exactly what it depends on, with no implicit "ambient" state to track down.

### Reactivity via a listener subscription hook, not polling or context

`TaskManager` exposes `subscribe(listener): () => void`, called from every mutating method's internal `notify()`. The [`useTaskManager`](src/hooks/useTaskManager.ts) hook is the single bridge between this manager and React:

```ts
const [tasks, setTasks] = useState(() => taskManager.getFilteredTasks());
useEffect(() => taskManager.subscribe(setTasks), [taskManager]);
```

Because the manager pushes new snapshots only when something actually changes (a card is dragged, a checkbox is toggled, a modal is saved), components re-render exactly once per real mutation — there is no polling, no diffing of unrelated state, and no provider-wide re-render fan-out that a Context-based store would otherwise trigger across every consumer regardless of relevance.

## 3. UI Design Trade-offs & Decisions

1. **Sliding side drawer instead of a center modal.** The task detail view (`TaskModal.tsx`) glides in from the right edge over a translucent backdrop rather than using a screen-centered dialog. A center modal interrupts the board/list layout the user was just scanning and forces a jarring re-focus; an edge drawer keeps the board visible and contextually "behind" the task being inspected, matching the reference design and reading as a natural extension of the row/card the user clicked rather than an unrelated overlay.

2. **Deterministic character-hash color indexing for avatars.** Assignee initials (`getAvatarColor` in [`utils/avatar.ts`](src/utils/avatar.ts)) are colored by summing character codes of the name and indexing into a fixed Tailwind palette, rather than assigning colors randomly or by insertion order. This guarantees the *same person* always renders in the *same color* everywhere they appear (Kanban card, list row, modal) without needing a lookup table, a database column, or any persisted state — the name itself is the only input required, so the property holds even across page reloads or for newly created tasks.

3. **Strict base-4px spacing scale.** Every padding/margin/gap value across `TaskCard`, `KanbanColumn`, and `ListView` uses Tailwind's default spacing scale (4px increments: `p-1`=4px, `p-2`=8px, `p-3`=12px, etc.) rather than arbitrary pixel values. This was enforced deliberately so that cards, chips, and avatars align on a shared rhythm regardless of which view they're rendered in, avoiding the subtly-misaligned look that comes from mixing ad hoc spacing values across components built at different times.

## 4. Boundary Scope Limitations

Given the assessment's time box, the following are explicit, intentional cuts rather than oversights:

- **Date handling is calendar-day only, not timezone-aware.** `dueDate`/`createdAt` are stored as plain `YYYY-MM-DD` strings and parsed via local calendar components (`parseDateOnly` in [`utils/date.ts`](src/utils/date.ts)) specifically to avoid UTC-parsing off-by-one bugs in negative-UTC-offset zones. This means "today" is evaluated against the *browser's local clock* with no server-authoritative time source and no per-user timezone preference — acceptable for a single-user demo, but not multi-timezone-team-safe.
- **No mobile/responsive breakpoints.** The layout (fixed 256px sidebar + flexible main content, fixed-width Kanban columns, a six-column list grid) is built and verified at desktop widths (1440px) only, matching the Dribbble references, which are themselves desktop-only compositions. Narrow viewports will show horizontal overflow on the board and a cramped list grid rather than a stacked mobile layout.
- **No persistence layer.** All state lives in the `TaskManager` instance's in-memory array, seeded from `mockData.ts` on every page load. Refreshing the page resets all edits, drags, and deletions. There is no backend, local-storage sync of task data, or multi-tab consistency (the view-mode toggle is the one exception, which intentionally does persist via `localStorage`).
- **No authentication or multi-user concurrency.** The sidebar profile ("Sarah Johnson") is static decoration; there is no login, no per-user task ownership, and no concurrent-edit conflict handling.
- **No automated test suite.** Verification for every feature in this build was done via live, scripted browser interaction (Playwright driving the actual dev server) rather than a checked-in unit/integration suite, which was traded off against the time available.

## 5. Time Log Allocation (48-Hour Window)

| Phase | Hours | Detail |
|---|---|---|
| Environment configuration | 4 | Vite + React + TypeScript scaffold review, wiring Tailwind CSS v4 (`@tailwindcss/vite` plugin, `@import` setup) since the template shipped without it actually connected, removing legacy template CSS constraints. |
| Entity relationship mapping | 3 | Defining `Task`/`TaskStatus`/`TaskPriority`/`TaskManagerListener` contracts in `types.ts`, deciding the `TaskManager` method surface (`moveTo`, `createTask`, `updateTask`, `deleteTask`, `setFilters`) before any UI existed. |
| Data seeding | 3 | Authoring `mockData.ts` with deliberate coverage: status/priority distribution, overdue cases, multi-developer assignees, and tag coverage matching the reference imagery. |
| Core BLL implementation | 4 | `TaskManager` class: filtering, pub-sub `notify()`/`subscribe()`, and later the activity-log audit trail extension. |
| React/BLL binding layer | 3 | `useTaskManager` hook, page shell, sidebar nav, view-mode persistence via `localStorage`. |
| Drafting drag-and-drop modules | 6 | `KanbanBoard`/`KanbanColumn`/`TaskCard` native HTML5 DnD (`dragstart`/`dragover`/`drop`), plus debugging the gap between mouse-simulated automation and real native drag event semantics during verification. |
| List view & sorting | 5 | `ListView` grouped table layout, class-driven `TaskListSorter` for due-date/priority sort toggling, inline checkbox-to-status interaction. |
| Task detail drawer | 7 | Sliding drawer mechanics, property editing form, validation rules, delete confirmation, and the activity-timeline ledger (including extending the BLL to actually record history rather than fake it). |
| Layout design refinement | 6 | Typography scale enforcement (24px/700 page title, 13–14px card text, 11px badges), base-4px spacing audit, priority/status color language consistency across all three views. |
| Cross-view & lint/type hardening | 4 | Resolving `eslint-plugin-react-hooks` v7 strict-mode findings (`set-state-in-effect`, ref-during-render) without regressing behavior; full `tsc`/`eslint` pass. |
| Cross-browser/interaction QA | 3 | Scripted Playwright verification of drag-and-drop, sort toggles, modal validation, save/delete flows, and console-error checks across each feature pass. |
| **Total** | **48** | |
