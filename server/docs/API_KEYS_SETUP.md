# API Keys Setup Guide

## 1. YouTube Data API v3
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key
6. Add to .env: `YOUTUBE_API_KEY=your_key_here`

## 2. Google Custom Search API
1. Go to https://programmablesearchengine.google.com/
2. Create a new search engine
3. Set it to search the entire web
4. Get your Search Engine ID
5. Go to https://console.cloud.google.com/apis/library/customsearch.googleapis.com
6. Enable Custom Search API
7. Create API key
8. Add to .env:

`GOOGLE_SEARCH_API_KEY=your_key_here`
`GOOGLE_SEARCH_ENGINE_ID=your_engine_id`


## 3. Semantic Scholar API
- No API key needed for basic usage 
- Rate limit: 100 requests per 5 minutes

## 4. arXiv API
- No API key needed
- Rate limit: 1 request per 3 seconds

## Testing Your Setup
1. Update your .env file with the keys
2. Restart the backend server
3. Make a search in AcademVault
4. Check server logs for API calls