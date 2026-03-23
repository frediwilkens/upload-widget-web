import { create } from "zustand";
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import { uploadFileToStorage } from "../http/upload-file-to-storage";
import { CanceledError } from "axios";
import { useShallow } from "zustand/shallow";

export type Upload = {
  name: string;
  file: File;
  abortController: AbortController;
  status: 'inProgress' | 'completed' | 'error' | 'canceled';
  originalSizeInBytes: number;
  uploadSizeInBytes: number;
}

type UploadState = {
  uploads: Map<string, Upload>
  addUploads: (files: File[]) => void;
  cancelUpload: (uplaodId: string) => void;
}

enableMapSet();

export const useUploads = create<UploadState, [["zustand/immer", never]]>(
  immer((set, get) => {
    function updateUpload(uploadId: string, data: Partial<Upload>) {
      const upload = get().uploads.get(uploadId);

      if (!upload) return;

      set(state => {
        state.uploads.set(uploadId, { ...upload, ...data });
      })
    }

    async function processUpload(uploadId: string) {
      const upload = get().uploads.get(uploadId);

      if (!upload) return;

      try {
        await uploadFileToStorage(
          {
            file: upload.file,
            onProgress: (sizeInBytes) => {
              updateUpload(uploadId, { uploadSizeInBytes: sizeInBytes });
            }
          },
          { signal: upload.abortController.signal },
        );

        updateUpload(uploadId, { status: 'completed' });
      } catch (error) {
        if (error instanceof CanceledError) {
          updateUpload(uploadId, { status: 'canceled' });
          return;
        }

        updateUpload(uploadId, { status: 'error' });
      }
    }

    function cancelUpload(uploadId: string) {
      const upload = get().uploads.get(uploadId);

      if (!upload) return;

      upload.abortController.abort();
    }

    function addUploads(files: File[]) {
      for (const file of files) {
        const uploadId = crypto.randomUUID();
        const abortController = new AbortController();

        const upload: Upload = {
          name: file.name,
          file,
          abortController,
          status: 'inProgress',
          originalSizeInBytes: file.size,
          uploadSizeInBytes: 0,
        }

        set(state => {
          state.uploads.set(uploadId, upload);
        })

        processUpload(uploadId);
      }
    }

    return {
      uploads: new Map<string, Upload>(),
      addUploads,
      cancelUpload,
    }
  })
)

export const usePendingUploads = () => {
  return useUploads(useShallow(store => {
    const isThereAnyPendingUpload = Array
      .from(store.uploads.values())
      .some(upload => upload.status === 'inProgress');

    if (!isThereAnyPendingUpload) {
      return { isThereAnyPendingUpload, globalPercentage: 100 }
    }

    const { total, uploaded } = Array.from(store.uploads.values()).reduce(
      (accumulator, upload) => {
        accumulator.total += upload.originalSizeInBytes;
        accumulator.uploaded += upload.uploadSizeInBytes;
        return accumulator
      },
      { total: 0, uploaded: 0 }
    )

    const globalPercentage = Math.min(
      Math.round((uploaded * 100) / total),
      100,
    )

    return { isThereAnyPendingUpload, globalPercentage }
  }))
}