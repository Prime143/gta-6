// Hardcoded fallback videos to return if API key is missing or calls fail
const fallbackVideos = [
  {
    id: "QdBZY2fkU-0",
    title: "GTA 6 Pre-Order Trailer & Gameplay Breakdown",
    channel: "Rockstar News",
    thumbnail: "img/trending1.png",
    published: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    views: "1420000",
    isLive: false
  },
  {
    id: "E1bXGZ5t_M8",
    title: "Is GTA 6 Worth $80? Pre-Order Controversy Explained",
    channel: "Gamer Zone",
    thumbnail: "img/trending2.png",
    published: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    views: "820000",
    isLive: false
  },
  {
    id: "hJ8z6_1d_E0",
    title: "GTA 6 MAP LEAKS - The Scale is Insane! (Vice City & Beyond)",
    channel: "Map Explorer",
    thumbnail: "img/trending3.png",
    published: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    views: "2100000",
    isLive: false
  }
];

export default async function handler(req, res) {
  // Determine region (check query parameter, Vercel IP header, or default to 'US')
  let region = req.query.region || req.headers['x-vercel-ip-country'] || 'US';
  region = region.toUpperCase().substring(0, 2);
  if (!/^[A-Z]{2}$/.test(region)) {
    region = 'US';
  }

  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) {
      console.warn("YOUTUBE_API_KEY is not configured, returning fallback videos.");
      res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=60');
      res.setHeader('X-Region', region);
      return res.status(200).json(fallbackVideos);
    }

    const getDateMinus2Days = () => {
      const d = new Date();
      d.setDate(d.getDate() - 2);
      return d.toISOString();
    };

    const url = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&q=GTA+6+pre+order` +
      `&type=video&order=viewCount&regionCode=${region}` +
      `&publishedAfter=${getDateMinus2Days()}&maxResults=10` +
      `&relevanceLanguage=en&key=${API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      console.warn(`YouTube API search failed: ${errText}. Returning fallback videos.`);
      res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=60');
      res.setHeader('X-Region', region);
      return res.status(200).json(fallbackVideos);
    }
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=60');
      res.setHeader('X-Region', region);
      return res.status(200).json([]);
    }

    // Get video IDs for stats
    const ids = data.items.map(i => i.id.videoId).filter(Boolean).join(',');
    if (!ids) {
      res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=60');
      res.setHeader('X-Region', region);
      return res.status(200).json([]);
    }

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=statistics,contentDetails,liveStreamingDetails` +
      `&id=${ids}&key=${API_KEY}`;

    const statsResponse = await fetch(statsUrl);
    if (!statsResponse.ok) {
      const errText = await statsResponse.text();
      console.warn(`YouTube API stats failed: ${errText}. Returning fallback videos.`);
      res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=60');
      res.setHeader('X-Region', region);
      return res.status(200).json(fallbackVideos);
    }
    const stats = await statsResponse.json();

    // Map stats by ID
    const statsMap = {};
    if (stats.items) {
      stats.items.forEach(item => {
        statsMap[item.id] = item;
      });
    }

    // Merge and return
    const merged = data.items.map((item) => {
      const videoId = item.id.videoId;
      const videoStats = statsMap[videoId];
      return {
        id: videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        published: item.snippet.publishedAt,
        views: videoStats?.statistics?.viewCount || '0',
        isLive: !!videoStats?.liveStreamingDetails?.actualStartTime
      };
    });

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=60');
    res.setHeader('X-Region', region);
    return res.status(200).json(merged);
  } catch (error) {
    console.error("Error in serverless handler:", error);
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=60');
    res.setHeader('X-Region', region);
    return res.status(200).json(fallbackVideos);
  }
}
