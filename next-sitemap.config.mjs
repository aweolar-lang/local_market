import pkg from '@next/env';
const { loadEnvConfig } = pkg;
import { createClient } from '@supabase/supabase-js';

const projectDir = process.cwd();
loadEnvConfig(projectDir);


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://localsoko.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin/*', '/pay', '/dashboard', '/dashboard/*', '/auth/*', '/api/*'],
  
  async additionalPaths() {
    const { data: items } = await supabase
      .from('items')
      .select('slug');

    if (!items) return [];

    return items.map(item => ({
      loc: `/${item.slug}`,
      changefreq: 'daily',
      priority: 0.9,
      lastmod: new Date().toISOString(),
    }));
  },
};

export default config;