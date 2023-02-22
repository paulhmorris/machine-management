import type { Invoice } from "@prisma/client";
import { Form } from "@remix-run/react";
import type { Dispatch, SetStateAction } from "react";
import { Button } from "~/components/shared/Button";
import { Modal } from "~/components/shared/Modal";
import { ModalHeader } from "~/components/shared/ModalHeader";

type Props = {
  invoiceId: Invoice["id"];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};
export function AbandonInvoiceModal(props: Props) {
  return (
    <Modal {...props}>
      <ModalHeader
        title="Are you sure?"
        description="This will delete the invoice and all charges associated with it."
      />
      <div className="mt-5 gap-2 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Form method="post" action="/admin/invoices/abandon" reloadDocument>
          <input type="hidden" name="invoiceId" value={props.invoiceId} />
          <Button type="submit" variant="danger">
            Abandon
          </Button>
        </Form>
        <Button onClick={() => props.setOpen(false)} variant="secondary">
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
