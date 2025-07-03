export const theme = {
  colors: {
    // Primary palette - desaturated, vintage, slightly menacing
    primary: {
      50: '#f8f9fa',
      100: '#e9ecef',
      200: '#dee2e6',
      300: '#ced4da',
      400: '#adb5bd',
      500: '#6c757d',
      600: '#495057',
      700: '#343a40',
      800: '#212529',
      900: '#0d1117',
    },
    
    // Accent colors - muted, vintage, slightly unsettling
    accent: {
      // Muted teal/cyan (Kid A influence)
      teal: '#2d4a4a',
      tealLight: '#4a6b6b',
      tealDark: '#1a2f2f',
      
      // Warm vintage orange (Geogaddi influence)
      orange: '#8b4513',
      orangeLight: '#a0522d',
      orangeDark: '#654321',
      
      // Muted red (menacing undertone)
      red: '#5d2e2e',
      redLight: '#7a3d3d',
      redDark: '#3d1f1f',
      
      // Vintage yellow (childlike but eerie)
      yellow: '#8b8b00',
      yellowLight: '#a0a000',
      yellowDark: '#6b6b00',
    },
    
    // Background colors - dark, atmospheric
    background: {
      primary: '#0a0a0a',
      secondary: '#1a1a1a',
      tertiary: '#2a2a2a',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
    
    // Text colors - vintage, slightly faded
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
      tertiary: '#808080',
      muted: '#606060',
      accent: '#8b8b00',
    },
    
    // Border colors - subtle, vintage
    border: {
      primary: '#333333',
      secondary: '#444444',
      accent: '#8b8b00',
    },
  },
  
  // Typography - vintage, slightly distorted
  typography: {
    fontFamily: {
      primary: '"Courier New", "Monaco", "Menlo", monospace',
      secondary: '"Times New Roman", serif',
      display: '"Arial Black", "Helvetica Bold", sans-serif',
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
  },
  
  // Spacing - slightly irregular, organic
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  
  // Border radius - slightly irregular
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows - atmospheric, vintage
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  
  // Animations - slightly glitchy, vintage
  animations: {
    // Snowfall animation
    snowfall: {
      duration: 'infinite',
      timing: 'linear',
      keyframes: `
        0% { transform: translateY(-100vh) rotate(0deg); }
        100% { transform: translateY(100vh) rotate(360deg); }
      `,
    },
    
    // Glitch effect
    glitch: {
      duration: '0.3s',
      timing: 'ease-in-out',
      keyframes: `
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
      `,
    },
    
    // Vintage fade
    fadeIn: {
      duration: '0.5s',
      timing: 'ease-out',
      keyframes: `
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      `,
    },
    
    // Scanlines effect
    scanlines: {
      duration: '0.1s',
      timing: 'linear',
      keyframes: `
        0% { transform: translateY(0); }
        100% { transform: translateY(2px); }
      `,
    },
  },
  
  // Effects - vintage, atmospheric
  effects: {
    // Vintage grain effect
    grain: `
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.05;
      mix-blend-mode: overlay;
    `,
    
    // Vintage vignette
    vignette: `
      background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
      pointer-events: none;
    `,
    
    // Scanlines overlay
    scanlines: `
      background-image: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(255, 255, 255, 0.03) 2px,
        rgba(255, 255, 255, 0.03) 4px
      );
      pointer-events: none;
    `,
  },
} as const;

export type Theme = typeof theme; 