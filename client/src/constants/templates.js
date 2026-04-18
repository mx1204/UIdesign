export const WIREFRAME_TEMPLATES = [
  {
    name: 'Login Form',
    elements: [
      { type: 'rect', x: 400, y: 200, width: 320, height: 380, fill: '#ffffff', stroke: '#aaaaaa', strokeWidth: 1, name: 'Container' },
      { type: 'text', x: 440, y: 240, text: 'Sign In', fontSize: 24, fill: '#222222', name: 'Title' },
      { type: 'rect', x: 440, y: 300, width: 240, height: 40, fill: '#f9f9f9', stroke: '#cccccc', name: 'Email Field' },
      { type: 'text', x: 450, y: 312, text: 'Email address', fontSize: 12, fill: '#888888', name: 'Email Placeholder' },
      { type: 'rect', x: 440, y: 360, width: 240, height: 40, fill: '#f9f9f9', stroke: '#cccccc', name: 'Password Field' },
      { type: 'text', x: 450, y: 372, text: 'Password', fontSize: 12, fill: '#888888', name: 'Password Placeholder' },
      { type: 'rect', x: 440, y: 440, width: 240, height: 44, fill: '#2563eb', stroke: 'none', name: 'Submit Button' },
      { type: 'text', x: 520, y: 454, text: 'Login', fontSize: 14, fill: '#ffffff', name: 'Button Text' },
    ]
  },
  {
    name: 'Dashboard Shell',
    elements: [
      { type: 'rect', x: 0, y: 0, width: 240, height: 800, fill: '#f3f4f6', stroke: '#e5e7eb', name: 'Sidebar' },
      { type: 'rect', x: 240, y: 0, width: 1000, height: 64, fill: '#ffffff', stroke: '#e5e7eb', name: 'Header' },
      { type: 'text', x: 40, y: 40, text: 'PLATFORM', fontSize: 18, fill: '#1d4ed8', name: 'Brand' },
      { type: 'rect', x: 40, y: 100, width: 160, height: 32, fill: '#e5e7eb', stroke: 'none', name: 'Menu Item 1' },
      { type: 'rect', x: 40, y: 140, width: 160, height: 32, fill: 'transparent', stroke: 'none', name: 'Menu Item 2' },
      { type: 'rect', x: 300, y: 100, width: 200, height: 120, fill: '#ffffff', stroke: '#cccccc', name: 'Stats Card 1' },
      { type: 'rect', x: 540, y: 100, width: 200, height: 120, fill: '#ffffff', stroke: '#cccccc', name: 'Stats Card 2' },
      { type: 'rect', x: 780, y: 100, width: 200, height: 120, fill: '#ffffff', stroke: '#cccccc', name: 'Stats Card 3' },
    ]
  },
  {
    name: 'Mobile Feed',
    elements: [
      { type: 'rect', x: 450, y: 100, width: 375, height: 667, fill: '#ffffff', stroke: '#333333', strokeWidth: 4, name: 'Phone Frame' },
      { type: 'rect', x: 450, y: 100, width: 375, height: 60, fill: '#ffffff', stroke: '#eeeeee', name: 'Mobile Header' },
      { type: 'rect', x: 465, y: 180, width: 345, height: 200, fill: '#f3f4f6', stroke: '#dddddd', name: 'Post 1 Image' },
      { type: 'rect', x: 465, y: 390, width: 200, height: 14, fill: '#eeeeee', stroke: 'none', name: 'Post 1 Text' },
      { type: 'rect', x: 465, y: 410, width: 150, height: 14, fill: '#eeeeee', stroke: 'none', name: 'Post 1 Subtext' },
      { type: 'circle', x: 485, y: 140, width: 40, height: 40, fill: '#e5e7eb', stroke: 'none', name: 'Avatar' },
    ]
  }
];
