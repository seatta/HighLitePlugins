import SeattaPlugin from '../_SeattaPlugin/plugin';
import { SettingsTypes } from '@highlite/core';

type ThemeData = Record<string, string>;

export default class ClientThemes extends SeattaPlugin {
    override pluginName: string = 'Themes';

    constructor() {
        super();
        this.settings.CurrentTheme = {
            text: 'Theme',
            description: 'The theme for the client to use',
            type: SettingsTypes.combobox,
            options: Object.values(Theme.getThemes()).map(theme => theme.name),
            value: 'Default',
            callback: () => {
                document.getElementById('client-themes-css-overrides')?.remove();

                const newTheme: Theme | undefined = Theme.getByName(this.settings.CurrentTheme!.value as string);
                if (newTheme) newTheme.apply();
                this.addCustomCssStyle(this.settings.customCSS!.value as string);
            },
        };

        this.settings.isCustomDarkMode = {
            text: 'Dark Mode?',
            description: 'Is your custom theme a dark mode theme?',
            type: SettingsTypes.checkbox,
            value: false,
            callback: () => this.updateCustomTheme(this.settings.isCustomDarkMode!.value as boolean, null, null, true),
        };
        this.settings.customBackgroundColor = {
            text: 'Background Color',
            description: "Custom Theme: Set the '--theme-background' css variable ",
            type: SettingsTypes.color,
            value: '#303446',
            callback: () => {
                this.updateCustomTheme(
                    this.settings.isCustomDarkMode!.value as boolean,
                    '--theme-background',
                    this.settings.customBackgroundColor!.value as string,
                    true
                );
            },
        };
        this.settings.customAccentColor = {
            text: 'Accent Color',
            description: "Custom Theme: Set the '--theme-accent' css variable ",
            type: SettingsTypes.color,
            value: '#c6a0f6',
            callback: () => {
                this.updateCustomTheme(
                    this.settings.isCustomDarkMode!.value as boolean,
                    '--theme-accent',
                    this.settings.customAccentColor!.value as string,
                    true
                );
            },
        };
        this.settings.customPrimaryTextColor = {
            text: 'Text Color',
            description: "Custom Theme: Set the '--theme-text-primary' css variable ",
            type: SettingsTypes.color,
            value: '#cad3f5',
            callback: () => {
                this.updateCustomTheme(
                    this.settings.isCustomDarkMode!.value as boolean,
                    '--theme-text-primary',
                    this.settings.customPrimaryTextColor!.value as string,
                    true
                );
            },
        };
        this.settings.customAltTextColor = {
            text: 'Alt Text Color',
            description: "Custom Theme: Set the '--theme-text-dark' css variable ",
            type: SettingsTypes.color,
            value: '#494d64',
            callback: () => {
                this.updateCustomTheme(
                    this.settings.isCustomDarkMode!.value as boolean,
                    '--theme-text-dark',
                    this.settings.customAltTextColor!.value as string,
                    true
                );
            },
        };
        this.settings.customSuccessColor = {
            text: 'Success Color',
            description: "Custom Theme: Set the '--theme-success' css variable ",
            type: SettingsTypes.color,
            value: '#a6da95',
            callback: () => {
                this.updateCustomTheme(
                    this.settings.isCustomDarkMode!.value as boolean,
                    '--theme-success',
                    this.settings.customSuccessColor!.value as string,
                    true
                );
            },
        };
        this.settings.customDangerColor = {
            text: 'Danger Color',
            description: "Custom Theme: Set the '--theme-danger' css variable ",
            type: SettingsTypes.color,
            value: '#ed8796',
            callback: () => {
                this.updateCustomTheme(
                    this.settings.isCustomDarkMode!.value as boolean,
                    '--theme-danger',
                    this.settings.customDangerColor!.value as string,
                    true
                );
            },
        };

        this.settings.exportThemeAsJson = {
            text: 'Export custom theme',
            description: 'Export your custom theme as a json file',
            type: SettingsTypes.button,
            value: '',
            callback: () => this.exportThemeAsJson(),
        };
        this.settings.importThemeFromJson = {
            text: 'Import custom theme',
            description: 'Overwrite the custom theme with values a json file',
            type: SettingsTypes.button,
            value: '',
            callback: () => {
                this.importThemeFromJson().then();
                if (this.isCustomThemeSet()) {
                    Theme.getByName('Default')!.apply();
                    Theme.getByName('Custom')!.apply();
                }
            },
        };

        this.settings.customCSS = {
            text: 'Custom CSS',
            description: 'Add some custom css here',
            type: SettingsTypes.textarea,
            value: '',
            callback: () => {
                this.addCustomCssStyle(this.settings.customCSS!.value as string);
            },
        };
    }

    exportThemeAsJson() {
        const t = Theme.CUSTOM;
        const themeData = {
            isDarkMode: t.isDarkModeTheme,
            '--theme-background': t.highliteColors['--theme-background'],
            '--theme-accent': t.highliteColors['--theme-accent'],
            '--theme-text-primary': t.highliteColors['--theme-text-primary'],
            '--theme-text-dark': t.highliteColors['--theme-text-dark'],
            '--theme-success': t.highliteColors['--theme-success'],
            '--theme-danger': t.highliteColors['--theme-danger'],
        };

        const blob = new Blob([JSON.stringify(themeData, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-theme.json';
        a.click();

        URL.revokeObjectURL(url);
        this.log('Exported custom theme to file');
    }

    async importThemeFromJson() {
        // Ask for confirmation first
        const confirmed = confirm(
            'Importing a theme will overwrite your current custom theme. Do you want to continue?'
        );
        if (!confirmed) return;

        // Create a hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        return new Promise<void>((resolve, reject) => {
            input.onchange = async (e: Event) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) {
                    reject('No file selected');
                    return;
                }

                try {
                    const themeData: {
                        isDarkMode: boolean;
                        [key: string]: string | boolean;
                    } = JSON.parse(await file.text());

                    if (
                        typeof themeData.isDarkMode !== 'boolean' ||
                        !('--theme-background' in themeData) ||
                        !('--theme-accent' in themeData) ||
                        !('--theme-text-primary' in themeData) ||
                        !('--theme-text-dark' in themeData) ||
                        !('--theme-success' in themeData) ||
                        !('--theme-danger' in themeData)
                    ) {
                        alert('Invalid theme file: missing required properties.');
                        reject('Invalid theme file');
                        return;
                    }

                    const container = document.getElementById('highlite-settings-content-row-holder')!;
                    const colorVariables = [
                        '--theme-background',
                        '--theme-accent',
                        '--theme-text-primary',
                        '--theme-text-dark',
                        '--theme-success',
                        '--theme-danger',
                    ];

                    const darkCheckbox = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[0];
                    darkCheckbox.checked = themeData.isDarkMode;
                    darkCheckbox.dispatchEvent(new Event('change'), { bubbles: true });

                    const colorInputs = container.querySelectorAll<HTMLInputElement>('input[type="color"]');
                    for (let i = 0; i < colorInputs.length; i++) {
                        colorInputs[i].value = themeData[colorVariables[i]];
                        colorInputs[i].dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    this.log('Imported custom theme from file');
                    resolve();
                } catch (err) {
                    alert('Failed to parse JSON: ' + err);
                    reject(err);
                }
            };

            // Trigger file dialog
            input.click();
        });
    }

    /**
     * Update a value for the custom theme
     *
     * @param isDarkMode boolean | null-- Whether the theme is a dark mode theme.
     * Null skips assignment
     * @param themeProperty string | null -- The theme property to update
     * Null on themeProperty or propertyValue skips assignment
     * @param propertyValue string | null -- The value to set for themeProperty
     * Null on themeProperty or propertyValue skips assignment
     * @param applyAfter boolean -- Whether to apply the theme afterward.
     * Only applies if the current theme is set to the Custom theme
     */
    updateCustomTheme(
        isDarkMode: boolean | null,
        themeProperty: string | null,
        propertyValue: string | null,
        applyAfter: boolean
    ) {
        let custom = Theme.CUSTOM;
        if (isDarkMode !== null) custom.isDarkModeTheme = isDarkMode;

        if (themeProperty && propertyValue) custom.highliteColors[themeProperty] = propertyValue;
        if (applyAfter && this.isCustomThemeSet()) custom.apply();
    }

    /**
     * Returns whether the custom theme is currently set
     */
    isCustomThemeSet(): boolean {
        return (this.settings.CurrentTheme!.value as string) === 'Custom';
    }

    /**
     * Read custom theme data from settings, or initialize them with preset values
     */
    populateCustomTheme() {
        let customTheme = Theme.getByName('Custom')!;
        customTheme.highliteColors = {
            '--theme-background': this.settings.customBackgroundColor?.value as string | '#525252',
            '--theme-accent': this.settings.customAccentColor?.value as string | '#11dd22',
            '--theme-text-primary': this.settings.customPrimaryTextColor?.value as string | '#000000',
            '--theme-text-dark': this.settings.customAltTextColor?.value as string | '#cccccc',
            '--theme-success': this.settings.customSuccessColor?.value as string | '#00ccff',
            '--theme-danger': this.settings.customDangerColor?.value as string | '#dd6565',
        };
    }

    /**
     * Appends a custom style element to <head>
     *
     * @param value string -- The style information to set
     */
    addCustomCssStyle(value: string) {
        let customOverrides: HTMLElement | null = document.getElementById('client-themes-css-overrides');
        if (!customOverrides) {
            customOverrides = document.createElement('style');
            customOverrides.id = 'client-themes-css-overrides';
            document.head.appendChild(customOverrides);
        }

        // Set the client-themes-css-overrides text to custom style blocks built from our colors
        customOverrides.textContent = value;
    }

    override init(): void {
        this.log('Initialized');
    }

    override start(): void {
        this.log('Started Theme Switcher');
        this.populateCustomTheme();
        (Theme.getByName(this.settings.CurrentTheme!.value as string) || Theme.getByName('Default')!).apply();
        this.addCustomCssStyle(this.settings.customCSS!.value as string);
    }

    override stop(): void {
        this.log('Stopped Theme Switcher');
        Theme.getByName('Default')!.apply();
        document.getElementById('client-themes-css-overrides')?.remove();
    }
}

class Theme {
    private static currentTheme: Theme;

    private clientColors: ThemeData = {};
    highliteColors: ThemeData;
    isDarkModeTheme: boolean;

    private constructor(
        public readonly name: string,
        isDarkModeTheme: boolean,
        highliteColors: ThemeData = {}
    ) {
        this.highliteColors = highliteColors;
        this.isDarkModeTheme = isDarkModeTheme;
    }

    /** When defining a theme 6 colors are required for the highliteColors ThemeData object
     * --theme-background:      The main background color for the theme
     * --theme-accent:          The primary accent color, used for highlights and emphasis
     * --theme-text-primary:    The primary text color
     * --theme-text-dark:       An alternate text color used when contrast with the primary text is needed
     * --theme-success:         The primary success color, used to indicate positive actions or states
     * --theme-danger:          The primary danger color, used to indicate errors or alerts
     *
     * This plugin will automatically override the rest of the highlite css variables based on the ones we defined.
     * That way, we don't need to define ~25 color variables per theme :)
     */

    /** The default HighLite theme */
    // Colors don't need to be defined since we'll remove the .client-themes-theme-overrides element
    public static DEFAULT: Theme = new Theme('Default', true);

    /** Based on Catppuccin Macchiato: https://catppuccin.com/palette/ */
    public static CATPPUCCIN_DARK: Theme = new Theme('Catppuccin - Dark', true, {
        '--theme-background': '#303446',
        '--theme-accent': '#c6a0f6',
        '--theme-text-primary': '#cad3f5',
        '--theme-text-dark': '#91d7e3',
        '--theme-success': '#a6da95',
        '--theme-danger': '#ed8796',
    });

    /** Based on Catppuccin Latte: https://catppuccin.com/palette/ */
    public static CATPPUCCIN_LIGHT: Theme = new Theme('Catppuccin - Light', false, {
        '--theme-background': '#eff1f5',
        '--theme-accent': '#1e66f5',
        '--theme-text-primary': '#4c4f69',
        '--theme-text-dark': '#04a5e5',
        '--theme-success': '#40a02b',
        '--theme-danger': '#e64553',
    });
    /** Based on Dracula: https://draculatheme.com/contribute */
    public static DRACULA: Theme = new Theme('Dracula', true, {
        '--theme-background': '#282A36',
        '--theme-accent': '#BD93F9',
        '--theme-text-primary': '#F8F8F2',
        '--theme-text-dark': '#8BE9FD',
        '--theme-success': '#50FA7B',
        '--theme-danger': '#FF5555',
    });

    /** Based on Alucard: https://draculatheme.com/contribute */
    public static ALUCARD: Theme = new Theme('Alucard', false, {
        '--theme-background': '#FFFBEB',
        '--theme-accent': '#A34D14',
        '--theme-text-primary': '#1F1F1F',
        '--theme-text-dark': '#CFCFDE',
        '--theme-success': '#14710A',
        '--theme-danger': '#CB3A2A',
    });

    /** Based on the Nord palette: https://www.nordtheme.com/docs/colors-and-palettes */
    public static NORD_DARK: Theme = new Theme('Nord - Dark', true, {
        '--theme-background': '#2e3440',
        '--theme-accent': '#88c0d0',
        '--theme-text-primary': '#eceff4',
        '--theme-text-dark': '#81a1c1',
        '--theme-success': '#a3be8c',
        '--theme-danger': '#d08770',
    });

    /** Based on the Nord palette: https://www.nordtheme.com/docs/colors-and-palettes */
    public static NORD_LIGHT: Theme = new Theme('Nord - Light', false, {
        '--theme-background': '#d8dee9',
        '--theme-accent': '#5e81ac',
        '--theme-text-primary': '#2e3440',
        '--theme-text-dark': '#88c0d0',
        '--theme-success': '#a3be8c',
        '--theme-danger': '#bf616a',
    });

    /** Based on Puffball-6 by polyphrog: https://lospec.com/palette-list/puffball-6 */
    public static PUFFBALL_6: Theme = new Theme('Puffball-6', false, {
        '--theme-background': '#eedbc8',
        '--theme-accent': '#548b71',
        '--theme-text-primary': '#5a473e',
        '--theme-text-dark': '#e0bb68',
        '--theme-success': '#97b34e',
        '--theme-danger': '#d58353',
    });

    /** The user-defined theme */
    public static CUSTOM: Theme = new Theme('Custom', false);

    /**
     * Calculates shades and transparencies for the selected theme.
     * This is done so we don't have to define nearly 20 more colors per theme
     */
    private calculateHighliteColorShades() {
        if (this === Theme.DEFAULT) return;
        this.highliteColors['--theme-accent-muted'] = Theme.hexToRgba(this.getProp('--theme-accent')!, 0.8);
        this.highliteColors['--theme-accent-transparent-10'] = Theme.hexToRgba(this.getProp('--theme-accent')!, 0.1);
        this.highliteColors['--theme-accent-transparent-20'] = Theme.hexToRgba(this.getProp('--theme-accent')!, 0.2);
        this.highliteColors['--theme-accent-transparent-30'] = Theme.hexToRgba(this.getProp('--theme-accent')!, 0.3);
        this.highliteColors['--theme-accent-transparent-40'] = Theme.hexToRgba(this.getProp('--theme-accent')!, 0.4);
        this.highliteColors['--theme-accent-transparent-60'] = Theme.hexToRgba(this.getProp('--theme-accent')!, 0.6);
        this.highliteColors['--theme-success-transparent-30'] = Theme.hexToRgba(this.getProp('--theme-success')!, 0.3);
        this.highliteColors['--theme-danger-transparent-30'] = Theme.hexToRgba(this.getProp('--theme-danger')!, 0.3);
        this.highliteColors['--theme-text-secondary'] = Theme.hexToRgba(this.getProp('--theme-text-primary')!, 0.8);
        this.highliteColors['--theme-text-muted'] = Theme.hexToRgba(this.getProp('--theme-text-primary')!, 0.6);
        this.highliteColors['--theme-background-soft'] = Theme.adjustColorBrightness(
            this.getProp('--theme-background')!,
            this.isDarkModeTheme ? 1.05 : 0.95
        );
        this.highliteColors['--theme-background-mute'] = Theme.adjustColorBrightness(
            this.getProp('--theme-background')!,
            this.isDarkModeTheme ? 1.4 : 0.8
        );
        this.highliteColors['--theme-background-light'] = Theme.adjustColorBrightness(
            this.getProp('--theme-background')!,
            this.isDarkModeTheme ? 1.4 : 0.8
        );
        this.highliteColors['--theme-accent-dark'] = Theme.adjustColorBrightness(
            this.getProp('--theme-accent')!,
            this.isDarkModeTheme ? 0.8 : 1.2
        );
        this.highliteColors['--theme-accent-light'] = Theme.adjustColorBrightness(
            this.getProp('--theme-accent')!,
            this.isDarkModeTheme ? 1.2 : 0.8
        );
        this.highliteColors['--theme-success-dark'] = Theme.adjustColorBrightness(
            this.getProp('--theme-success')!,
            this.isDarkModeTheme ? 0.8 : 1.2
        );
        this.highliteColors['--theme-success-light'] = Theme.adjustColorBrightness(
            this.getProp('--theme-success')!,
            this.isDarkModeTheme ? 1.2 : 0.8
        );
        this.highliteColors['--theme-danger-dark'] = Theme.adjustColorBrightness(
            this.getProp('--theme-danger')!,
            this.isDarkModeTheme ? 0.8 : 1.2
        );
        this.highliteColors['--theme-danger-light'] = Theme.adjustColorBrightness(
            this.getProp('--theme-danger')!,
            this.isDarkModeTheme ? 1.2 : 0.8
        );
        this.highliteColors['--theme-border'] = Theme.hexToRgba(this.getProp('--theme-accent')!, 0.1);
        this.highliteColors['--theme-border-light'] = Theme.hexToRgba(this.getProp('--theme-border')!, 0.05);
        this.highliteColors['--theme-divider'] = Theme.hexToRgba(this.getProp('--theme-accent')!, 0.15);
    }

    /**
     * Returns a ThemeColors object of clientColors based on highliteColors.
     *
     * This is where we override HighSpell css variables from: <br>
     * https://highspell.com/css/game.11.css
     */
    private getClientColorsFromHighliteColors(): ThemeData {
        return {
            color: this.highliteColors['--theme-text-primary'],
            '--hs-color-menu-bg': Theme.hexToRgba(this.highliteColors['--theme-background']!, 0.9),
            '--hs-color-menu-border': this.highliteColors['--theme-accent']!,
            '--hs-color-overlay-menu-bg': Theme.hexToRgba(this.highliteColors['--theme-background']!, 0.8),
            '--hs-color-menu-header-fg': this.getProp('--theme-text-primary')!,
            '--hs-color-inventory-item-amount-bg': this.getProp('--theme-background-light')!,
        };
    }

    /**
     * Applies the theme by appending it as a style element to <head>
     *
     * Use ThemeManager.setTheme() instead
     */
    apply() {
        // Skip re-applying the currently equipped theme, unless it is the custom theme
        // We exclude custom theme so it can be updated and apply correctly afterward.
        let themeOverrides: HTMLElement | null = document.getElementById('client-themes-theme-overrides');
        if (this === Theme.DEFAULT) {
            themeOverrides?.remove();
            return;
        }

        this.calculateHighliteColorShades();
        this.clientColors = this.getClientColorsFromHighliteColors();
        if (!themeOverrides) {
            themeOverrides = document.createElement('style');
            themeOverrides.id = 'client-themes-theme-overrides';
            document.head.appendChild(themeOverrides);
        }

        // Set the client-themes-theme-overrides textContent to custom css for our theme colors
        themeOverrides.textContent = this.createStyledCss();

        // Recolor the HighLite window frame to match the theme
        this.recolorFrame();
        this.currentTheme = this;
    }

    /** Creates a formatted style tag of css based on the theme */
    createStyledCss(): string {
        return this.formatCss(`
            /* HighLite CSS Variable Reassignments */
            ${this.objectToCssBlock(':root', this.highliteColors)}
            
            /* HighSpell CSS Variable Reassignments */
            ${this.objectToCssBlock('#hs-screen-mask, #hs-screen-mask.hs-dark-theme', this.clientColors)}
             
            /* HighSpell yellow Text -- Non-chat */ 
            .hs-text--yellow:not(.hs-chat-menu__message-text-container) {
                color: ${this.highliteColors['--theme-accent']};
            }                
            
            /* HighSpell White Text -- Non-chat */
            .hs-text--white:not(.hs-chat-menu__message-text-container) {
                color: ${this.highliteColors['--theme-accent']};
            }
        
            /* HighSpell Action Bar Item Text */
            .hs-action-bar-item__text {
                color: ${this.highliteColors['--theme-text-primary']};
            }
            
            /* HighSpell Action Bar Selected */
            .hs-action-bar-button--selected {
                background-color: ${this.highliteColors['--theme-accent']};
            }
            
            /* HighSpell Action Bar Selected -- Hover */
            .hs-action-bar-button--selected:hover {
                background-color: ${this.highliteColors['--theme-accent-light']}
            }
            
            /* HighSpell Action Bar Selected Item Text */
            .hs-action-bar-button--selected .hs-action-bar-item .hs-action-bar-item__text {
                color: ${this.highliteColors['--theme-background']};
            }
            
            /* HighSpell Context Menu Title */
            .hs-context-menu__title {
                color: ${this.highliteColors['--theme-text-dark']};
            }
            
            /* HighSpell Context Menu Item -- Hover */
            .hs-context-menu__item:hover {
                color: ${this.highliteColors['--theme-background-mute']};
            }
            
            /* HighSpell Context Menu Action Name -- Hover */
            .hs-context-menu__item:hover .hs-context-menu__item__action-name {
                color: ${this.highliteColors['--theme-accent']};
            }  
                          
            /* HighSpell Context Menu Action Name */
            .hs-context-menu__item__action-name {
                color: ${this.highliteColors['--theme-text-primary']};
            }
            
            /* HighLite Warning Indicator -- Error */
            #warningIndicator .warning-icon.error {
                color: ${this.highliteColors['--theme-danger']} !important;
            }
            
            /* HighLite Warning Indicator -- Warning */
            #warningIndicator .warning-icon.warning {
                color: ${this.highliteColors['--theme-accent']} !important;
            }
            
            /* HighLite Title Bar Icons */
            #iconbar a:hover .iconify {
                color: ${this.highliteColors['--theme-accent']};
            }
            
            /* HighLite Plugin Settings Back Button */
            #highlite-settings-back-button[style] {
                color: ${this.highliteColors['--theme-background']} !important;
            }
            
            /* HighLite Plugin Settings Buttons */
            #selectedContentDiv button[style] {
                color: ${this.highliteColors['--theme-background']} !important;
            }
        `);
    }

    /**
     * Takes in a string of CSS and returns it formatted
     * @param cssString string -- The string to format
     * @return Formatted cssString
     */
    private formatCss(cssString: string): string {
        let indentLevel = 0;
        const indent = () => ' '.repeat(4 * indentLevel);

        return (
            cssString
                // normalize spacing around braces/semicolons
                .replace(/\s*{\s*/g, ' {\n')
                .replace(/\s*}\s*/g, '\n}\n')
                .replace(/\s*;\s*/g, ';\n')
                // split into lines
                .split('\n')
                .map(line => line.trim())
                .filter(Boolean)
                .map(line => {
                    if (line === '}') {
                        indentLevel = Math.max(0, indentLevel - 1);
                        return indent() + line;
                    }
                    const out = indent() + line;
                    if (line.endsWith('{')) indentLevel++;
                    return out;
                })
                .join('\n')
                // add a blank line between rules
                .replace(/}\n(?=\S)/g, '}\n\n')
                .trim()
        );
    }

    /** Returns an array of all defined Themes */
    static getThemes(): Theme[] {
        return Object.values(Theme).filter(value => value instanceof Theme) as Theme[];
    }

    /** Returns a Theme based on a name */
    static getByName(name: string): Theme | undefined {
        return Object.values(this.getThemes()).find(theme => theme.name === name);
    }

    /** Gets the value of a key from the highliteColors object */
    private getProp(key: string): string | undefined {
        return this.highliteColors[key];
    }

    /** Takes a selector string and an object of colors and converts it into a css block */
    private objectToCssBlock(selector: String, obj: Record<string, string>): string {
        const lines = Object.entries(obj).map(([key, value]) => `    ${key}: ${value};`);
        return `${selector} {\n${lines.join('\n')}\n}`;
    }

    /** Recolors the window to match the colors of the selected theme */
    private recolorFrame() {
        const mainFrame: HTMLElement = document.getElementById('main')!;
        const bodyContainer: HTMLElement = document.getElementById('body-container')!;

        let barColor = this !== Theme.DEFAULT ? this.getProp('--theme-background')! : '#141414';
        let textColor = this !== Theme.DEFAULT ? this.getProp('--theme-text-primary')! : '#ffffff';

        let titleBar = bodyContainer.querySelector<HTMLElement>('.highlite_titlebar')!;

        titleBar.style.background = barColor;
        titleBar.style.color = textColor;

        mainFrame.querySelectorAll<HTMLElement>('.highlite_bar').forEach(ele => {
            ele.style.background = barColor;
        });
        mainFrame.querySelectorAll<HTMLElement>('.content_title').forEach(ele => {
            ele.style.background = barColor;
        });
        mainFrame.querySelectorAll<HTMLElement>('.highlite_bar_selected_content').forEach(ele => {
            ele.style.color = textColor;
        });
    }

    /** Adjust the brightness of a hex color */
    private static adjustColorBrightness(color: string, factor: number): string {
        // Convert hex to RGB
        let r: number, g: number, b: number;

        if (color.startsWith('#')) {
            const clean = color.slice(1);
            r = parseInt(clean.slice(0, 2), 16);
            g = parseInt(clean.slice(2, 4), 16);
            b = parseInt(clean.slice(4, 6), 16);
        } else {
            // Assume rgb(...) format
            const match = color.match(/rgb(a?)\((\d+),\s*(\d+),\s*(\d+)/);
            if (!match) throw new Error('Invalid RGB(A) color');
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

    /** Convert a hex color to an RGBA color */
    private static hexToRgba(hex: string, alpha: number): string {
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
