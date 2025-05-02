const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => ({
    mode: argv.mode === 'production' ? 'production' : 'development',

    // This is the entry point for the UI (src/ui.tsx)
    entry: {
        ui: './src/ui.tsx',
        code: './src/code.ts',
    },

    module: {
        rules: [
            // Typescript loader
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            // CSS loader
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            // Asset loader for images
            {
                test: /\.(png|jpg|gif|webp|svg)$/,
                loader: 'url-loader',
                options: {
                    limit: 8192,
                },
            },
        ],
    },

    // Webpack tries to resolve these extensions in order
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },

    // Generates the UI HTML file
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/ui.html',
            filename: 'ui.html',
            chunks: ['ui'],
            cache: false,
        }),
    ],
});