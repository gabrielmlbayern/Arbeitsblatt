declare global {
  interface Window {
    APP_CONFIG: {
      APP_PASSWORD: string;
    };
  }
}

export const CONFIG = {
  get APP_PASSWORD() {
    return window.APP_CONFIG?.APP_PASSWORD || 'app';
  }
};
