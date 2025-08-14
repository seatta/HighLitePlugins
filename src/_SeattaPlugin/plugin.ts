import {Plugin, PanelManager, ContextMenuManager, UIManager,} from "@highlite/plugin-api";

// Experimental superclass for my plugins!
export default abstract class SeattaPlugin extends Plugin {
    abstract override pluginName: string;
    author: string = "Seatta";

    pm: PanelManager = new PanelManager();
    cmm: ContextMenuManager = new ContextMenuManager();
    uim: UIManager = new UIManager();

    // Variables
    // Colors - Based on the dracula theme: https://draculatheme.com/contribute
    COLORS = {
        darkGray: "RGB(40, 42, 54)",
        blue: "RGB(98, 114, 164)",
        gray: "RGB(68, 71, 90)",
        white: "RGB(248, 248, 242)",
        red: "RGB(255, 85, 85)",
        orange: "RGB(255, 184, 108)",
        yellow: "RGB(241, 250, 140)",
        green: "RGB(80, 250, 123)",
        cyan: "RGB(139, 233, 253)",
        purple: "RGB(189, 147, 249)",
        pink: "RGB(255, 121, 198)"
    }

    // State functions
    abstract override init(): void

    abstract override start(): void

    abstract override stop(): void

}




