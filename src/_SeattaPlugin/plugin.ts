import {Plugin, PanelManager, ContextMenuManager, UIManager,} from "@highlite/plugin-api";

// Experimental superclass for my plugins!
export default abstract class SeattaPlugin extends Plugin {
    abstract override pluginName: string;
    author: string = "Seatta";

    pm: PanelManager = new PanelManager();
    cmm: ContextMenuManager = new ContextMenuManager();
    uim: UIManager = new UIManager();


    // State functions
    abstract override init(): void

    abstract override start(): void

    abstract override stop(): void

    test(): number {
        return 14
    }
}




