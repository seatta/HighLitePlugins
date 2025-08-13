// src/_SeattaPlugin/plugin.ts
import { Plugin, PanelManager, ContextMenuManager, UIManager } from "@highlite/plugin-api";
var SeattaPlugin = class extends Plugin {
  constructor() {
    super(...arguments);
    this.author = "Seatta";
    this.pm = new PanelManager();
    this.cmm = new ContextMenuManager();
    this.uim = new UIManager();
  }
};
export {
  SeattaPlugin as default
};
