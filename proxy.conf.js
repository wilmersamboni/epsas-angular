const PROXY_CONFIG = {
  "/api": {
    target: "http://localhost:3000",
    secure: false,
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
    logLevel: "debug"
  },
  "/v2/": {  // <--- Agrega una barra "/" aquí
    target: "http://localhost:3001",
    secure: false,
    changeOrigin: true,
    pathRewrite: { "^/v2/": "/" }, // <--- Asegúrate de que termine en barra
    logLevel: "debug",
    cookieDomainRewrite: "localhost",
    onProxyReq(proxyReq, req) {
      if (req.headers.cookie) {
        proxyReq.setHeader("Cookie", req.headers.cookie);
      }
    },
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