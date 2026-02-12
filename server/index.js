const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'TikSave API is running' });
});

app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'TikTok URL is required' });
    }

    try {
        // Using tikwm.com as it's a popular free API for TikTok downloading
        const response = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);

        if (response.data && response.data.code === 0) {
            const data = response.data.data;
            res.json({
                success: true,
                title: data.title,
                author: data.author.nickname,
                cover: data.cover,
                videoUrl: data.play, // Direct link to video without watermark
                music: data.music,
                stats: {
                    plays: data.play_count,
                    diggs: data.digg_count,
                    comments: data.comment_count,
                    shares: data.share_count
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: response.data.msg || 'Failed to fetch video. Please check the URL.'
            });
        }
    } catch (error) {
        console.error('Error fetching TikTok data:', error.message);
        res.status(500).json({ error: 'Server error while processing request' });
    }
});

app.get('/api/proxy', async (req, res) => {
    const { url, name } = req.query;
    if (!url) return res.status(400).send('URL is required');

    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.tiktok.com/'
            }
        });

        res.setHeader('Content-Disposition', `attachment; filename="${name || 'tiktok-video'}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');
        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).send('Error downloading video');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
