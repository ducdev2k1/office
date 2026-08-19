import type { TextRotationAngle, TextWrapMode } from '@/modules/toolbar/types/toolbar.types';
import { useTranslation } from '@office/i18n';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@office/ui-kit';

export interface AlignmentToolsProps {
  horizontalAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  wrapMode: TextWrapMode;
  textRotation: TextRotationAngle;
  onHorizontalAlignChange: (align: 'left' | 'center' | 'right') => void;
  onVerticalAlignChange: (align: 'top' | 'middle' | 'bottom') => void;
  onSetWrapMode: (mode: TextWrapMode) => void;
  onSetTextRotation: (angle: TextRotationAngle) => void;
}

const ROTATION_PRESETS: Array<{
  angle: TextRotationAngle;
  labelKey: string;
  icon: string;
}> = [
  { angle: 0, labelKey: 'toolbar.align.rotation.none', icon: 'minus' },
  { angle: 45, labelKey: 'toolbar.align.rotation.up45', icon: 'trending-up' },
  { angle: -45, labelKey: 'toolbar.align.rotation.down45', icon: 'trending-down' },
  { angle: 90, labelKey: 'toolbar.align.rotation.up90', icon: 'arrow-up' },
  { angle: -90, labelKey: 'toolbar.align.rotation.down90', icon: 'arrow-down' },
];

export const AlignmentTools = ({
  horizontalAlign,
  verticalAlign,
  wrapMode,
  textRotation,
  onHorizontalAlignChange,
  onVerticalAlignChange,
  onSetWrapMode,
  onSetTextRotation,
}: AlignmentToolsProps) => {
  const { t } = useTranslation('sheets');

  return (
    <div className="flex items-center gap-0.5">
      {/* Horizontal Alignment Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('toolbar.align.horizontalAriaLabel')}
              className="flex h-7 items-center gap-0.5 rounded px-1 text-foreground hover:bg-accent/70"
            />
          }
        >
          <Icon
            name={
              horizontalAlign === 'center'
                ? 'align-center'
                : horizontalAlign === 'right'
                  ? 'align-right'
                  : 'align-left'
            }
            size={16}
          />
          <Icon name="chevron-down" size={10} className="opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-28 text-xs">
          <DropdownMenuItem
            onClick={() => onHorizontalAlignChange('left')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="align-left" size={15} />
            <span>{t('toolbar.align.left')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onHorizontalAlignChange('center')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="align-center" size={15} />
            <span>{t('toolbar.align.center')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onHorizontalAlignChange('right')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="align-right" size={15} />
            <span>{t('toolbar.align.right')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Vertical Alignment Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('toolbar.align.verticalAriaLabel')}
              className="flex h-7 items-center gap-0.5 rounded px-1 text-foreground hover:bg-accent/70"
            />
          }
        >
          <Icon
            name={
              verticalAlign === 'top'
                ? 'arrow-up-to-line'
                : verticalAlign === 'middle'
                  ? 'align-vertical-space-around'
                  : 'arrow-down-to-line'
            }
            size={16}
          />
          <Icon name="chevron-down" size={10} className="opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-28 text-xs">
          <DropdownMenuItem
            onClick={() => onVerticalAlignChange('top')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="arrow-up-to-line" size={15} />
            <span>{t('toolbar.align.top')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onVerticalAlignChange('middle')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="align-vertical-space-around" size={15} />
            <span>{t('toolbar.align.middle')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onVerticalAlignChange('bottom')}
            className="flex items-center gap-2 py-1 text-xs"
          >
            <Icon name="arrow-down-to-line" size={15} />
            <span>{t('toolbar.align.bottom')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Text Wrapping Mode Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('toolbar.align.wrapAriaLabel')}
              className="flex h-7 items-center gap-0.5 rounded px-1 text-foreground hover:bg-accent/70"
            />
          }
        >
          <Icon name="wrap-text" size={16} />
          <Icon name="chevron-down" size={10} className="opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36 text-xs">
          <DropdownMenuItem
            onClick={() => onSetWrapMode('overflow')}
            className="flex items-center justify-between py-1 text-xs"
          >
            <span>{t('toolbar.align.overflow')}</span>
            {wrapMode === 'overflow' && <Icon name="check" size={14} className="text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSetWrapMode('wrap')}
            className="flex items-center justify-between py-1 text-xs"
          >
            <span>{t('toolbar.align.wrap')}</span>
            {wrapMode === 'wrap' && <Icon name="check" size={14} className="text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSetWrapMode('clip')}
            className="flex items-center justify-between py-1 text-xs"
          >
            <span>{t('toolbar.align.clip')}</span>
            {wrapMode === 'clip' && <Icon name="check" size={14} className="text-primary" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Text Rotation Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('toolbar.align.rotationAriaLabel')}
              className="flex h-7 items-center gap-0.5 rounded px-1 text-foreground hover:bg-accent/70"
            />
          }
        >
          <Icon name="rotate-cw" size={15} />
          <Icon name="chevron-down" size={10} className="opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 text-xs">
          {ROTATION_PRESETS.map((rp) => (
            <DropdownMenuItem
              key={rp.angle}
              onClick={() => onSetTextRotation(rp.angle)}
              className="flex items-center justify-between py-1 text-xs"
            >
              <div className="flex items-center gap-2">
                <Icon name={rp.icon} size={14} />
                <span>{t(rp.labelKey)}</span>
              </div>
              {textRotation === rp.angle && (
                <Icon name="check" size={14} className="text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
