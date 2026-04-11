import { useUploads } from "../store/uploads";
import { UploadWidgetUploadItem } from "./upload-widget-upload-item";
import * as ScrollArea from "@radix-ui/react-scroll-area"

export function UploadWidgetUploadList() {
  const uploads = useUploads(store => store.uploads);
  const isUploadListEmpty = uploads.size === 0;

  return (
    <div className="px-3 flex flex-col gap-3">
      <span className="text-xs font-medium">
        Uploaded files{' '}
        <span className="text-zinc-400">{uploads.size}</span>
      </span>

      <ScrollArea.Root type="scroll" className="overflow-hidden">
        <ScrollArea.Viewport className="h-55">
          {isUploadListEmpty ? (
            <span className="text-xs text-zinc-400">No uploads added</span>
          ) : (
            <div className="flex flex-col gap-2">
              {Array.from(uploads.entries()).map(([uploadId, upload]) => {
                return <UploadWidgetUploadItem key={uploadId} upload={upload} uploadId={uploadId} />
              })}
            </div>
          )}
        </ScrollArea.Viewport>

        <ScrollArea.Scrollbar
          className="flex touch-none select-none bg-zinc-800 p-0.5 transition-colors duration-160 ease-out data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-zinc-600 before:left-0.5 before:top-0.5 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-0.5 before:-translate-y-0.5" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  )
}