/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import {
  motion,
  AnimatePresence,
  DragHandlers,
  HTMLMotionProps,
} from "framer-motion";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { GrabIcon } from "./Icons/Grab";
import { GrabCorner } from "./Icons/GrabCorner";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  children: React.ReactNode;
  shouldScaleBackground?: boolean;
};

type DrawerContentProps = Omit<HTMLMotionProps<"div">, "onDragEnd"> & {
  className?: string;
  children: React.ReactNode;
};

type DrawerTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const SPRING_CONFIG = {
  type: "spring",
  damping: 35,
  stiffness: 400,
};

const ROOT_ID = "drawer-root";
const MAIN_CONTENT_ID = "drawer-main-content";

const DrawerContext = React.createContext<{
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
} | null>(null);

export const useDrawer = () => {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a Drawer");
  }
  return context;
};

const useMainContent = () => {
  const [mainContent, setMainContent] = React.useState<HTMLElement | null>(
    null
  );

  React.useEffect(() => {
    const content =
      document.getElementById(MAIN_CONTENT_ID) ||
      document.querySelector("main");
    if (content && !content.id) {
      content.id = MAIN_CONTENT_ID;
    }
    setMainContent(content);
  }, []);

  return mainContent;
};

const DrawerRoot: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
  children,
  shouldScaleBackground = true,
}) => {
  const mainContent = useMainContent();
  const [portalContainer] = React.useState(() => {
    const existing = document.getElementById(ROOT_ID);
    if (existing) return existing;

    const container = document.createElement("div");
    container.id = ROOT_ID;
    document.body.appendChild(container);
    return container;
  });

  const drawerContent = React.useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === DrawerContent) {
        return child;
      }
      return null;
    });
  }, [children]);

  const triggerContent = React.useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === DrawerTrigger) {
        return child;
      }
      return null;
    });
  }, [children]);

  React.useEffect(() => {
    if (!mainContent || !shouldScaleBackground) return;

    if (isOpen) {
      mainContent.style.transition = `all 0.3s ${SPRING_CONFIG.type}`;
      mainContent.style.transform = "scale(0.95)";
      mainContent.style.borderRadius = "8px";
      mainContent.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      mainContent.style.transform = "scale(1)";
      mainContent.style.borderRadius = "0";
      mainContent.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      mainContent.style.transform = "";
      mainContent.style.borderRadius = "";
      mainContent.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen, mainContent, shouldScaleBackground]);

  return (
    <>
      <DrawerContext.Provider value={{ isOpen, onClose, onOpen }}>
        {triggerContent}
      </DrawerContext.Provider>

      {createPortal(
        <DrawerContext.Provider value={{ isOpen, onClose, onOpen }}>
          {drawerContent}
        </DrawerContext.Provider>,
        portalContainer
      )}
    </>
  );
};
const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { onOpen } = useDrawer();

    if (asChild) {
      return (
        <button
          ref={ref}
          type="button"
          onClick={onOpen}
          className={className}
          {...props}
        >
          {React.Children.only(children)}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onOpen}
        className={cn("", className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

DrawerTrigger.displayName = "DrawerTrigger";

const DrawerPortal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
};

const DrawerOverlay: React.FC = () => {
  const { isOpen, onClose } = useDrawer();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
        />
      )}
    </AnimatePresence>
  );
};

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, onClose } = useDrawer();
    const constraintsRef = React.useRef<HTMLDivElement>(null);
    const touchStartY = React.useRef<number | null>(null);

    const handleDragEnd: DragHandlers["onDragEnd"] = (e, info) => {
      e.preventDefault();
      e.stopPropagation();
      if (info.offset.y > 100) {
        onClose();
      }
    };

    const handleDrag: DragHandlers["onDrag"] = (e, info) => {
      if (info.offset.y < 0) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    React.useEffect(() => {
      if (!isOpen) return;

      const drawerElement = constraintsRef.current;
      if (!drawerElement) return;

      const preventDefault = (e: TouchEvent) => {
        if (!drawerElement.contains(e.target as Node)) return;

        // Отслеживаем начало касания
        if (e.type === "touchstart") {
          touchStartY.current = e.touches[0].clientY;
          return;
        }

        // Проверяем движение только для touchmove
        if (e.type === "touchmove" && touchStartY.current !== null) {
          const currentY = e.touches[0].clientY;
          const deltaY = currentY - touchStartY.current;

          // Предотвращаем только вертикальный свайп
          if (Math.abs(deltaY) > 10) {
            // небольшой threshold для определения свайпа
            e.preventDefault();
            e.stopPropagation();
          }
        }

        // Сбрасываем touchStartY при окончании касания
        if (e.type === "touchend" || e.type === "touchcancel") {
          touchStartY.current = null;
        }
      };

      document.addEventListener("touchstart", preventDefault, {
        capture: true,
        passive: false,
      });
      document.addEventListener("touchmove", preventDefault, {
        capture: true,
        passive: false,
      });
      document.addEventListener("touchend", preventDefault, {
        capture: true,
        passive: false,
      });
      document.addEventListener("touchcancel", preventDefault, {
        capture: true,
        passive: false,
      });

      drawerElement.style.overscrollBehavior = "none";
      drawerElement.style.touchAction = "pan-x"; // Разрешаем горизонтальные жесты

      return () => {
        document.removeEventListener("touchstart", preventDefault, {
          capture: true,
        });
        document.removeEventListener("touchmove", preventDefault, {
          capture: true,
        });
        document.removeEventListener("touchend", preventDefault, {
          capture: true,
        });
        document.removeEventListener("touchcancel", preventDefault, {
          capture: true,
        });

        drawerElement.style.overscrollBehavior = "";
        drawerElement.style.touchAction = "";
        touchStartY.current = null;
      };
    }, [isOpen]);

    return (
      <DrawerPortal>
        <DrawerOverlay />
        <div
          ref={constraintsRef}
          className="fixed inset-0 z-50 pointer-events-none"
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={ref}
                drag="y"
                dragElastic={0.3}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                onDrag={handleDrag}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={SPRING_CONFIG}
                className={cn(
                  "fixed inset-x-0 bottom-0 z-50 flex flex-col bg-inkwell pointer-events-auto",
                  className
                )}
                {...props}
              >
                <DrawerContentBorders />
                <DrawerHandle />
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DrawerPortal>
    );
  }
);

const DrawerHandle = () => (
  <div className="mx-auto flex justify-center mt-4 mb-6 h-1.5 w-[100px]">
    <GrabIcon />
  </div>
);

const DrawerContentBorders = React.forwardRef<HTMLDivElement, unknown>(
  (_, ref) => (
    <div className="absolute w-full h-full pointer-events-none" ref={ref}>
      <span className="inline-block absolute top-0 left-0 z-[2]">
        <GrabCorner />
      </span>
      <span className="inline-block absolute top-0 right-0 z-[2]">
        <GrabCorner className="rotate-90" />
      </span>
      <div className="absolute left-0 top-0 bottom-auto w-full h-[3px] right-0 m-auto bg-liquor z-[1]" />
      <div className="absolute left-0 top-0 bottom-auto h-[100vh] w-[3px] right-auto m-auto bg-liquor z-[1]" />
      <div className="absolute right-0 top-0 bottom-auto h-[100vh] w-[3px] left-auto m-auto bg-liquor z-[1]" />
      <div className="bg-inkwell absolute top-auto m-auto left-0 right-0 bottom-[-50vh] w-full h-[50vh]" />
    </div>
  )
);

const DrawerHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
));

const DrawerFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
));

DrawerContent.displayName = "DrawerContent";
DrawerHeader.displayName = "DrawerHeader";
DrawerFooter.displayName = "DrawerFooter";
DrawerContentBorders.displayName = "DrawerContentBorders";

export const Drawer = DrawerRoot;

export { DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter };
