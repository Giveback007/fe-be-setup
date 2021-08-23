// workbox-config.js
module.exports = {
    globDirectory: "dist",
    globPatterns: [
      "**/*.{html,js,css,png,svg,jpg,gif,json,woff,woff2,eot,ico,webmanifest,map}"
    ],
    swDest: "dist/public/service-worker.js",
    clientsClaim: true,
    skipWaiting: true
};
