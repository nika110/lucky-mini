import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { motion } from "framer-motion";
import WebApp from "@twa-dev/sdk";

// Расширенный интерфейс для Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        CloudStorage: {
          getItem: (key: string) => Promise<string | null>;
          setItem: (key: string, value: string) => Promise<void>;
        };
        platform: "web" | "ios" | "android";
        sendData: (data: string) => void;
        initData: string;
        initDataUnsafe: {
          start_param?: string;
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        switchInlineQuery: (query: string, type: string[]) => void;
        showPopup: (options: {
          title: string;
          message: string;
          buttons: { id: string; text: string; type: string }[];
        }) => void;
        ready: () => void;
        openTelegramLink: (url: string) => void;
        openLink: (url: string, options: { try_instant_view: boolean }) => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        setBackgroundColor: (color: string) => void;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        colorScheme: "light" | "dark";
        backgroundColor: string;
        themeParams: {
          bg_color: string;
          text_color: string;
          hint_color: string;
          link_color: string;
          button_color: string;
          button_text_color: string;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          isVisible: boolean;
        };
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
        MainButton: {
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          setParams: (params: {
            text: string;
            color: string;
            text_color: string;
            is_active: boolean;
            is_visible: boolean;
          }) => void;
        };
      };
    };
  }
}

export const Layout: React.FC = () => {
  const location = useLocation();
  const [viewportHeight, setViewportHeight] = useState(WebApp.viewportHeight);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();

    WebApp.setBackgroundColor("#121212");
    WebApp.setBottomBarColor("#121212");
    WebApp.setHeaderColor("#121212");

    // Обработчик изменения высоты вьюпорта
    const handleViewportChange = () => {
      setViewportHeight(WebApp.viewportHeight);
    };

    // Обработчик изменения темы

    // Настройка кнопки "Назад"
    if (location.pathname === ROUTES.HOME) {
      WebApp.BackButton.hide();
    } else {
      WebApp.BackButton.show();
      WebApp.BackButton.onClick(() => {
        window.history.back();
      });
    }

    // Подписка на события Telegram WebApp
    WebApp.onEvent("viewportChanged", handleViewportChange);

    // Очистка при размонтировании
    return () => {
      WebApp.offEvent("viewportChanged", handleViewportChange);
    };
  }, [location.pathname]);

  // Применяем динамические стили на основе темы Telegram
  const containerStyle = {
    minHeight: `${viewportHeight}px`,
  };

  return (
    <div style={containerStyle} className={`relative !bg-dark-bg`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-0 left-0 right-0 bottom-0 w-full h-[100lvh]"
        style={{
          minHeight: "-webkit-fill-available",
        }}
      >
        <div
          className="relative h-[100lvh]"
          style={{
            minHeight: "-webkit-fill-available",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 z-[1]"
            style={{ height: "50lvh" }}
          >
            <img
              src="/bg-top.png"
              className="w-full h-full object-cover object-top"
              alt="Top background"
            />
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 z-[1]"
            style={{ height: "25lvh" }}
          >
            <img
              src="/bg-bottom.png"
              className="w-full h-[25lvh] object-cover object-top"
              alt="Bottom background"
            />
          </div>
        </div>
      </motion.div>
      <div className="relative z-[2] h-[100svh] overflow-y-scroll">
        <Outlet />
      </div>
    </div>
  );
};
