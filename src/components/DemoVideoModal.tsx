"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

type DemoVideoModalProps = {
  buttonLabel: string;
  buttonClassName?: string;
  videoSrc: string;
  dialogLabel?: string;
};

export default function DemoVideoModal({
  buttonLabel,
  buttonClassName = "",
  videoSrc,
  dialogLabel = "Demo video",
}: DemoVideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonClassName}
      >
        {buttonLabel}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/70" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                  <Dialog.Title className="sr-only">{dialogLabel}</Dialog.Title>
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <span className="text-sm font-semibold text-gray-700">{dialogLabel}</span>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 shadow"
                      aria-label="Close demo"
                    >
                      Close
                    </button>
                  </div>
                  <div className="aspect-[9/16] w-full bg-black">
                    <video
                      className="h-full w-full object-cover"
                      src={videoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
