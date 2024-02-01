export function frame200Response(title: string, frameVersion: string, frameImageUrl: string, postUrl: string, buttonNames: string[]): Response {
    const html = `
      <!DOCTYPE html> 
      <html>
        <head>
          <title>${title}</title>
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${title}" />
          <meta property="og:image" content="${frameImageUrl}" />
          <meta name="fc:frame" content="${frameVersion}" />
          <meta name="fc:frame:image" content="${frameImageUrl}" />
          <meta name="fc:frame:post_url" content="${postUrl}" />
          ${buttonNames.map(
            (bn, i) => `<meta name="fc:frame:button:${i+1}" content="${bn}" />`
          )}
        </head>
        <body>
          <h1>dont do this</h1>
          <p>Farcaster Frame for the latest dont do this(s)</p>
          <dl>
            <dt>In action</dt>
            <dd><a href="https://warpcast.com/3070/0xbbd3cde2">https://warpcast.com/3070/0xbbd3cde2</a></dd>
            <dt>Code</dt>
            <dd><a href="https://github.com/eucalyptus-viminalis/dont-do-this">GitHub</a></dd>
          </dl>
          <hr>
          <p>Built by 3070 (<a href="https://warpcast.com/3070">Warpcast Profile</a>)
        </body>
      </html>
    `;
  
    return new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
    });
  }
  