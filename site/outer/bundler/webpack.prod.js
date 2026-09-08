const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = merge(
    commonConfiguration,
    {
        mode: 'production',
        plugins:
        [
            new CleanWebpackPlugin()
        ],
        optimization:
        {
            // Copied static assets (the staged desktop build and the vendored
            // open-source games) are already minified — running Terser over
            // them again breaks on their sourcemap-less bundles.
            minimizer: [
                (compiler) => {
                    const TerserPlugin = require('terser-webpack-plugin');
                    new TerserPlugin({ exclude: /desktop[\\/]/ }).apply(compiler);
                },
            ],
        }
    }
)
