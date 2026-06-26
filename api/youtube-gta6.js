export default async function handler(req, res) {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "YOUTUBE_API_KEY is not configured" });
    }

    // Determine region (check query parameter, Vercel IP header, or default to 'US')
    let region = req.query.region || req.headers['x-vercel-ip-country'] || 'US';
    region = region.toUpperCase().substring(0, 2);
    if (!/^[A-Z]{2}$/.test(region)) {
      region = 'US';
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
      return res.status(response.status).json({ error: `YouTube API search failed: ${errText}` });
    }
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(200).json([]);
    }

    // Get video IDs for stats
    const ids = data.items.map(i => i.id.videoId).filter(Boolean).join(',');
    if (!ids) {
      return res.status(200).json([]);
    }

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=statistics,contentDetails,liveStreamingDetails` +
      `&id=${ids}&key=${API_KEY}`;

    const statsResponse = await fetch(statsUrl);
    if (!statsResponse.ok) {
      const errText = await statsResponse.text();
      return res.status(statsResponse.status).json({ error: `YouTube API stats failed: ${errText}` });
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
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
