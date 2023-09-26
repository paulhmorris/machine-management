import { Select } from "~/components/shared/Select";
import { Textarea } from "~/components/shared/Textarea";
import type { getCampusUsers } from "~/models/campusUser.server";

type CampusUserPayload = Awaited<ReturnType<typeof getCampusUsers>>;

export function CloseForm() {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Close Ticket</h2>
      <input type="hidden" name="actionType" value="close" />
      <Textarea name="comments" label="Comments" resizeable={false} rows={6} maxLength={255} />
    </div>
  );
}
export function AttendantForm({ campusUsers }: { campusUsers: CampusUserPayload }) {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Assign Attendant</h2>
      <input type="hidden" name="actionType" value="assignment" />
      <Select label="Attendants" name="assignedToUserId" defaultValue="" required>
        <option value="" disabled>
          Select an Attendant
        </option>
        {campusUsers.map((user) => {
          const userData = user.user;
          return (
            <option key={userData.id} value={userData.id}>
              {userData.firstName} {userData.lastName}
            </option>
          );
        })}
      </Select>
      <Textarea name="comments" label="Comments" resizeable={false} rows={6} maxLength={255} />
    </div>
  );
}
export function MachineTechForm({ campusUsers }: { campusUsers: CampusUserPayload }) {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Assign Machine Tech</h2>
      <input type="hidden" name="actionType" value="assignment" />
      <Select label="Machine Techs" name="assignedToUserId" defaultValue="" required>
        <option value="" disabled>
          Select a Tech
        </option>
        {campusUsers.map((user) => {
          const userData = user.user;
          return (
            <option key={userData.id} value={userData.id}>
              {userData.firstName} {userData.lastName}
            </option>
          );
        })}
      </Select>
      <Textarea name="comments" label="Comments" resizeable={false} rows={6} maxLength={255} />
    </div>
  );
}

export function CampusTechForm({ campusUsers }: { campusUsers: CampusUserPayload }) {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Assign Campus Tech</h2>
      <input type="hidden" name="actionType" value="assignment" />
      <Select label="Campus Techs" name="assignedToUserId" defaultValue="" required>
        <option value="" disabled>
          Select a Tech
        </option>
        {campusUsers.map((user) => {
          const userData = user.user;
          return (
            <option key={userData.id} value={userData.id}>
              {userData.firstName} {userData.lastName}
            </option>
          );
        })}
      </Select>
      <Textarea name="comments" label="Comments" resizeable={false} rows={6} maxLength={255} />
    </div>
  );
}
export function AddNoteForm() {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Add Note</h2>
      <input type="hidden" name="actionType" value="note" />
      <Textarea name="comments" label="Comments" resizeable={false} rows={6} maxLength={255} />
    </div>
  );
}

export function ReopenForm() {
  return (
    <div className="space-y-4">
      <h2 className="mb-4">Reopen</h2>
      <input type="hidden" name="actionType" value="reopen" />
      <Textarea name="comments" label="Comments" resizeable={false} rows={6} maxLength={255} />
    </div>
  );
}
