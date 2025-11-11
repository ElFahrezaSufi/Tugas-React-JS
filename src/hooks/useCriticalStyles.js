import { useInsertionEffect } from 'react';

function useCriticalStyles(theme) {
  useInsertionEffect(() => {
    const styleId = 'critical-theme-styles';
    let styleTag = document.getElementById(styleId);

    const css = `
      :root[data-theme="${theme}"] { color-scheme: ${theme}; }
      html, body { background-color: transparent; }
    `;

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.insertBefore(styleTag, document.head.firstChild);
    }

    styleTag.textContent = css;

    return () => {
      // Keep the style tag to avoid flash on rapid toggles
    };
  }, [theme]);
}

export default useCriticalStyles;
