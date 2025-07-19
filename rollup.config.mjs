import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-import-css';``
import { string } from 'rollup-plugin-string';
import url from '@rollup/plugin-url';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'src/ExamplePlugin.ts',
    output: {
        file: 'dist/bundle.js',
        format: 'cjs'
    },
    plugins: [
        typescript(),
        nodeResolve(),
        css(),
        string({
            include: "**/*.html"
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