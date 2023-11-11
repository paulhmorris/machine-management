export const errorTypes = [
  { name: "Took my money!" },
  { name: "Won't drain" },
  { name: "Shakes violently" },
  { name: "No heat" },
  { name: "Other" },
  { name: "Blank display" },
  { name: "CA Room Check-in" },
  { name: "Cycle Count" },
];
export type TErrorType = (typeof errorTypes)[number]["name"];

export const ticketStatuses = [
  { name: "New" },
  { name: "Awaiting Inspection" },
  { name: "Fixed by TA" },
  { name: "Closed" },
  { name: "Tech Repair Requested" },
  { name: "Tech Repair Acknowledged" },
  { name: "Tech Repair Scheduled" },
  { name: "Resolved by Tech" },
  { name: "Reopened" },
  { name: "Inspected, Needs Service" },
];
export type TTicketStatus = (typeof ticketStatuses)[number]["name"];

export const chargeTypes = [
  { name: "Labor" },
  { name: "Trip Charge" },
  { name: "Part" },
  { name: "Shipping" },
  { name: "Reimbursement" },
];

export const machineTypes = [{ name: "Washer" }, { name: "Dryer" }];
export type TMachineType = (typeof machineTypes)[number]["name"];
