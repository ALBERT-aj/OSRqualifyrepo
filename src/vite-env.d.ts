/// <reference types="vite/client" />

interface Window {
  Calendly?: {
    initInlineWidget: (options: {
      url: string;
      parentElement: Element;
    }) => void;
  };
  fbq?: (action: string, event: string, params?: object) => void;
}
