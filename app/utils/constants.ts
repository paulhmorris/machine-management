export const errorTypes = [
  "Took my money!",
  "Won't drain",
  "Shakes violently",
  "No heat",
  "Other",
  "Blank display",
  "CA Room Check-in",
  "Cycle Count",
] as const;
export type TErrorType = (typeof errorTypes)[number];

export const ticketStatuses = [
  "New",
  "Awaiting Inspection",
  "Fixed by TA",
  "Closed",
  "Tech Repair Requested",
  "Tech Repair Acknowledged",
  "Tech Repair Scheduled",
  "Resolved by Tech",
  "Reopened",
  "Inspected, Needs Service",
] as const;
export type TTicketStatus = (typeof ticketStatuses)[number];

export const chargeTypes = ["Labor", "Trip Charge", "Part", "Shipping", "Reimbursement"] as const;

export const machineTypes = ["Washer", "Dryer"] as const;
export type TMachineType = (typeof machineTypes)[number];
