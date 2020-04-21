const crypto = require('crypto')
const secret = process.env.WEBHOOK_SECRET;
const sigHeaderName = 'x-hub-signature'

module.exports.verifyWebhookData = function(req, res, next) {
    const payload = JSON.stringify(req.body)
    if (!payload) {
      return next('Request body empty')
    }
  
    const sig = req.get(sigHeaderName) || ''
    const hmac = crypto.createHmac('sha1', secret)
    const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8')
    const checksum = Buffer.from(sig, 'utf8')
    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
      return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`)
    }
    return next()
  }