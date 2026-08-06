export const CDN = {
  assets: 'https://cdn.platform.com/assets',
  bundles: 'https://cdn.platform.com/bundles',
  remotes: 'https://cdn.platform.com/remotes',

  resolve(path) {
    return this.assets + path;
  }
};
