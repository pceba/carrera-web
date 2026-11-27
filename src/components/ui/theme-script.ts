/** localStorage key for the theme the visitor picked. Only "dark" is stored: light is the default. */
export const THEME_KEY = "theme";

/**
 * Inlined in <head> so a saved dark choice applies before first paint (no light flash).
 * Kept tiny and dependency-free; storage can throw in private modes, hence try/catch.
 */
export const THEME_SCRIPT = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;
