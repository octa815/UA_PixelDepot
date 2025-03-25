module.exports = function override(config, env) {
    if (!config.devServer) config.devServer = {};
    config.devServer.allowedHosts = ["localhost"];
    return config;
  };
  