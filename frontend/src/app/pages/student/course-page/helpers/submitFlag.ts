
import { EntityType, FlagBody } from "@/types/flag.types";
import { toast } from "sonner";

interface SubmitFlagParams {
  courseId: string;
  versionId: string;
  currentItem: { _id: string; type: string } | null;
  reason: string;
  submitFlagAsyncMutate: (arg: { body: FlagBody }) => Promise<any>;
  setIsFlagSubmitted: (v: boolean) => void;
  setIsFlagModalOpen: (v: boolean) => void;
}

export const handleFlagSubmit = async ({
  courseId,
  versionId,
  currentItem,
  reason,
  submitFlagAsyncMutate,
  setIsFlagSubmitted,
  setIsFlagModalOpen,
}: SubmitFlagParams) => {
  try {
    if (!currentItem) {
      console.warn("Current item not found", currentItem);
      return;
    }

    const submitFlagBody:FlagBody = {
      courseId,
      versionId,
      entityId: currentItem._id,
      entityType: currentItem.type as EntityType,
      reason,
    };

    await submitFlagAsyncMutate({ body: submitFlagBody });

    toast.success("Flag submitted successfully", { position: "top-right" });
  } catch (error: any) {
    toast.error(error?.message || "Failed to submit flag", { position: "top-right" });
  } finally {
    setIsFlagSubmitted(true);
    setIsFlagModalOpen(false);
  }
};
