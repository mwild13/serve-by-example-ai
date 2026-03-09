// OpenNext configuration for Cloudflare deployment
// https://opennext.js.org/config

import type { OpenNextConfig } from '@opennextjs/cloudflare';

const config: OpenNextConfig = {
  // the default values should work for most setups
  projectRoot: '.',
  output: 'dist',
};

export default config;
