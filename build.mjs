import * as esbuild from "esbuild";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "src");
const DIST_DIR = path.join(__dirname, "dist");
const CSSMinifyPlugin = {
    name: "CSSMinifyPlugin",
    setup(build) {
        build.onLoad({ filter: /\.css$/ }, async (args) => {
            const f = await fs.readFile(args.path);
            const css = await esbuild.transform(f, {
                loader: "css",
                minify: true,
            });
            return { loader: "text", contents: css.code };
        });
    },
};

/**
 *
 * @param {path} dir -- Directory to search for plugin s
 * @returns
 */
async function findPackageJsons(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const builds = [];

    for (const entry of entries) {
        const subdir = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            try {
                const pkgPath = path.join(subdir, "package.json");
                const pkg = JSON.parse(await fs.readFile(pkgPath, "utf-8"));

                if (!pkg.main) {
                    console.warn(`No "main" field in ${pkgPath}, skipping`);
                    continue;
                }

                builds.push({
                    name: pkg.name,
                    entryPoint: path.join(subdir, pkg.main),
                    outdir: DIST_DIR,
                });
            } catch (err) {
                console.warn(
                    `❌ No package.json available in "src/${entry.name}". Skipping...`
                );
                continue;
            }
        }
    }

    return builds;
}

const builds = await findPackageJsons(SRC_DIR);
await Promise.all(
    builds.map(async ({ name, entryPoint, outdir }) => {
        try {
            await esbuild.build({
                entryPoints: [entryPoint],
                bundle: true,
                minify: false,
                outExtension: { ".js": ".js" },
                outdir,
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
            console.log(
                `✅ Built ${name}: ${path.relative(
                    process.cwd(),
                    entryPoint
                )} → ${path.relative(process.cwd(), outdir)}/${name}.js`
            );
        } catch (err) {
            console.error(`❌ Build failed for ${name}:`, err);
            process.exitCode = 1;
        }
    })
);
