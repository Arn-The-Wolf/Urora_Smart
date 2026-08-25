export type CowStatus = "active" | "sold" | "dead";
export type Gender = "female" | "male";
export type MilkSession = "morning" | "midday" | "evening";
export type UserRole = "owner" | "operator";
export type SyncEntity = "cow" | "milking" | "health" | "stock" | "wash";
export type SyncOp = "upsert" | "delete";

export type FarmAlertSeverity = "critical" | "warning" | "info";
export type FarmAlertKind =
    | "stock_low"
    | "stock_expired"
    | "stock_expiring"
    | "sick_cow"
    | "wash_due"
    | "task_overdue"
    | "milk_drop"
    | "milk_missing"
    | "milk_withhold"
    | "breeding_due"
    | "dry_off_due"
    | "calving_due";

export type FarmAlert = {
  id: string;
  kind: FarmAlertKind;
  severity: FarmAlertSeverity;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
};

export type Farm = {
  id: string;
  name: string;
  location: string | null;
  digestPhone: string | null;
  digestChannel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  farmId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type Cow = {
  id: string;
  farmId: string;
  clientId: string;
  tagNumber: string;
  name: string | null;
  breed: string | null;
  gender: Gender;
  birthDate: string | null;
  motherTag: string | null;
  status: CowStatus;
  kraalId: string | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type MilkingRecord = {
  id: string;
  farmId: string;
  clientId: string;
  cowId: string;
  date: string;
  session: MilkSession;
  liters: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type SessionUser = {
  user: User;
  farm: Farm;
};

export type SyncMutation = {
  entity: SyncEntity;
  op: SyncOp;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: any;
};

export type MilkSummary = {
  todayLiters: number;
  todayBySession: Record<MilkSession, number>;
  weekLiters: number;
  yesterdayLiters: number;
  activeCows: number;
  totalCows: number;
  topCow: { cowId: string; tagNumber: string; name: string | null; liters: number } | null;
  last7Days: { date: string; liters: number }[];
};

export type HealthKind = "illness" | "vaccination" | "deworming" | "treatment" | "vet_check" | "injury";
export type HealthStatus = "open" | "recovering" | "resolved" | "due" | "completed";

export type HealthEvent = {
  id: string;
  farmId: string;
  cowId: string;
  date: string;
  kind: HealthKind;
  status: HealthStatus;
  diagnosis: string | null;
  treatment: string | null;
  medicineName: string | null;
  isolated: boolean;
  milkWithholdUntil: string | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BreedingKind = "heat" | "ai" | "natural_service" | "pregnancy_check" | "calving" | "dry_off";
export type BreedingStatus = "recorded" | "confirmed" | "failed" | "completed";

export type BreedingEvent = {
  id: string;
  farmId: string;
  cowId: string;
  date: string;
  kind: BreedingKind;
  status: BreedingStatus;
  sireTag: string | null;
  expectedCalving: string | null;
  dryOffDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseCategory =
  | "feed"
  | "medicine"
  | "vet"
  | "labor"
  | "transport"
  | "equipment"
  | "utilities"
  | "other";

export type Expense = {
  id: string;
  farmId: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  vendor: string | null;
  notes: string | null;
  recordedBy: string | null;
  createdAt: string;
};

export type MilkSale = {
  id: string;
  farmId: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  buyer: string | null;
  notes: string | null;
  recordedBy: string | null;
  createdAt: string;
};

export type ActivityLogEntry = {
  id: string;
  farmId: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  detail: string | null;
  createdAt: string;
};

export type StockCategory =
  | "medicine"
  | "salt"
  | "mineral"
  | "acaricide"
  | "disinfectant"
  | "feed"
  | "feed_supplement"
  | "other";

export type StockItem = {
  id: string;
  farmId: string;
  name: string;
  category: StockCategory;
  unit: string;
  quantity: number;
  reorderLevel: number;
  batchCode: string | null;
  expiresOn: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DailyReport = {
  date: string;
  milkLiters: number;
  sessionsLogged: number;
  activeCows: number;
  sickCows: number;
  lowStockCount: number;
  expiredStockCount: number;
  openTasks: number;
  washDue: string | null;
  topCow: { tagNumber: string; name: string | null; liters: number } | null;
};

export type MonthlyReport = {
  month: string;
  milkLiters: number;
  milkingDays: number;
  averageDailyLiters: number;
  activeCows: number;
  healthEvents: number;
  washesDone: number;
  stockMovementsOut: number;
  byDay: { date: string; liters: number }[];
};

export type WashMethod = "spray" | "dip" | "hand_wash" | "footbath";

export type WashRecord = {
  id: string;
  farmId: string;
  date: string;
  method: WashMethod;
  chemicalName: string;
  mixRatio: string | null;
  nextDue: string | null;
  animalScope: string;
  notes: string | null;
  createdAt: string;
};

export type TaskCategory = "milking" | "health" | "wash" | "feed" | "stock" | "routine";

export type FarmTask = {
  id: string;
  farmId: string;
  title: string;
  category: TaskCategory;
  dueDate: string;
  dueTime: string | null;
  cowId: string | null;
  status: "open" | "done";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

