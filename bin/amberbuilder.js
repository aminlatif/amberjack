#! /usr/bin/env node

const passedArguments = process.argv.slice(2);

let mode = "production";
if (passedArguments.length > 0) {
  mode = passedArguments[0];
}

let addSourceMap = false; 
if(mode==='development'){
  addSourceMap = true; 
}

console.log(`Asset builder started in ${mode} mode...`);

import webpack from "webpack";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

const require = createRequire(import.meta.url);

const __dirname = path.resolve(path.dirname(""));
console.log(`Current Directory: ${__dirname}`);

const __moduledir = path.resolve(dirname(fileURLToPath(import.meta.url)), "..");
console.log(`Module Directory: ${__moduledir}`);

const staticSuffix = "";

const fileLoaderOutputPattern = "[name].[ext]" + staticSuffix;

const webpackConfigEntry = {
  critical: [
    path.resolve(__moduledir, "src/scripts", "critical.ts"),
    path.resolve(__moduledir, "src/styles", "critical.scss"),
    path.resolve(__dirname, "src/scripts", "custom-critical.ts"),
    path.resolve(__dirname, "src/styles", "custom-critical.scss")
  ],
  styles: [
    path.resolve(__moduledir, "src/styles", "styles.scss"),
    path.resolve(__dirname, "src/styles", "custom-styles.scss")
  ],
  scripts: [
    path.resolve(__moduledir, "src/scripts", "scripts.ts"),
    path.resolve(__dirname, "src/scripts", "custom-scripts.ts"),
  ]
};

const webpackConfigOutput = {
  filename: "[name].js",
  path: path.resolve(__dirname, "dist"),
};

let webpackConfigWatch = false;

if(mode==='development'){
  webpackConfigWatch = true;
}

const webpackConfigWatchOptions = {
  ignored: ["**/libraries", "**/node_modules", "**/fonts"],
};

const webpackConfigResolve = {
  extensions: [".tsx", ".ts", ".js"],
};

const webpackConfigPlugins = [
  new MiniCssExtractPlugin({
    filename: "[name].css",
    chunkFilename: "[id].css",
  }),
  new CopyWebpackPlugin({
    patterns: [{ from: "src/images", to: "images" }],
  }),
  new HtmlWebpackPlugin({
    template: path.resolve(__moduledir, "src", "index.html"),
  }),
];

const webpackModuleCss = {
  test: /\.css$/,
  use: [
    "style-loader",
    {
      loader: "css-loader",
      options: {
        sourceMap: addSourceMap,
      },
    },
  ],
};

const webpackModuleScss = {
  test: /\.scss$/,
  use: [
    "style-loader",
    {
      loader: "css-loader",
      options: {
        sourceMap: addSourceMap,
      },
    },
    {
      loader: "sass-loader",
      options: {
        sourceMap: addSourceMap,
        sassOptions: {
          includePaths: [
            "src/styles",
            "node_modules/@babirusa/amberjack/src/styles",
            "node_modules/foundation-sites/scss",
            "node_modules/motion-ui/src"
          ],
        }
      },
    },
  ],
};

const webpackModuleJs = {
  test: /\.js$/,
  use: ["babel-loader"],
  // exclude: /node_modules/,
};

const webpackModuleTs = {
  test: /\.ts?$/,
  use: "ts-loader",
  // exclude: /node_modules/,
};

const webpackModuleFonts = {
  test: /\.(woff(2)?|ttf|eot|otf)(\?v=\d+\.\d+\.\d+)?$/,
  use: [
    {
      loader: "file-loader",
      options: {
        name: fileLoaderOutputPattern,
        outputPath: "fonts/",
      },
    },
  ],
};

const webpackModuleImages = {
  test: /\.(jpg|jpeg|jp2|jpg2|png|webp|svg|gif)$/,
  use: [
    {
      loader: "file-loader",
      options: {
        name: fileLoaderOutputPattern,
        outputPath: "images/",
      },
    },
  ],
};

const webpackModuleVideos = {
  test: /\.(mp4|webm)$/,
  use: [
    {
      loader: "file-loader",
      options: {
        name: fileLoaderOutputPattern,
        outputPath: "videos/",
      },
    },
  ],
};

const webpackConfigModules = {
  rules: [
    webpackModuleCss,
    webpackModuleScss,
    webpackModuleJs,
    webpackModuleTs,
    webpackModuleFonts,
    webpackModuleImages,
    webpackModuleVideos,
  ],
};

const webpackConfig = {
  mode: mode,
  entry: webpackConfigEntry,
  output: webpackConfigOutput,
  watch: webpackConfigWatch,
  watchOptions: webpackConfigWatchOptions,
  resolve: webpackConfigResolve,
  plugins: webpackConfigPlugins,
  module: webpackConfigModules,
  
};

if(mode==='development'){
  webpackConfig.devtool = 'source-map';
}else{
  webpackConfig.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i
      })
    ],
  };
}

webpack(webpackConfig, function (err, stats) {
  const info = stats.toJson();

  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }else if (stats.hasErrors()) {
    console.error(info.errors);
  }else {
    if(stats.hasWarnings()) {
      console.warn(info.warnings);
    }
    const startTime = stats.compilation.startTime;
    const endTime = stats.compilation.endTime;

    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);

    const duration = endTime - startTime;
    const durationDate = new Date(duration);

    const durationFormatted = durationDate.getSeconds()+"."+durationDate.getMilliseconds();

    console.log(
      "\x1b[32m", 
      "Build completed in "+durationFormatted+" seconds:",
      "\x1b[2m",
      startTimeDate.getHours()+":"+startTimeDate.getMinutes()+":"+startTimeDate.getSeconds(),
      "->",
      endTimeDate.getHours()+":"+endTimeDate.getMinutes()+":"+endTimeDate.getSeconds(),
      "\x1b[0m");
  }
});
