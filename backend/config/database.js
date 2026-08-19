const path = require('path');

module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      // path.resolve lets DATABASE_FILENAME be an absolute path (needed when
      // the app directory is read-only and the DB must live in /tmp).
      filename: path.resolve(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
    },
    useNullAsDefault: true,
  },
});
