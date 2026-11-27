/** localStorage key for the theme the visitor picked. Absent = follow the OS. */
export const THEME_KEY = "theme";

/**
 * Inlined in <head> so the saved theme applies before first paint (no light flash on a dark
 * choice). Kept tiny and dependency-free; storage can throw in private modes, hence try/catch.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
