import { Dialog } from "@headlessui/react";
import { useFetcher } from "@remix-run/react";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import { Button } from "~/components/shared/Button";
import { Modal } from "~/components/shared/Modal";
import { Textarea } from "~/components/shared/Textarea";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  ticketId: number;
};

export function CloseTicketModal({ ticketId, open, setOpen }: Props) {
  const cancelButtonRef = useRef(null);
  const fetcher = useFetcher();

  return (
    <Modal open={open} setOpen={setOpen}>
      <fetcher.Form
        action="/admin/resources/close-ticket"
        method="post"
        reloadDocument
      >
        <input type="hidden" name="ticketId" value={ticketId} />
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <IconAlertTriangle
              size={24}
              className="text-red-500"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-xl font-medium leading-6 text-gray-900"
            >
              Close ticket {ticketId}
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to close this ticket? Please provide any
                related comments.
              </p>
            </div>
            <div className="mt-4">
              <Textarea
                name="comments"
                label="Comments"
                resizeable={false}
                maxLength={255}
                required
              />
            </div>
          </div>
        </div>
        <div className="mt-5 gap-2 sm:flex sm:flex-row-reverse">
          <Button
            variant="primary"
            type="submit"
            onClick={() => setOpen(false)}
          >
            Close Ticket
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            ref={cancelButtonRef}
          >
            Cancel
          </Button>
        </div>
      </fetcher.Form>
    </Modal>
  );
}
