const {
    override,
    overrideDevServer,
    addWebpackPlugin
} = require("customize-cra");
const CopyPlugin = require('copy-webpack-plugin');

const multipleEntry = require('react-app-rewire-multiple-entry')([
    {
        // points to the options page entry point
        entry: 'src/settings/index.js',
        template: 'public/index.html',
        outPath: '/index.html'
    },
    {
        // points to the popup entry point
        entry: 'src/menu/index.js',
        template: 'public/menu.html',
        outPath: '/menu.html'
    },
    {
        // points to the sidepanel entry point
        entry: 'src/sidepanel/index.js',
        template: 'public/sidepanel.html',
        outPath: '/sidepanel.html'
    }
]);

const devServerConfig = () => config => {
    return {
        ...config,
        devMiddleware: {
            ...(config.devMiddleware || {}),
            writeToDisk: true
        }
    }
}

const copyPlugin = new CopyPlugin({
    patterns: [
        // copy assets
        {
            from: 'public',
            to: '',
            globOptions: {
                ignore: ['**/index.html', '**/menu.html', '**/sidepanel.html']
            }
        },
        { from: 'src/background.js', to: '' }
    ]
})

module.exports = {
    webpack: override(
        addWebpackPlugin(
            copyPlugin
        ),
        multipleEntry.addMultiEntry,
    ),
    devServer: overrideDevServer(
        devServerConfig()
    ),

};
