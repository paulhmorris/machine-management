import { Dialog } from "@headlessui/react";
import { Form } from "@remix-run/react";
import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import { Modal } from "~/components/shared/Modal";
import { Textarea } from "~/components/shared/Textarea";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  ticketId: number;
};

export function CloseTicketModal({ ticketId, open, setOpen }: Props) {
  const cancelButtonRef = useRef(null);

  return (
    <Modal open={open} setOpen={setOpen}>
      <Form action="/admin/resources/close-ticket" method="post">
        <input type="hidden" name="ticketId" value={ticketId} />
        <div className="sm:flex sm:items-start">
          <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-xl font-medium leading-6 text-gray-900"
            >
              Close ticket {ticketId}
            </Dialog.Title>
            <div className="mt-4">
              <Textarea name="comments" label="Comments" />
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={() => setOpen(false)}
          >
            Close Ticket
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:border-cyan-700 focus:outline-none focus:ring focus:ring-cyan-600 focus:ring-opacity-25 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={() => setOpen(false)}
            ref={cancelButtonRef}
          >
            Cancel
          </button>
        </div>
      </Form>
    </Modal>
  );
}
