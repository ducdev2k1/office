interface PageScrollIndicatorProps {
  currentPage: number;
  totalPages: number;
  topPx: number;
  visible: boolean;
}

export const PageScrollIndicator = ({
  currentPage,
  totalPages,
  topPx,
  visible,
}: PageScrollIndicatorProps) => {
  if (!visible) return null;

  return (
    <div
      className="absolute right-4.5 z-30 px-2.5 py-1 rounded-full bg-black/85 text-white text-xs font-medium pointer-events-none -translate-y-1/2 transition-opacity shadow"
      style={{ top: `${topPx}px` }}
      aria-hidden="true"
    >
      {currentPage} / {totalPages}
    </div>
  );
};
