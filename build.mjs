import {mkdir, access, rm, readdir, readFile, stat} from "fs/promises";
import * as esbuild from "esbuild";
import {fileURLToPath} from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "src");
const DIST_DIR = path.join(__dirname, "dist/plugins");
const CSSMinifyPlugin = {
    name: "CSSMinifyPlugin",
    setup(build) {
        build.onLoad({filter: /\.css$/}, async (args) => {
            const f = await readFile(args.path);
            const css = await esbuild.transform(f, {
                loader: "css",
                minify: true,
            });
            return {loader: "text", contents: css.code};
        });
    }
};

/**
 * Removes all files from a directory
 *
 * @param dir
 */
async function deleteFilesInDirectory(dir) {
    const oldFiles = await readdir(dir.toString(), {withFileTypes: true});
    await Promise.all(
        oldFiles.map(f =>
            rm(path.join(dir.toString(), f.name), {recursive: true, force: true})
        )
    );
}

/**
 * Adds all valid plugins to an array to be built later
 *
 * @param {string} dir -- Directory to search for plugins
 */
async function getPlugins(dir) {

    // Create missing directories
    const dirs = [DIST_DIR, SRC_DIR];
    for (const d of dirs) {
        try {
            await access(d);
        } catch {
            await mkdir(d, {recursive: true});
            console.log("Created:", d);
        }
    }

    // Clear old script files to prevent unintended scripts from appearing in highlite dev
    await deleteFilesInDirectory(`${DIST_DIR}/..`);

    const entries = await readdir(dir.toString(), {withFileTypes: true});
    const builds = [];

    for (const entry of entries) {
        const subDir = path.join(dir.toString(), entry.name);

        if (entry.isDirectory()) {
            try {
                // Check if a plugin.ts file exists in the plugin subdirectory
                const pluginPath = path.join(subDir, "plugin.ts");
                await stat(pluginPath);

                builds.push({
                    name: entry.name.replaceAll(" ", "-").replaceAll("_", "-"),
                    entryPoint: pluginPath,
                    outDir: DIST_DIR,
                });
            } catch (err) {
                console.warn(
                    `❌ No "plugin.ts" file is available in "src/${entry.name}". Skipping...`
                );
            }
        }
    }

    return builds;
}

const builds = await getPlugins(SRC_DIR);
await Promise.all(
    builds.map(async ({name, entryPoint, outDir}) => {
        let outName = `_${name.toLowerCase()}.js`;

        // Reassign output variables so the SeattaPlugin superclass doesn't appear in highlite dev
        if (name.includes("SeattaPlugin")) {
            name = "SeattaPlugin"
            outDir = `${DIST_DIR}/..`
            outName = `SeattaPlugin.js`;
        }

        const outfile = path.join(outDir, outName);

        try {
            await esbuild.build({
                entryPoints: [entryPoint],
                bundle: true,
                minify: false,
                outExtension: {".js": ".js"},
                outfile,
                format: "esm",
                plugins: [CSSMinifyPlugin],
                external: ["@babylonjs/core", "@highlite/plugin-api"],
                loader: {
                    ".html": "text",
                    ".png": "dataurl",
                    ".jpg": "dataurl",
                    ".jpeg": "dataurl",
                    ".gif": "dataurl",
                    ".svg": "dataurl",
                    ".webp": "dataurl",
                    ".wav": "dataurl",
                    ".mp3": "dataurl",
                },
            });
            const outString = `"${path.relative(process.cwd(), outfile)}"`;
            console.log(`✅ Built ${name} → ${outString}`);
        } catch (err) {
            console.error(`❌ Build failed for "${name}":`, err);
            process.exitCode = 1;
        }
    })
);
