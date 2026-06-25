import { supabase } from '@/integrations/supabase/client';
import { parseEdgeFunctionError } from '@/lib/edgeFunctionError';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
  links?: string[];
};

type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot')[];
  onlyMainContent?: boolean;
  waitFor?: number;
};

type MapOptions = {
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
};

type CrawlOptions = {
  limit?: number;
  maxDepth?: number;
  includePaths?: string[];
  excludePaths?: string[];
};

export type ScrapeResult = {
  markdown?: string;
  html?: string;
  metadata?: {
    title?: string;
    description?: string;
    sourceURL?: string;
    statusCode?: number;
  };
};

export type CrawlResult = {
  success: boolean;
  status?: string;
  completed?: number;
  total?: number;
  data?: Array<{
    markdown?: string;
    metadata?: {
      title?: string;
      description?: string;
      sourceURL?: string;
    };
  }>;
};

export const firecrawlApi = {
  // Scrape a single URL
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse<ScrapeResult>> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      const msg = await parseEdgeFunctionError(error, data);
      return { success: false, error: msg };
    }
    if ((data as { error?: string })?.error) {
      return { success: false, error: (data as { error: string }).error };
    }

    const result = data?.data || data;
    return {
      success: data?.success !== false,
      data: result,
      error: data?.error,
    };
  },

  // Map a website to discover all URLs (fast sitemap)
  async map(url: string, options?: MapOptions): Promise<FirecrawlResponse & { links?: string[] }> {
    const { data, error } = await supabase.functions.invoke('firecrawl-map', {
      body: { url, options },
    });

    if (error) {
      const msg = await parseEdgeFunctionError(error, data);
      return { success: false, error: msg };
    }
    if ((data as { error?: string })?.error) {
      return { success: false, error: (data as { error: string }).error };
    }

    return {
      success: data?.success !== false,
      links: data?.links || [],
      error: data?.error,
    };
  },

  // Crawl an entire website
  async crawl(url: string, options?: CrawlOptions): Promise<FirecrawlResponse<CrawlResult>> {
    const { data, error } = await supabase.functions.invoke('firecrawl-crawl', {
      body: { url, options },
    });

    if (error) {
      const msg = await parseEdgeFunctionError(error, data);
      return { success: false, error: msg };
    }
    if ((data as { error?: string })?.error) {
      return { success: false, error: (data as { error: string }).error };
    }

    return {
      success: data?.success !== false,
      data: data,
      error: data?.error,
    };
  },
};
