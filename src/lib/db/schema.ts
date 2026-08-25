import { farms } from "@/modules/farm/schema";
import { sessions, users } from "@/modules/users/schema";
import { cows } from "@/modules/cattle/schema";
import { milkingRecords } from "@/modules/milk/schema";
import { healthEvents } from "@/modules/health/schema";
import { stockItems, stockMovements } from "@/modules/inventory/schema";
import { washRecords } from "@/modules/wash/schema";
import { farmTasks } from "@/modules/tasks/schema";
import { breedingEvents } from "@/modules/breeding/schema";
import { expenses, milkSales } from "@/modules/finance/schema";
import { activityLog } from "@/modules/activity/schema";
import { kraals } from "@/modules/kraals/schema";

export const schema = {
  farms,
  users,
  sessions,
  cows,
  milkingRecords,
  healthEvents,
  stockItems,
  stockMovements,
  washRecords,
  farmTasks,
  breedingEvents,
  expenses,
  milkSales,
  activityLog,
  kraals,
};

export {
  farms,
  users,
  sessions,
  cows,
  milkingRecords,
  healthEvents,
  stockItems,
  stockMovements,
  washRecords,
  farmTasks,
  breedingEvents,
  expenses,
  milkSales,
  activityLog,
  kraals,
};
