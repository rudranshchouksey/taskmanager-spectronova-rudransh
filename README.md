# Task Manager

A single-page task management app (Kanban board + list view) built with React, TypeScript, and Tailwind CSS, backed by an in-memory business logic layer.

## 1. Setup & Run

Requirements: Node.js 18+ and npm.

```bash
npm install && npm run dev
```

This starts the Vite dev server (default `http://localhost:5173`). Other available scripts:

```bash
npm run build      # production build
npm run preview    # preview the production build locally
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
```

There is no backend and no environment configuration required — all task data is seeded in-memory from [src/BLL/taskManager/mockData.ts](src/BLL/taskManager/mockData.ts) and lives for the duration of the browser session only.

## 2. Core Architecture

### `TaskManager`: a plain TypeScript class, not a global store

All task mutations (create, update, delete, move, filter, sort) live in [src/BLL/taskManager/TaskManager.ts](src/BLL/taskManager/TaskManager.ts) as methods on a plain `TaskManager` class — no React, no hooks, no JSX inside it. It owns a private `tasks` array and exposes a narrow method surface (`createTask`, `updateTask`, `deleteTask`, `moveTo`, `filterTasks`, `sortTasks`, `getFilteredAndSorted`, ...).

This separation is deliberate: business rules (e.g. priority ordering, overdue calculation, filter predicates) are unit-testable in isolation, independent of any render cycle, and have no risk of being re-triggered or duplicated by React's render behavior (e.g. StrictMode double-invocation, concurrent rendering). UI components never reach into the task array directly — they only ever call methods on the manager instance.

### No Context provider — direct instance prop-threading

Rather than wrapping the tree in a Context provider, [src/pages/taskManager/index.tsx](src/pages/taskManager/index.tsx) constructs a single `TaskManager` instance once (`useState(() => new TaskManager())`) and passes that *same instance* down as a `manager` prop to `KanbanBoard`, `ListView`, `TaskModal`, and `TaskDetailPanel`. Each of those forwards it further down to their own children (e.g. `KanbanColumn`).

For an app of this size, a Context provider would add indirection (provider component, context object, a consumer hook) to solve a problem that doesn't exist here: there is exactly one manager instance for the lifetime of the page, and every consumer needs the same one. Prop-threading keeps the dependency explicit and traceable at every call site, and avoids the unnecessary re-render fan-out that naive Context consumption can cause.

### Re-render signal: an explicit `tick` counter threaded as a callback

Because `TaskManager` is a plain class, mutating it does **not** automatically trigger a React re-render. The page holds a `tick` counter and a `forceUpdate = () => setTick(t => t + 1)` callback ([src/pages/taskManager/index.tsx:46-70](src/pages/taskManager/index.tsx#L46-L70)). Every mutating action threads back up through an `on*` callback prop (`onSaved`, `onTaskMoved`, `onUpdateTaskStatus`, `handleConfirmDelete`, etc.), calls the relevant `manager` method, and then calls `forceUpdate()`.

This keeps the re-render trigger centralized and predictable: one state value at the top of the tree, one place that bumps it, and every child re-derives its data on that render by calling read methods (`getFilteredAndSorted`, `getFilteredByStatus`, `getAllAssignees`) straight off the manager. There is intentionally no listener/event-emitter machinery inside `TaskManager` itself — the manager stays a dumb, framework-agnostic data object, and React's own state update is the only signal that drives a re-render.

## 3. UI Design Trade-offs & Decisions

**Slide-in drawer for inspection, centered modal for forms.** `TaskDetailPanel` renders as a right-aligned slide-in drawer (`fixed inset-0 ... justify-end`, [TaskDetailPanel.tsx:164](src/components/TaskDetail/TaskDetailPanel.tsx#L164)), while `TaskModal` (create/edit) and `DeleteConfirmModal` render as centered dialogs (`justify-center`, [TaskModal.tsx:102](src/components/taskManager/TaskModal.tsx#L102)). The split is intentional: inspecting a task is a glanceable, low-commitment action that benefits from staying anchored to the list/board behind it (you can still see your place in the data), whereas creating/editing/deleting is a focused, blocking action where centering removes ambiguity about what the user is currently committed to.

**Deterministic hash-based avatar colors instead of stored/random colors.** `getAvatarColor` ([src/utils/utils.ts:14-20](src/utils/utils.ts#L14-L20)) derives a color by hashing the assignee's name (`charCodeAt` accumulation) and indexing into a fixed 8-color palette. No color is persisted on the `Task`/assignee model. This guarantees the same person always renders the same badge color everywhere in the app (header avatars, cards, drawer, filters) without needing a `User` table or a color field threaded through every component — at the cost of occasional palette collisions once more than 8 distinct names are in play.

**Spacing snapped to Tailwind's 4px scale, with explicit 2px half-steps for optical alignment.** Layout spacing (`p-2`, `gap-3`, `px-8`, `py-4`, etc.) is built on Tailwind's default spacing scale, which is 4px-based — there is no custom spacing override in [tailwind.config.js](tailwind.config.js). A handful of spots intentionally break to the half-step (`gap-1.5` = 6px, `py-2.5` = 10px, `mt-0.5` = 2px) where an icon needs to optically center against adjacent text — a deliberate exception to the grid rather than an inconsistency.

## 4. Scope Boundaries & Known Limitations

This was built under a 48-hour assessment window, so the following were consciously left out of scope rather than missed:

- **Time zones.** Dates are formatted with `toLocaleDateString` / `toLocaleTimeString` against the browser's local time zone ([src/utils/utils.ts:31-43](src/utils/utils.ts#L31-L43)). There is no stored UTC offset, no per-user time zone preference, and no normalization — due dates are treated as wall-clock dates, which is correct for a single-user/single-locale demo but would need an explicit UTC+offset model for multi-timezone teams.
- **Mobile responsiveness.** Only `ListView` and `KanbanBoard` carry responsive (`md:`) breakpoints; the persistent `Sidebar`, the top header/filter bar, the create/edit modal, and the detail drawer are laid out for desktop viewport widths and have not been verified below typical tablet width.
- **Persistence.** All data is seeded from `mockData.ts` into an in-memory array; there is no backend, so a page refresh resets all tasks. `@supabase/supabase-js` is present in `package.json` as a leftover starter-template dependency and is not wired up anywhere in `src/`.
- **Real-time/multi-user collaboration.** The activity feed in `TaskDetailPanel` is static mock data, not derived from actual task mutations — there is no event log behind the comments/activity/reactions UI.
- **No automated test suite.** Verification was done through manual interaction with the running dev server rather than a checked-in unit/integration suite, traded off against the time available.
