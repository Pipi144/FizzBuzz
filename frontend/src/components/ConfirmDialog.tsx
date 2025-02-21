import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { DialogProps } from "@radix-ui/react-dialog";

type Props = DialogProps & {
  title?: string;
  description?: string;
  footerContent?: React.ReactNode;
};

const ConfirmDialog = ({
  title,
  description,
  footerContent,
  ...props
}: Props) => {
  return (
    <Dialog {...props}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>{title ?? "Title"}</DialogTitle>
          <DialogDescription>
            {description ?? "Dialog description"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>{footerContent}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
