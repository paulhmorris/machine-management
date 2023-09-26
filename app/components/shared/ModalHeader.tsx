import { Dialog } from "@headlessui/react";

type Props = {
  title?: string;
  description?: string;
};
export function ModalHeader({ title, description }: Props) {
  return (
    <div className="sm:flex sm:items-start">
      <div className="mt-3 text-center sm:mt-0 sm:text-left">
        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
          {title}
        </Dialog.Title>
        <div className="mt-2">
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
