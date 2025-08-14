/* Seatta's superclass */
declare abstract class SeattaPlugin {
    /* The name of the plugin */
    pluginName: string;

    /* Settings object for the plugin. Refer to the pluginSettings interface.
    * @see {@link https://github.com/Highl1te/Core/blob/main/src/interfaces/highlite/plugin/pluginSettings.interface.ts}
    */
    settings: {
        /* Property for a plugin setting. Refer to the pluginSettings interface
        * @see {@link https://github.com/Highl1te/Core/blob/main/src/interfaces/highlite/plugin/pluginSettings.interface.ts}
        */
        [key: string]: any;
    };

    /* The plugin's author */
    author: string;

    /* Called when the plugin is initialized */
    abstract init(): void;

    /* Called when the plugin is started */
    abstract start(): void;

    /* Called when the plugin is stopped */
    abstract stop(): void;

    /* Logs something to the HighLite console */
    log(any): void;

    /* Not defined in SeattaPlugin.d.ts */
    [key: string]: any;
}

// --- Local alias ---
declare module "SeattaPlugin" {
    export default SeattaPlugin;
}

// --- Remote URL alias ---
declare module "https://cdn.jsdelivr.net/gh/seatta/HighLitePlugins@main/dist/SeattaPlugin.js" {
    export default SeattaPlugin;
}
