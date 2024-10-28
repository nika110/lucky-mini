import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { motion } from "framer-motion";

// Расширенный интерфейс для Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
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
        ready: () => void;
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
  const tg = window.Telegram.WebApp;
  const [viewportHeight, setViewportHeight] = useState(tg.viewportHeight);

  useEffect(() => {
    // Инициализация Web App
    tg.ready();
    tg.expand();

    // Обработчик изменения высоты вьюпорта
    const handleViewportChange = () => {
      setViewportHeight(tg.viewportHeight);
    };

    // Обработчик изменения темы

    // Настройка кнопки "Назад"
    if (location.pathname === ROUTES.HOME) {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        window.history.back();
      });
    }

    // Подписка на события Telegram WebApp
    tg.onEvent("viewportChanged", handleViewportChange);

    // Очистка при размонтировании
    return () => {
      tg.offEvent("viewportChanged", handleViewportChange);
    };
  }, [location.pathname, tg]);

  // Применяем динамические стили на основе темы Telegram
  const containerStyle = {
    minHeight: `${viewportHeight}px`,
    backgroundColor: tg.backgroundColor,
    color: tg.themeParams.text_color,
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
