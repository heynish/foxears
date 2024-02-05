module.exports = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...config.externals, "canvas", "jsdom"];
    return config;
  },
}



module.exports = {
  reactStrictMode: true,
};

module.exports = {
  images: {
    domains: ['mframes.vercel.app'],
  },
};