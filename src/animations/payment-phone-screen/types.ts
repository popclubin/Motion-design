export interface NumberDisplayConfig {
  fontMode: 'custom' | 'outfit' | 'figtree';
  targetWeight: number;
  digitSpacing: number;
  digitFontSize: number;
  elementScale: number;
  initialScale: number;
  speedIn: number;
  speedOut: number;
  springStiffness: number;
  springDamping: number;
  springMass: number;
  springOvershoot: number;
  enableCommas: boolean;
  commaOffsetY: number;
  commaOpacity: number;
  commaEnterDuration: number;
  rupeeFontSize: number;
  rupeeFontWeight: number;
  rupeeGap: number;
  rupeeTopOffset: number;
}
