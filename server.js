const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Regional Cache: keys will be country codes (e.g., 'IN', 'US')
let youtubeRegionalCache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

// Helper to get date minus 2 days in ISO format
function getDateMinus2Days() {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString();
}

app.get('/api/youtube-gta6', async (req, res) => {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: "YOUTUBE_API_KEY is not configured in .env file" });
    }

    // Determine region (check query parameter, Vercel IP header, or default to 'US')
    let region = req.query.region || req.headers['x-vercel-ip-country'] || 'US';
    region = region.toUpperCase().substring(0, 2);

    // Basic validation of country code format
    if (!/^[A-Z]{2}$/.test(region)) {
      region = 'US';
    }

    const now = Date.now();
    
    // Check if cache exists for this specific region and is still valid
    if (youtubeRegionalCache[region] && (now - youtubeRegionalCache[region].timestamp < CACHE_TTL)) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Region', region);
      return res.json(youtubeRegionalCache[region].data);
    }

    // Fetch region-specific trending videos from YouTube API
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&q=GTA+6+pre+order` +
      `&type=video&order=viewCount&regionCode=${region}` +
      `&publishedAfter=${getDateMinus2Days()}&maxResults=10` +
      `&relevanceLanguage=en&key=${API_KEY}`;

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      const errText = await searchResponse.text();
      return res.status(searchResponse.status).json({ error: `YouTube search API failed: ${errText}` });
    }
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return res.json([]);
    }

    // Get stats details for video views and live streaming status
    const ids = searchData.items.map(i => i.id.videoId).filter(Boolean).join(',');
    if (!ids) {
      return res.json([]);
    }

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=statistics,contentDetails,liveStreamingDetails` +
      `&id=${ids}&key=${API_KEY}`;

    const statsResponse = await fetch(statsUrl);
    if (!statsResponse.ok) {
      const errText = await statsResponse.text();
      return res.status(statsResponse.status).json({ error: `YouTube stats API failed: ${errText}` });
    }
    const statsData = await statsResponse.json();

    const statsMap = {};
    if (statsData.items) {
      statsData.items.forEach(item => {
        statsMap[item.id] = item;
      });
    }

    // Merge search results and statistics
    const merged = searchData.items.map(item => {
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

    // Save to regional cache
    youtubeRegionalCache[region] = {
      data: merged,
      timestamp: now
    };

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Region', region);
    return res.json(merged);
  } catch (error) {
    console.error("Error fetching YouTube trending data:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 GTA 6 LIVE HUB server is running on http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
