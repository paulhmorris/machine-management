import type { Invoice, Ticket } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "~/components/shared/Button";
import { Modal } from "~/components/shared/Modal";
import { ModalHeader } from "~/components/shared/ModalHeader";
import { Spinner } from "~/components/shared/Spinner";

type Props = {
  ticketId: Ticket["id"];
  invoiceId: Invoice["id"];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};
export function RemoveTicketModal(props: Props) {
  const fetcher = useFetcher();
  const busy = fetcher.state === "submitting" || fetcher.state === "loading";
  return (
    <Modal {...props}>
      <ModalHeader
        title="Are you sure?"
        description="This will remove the ticket from the invoice, and delete all charges associated with it. You can add it again later, but all charges will be deleted."
      />
      <div className="mt-5 gap-2 sm:mt-4 sm:flex sm:flex-row-reverse">
        <fetcher.Form
          method="post"
          action={`/admin/invoices/${props.invoiceId}/ticket`}
          replace={true}
        >
          <input type="hidden" name="ticketId" value={props.ticketId} />
          <Button
            type="submit"
            variant="danger"
            name="_action"
            value="removeTicket"
            disabled={busy}
          >
            {busy && <Spinner className="mr-2" />}
            {busy ? "Removing..." : "Remove Ticket"}
          </Button>
        </fetcher.Form>
        <Button
          onClick={() => props.setOpen(false)}
          variant="secondary"
          disabled={busy}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
