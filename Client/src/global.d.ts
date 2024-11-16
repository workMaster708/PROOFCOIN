interface TelegramWebAppUser {
    id: string;
    first_name: string;
    last_name?: string;
    username?: string;
  }
  
  interface TelegramWebApp {
    initDataUnsafe?: {
      user?: TelegramWebAppUser;
    };
  }
  
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
  