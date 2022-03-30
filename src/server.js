const Hapi = require('@hapi/hapi');
require('dotenv').config();

const { songs, albums, users } = require('./api');
const { SongsService, AlbumsService, UsersService } = require('./services/postgres');
const { SongsValidator, AlbumsValidator, UsersValidator } = require('./validator');
const { catchErrorResponse } = require('./utils');

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  server.ext('onPreResponse', catchErrorResponse);

  await server.start();
  console.log(`Server listen in ${server.info.uri}`);
};

init();
