var path = require('path'),
    argv = require('yargs').argv,
    env = require('./utils/env'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    StringReplacePlugin = require("string-replace-webpack-plugin"),
    WriteFilePlugin = require("write-file-webpack-plugin");
var sandboxUrl = "http://sandbox7.feedly.com";

var plugins = [
    new StringReplacePlugin(),
    new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
        "BROWSER": JSON.stringify(argv.browser),
        "CLIENT_ID": JSON.stringify(argv.clientId),
        "CLIENT_SECRET": JSON.stringify(argv.clientSecret)
    }),
    new HtmlWebpackPlugin({
        template: path.join(__dirname, "src", "popup.html"),
        filename: "popup.html",
        chunks: ["popup"]
    }),
    new HtmlWebpackPlugin({
        template: path.join(__dirname, "src", "background.html"),
        filename: "background.html",
        chunks: ["background"]
    }),
    new HtmlWebpackPlugin({
        template: path.join(__dirname, "src", "options.html"),
        filename: "options.html",
        chunks: ["options"]
    }),
    new CopyWebpackPlugin([
        {
            from: path.resolve(__dirname, "src"),
            to: path.resolve(__dirname, "build"),
            ignore: ['**/scripts/**/*', "*.html", "manifest.json"],
            verbose: true
        }
    ]),
    // new CopyWebpackPlugin([
    //     {
    //         from: path.resolve(__dirname, "node_modules/timeago/locales"),
    //         to: path.resolve(__dirname, "build/scripts/timeago/locales"),
    //         verbose: true
    //     }
    // ]),
    new WriteFilePlugin()
];

var config = {
    entry: {
        background: path.join(__dirname, "src", "scripts", "background.js"),
        popup: path.join(__dirname, "src", "scripts", "popup.js"),
        options: path.join(__dirname, "src", "scripts", "options.js")
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "scripts/[name].js"
    },
    module: {
        rules: [
            {
                test: /feedly\.api\.js/,
                exclude: /node_modules/,
                loader: StringReplacePlugin.replace({
                    replacements: [
                        {
                            pattern: /http(?:s)?:\/\/(?:www\.)?cloud\.feedly\.com/gi,
                            replacement: function (match, p1, offset, string) {
                                return argv.sandbox ? sandboxUrl : match;
                            }
                        }
                    ]
                })
            },
            {
                test: /background\.js/,
                exclude: /node_modules/,
                loader: StringReplacePlugin.replace({
                    replacements: [
                        {
                            pattern: /http(?:s)?:\/\/(?:www\.)?feedly\.com/gi,
                            replacement: function (match, p1, offset, string) {
                                return argv.sandbox ? sandboxUrl : match;
                            }
                        }
                    ]
                })
            },
            {
                test: /.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "echo-loader",
                    },
                    {
                        loader: 'preprocess-loader',
                        options: {
                            BROWSER: argv.browser
                        }
                    }
                ]
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "echo-loader",
                    },
                    {
                        loader: 'preprocess-loader',
                        options: {
                            BROWSER: argv.browser
                        }
                    },
                    {
                        loader: "html-loader",
                    }
                ]
            }    
        ]
    },
    plugins: plugins
}

module.exports = config;