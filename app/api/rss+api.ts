export async function GET(request: Request) {
  try {
    // Updated to use the Feedburner RSS feed URL
    const RSS_FEED_URL = 'https://feeds.feedburner.com/bugmohol';
    
    const response = await fetch(RSS_FEED_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BugMohol RSS Reader; +https://bugmohol.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'bn,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      // Add timeout
      signal: AbortSignal.timeout(15000), // 15 seconds timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Validate that we received XML content
    if (!xmlText.includes('<rss') && !xmlText.includes('<feed')) {
      throw new Error('Invalid RSS/XML content received');
    }
    
    return new Response(xmlText, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    
    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch RSS feed',
        message: errorMessage,
        timestamp: new Date().toISOString(),
        feedUrl: 'https://feeds.feedburner.com/bugmohol'
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
        },
      }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}