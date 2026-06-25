declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        poster?: string;
        'ios-src'?: string;
        alt?: string;
        'auto-rotate'?: string;
        'camera-controls'?: string;
        ar?: string;
        'ar-modes'?: string;
        exposure?: number;
        'shadow-intensity'?: number;
        'environment-image'?: string;
        'camera-orbit'?: string;
        'field-of-view'?: string;
        'interaction-prompt'?: string;
        loading?: 'auto' | 'lazy' | 'eager';
        reveal?: 'auto' | 'interaction' | 'manual';
      },
      HTMLElement
    >;
  }
}
