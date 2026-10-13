const dns = require('dns');

// Configure Google & Cloudflare Public DNS to bypass local ISP/Hotspot DNS limitations
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore in environments where setting servers is restricted
}

// Intercept getaddrinfo to resolve MongoDB Atlas shard CNAMEs directly
const origLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  const isAll = options && options.all;

  if (hostname && (hostname.includes('mongodb.net') || hostname.includes('amazonaws.com'))) {
    return dns.resolve4(hostname, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        if (isAll) {
          return callback(null, addresses.map((a) => ({ address: a, family: 4 })));
        } else {
          return callback(null, addresses[0], 4);
        }
      }
      return origLookup(hostname, options, callback);
    });
  }

  return origLookup(hostname, options, callback);
};

module.exports = dns;
