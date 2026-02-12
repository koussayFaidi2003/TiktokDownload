import { useState } from 'react'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleDownload = async (e) => {
    if (e) e.preventDefault()
    if (!url) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.message || 'Something went wrong. Please check the URL.')
      }
    } catch (err) {
      setError('Failed to connect to the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num
  }

  return (
    <div className="app">
      <div className="bg-gradient"></div>
      <div className="blob"></div>
      <div className="blob blob-2"></div>

      <div className="container">
        <header className="glass-card">
          <h1>TikSave</h1>
          <p className="subtitle">Download TikTok videos without watermark instantly.</p>

          <form className="input-group" onSubmit={handleDownload}>
            <input
              type="text"
              placeholder="Paste TikTok video link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              id="tiktok-url-input"
            />
            <button type="submit" disabled={loading || !url} id="download-trigger">
              {loading ? <div className="loader"></div> : 'Download'}
            </button>
          </form>

          {error && (
            <div style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '1rem', fontWeight: 500 }}>
              {error}
            </div>
          )}
        </header>

        {result && (
          <div className="result-container">
            <div className="video-info glass-card">
              <img src={result.cover} alt="Thumbnail" className="thumbnail" />
              <div className="details">
                <div>
                  <h2>{result.title || 'TikTok Video'}</h2>
                  <p className="author">@{result.author}</p>

                  <div className="stats">
                    <div className="stat-item">👁️ {formatNumber(result.stats.plays)} plays</div>
                    <div className="stat-item">❤️ {formatNumber(result.stats.diggs)} likes</div>
                    <div className="stat-item">💬 {formatNumber(result.stats.comments)} comments</div>
                    <div className="stat-item">🔗 {formatNumber(result.stats.shares)} shares</div>
                  </div>
                </div>

                <div className="download-actions">
                  <a
                    href={`/api/proxy?url=${encodeURIComponent(result.videoUrl)}&name=tiksave-${Date.now()}`}
                    className="download-btn"
                  >
                    Download Video (No Watermark)
                  </a>
                  <a
                    href={`/api/proxy?url=${encodeURIComponent(result.music.play_url)}&name=tiksave-audio-${Date.now()}`}
                    className="download-btn secondary"
                  >
                    Download Audio (MP3)
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
