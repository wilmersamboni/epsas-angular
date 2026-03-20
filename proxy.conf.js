const PROXY_CONFIG = {
  "/api/": {
    target: "http://localhost:3000",
    secure: false,
    changeOrigin: true,
    pathRewrite: { "^/api/": "/" },
    logLevel: "debug"
  },
  "/api2/": {
    target: "http://localhost:3001",
    secure: false,
    changeOrigin: true,
    pathRewrite: { "^/api2/": "/" },
    cookieDomainRewrite: "localhost",
    // Reenvía cookies al backend (necesario cuando usa sesiones en vez de JWT)
    onProxyReq(proxyReq, req) {
      if (req.headers.cookie) {
        proxyReq.setHeader("Cookie", req.headers.cookie);
      }
    },
    // Permite que las cookies Set-Cookie del backend lleguen al navegador
    onProxyRes(proxyRes) {
      const cookies = proxyRes.headers["set-cookie"];
      if (cookies) {
        proxyRes.headers["set-cookie"] = cookies.map(c =>
          c.replace(/; SameSite=None/gi, "")
           .replace(/; Secure/gi, "")
        );
      }
    },
    logLevel: "debug"
  }
};

module.exports = PROXY_CONFIG;
