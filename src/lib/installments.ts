import { addMonths } from "date-fns";

export type InstallmentPlan = {
  months: number;
  deposit?: number;
  monthly?: number;
  label?: string;
};

export type GeneratedInstallment = {
  dueDate: Date;
  amount: number;
};

export function generateSchedule(
  totalPrice: number,
  plan: InstallmentPlan,
  startDate: Date = new Date()
): GeneratedInstallment[] {
  const deposit = plan.deposit ?? 0;
  const remaining = Math.max(0, totalPrice - deposit);
  const months = Math.max(1, plan.months);
  const monthly = plan.monthly ?? Math.round((remaining / months) * 100) / 100;

  const schedule: GeneratedInstallment[] = [];
  if (deposit > 0) {
    schedule.push({ dueDate: startDate, amount: deposit });
  }
  for (let i = 1; i <= months; i++) {
    schedule.push({ dueDate: addMonths(startDate, i), amount: monthly });
  }
  return schedule;
}

export function computeBalance(totalPrice: number, paidAmount: number): number {
  return Math.max(0, totalPrice - paidAmount);
}
