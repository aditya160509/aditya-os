const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, '../src/script.ts'),
    output: {
        hashFunction: 'xxhash64',
        filename: 'bundle.[contenthash].js',
        path: path.resolve(__dirname, '../public'),
    },
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static') },
                {
                    from: path.resolve(
                        __dirname,
                        '../node_modules/three/examples/js/libs/draco/gltf'
                    ),
                    to: 'draco',
                },
            ],
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
            minify: true,
        }),
        new MiniCSSExtractPlugin(),
    ],
    resolve: {
        alias: {
            three: path.resolve('./node_modules/three'),
        },
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.(html)$/,
                use: ['html-loader'],
            },
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.tsx$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.css$/,
                use: [MiniCSSExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(jpg|png|gif|svg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/images/[hash][ext]',
                },
            },
            {
                test: /\.(mp3|wav)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                },
            },
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[hash][ext]',
                },
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: ['glslify-import-loader', 'raw-loader', 'glslify-loader'],
            },
        ],
    },
};
