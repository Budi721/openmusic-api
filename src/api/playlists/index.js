const routes = require('./routes');
const PlaylistsHandler = require('./handler');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: (server, { service, songsService, validator }) => {
    const playlistsHandler = new PlaylistsHandler(service, songsService, validator);
    server.route(routes(playlistsHandler));
  },
};
