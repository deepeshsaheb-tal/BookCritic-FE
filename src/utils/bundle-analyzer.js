const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

module.exports = function override(config, env) {
  // Bundle analyzer configuration
  if (process.env.ANALYZE) {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerPort: 8888,
        openAnalyzer: true,
      })
    );
  }

  // Add workbox service worker
  if (env === 'production') {
    // Remove any existing service worker plugins
    config.plugins = config.plugins.filter(
      plugin => plugin.constructor.name !== 'GenerateSW' && 
                plugin.constructor.name !== 'InjectManifest'
    );
    
    // Add our custom service worker
    config.plugins.push(
      new WorkboxWebpackPlugin.InjectManifest({
        swSrc: path.join(__dirname, '../service-worker.ts'),
        swDest: 'service-worker.js',
        exclude: [/\.map$/, /asset-manifest\.json$/],
      })
    );
  }

  // Split chunks optimization
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            
            // Create separate chunks for larger packages
            return `npm.${packageName.replace('@', '')}`;
          },
        },
        // Separate React and related libraries
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          name: 'npm.react',
          priority: 20,
        },
        // Separate UI libraries
        ui: {
          test: /[\\/]node_modules[\\/](tailwindcss|@headlessui)[\\/]/,
          name: 'npm.ui',
          priority: 15,
        },
        // Separate data fetching libraries
        data: {
          test: /[\\/]node_modules[\\/](@tanstack|axios)[\\/]/,
          name: 'npm.data',
          priority: 10,
        },
      },
    },
  };

  // Compression plugin for production
  if (env === 'production') {
    const CompressionPlugin = require('compression-webpack-plugin');
    config.plugins.push(
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      })
    );
  }

  return config;
};
