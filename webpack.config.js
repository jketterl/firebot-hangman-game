const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    target: 'node',
    mode: 'production',
    devtool: false,
    entry: './src/main.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'hangman.js',
        libraryTarget: 'commonjs2',
        libraryExport: 'default',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        minimize: true,

        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_fnames: /main/,
                    mangle: false,
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },
};