import SeattaPlugin from "../_SeattaPlugin/plugin";
import {SettingsTypes} from "@highlite/core";

type ThemeColors = Record<string, string>;

export default class ClientThemes extends SeattaPlugin {
    override pluginName: string = "Themes";

    constructor() {
        super();
        this.settings.CurrentTheme = {
            text: "Theme",
            description: "The theme for the client to use",
            type: SettingsTypes.combobox,
            options: Object.values(Theme.THEMES).map(theme => theme.name),
            value: "Default",
            callback: () => {
                document.getElementById("custom-overrides")?.remove();

                const newTheme: Theme | undefined = Theme.getByName(this.settings.CurrentTheme!.value as string);
                if (newTheme) newTheme.apply();
                this.addCustomCssStyle(this.settings.customCSS!.value as string)
            }
        }

        this.settings.isCustomDarkMode = {
            text: "Dark Mode?",
            description: "Is your custom theme a dark mode theme?",
            type: SettingsTypes.checkbox,
            value: false,
            callback: () =>
                this.updateCustomTheme(this.settings.isCustomDarkMode!.value as boolean, null, null)
        }
        this.settings.customBackgroundColor = {
            text: "Background Color",
            description: "Custom Theme: Set the '--theme-background' css variable ",
            type: SettingsTypes.color,
            value: "#303446",
            callback: () => {
                this.updateCustomTheme(this.settings.isCustomDarkMode!.value as boolean,
                    "--theme-background",
                    this.settings.customBackgroundColor!.value as string)
            }
        }
        this.settings.customAccentColor = {
            text: "Accent Color",
            description: "Custom Theme: Set the '--theme-accent' css variable ",
            type: SettingsTypes.color,
            value: "#c6a0f6",
            callback: () => {
                this.updateCustomTheme(this.settings.isCustomDarkMode!.value as boolean,
                    "--theme-accent",
                    this.settings.customAccentColor!.value as string)
            }
        }
        this.settings.customPrimaryTextColor = {
            text: "Text Color",
            description: "Custom Theme: Set the '--theme-text-primary' css variable ",
            type: SettingsTypes.color,
            value: "#cad3f5",
            callback: () => {
                this.updateCustomTheme(this.settings.isCustomDarkMode!.value as boolean,
                    "--theme-text-primary",
                    this.settings.customPrimaryTextColor!.value as string)
            }
        }
        this.settings.customAltTextColor = {
            text: "Alt Text Color",
            description: "Custom Theme: Set the '--theme-text-dark' css variable ",
            type: SettingsTypes.color,
            value: "#494d64",
            callback: () => {
                this.updateCustomTheme(this.settings.isCustomDarkMode!.value as boolean,
                    "--theme-text-dark",
                    this.settings.customAltTextColor!.value as string)
            }
        }
        this.settings.customSuccessColor = {
            text: "Success Color",
            description: "Custom Theme: Set the '--theme-success' css variable ",
            type: SettingsTypes.color,
            value: "#a6da95",
            callback: () => {
                this.updateCustomTheme(this.settings.isCustomDarkMode!.value as boolean,
                    "--theme-success",
                    this.settings.customSuccessColor!.value as string)
            }
        }
        this.settings.customDangerColor = {
            text: "Danger Color",
            description: "Custom Theme: Set the '--theme-danger' css variable ",
            type: SettingsTypes.color,
            value: "#ed8796",
            callback: () => {
                this.updateCustomTheme(this.settings.isCustomDarkMode!.value as boolean,
                    "--theme-danger",
                    this.settings.customDangerColor!.value as string)
            }
        }

        this.settings.customCSS = {
            text: "Custom CSS",
            description: "Add some custom css here",
            type: SettingsTypes.textarea,
            value: "",
            callback: () =>
                this.addCustomCssStyle(this.settings.customCSS!.value as string)
        }
    }

    updateCustomTheme(isDarkMode: boolean, themeProperty: string | null, propertyValue: string | null) {
        let customTheme = Theme.getByName("Custom")!;
        customTheme.isDarkModeTheme = isDarkMode;

        if (themeProperty && propertyValue) {
            customTheme.highliteColors[themeProperty] = propertyValue;
        }
        if (this.settings.CurrentTheme!.value as string === "Custom") customTheme.apply()
    }


    addCustomCssStyle(value: string) {
        let customOverrides: HTMLElement | null = document.getElementById("custom-overrides");
        if (!customOverrides) {
            customOverrides = document.createElement("style");
            customOverrides.id = "custom-overrides";
            document.head.appendChild(customOverrides);
        }

        // Set the custom-overrides text to custom style blocks built from our colors
        customOverrides.textContent = `${value}`
    }

    populateCustomTheme() {
        let customTheme = Theme.getByName("Custom")!;
        customTheme.highliteColors = {
            "--theme-background": this.settings.customBackgroundColor?.value as string | "#525252",
            "--theme-accent": this.settings.customAccentColor?.value as string | "#11dd22",
            "--theme-text-primary": this.settings.customPrimaryTextColor?.value as string | "#000000",
            "--theme-text-dark": this.settings.customAltTextColor?.value as string | "#cccccc",
            "--theme-success": this.settings.customSuccessColor?.value as string | "#00ccff",
            "--theme-danger": this.settings.customDangerColor?.value as string | "#dd6565",
        }
    }

    override init(): void {
        this.log("Initialized")
    }

    override start(): void {
        this.log("Started Theme Switcher");
        this.populateCustomTheme();
        const newTheme: Theme = (Theme.getByName(this.settings.CurrentTheme!.value as string) || Theme.getByName("Default")!);
        newTheme.apply()
        this.addCustomCssStyle(this.settings.customCSS!.value as string)
    }

    override stop(): void {
        this.log("Stopped Theme Switcher")

        let defaultTheme = Theme.getByName("Default")!;
        defaultTheme.apply()
        document.getElementById("custom-overrides")?.remove();
    }
}

class Theme {
    private clientColors: ThemeColors;
    highliteColors: ThemeColors;
    isDarkModeTheme: boolean;

    private constructor(public readonly name: string, isDarkModeTheme: boolean, highliteColors: ThemeColors = {}, clientColors: ThemeColors = {}) {
        this.highliteColors = highliteColors;
        this.clientColors = clientColors;
        this.isDarkModeTheme = isDarkModeTheme;
    }

    static readonly THEMES: Record<string, Theme> = {
        // The default HighLite theme - Colors don't need to be defined since we'll remove the theme-overrides element
        Default: new Theme("Default", true),
        Catppuccin_Dark: new Theme("Catppuccin - Dark", true, {
            "--theme-background": "#303446",
            "--theme-accent": "#c6a0f6",
            "--theme-text-primary": "#cad3f5",
            "--theme-text-dark": "#494d64",
            "--theme-success": "#a6da95",
            "--theme-danger": "#ed8796",
        }),
        Catppuccin: new Theme("Catppuccin - Light", false, {
            "--theme-background": "#eff1f5",
            "--theme-accent": "#1e66f5",
            "--theme-text-primary": "#4c4f69",
            "--theme-text-dark": "#9ca0b0",
            "--theme-success": "#40a02b",
            "--theme-danger": "#e64553",
        }),
        Custom: new Theme("Custom", false)
    };

    /**
     * Calculates shades and transparencies for the selected theme.
     * This is done so we don't have to define nearly 20 more colors per theme
     */
    calculateHighliteColorShades() {
        if (this.name === "Default") return;
        this.highliteColors["--theme-accent-muted"] = Theme.hexToRgba(this.getHighlite("--theme-accent")!, .8);
        this.highliteColors["--theme-accent-transparent-10"] = Theme.hexToRgba(this.getHighlite("--theme-accent")!, .1);
        this.highliteColors["--theme-accent-transparent-20"] = Theme.hexToRgba(this.getHighlite("--theme-accent")!, .2);
        this.highliteColors["--theme-accent-transparent-30"] = Theme.hexToRgba(this.getHighlite("--theme-accent")!, .3);
        this.highliteColors["--theme-accent-transparent-40"] = Theme.hexToRgba(this.getHighlite("--theme-accent")!, .4);
        this.highliteColors["--theme-accent-transparent-60"] = Theme.hexToRgba(this.getHighlite("--theme-accent")!, .6);
        this.highliteColors["--theme-success-transparent-30"] = Theme.hexToRgba(this.getHighlite("--theme-success")!, .3);
        this.highliteColors["--theme-danger-transparent-30"] = Theme.hexToRgba(this.getHighlite("--theme-danger")!, .3);
        this.highliteColors["--theme-text-secondary"] = Theme.hexToRgba(this.getHighlite("--theme-text-primary")!, .8);
        this.highliteColors["--theme-text-muted"] = Theme.hexToRgba(this.getHighlite("--theme-text-primary")!, .6);
        this.highliteColors["--theme-text-reversed"] = Theme.adjustColorBrightness(this.getHighlite("--theme-text-primary")!, this.isDarkModeTheme ? 0.6 : 2);
        this.highliteColors["--theme-background-soft"] = Theme.adjustColorBrightness(this.getHighlite("--theme-background")!, this.isDarkModeTheme ? 1.05 : 0.95);
        this.highliteColors["--theme-background-mute"] = Theme.adjustColorBrightness(this.getHighlite("--theme-background")!, this.isDarkModeTheme ? 1.4 : 0.8);
        this.highliteColors["--theme-background-light"] = Theme.adjustColorBrightness(this.getHighlite("--theme-background")!, this.isDarkModeTheme ? 1.4 : 0.8);
        this.highliteColors["--theme-accent-dark"] = Theme.adjustColorBrightness(this.getHighlite("--theme-accent")!, this.isDarkModeTheme ? 0.8 : 1.2);
        this.highliteColors["--theme-accent-light"] = Theme.adjustColorBrightness(this.getHighlite("--theme-accent")!, this.isDarkModeTheme ? 1.2 : 0.8);
        this.highliteColors["--theme-success-dark"] = Theme.adjustColorBrightness(this.getHighlite("--theme-success")!, this.isDarkModeTheme ? 0.8 : 1.2);
        this.highliteColors["--theme-success-light"] = Theme.adjustColorBrightness(this.getHighlite("--theme-success")!, this.isDarkModeTheme ? 1.2 : 0.8);
        this.highliteColors["--theme-danger-dark"] = Theme.adjustColorBrightness(this.getHighlite("--theme-danger")!, this.isDarkModeTheme ? 0.8 : 1.2);
        this.highliteColors["--theme-danger-light"] = Theme.adjustColorBrightness(this.getHighlite("--theme-danger")!, this.isDarkModeTheme ? 1.2 : 0.8);
        this.highliteColors["--theme-border"] = Theme.hexToRgba(this.getHighlite("--theme-accent")!, 0.1)
        this.highliteColors["--theme-border-light"] = Theme.hexToRgba(this.getHighlite("--theme-border")!, 0.05)
        this.highliteColors["--theme-divider"] = Theme.hexToRgba(this.getHighlite("--theme-accent")!, 0.15)
    }

    /**
     * Returns a ThemeColors object of clientColors based on highliteColors
     */
    getClientColorsFromHighliteColors(): ThemeColors {
        return {
            "color": this.highliteColors["--theme-accent"],
            "--hs-color-menu-bg": Theme.hexToRgba(this.highliteColors["--theme-background"]!, 0.9),
            "--hs-color-menu-border": this.highliteColors["--theme-accent"]!,
            "--hs-color-overlay-menu-bg": Theme.hexToRgba(this.highliteColors["--theme-background"]!, 0.8),
            "--hs-color-menu-header-fg": this.getHighlite("--theme-text-primary")!,
            "--hs-color-inventory-item-amount-bg": this.getHighlite("--theme-background-light")!,
        };
    }

    apply() {
        let themeOverrides: HTMLElement | null = document.getElementById("theme-overrides");

        if (this.name === "Default") {
            themeOverrides?.remove();
        } else {
            this.calculateHighliteColorShades()
            this.clientColors = this.getClientColorsFromHighliteColors();
            if (!themeOverrides) {
                themeOverrides = document.createElement("style");
                themeOverrides.id = "theme-overrides";
                document.head.appendChild(themeOverrides);
            }

            // Set the theme-overrides text to custom style blocks built from our colors
            themeOverrides.textContent =
                `${this.createCssStyleBlock(":root", this.highliteColors)}
                 \n${this.createCssStyleBlock("#hs-screen-mask, #hs-screen-mask.hs-dark-theme", this.clientColors)}
                 \n${this.createCssStyleBlock(".hs-action-bar-item__text", {"color": this.highliteColors["--theme-text-primary"]})}
                 \n${this.createCssStyleBlock(".hs-action-bar-button--selected", {
                    "color": this.highliteColors["--theme-text-reversed"],
                    "background-color": this.highliteColors["--theme-accent"]
                })}
                 \n${this.createCssStyleBlock(".hs-action-bar-button--selected:hover", {
                    "background-color": this.highliteColors["--theme-accent-light"]
                })}
                 \n${this.createCssStyleBlock(".hs-text--yellow:not(.hs-chat-menu__message-text-container)", {
                    "color": this.highliteColors["--theme-accent"]
                })}
                \n${this.createCssStyleBlock(".hs-text--white:not(.hs-chat-menu__message-text-container)", {
                    "color": this.highliteColors["--theme-accent"]
                })}
                 \n${this.createCssStyleBlock("hs-chat-menu__message-text-container", {
                    "color": this.isDarkModeTheme ? this.highliteColors["--theme-text-primary"] : this.highliteColors["--theme-text-reversed"]
                })}
                \n${this.createCssStyleBlock(".hs-context-menu__item:hover", {
                    "color": this.highliteColors["--theme-background-mute"]
                })}
                \n${this.createCssStyleBlock(".hs-context-menu__item:hover .hs-context-menu__item__action-name", {
                    "color": this.highliteColors["--theme-accent"]
                })}
                \n${this.createCssStyleBlock("hs-context-menu__item__action-name", {
                    "color": this.highliteColors["--theme-text-primary"]
                })}
                \n${this.createCssStyleBlock(".hs-action-bar-button--selected .hs-action-bar-item__text", {
                    "color": this.highliteColors["--theme-text-reversed"]
                })}`;

        }

        // Recolor the HighLite window frame to match the theme
        this.recolorFrame();
    }

    static getByName(name: string): Theme | undefined {
        return Object.values(this.THEMES).find(theme => theme.name === name);
    }


    // Gets the value of a key from the highliteColors object
    getHighlite(key: string): string | undefined {
        return this.highliteColors[key];
    }

    // Gets the value of a key from the clientColors object
    getClient(key: string): string | undefined {
        return this.clientColors[key];
    }


    /* Takes a selector string and an object of colors and converts it into a css block*/
    private createCssStyleBlock(selector: String, obj: Record<string, string>): string {
        const lines = Object.entries(obj).map(([key, value]) => `    ${key}: ${value};`);
        return `${selector} {\n${lines.join("\n")}\n}`;
    }


    /** Recolors the window to match the colors of the selected theme */
    recolorFrame() {
        const mainFrame: HTMLElement = document.getElementById("main")!;
        const bodyContainer: HTMLElement = document.getElementById("body-container")!;

        let barColor = this.name !== "Default" ? this.getHighlite("--theme-background")! : "#141414";
        let textColor = this.name !== "Default" ? this.getHighlite("--theme-text-primary")! : "#fff";

        let titleBar = bodyContainer.querySelector<HTMLElement>(".highlite_titlebar")!
        titleBar.style.background = barColor;
        titleBar.style.color = textColor;

        mainFrame.querySelectorAll<HTMLElement>(".highlite_bar").forEach(ele => {
            ele.style.background = barColor;
        });
        mainFrame.querySelectorAll<HTMLElement>(".content_title").forEach(ele => {
            ele.style.background = barColor
        });
        mainFrame.querySelectorAll<HTMLElement>(".highlite_bar_selected_content").forEach(ele => {
            ele.style.color = textColor;
        });
    }


    private static adjustColorBrightness(color: string, factor: number): string {
        // Convert hex to RGB
        let r: number, g: number, b: number;

        if (color.startsWith("#")) {
            const clean = color.slice(1);
            r = parseInt(clean.slice(0, 2), 16);
            g = parseInt(clean.slice(2, 4), 16);
            b = parseInt(clean.slice(4, 6), 16);
        } else {
            // Assume rgb(...) format
            const match = color.match(/rgb(a?)\((\d+),\s*(\d+),\s*(\d+)/);
            if (!match) throw new Error("Invalid RGB(A) color");
            r = parseInt(match[2], 10);
            g = parseInt(match[3], 10);
            b = parseInt(match[4], 10);
        }

        const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)));

        r = clamp(r * factor);
        g = clamp(g * factor);
        b = clamp(b * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    private static hexToRgb(hex: string) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return {r, g, b};
    }

    private static rgbToHex({r, g, b}: { r: number; g: number; b: number }) {
        const toHex = (c: number) => c.toString(16).padStart(2, "0");
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    private static rgbaToHex(rgba: string, includeAlpha = false): string {
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)?\)/);
        if (!match) throw new Error("Invalid rgba format");

        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        const a = match[4] ? parseFloat(match[4]) : 1;

        const toHex = (n: number) => n.toString(16).padStart(2, "0");

        const alphaHex = Math.round(a * 255);
        return `#${toHex(r)}${toHex(g)}${toHex(b)}${includeAlpha ? toHex(alphaHex) : ""}`;
    }

    private static hexToRgba(hex: string, alpha: number): string {
        const cleanHex = hex.replace("#", "");
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
