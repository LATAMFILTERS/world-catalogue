export class BuildSystem {
  compile(feature) {
    return {
      feature,
      bundles: ['app.js', 'vendor.js'],
      status: 'compiled'
    };
  }
}
