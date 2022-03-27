const Hapi = require('@hapi/hapi');
const { songs, albums } = require('./api');
const { SongsService, AlbumsService } = require('./services/postgres');
const { SongsValidator, AlbumsValidator } = require('./validator');
const { catchErrorResponse } = require('./utils');
require('dotenv').config();

const init = async () => {
  const songsService = new SongsService();
  const albumService = new AlbumsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  });

  await server.register({
    plugin: albums,
    options: {
      service: albumService,
      validator: AlbumsValidator,
    },
  });

  server.ext('onPreResponse', catchErrorResponse);

  await server.start();
  console.log(`Server listen in ${server.info.uri}`);
};

init();
