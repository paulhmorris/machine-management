import type { Invoice } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "~/components/shared/Button";
import { Modal } from "~/components/shared/Modal";
import { ModalHeader } from "~/components/shared/ModalHeader";
import { Spinner } from "~/components/shared/Spinner";

type Props = {
  invoiceId: Invoice["id"];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};
export function AbandonInvoiceModal(props: Props) {
  const fetcher = useFetcher();
  const busy = fetcher.state === "submitting" || fetcher.state === "loading";
  return (
    <Modal {...props}>
      <ModalHeader
        title="Are you sure?"
        description="This will delete the invoice and all charges associated with it."
      />
      <div className="mt-5 gap-2 sm:mt-4 sm:flex sm:flex-row-reverse">
        <fetcher.Form method="post" action={`/admin/invoices/`}>
          <input type="hidden" name="invoiceId" value={props.invoiceId} />
          <Button type="submit" variant="danger" disabled={busy} name="_action" value="abandonInvoice">
            {busy && <Spinner className="mr-2" />}
            {busy ? "Abandoning..." : "Abandon"}
          </Button>
        </fetcher.Form>
        <Button onClick={() => props.setOpen(false)} variant="secondary">
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
