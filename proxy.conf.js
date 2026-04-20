/**
 * proxy.conf.js
 *
 * /api/  → http://localhost:3000  (backend-epsas: auth, personas, matriculas, áreas, cursos...)
 * /api2/ → http://localhost:3001  (epsas-bac-peq: etapa-practica, seguimientos, bitacoras...)
 *
 * Uso: ng serve --proxy-config proxy.conf.js
 * O en angular.json → "proxyConfig": "proxy.conf.js"
 */

const PROXY_CONFIG = {
  "/api/": {
    target: "http://localhost:3000",
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
  },
  "/api2/": {
    target: "http://localhost:3001",
    secure: false,
    changeOrigin: true,
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
    }
  }
};

module.exports = PROXY_CONFIG;