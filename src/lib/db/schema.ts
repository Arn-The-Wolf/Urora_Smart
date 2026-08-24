import { farms } from "@/modules/farm/schema";
import { sessions, users } from "@/modules/users/schema";
import { cows } from "@/modules/cattle/schema";
import { milkingRecords } from "@/modules/milk/schema";
import { healthEvents } from "@/modules/health/schema";
import { stockItems, stockMovements } from "@/modules/inventory/schema";
import { washRecords } from "@/modules/wash/schema";
import { farmTasks } from "@/modules/tasks/schema";

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
};
