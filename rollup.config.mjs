import typescript from '@rollup/plugin-typescript';
import { string } from 'rollup-plugin-string';
import url from '@rollup/plugin-url';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';


import pkgJson from './package.json' with { type: 'json' };

export default {
    input: `${pkgJson.main}`,
    output: {
        file: `dist/${pkgJson.name}.js`,
        name: `${pkgJson.name}`,
        format: 'umd',
    },
    plugins: [
        typescript(),
        nodeResolve(),
        string({
            include: ["**/*.html", "**/*.css"]
        }),
        replace({
            preventAssignment: true,
            values: {
                'process.env.PLUGIN_VERSION': JSON.stringify('1.0.0') // Replace with your plugin version
            }
        }),
        url({
            include: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.svg", "**/*.webp"],
            limit: 1024000, // 1MB limit for inlining images
            emitFiles: false // Do not emit files, just inline them
        }),
        url({
            include: ["**/*.wav", "**/*.mp3"],
            limit: 5024000, // 5MB limit for inlining audio files
            emitFiles: false // Do not emit files, just inline them
        })
    ]
}