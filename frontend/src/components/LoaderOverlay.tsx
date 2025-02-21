import React from "react";
import { Spinner } from "./ui/spinner";
import { Modal, ModalBody, ModalContent, ModalProps } from "@heroui/modal";
type Props = Omit<ModalProps, "children"> & {
  message?: string;
};

const LoaderOverlay = ({ message, ...props }: Props) => {
  return (
    <Modal
      backdrop="opaque"
      classNames={{
        backdrop:
          "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
      {...props}
    >
      <ModalContent>
        {() => (
          <>
            <ModalBody className="flex flex-col items-center justify-center  ">
              <Spinner size="medium" className="text-white" />
              <h2 className="text-white text-lg mt-4">
                {message ?? "Loading..."}
              </h2>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
LoaderOverlay.displayName = "LoaderOverlay";
export default LoaderOverlay;
