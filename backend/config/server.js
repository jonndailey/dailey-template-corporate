module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('STRAPI_URL'),
  dirs: {
    // Overridable so deployed containers with a read-only app dir can point
    // uploads/import-backups at a writable location (see start.sh).
    public: env('STRAPI_PUBLIC_DIR', './public'),
  },
});
