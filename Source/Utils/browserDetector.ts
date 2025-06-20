/**
 *  Detects the browser the user is using based on the user agent string.
 *  This helps in determining which browser-specific features or fixes might be needed.
 *
 *  @returns {string} The name of the browser the user is using. Possible values are 'chrome', 'ie', 'safari', 'firefox', 'opera', or 'unknown'.
 */
export const browserDetector = (): string => {
  const userAgent = navigator.userAgent;

  const browsers: { [key: string]: boolean } = {
    chrome: /Chrome/.test(userAgent) && !/OPR/.test(userAgent),
    ie: /MSIE|Trident/.test(userAgent),
    safari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    firefox: /Firefox/.test(userAgent),
    opera: /OPR/.test(userAgent),
  };

  const browser = Object.keys(browsers).find((key) => browsers[key]) || "unknown";

  return browser;
};
