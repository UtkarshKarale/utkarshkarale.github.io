<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>XML Sitemap | Utkarsh Karale</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #09090b;
            color: #f4f4f5;
            margin: 0;
            padding: 2.5rem 1.5rem;
          }
          .container {
            max-width: 1080px;
            margin: 0 auto;
          }
          header {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #27272a;
          }
          h1 {
            font-size: 1.85rem;
            font-weight: 800;
            margin: 0 0 0.5rem 0;
            color: #ffffff;
            letter-spacing: -0.025em;
          }
          p.desc {
            color: #a1a1aa;
            font-size: 0.95rem;
            margin: 0 0 0.75rem 0;
            line-height: 1.5;
          }
          .badge {
            display: inline-block;
            background: rgba(14, 165, 233, 0.15);
            color: #38bdf8;
            border: 1px solid rgba(14, 165, 233, 0.3);
            padding: 0.25rem 0.65rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: #121215;
            border: 1px solid #27272a;
            border-radius: 14px;
            overflow: hidden;
            font-size: 0.875rem;
          }
          th {
            background: #18181b;
            color: #d4d4d8;
            text-align: left;
            padding: 1rem 1.25rem;
            font-weight: 700;
            border-bottom: 1px solid #27272a;
          }
          td {
            padding: 0.85rem 1.25rem;
            border-bottom: 1px solid #1f1f23;
            color: #e4e4e7;
          }
          tr:last-child td {
            border-bottom: none;
          }
          tr:hover td {
            background: #18181b;
          }
          a {
            color: #38bdf8;
            text-decoration: none;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
          .priority {
            display: inline-block;
            padding: 0.15rem 0.5rem;
            border-radius: 6px;
            font-weight: 700;
            font-size: 0.75rem;
            background: #27272a;
            color: #f4f4f5;
          }
          .p-high { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
          .p-med { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
          .p-low { background: #27272a; color: #a1a1aa; }
          .footer-note {
            margin-top: 2rem;
            font-size: 0.8rem;
            color: #71717a;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <span class="badge">Search Engine &amp; Machine Index</span>
            <h1>Utkarsh Karale — XML Sitemap</h1>
            <p class="desc">
              This index contains all 40 indexed landing pages, products, essays, and utilities for web crawlers and answer engines.
            </p>
          </header>

          <xsl:if test="sitemap:sitemapindex">
            <table>
              <thead>
                <tr>
                  <th style="width: 70%;">Sitemap File</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <tr>
                    <td>
                      <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                    </td>
                    <td style="color: #a1a1aa; font-family: monospace;">
                      <xsl:value-of select="sitemap:lastmod"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>

          <xsl:if test="sitemap:urlset">
            <table>
              <thead>
                <tr>
                  <th style="width: 55%;">URL Location</th>
                  <th style="width: 15%;">Last Modified</th>
                  <th style="width: 15%;">Frequency</th>
                  <th style="width: 15%;">Priority</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td>
                      <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                    </td>
                    <td style="color: #a1a1aa; font-family: monospace;">
                      <xsl:value-of select="sitemap:lastmod"/>
                    </td>
                    <td style="color: #d4d4d8; text-transform: capitalize;">
                      <xsl:value-of select="sitemap:changefreq"/>
                    </td>
                    <td>
                      <xsl:choose>
                        <xsl:when test="sitemap:priority &gt;= 0.9">
                          <span class="priority p-high"><xsl:value-of select="sitemap:priority"/></span>
                        </xsl:when>
                        <xsl:when test="sitemap:priority &gt;= 0.75">
                          <span class="priority p-med"><xsl:value-of select="sitemap:priority"/></span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="priority p-low"><xsl:value-of select="sitemap:priority"/></span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>

          <div class="footer-note">
            Generated dynamically by Antigravity Sitemap Engine for Utkarsh Karale Portfolio.
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
