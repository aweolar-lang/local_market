import { IConfig } from 'next-sitemap';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const config: IConfig = {
  siteUrl: 'https://localsoko.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin/*', '/login', '/api/*'], // keep excluded pages

  async additionalPaths() {
    const { data: items } = await supabase
      .from('items')
      .select('id');

    if (!items) return [];

    return items.map(item => ({
      loc: `/${item.id}`,
      changefreq: 'daily',
      priority: 0.9,
      lastmod: new Date().toISOString(),
    }));
  },
};

export default config;