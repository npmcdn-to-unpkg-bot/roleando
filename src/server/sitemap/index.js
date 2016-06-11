'use strict'

const sm = require('sitemap')

const sitemapConfig = {
  hostname: 'http://roleando.herokuapp.com',
  cacheTime: 86400000,        // 86400 sec - cache purge period
  urls: [
    { url: '/generadores/',  changefreq: 'weekly', priority: 0.8 },
    { url: '/',  changefreq: 'monthly',  priority: 0.2 }
  ]
}

const sitemap = sm.createSitemap(sitemapConfig);

module.exports = app => {
  app.get('/sitemap.xml', (req, res) => {
    sitemap.toXML( function (err, xml) {
      if (err) {
        return res.status(500).end()
      }
      res.header('Content-Type', 'application/xml')
      res.send( xml )
    })
  })
}
