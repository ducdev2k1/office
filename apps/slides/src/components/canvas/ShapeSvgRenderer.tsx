import type { SlideElement } from '@/types/slides.types';

export const ShapeSvgRenderer = ({ element }: { element: SlideElement }) => {
  const kind = element.shapeKind || 'rect';
  const fill = element.fill || '#3b82f6';
  const stroke = element.stroke || 'none';
  const strokeWidth = element.strokeWidth || 0;

  if (kind === 'circle') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <ellipse cx="50" cy="50" rx="48" ry="48" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'triangle') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <polygon points="50,4 96,96 4,96" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'right-triangle') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <polygon points="4,4 96,96 4,96" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'diamond') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <polygon points="50,4 96,50 50,96 4,50" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'parallelogram') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <polygon points="25,4 96,4 75,96 4,96" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'trapezoid') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <polygon points="20,4 80,4 96,96 4,96" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'hexagon') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <polygon points="25,4 75,4 96,50 75,96 25,96 4,50" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'octagon') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'star') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'star-6') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <polygon points="50,4 63,28 90,28 72,50 82,76 56,66 50,96 44,66 18,76 28,50 10,28 37,28" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'arrow') {
    return (
      <svg viewBox="0 0 100 60" className="h-full w-full pointer-events-none">
        <polygon points="0,20 60,20 60,0 100,30 60,60 60,40 0,40" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'arrow-left') {
    return (
      <svg viewBox="0 0 100 60" className="h-full w-full pointer-events-none">
        <polygon points="100,20 40,20 40,0 0,30 40,60 40,40 100,40" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'arrow-up') {
    return (
      <svg viewBox="0 0 60 100" className="h-full w-full pointer-events-none">
        <polygon points="20,100 20,40 0,40 30,0 60,40 40,40 40,100" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'arrow-down') {
    return (
      <svg viewBox="0 0 60 100" className="h-full w-full pointer-events-none">
        <polygon points="20,0 20,60 0,60 30,100 60,60 40,60 40,0" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'callout') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <path d="M10,10 H90 V70 H40 L20,90 L25,70 H10 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'cloud') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <path d="M25,60 a20,20 0 0,1 0,-40 a30,30 0 0,1 50,0 a20,20 0 0,1 0,40 z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  if (kind === 'heart') {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full pointer-events-none">
        <path d="M50,85 C20,60 0,40 0,25 C0,10 15,0 30,0 C40,0 45,5 50,15 C55,5 60,0 70,0 C85,0 100,10 100,25 C100,40 80,60 50,85 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </svg>
    );
  }

  return (
    <div
      className="h-full w-full"
      style={{
        backgroundColor: fill,
        border: stroke !== 'none' ? `${strokeWidth || 2}px solid ${stroke}` : undefined,
        borderRadius: kind === 'rounded' ? '12px' : '0px',
      }}
    />
  );
};

export const LineSvgRenderer = ({ element }: { element: SlideElement }) => {
  const lineKind = element.lineKind || 'straight';
  const stroke = element.stroke || '#0f172a';
  const strokeWidth = element.strokeWidth || 3;
  const dashArray = element.lineDash === 'dashed' ? '8,6' : element.lineDash === 'dotted' ? '3,4' : undefined;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full pointer-events-none">
      <defs>
        <marker id={`arr-end-${element.id}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill={stroke} />
        </marker>
        <marker id={`arr-start-${element.id}`} viewBox="0 0 10 10" refX="4" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 10 1 L 0 5 L 10 9 z" fill={stroke} />
        </marker>
      </defs>

      {lineKind === 'straight' && (
        <line
          x1="0"
          y1="50"
          x2="100"
          y2="50"
          stroke={stroke}
          strokeWidth={strokeWidth * 2}
          strokeDasharray={dashArray}
        />
      )}

      {lineKind === 'arrow' && (
        <line
          x1="0"
          y1="50"
          x2="92"
          y2="50"
          stroke={stroke}
          strokeWidth={strokeWidth * 2}
          strokeDasharray={dashArray}
          markerEnd={`url(#arr-end-${element.id})`}
        />
      )}

      {lineKind === 'double-arrow' && (
        <line
          x1="8"
          y1="50"
          x2="92"
          y2="50"
          stroke={stroke}
          strokeWidth={strokeWidth * 2}
          strokeDasharray={dashArray}
          markerStart={`url(#arr-start-${element.id})`}
          markerEnd={`url(#arr-end-${element.id})`}
        />
      )}

      {lineKind === 'elbow' && (
        <path
          d="M 0,10 L 50,10 L 50,90 L 100,90"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth * 2}
          strokeDasharray={dashArray}
        />
      )}

      {lineKind === 'curved' && (
        <path
          d="M 0,80 Q 50,0 100,80"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth * 2}
          strokeDasharray={dashArray}
        />
      )}
    </svg>
  );
};
