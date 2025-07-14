import { NextRequest, NextResponse } from 'next/server';

// OGP画像を取得するAPIエンドポイント
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URLが必要です' }, { status: 400 });
  }

  try {
    // URLを正規化
    const validUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // HTMLを取得
    const response = await fetch(validUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10秒でタイムアウト
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // OGP画像を抽出
    const ogImageMatch = html.match(/<meta[^>]*property=["|']og:image["|'][^>]*content=["|']([^"|']*)["|'][^>]*>/i) ||
                         html.match(/<meta[^>]*content=["|']([^"|']*)["|'][^>]*property=["|']og:image["|'][^>]*>/i);
    
    let ogImage = ogImageMatch ? ogImageMatch[1] : null;
    
    // 相対URLの場合は絶対URLに変換
    if (ogImage && !ogImage.startsWith('http')) {
      const baseUrl = new URL(validUrl);
      ogImage = new URL(ogImage, baseUrl.origin).href;
    }

    // ファビコンをフォールバックとして使用
    if (!ogImage) {
      const faviconMatch = html.match(/<link[^>]*rel=["|'](?:icon|shortcut icon)["|'][^>]*href=["|']([^"|']*)["|'][^>]*>/i) ||
                           html.match(/<link[^>]*href=["|']([^"|']*)["|'][^>]*rel=["|'](?:icon|shortcut icon)["|'][^>]*>/i);
      
      if (faviconMatch) {
        const favicon = faviconMatch[1];
        if (!favicon.startsWith('http')) {
          const baseUrl = new URL(validUrl);
          ogImage = new URL(favicon, baseUrl.origin).href;
        } else {
          ogImage = favicon;
        }
      }
    }

    return NextResponse.json({ 
      image: ogImage,
      url: validUrl 
    });

  } catch (error) {
    console.error('OGP取得エラー:', error);
    return NextResponse.json({ 
      error: 'OGP画像の取得に失敗しました',
      image: null,
      url: url 
    }, { status: 500 });
  }
} 