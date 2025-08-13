import * as esbuild from "esbuild";
import fs from "fs/promises";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "src");
const DIST_DIR = path.join(__dirname, "dist");
const CSSMinifyPlugin = {
    name: "CSSMinifyPlugin",
    setup(build) {
        build.onLoad({filter: /\.css$/}, async (args) => {
            const f = await fs.readFile(args.path);
            const css = await esbuild.transform(f, {
                loader: "css",
                minify: true,
            });
            return {loader: "text", contents: css.code};
        });
    },
};

/**
 *
 * @param {path} dir -- Directory to search for plugins
 * @returns
 */
async function findPackageJsons(dir) {
    const entries = await fs.readdir(dir, {withFileTypes: true});
    const builds = [];

    for (const entry of entries) {
        const subdir = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            try {
                // Check if a plugin.ts file exists in the plugin subdirectory
                const pluginPath = path.join(subdir, "plugin.ts");
                await fs.stat(pluginPath);

                builds.push({
                    name: entry.name.replaceAll(" ", "-").replaceAll("_", "-"),
                    entryPoint: pluginPath,
                    outdir: DIST_DIR,
                });
            } catch (err) {
                console.warn(
                    `❌ No "plugin.ts" file is available in "src/${entry.name}". Skipping...`
                );
                continue;
            }
        }
    }

    return builds;
}

const builds = await findPackageJsons(SRC_DIR);
await Promise.all(
    builds.map(async ({name, entryPoint, outdir}) => {
        // Get version directly from the entryPoint file
        const source = await fs.readFile(entryPoint, "utf-8");

        let outName = `_${name.toLowerCase()}.js`;
        const outfile = path.join(outdir, outName);

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

/**
 * Checks if a string contains a valid version number
 *
 * @param {string} version - The string to validate
 * @returns {boolean} - Whether the version is valid
 */
function isValidSemver(version) {
    return /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[\w.-]+)?(\+[\w.-]+)?$/.test(
        version
    );
}
