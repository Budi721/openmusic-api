const Hapi = require('@hapi/hapi');
require('dotenv').config();

const { TokenManager } = require('./tokenize');
const {
  songs, albums, users, authentications,
} = require('./api');
const {
  SongsService, AlbumsService, UsersService, AuthenticationsService,
} = require('./services/postgres');
const {
  SongsValidator, AlbumsValidator, UsersValidator, AuthenticationsValidator,
} = require('./validator');
const { catchErrorResponse } = require('./utils');

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

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
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', catchErrorResponse);

  await server.start();
  console.log(`Server listen in ${server.info.uri}`);
};

init();
