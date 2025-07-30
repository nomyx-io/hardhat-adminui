module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Override webpack-dev-server configuration to fix deprecation warnings
      if (env === 'development') {
        // Fix deprecated webpack-dev-server options
        webpackConfig.devServer = {
          ...webpackConfig.devServer,
          setupMiddlewares: (middlewares, devServer) => {
            // This replaces the deprecated onBeforeSetupMiddleware and onAfterSetupMiddleware
            return middlewares;
          },
          // Remove deprecated options if they exist
          onBeforeSetupMiddleware: undefined,
          onAfterSetupMiddleware: undefined,
        };
      }
      return webpackConfig;
    },
  },
};
