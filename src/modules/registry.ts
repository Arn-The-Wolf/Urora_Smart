export const domainModules = [
  { name: "farm", phase: 1, path: "src/modules/farm" },
  { name: "users", phase: 1, path: "src/modules/users" },
  { name: "cattle", phase: 1, path: "src/modules/cattle" },
  { name: "milk", phase: 1, path: "src/modules/milk" },
  { name: "sync", phase: 1, path: "src/modules/sync" },
  { name: "health", phase: 1, path: "src/modules/health" },
  { name: "inventory", phase: 1, path: "src/modules/inventory" },
  { name: "wash", phase: 1, path: "src/modules/wash" },
  { name: "tasks", phase: 1, path: "src/modules/tasks" },
  { name: "breeding", phase: 4, path: "src/modules/breeding", status: "planned" },
  { name: "finance", phase: 6, path: "src/modules/finance", status: "planned" },
  { name: "crops", phase: 7, path: "src/modules/crops", status: "planned" },
] as const;
