import React from 'react';

type WhatsAppFloatingButtonProps = {
  phoneNumber: string; // E.164-ish, contoh: +62 821-3170-4701
  className?: string;
};

const toWaMeNumber = (value: string) => value.replace(/[^0-9]/g, '');

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ phoneNumber, className }) => {
  const waNumber = toWaMeNumber(phoneNumber);
  const href = `https://wa.me/${waNumber}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Hubungi via WhatsApp: ${phoneNumber}`}
      title={`WhatsApp: ${phoneNumber}`}
      className={
        className ??
        'fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#86efac] to-[#93c5fd] text-white shadow-lg ring-1 ring-black/5 hover:opacity-95'
      }
    >
      {/* WhatsApp icon (inline SVG) */}
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M19.11 17.47c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.84-2.03-.22-.53-.45-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.33.97 2.62 1.1 2.8.14.18 1.9 2.9 4.6 4.07.64.28 1.14.45 1.53.57.64.2 1.22.17 1.68.1.51-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
        <path d="M16 3C8.83 3 3 8.83 3 16c0 2.27.6 4.41 1.65 6.28L3 29l6.92-1.61A12.95 12.95 0 0 0 16 29c7.17 0 13-5.83 13-13S23.17 3 16 3zm0 23.5c-1.96 0-3.87-.53-5.52-1.52l-.39-.23-4.1.96.99-3.99-.25-.41A10.45 10.45 0 0 1 5.5 16C5.5 10.76 10.76 6.5 16 6.5S26.5 10.76 26.5 16 21.24 26.5 16 26.5z" />
      </svg>
    </a>
  );
};
