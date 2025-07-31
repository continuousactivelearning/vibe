import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface ProctorDeclarationDialogProps {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

const ProctorDeclarationDialog: React.FC<ProctorDeclarationDialogProps> = ({ open, onAccept, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">Declaration</DialogTitle>
        </DialogHeader>
        <ul className="text-base text-foreground mb-4 list-disc pl-6 space-y-2">
          <li>
            I understand that my camera and microphone will be used for proctoring during this exam.
          </li>
          <li>
            I agree that images from my webcam may be captured at various points if unusual activity is detected.
          </li>
          <li>
            I acknowledge that the microphone is used for monitoring purposes only, and that no audio or video will be recorded or stored elsewhere.
          </li>
        </ul>
        <div className="w-full flex justify-end">
          <Button onClick={onAccept} className="w-full">ACCEPT</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProctorDeclarationDialog;
