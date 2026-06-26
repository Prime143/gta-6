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

// Helper to get date minus 2 days in ISO format
function getDateMinus2Days() {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString();
}

app.get('/api/youtube-gta6', async (req, res) => {
  // Determine region (check query parameter, Vercel IP header, or default to 'US')
  let region = req.query.region || req.headers['x-vercel-ip-country'] || 'US';
  region = region.toUpperCase().substring(0, 2);

  // Basic validation of country code format
  if (!/^[A-Z]{2}$/.test(region)) {
    region = 'US';
  }

  const now = Date.now();

  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) {
      console.warn("YOUTUBE_API_KEY is not configured in server.js, returning fallback videos.");
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Region', region);
      return res.json(fallbackVideos);
    }
    
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
      console.warn(`YouTube search API failed: ${errText}. Returning fallback videos.`);
      res.setHeader('X-Cache', 'MISS-FALLBACK');
      res.setHeader('X-Region', region);
      return res.json(fallbackVideos);
    }
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Region', region);
      return res.json([]);
    }

    // Get stats details for video views and live streaming status
    const ids = searchData.items.map(i => i.id.videoId).filter(Boolean).join(',');
    if (!ids) {
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Region', region);
      return res.json([]);
    }

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=statistics,contentDetails,liveStreamingDetails` +
      `&id=${ids}&key=${API_KEY}`;

    const statsResponse = await fetch(statsUrl);
    if (!statsResponse.ok) {
      const errText = await statsResponse.text();
      console.warn(`YouTube stats API failed: ${errText}. Returning fallback videos.`);
      res.setHeader('X-Cache', 'MISS-FALLBACK');
      res.setHeader('X-Region', region);
      return res.json(fallbackVideos);
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
    res.setHeader('X-Cache', 'ERROR-FALLBACK');
    res.setHeader('X-Region', region);
    return res.json(fallbackVideos);
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
