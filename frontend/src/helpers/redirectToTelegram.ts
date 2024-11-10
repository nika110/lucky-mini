export const redirectToTelegram = () => {
  const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_BOT_NAME;
  const TELEGRAM_MINI_APP_NAME = import.meta.env.VITE_WEB_APP_NAME;

  const telegramUrl = `tg://resolve?domain=${TELEGRAM_BOT_USERNAME}&appname=${TELEGRAM_MINI_APP_NAME}`;
  window.location.href = telegramUrl;

  setTimeout(() => {
    const webUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=webapp`;
    window.location.href = webUrl;
  }, 1000);
};
