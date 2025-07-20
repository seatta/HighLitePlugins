import typescript from '@rollup/plugin-typescript';
import { string } from 'rollup-plugin-string';
import url from '@rollup/plugin-url';
import { nodeResolve } from '@rollup/plugin-node-resolve';


import pkgJson from './package.json' with { type: 'json' };

export default {
    input: `${pkgJson.main}`,
    output: {
        file: `dist/${pkgJson.name}.js`,
        name: `${pkgJson.name}`,
        format: 'esm', // ECMAScript Module format
        exports: 'auto'
    },
    plugins: [
        typescript({
            tsconfig: './tsconfig.json', // Specify your TypeScript configuration file
        }),
        nodeResolve(),
        string({
            include: ["**/*.html", "**/*.css"]
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