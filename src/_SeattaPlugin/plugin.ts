import {
    Plugin,
    PanelManager,
    ContextMenuManager,
    UIManager,
} from "@highlite/core";

// Superclass for my plugins! This class is bundled with any plugin that extends it and imports it with a relative path.
export default abstract class SeattaPlugin extends Plugin {
    abstract override pluginName: string;
    author: string = "Seatta";

    pm: PanelManager = new PanelManager();
    cmm: ContextMenuManager = new ContextMenuManager();
    uim: UIManager = new UIManager();

    // Variables
    // CSS color variables to use for theming
    css = {
        bg: "var(--theme-background)",
        bg_soft: "var(--theme-background-soft)",
        bg_muted: "var(--theme-background-mute)",
        bg_light: "var(--theme-background-light)",
        accent: "var(--theme-accent)",
        accent_dark: "var(--theme-accent-dark)",
        accent_light: "var(--theme-accent-light)",
        accent_muted: "var(--theme-accent-muted)",
        fg: "var(--theme-text-primary)",
        fg_sec: "var(--theme-text-secondary)",
        fg_dark: "var(--theme-text-dark)",
        fg_muted: "var(--theme-text-muted)",
        success: "var(--theme-success)",
        success_light: "var(--theme-success-light)",
        success_dark: "var(--theme-success-dark)",
        danger: "var(--theme-danger)",
        danger_light: "var(--theme-danger-light)",
        danger_dark: "var(--theme-danger-dark)"
    }

    // State functions
    abstract override init(): void

    abstract override start(): void

    abstract override stop(): void

}




