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
      className={`c-page_indicator ${visible ? 'is-visible' : ''}`}
      style={{ top: `${topPx}px` }}
      aria-hidden="true"
    >
      {currentPage} / {totalPages}
    </div>
  );
};
