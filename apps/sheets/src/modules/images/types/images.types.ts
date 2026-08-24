export interface ImagePosition {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  lockAspectRatio?: boolean;
}

export interface FloatingImageSpec {
  id: string;
  url: string;
  title?: string;
  sheetId: string;
  position: ImagePosition;
  createdAt: string;
}
