import type { Part } from "@prisma/client";
import { useState } from "react";
import { Checkbox } from "~/components/shared/Checkbox";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { formatCurrency } from "~/utils/formatters";

export function TripForm({ amount }: { amount: number }) {
  return (
    <div className="sm:w-40">
      <input type="hidden" name="actionType" value="trip" />
      <input type="hidden" name="chargeAmount" value={amount} />
      <Input type="date" label="Trip Date" name="tripChargeDate" required />
      <span className="mt-2 block text-sm text-gray-500">{formatCurrency(amount)} / trip</span>
    </div>
  );
}
export function ShippingForm() {
  return (
    <>
      <input type="hidden" name="actionType" value="shipping" />
      <fieldset className="flex gap-2">
        <div className="sm:w-40">
          <Input type="date" label="Shipping Date" name="shippingDate" required />
        </div>
        <div className="sm:w-32">
          <Input
            type="number"
            label="Shipping Cost"
            name="chargeAmount"
            inputMode="decimal"
            placeholder="0.00"
            isCurrency
            required
          />
        </div>
      </fieldset>
    </>
  );
}

export function LaborForm({ rate }: { rate: number }) {
  const [timeInMin, setTimeInMin] = useState(0);
  const total = ((timeInMin * rate) / 60).toFixed(2);

  return (
    <div>
      <input type="hidden" name="actionType" value="labor" />
      <input type="hidden" name="chargeAmount" value={total} />
      <Select
        name="time"
        label="Time"
        defaultValue=""
        required
        onChange={(e) => setTimeInMin(Number(e.target.value))}
        className="sm:w-40"
      >
        <option value="" disabled>
          Select Time
        </option>
        {[...Array(18).keys()].map((i) => (
          <option key={i} value={i * 10 + 10}>
            {i * 10 + 10} mins
          </option>
        ))}
      </Select>
      <div className="mt-2 text-sm">
        <Checkbox id="isWarranty" name="isWarranty" label="Warranty Covered" defaultChecked={false} />
      </div>
      <div className="mt-2 flex items-center whitespace-nowrap text-sm">
        <span className="block text-gray-500">at {formatCurrency(rate)} / hr</span>
        &nbsp;
        <span className="font-medium text-cyan-700">= {formatCurrency(total)}</span>
      </div>
    </div>
  );
}

export function PartForm({ parts }: { parts: Part[] }) {
  return (
    <div>
      <input type="hidden" name="actionType" value="part" />
      <fieldset className="flex gap-2">
        <div className="sm:w-40">
          <Select name="partId" label="Part" defaultValue="" required>
            <option value="" disabled>
              Select Part
            </option>
            {parts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:w-32">
          <Input
            type="number"
            label="Part Cost"
            name="chargeAmount"
            inputMode="decimal"
            placeholder="0.00"
            isCurrency
            required
          />
        </div>
      </fieldset>
      <div className="mt-2 whitespace-nowrap text-sm">
        <Checkbox id="isWarranty" name="isWarranty" label="Warranty Covered" defaultChecked={false} />
      </div>
    </div>
  );
}

export function ReimbursementForm() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="actionType" value="reimbursement" />
      <Input name="reimbursedUser" label="User's Name" placeholder="Trae Drose" className="sm:w-48" required />
      <Input
        type="number"
        label="Amount"
        name="chargeAmount"
        inputMode="decimal"
        placeholder="0.00"
        isCurrency
        required
      />
    </div>
  );
}
