class PlaylistsHandler {
  constructor(service, songsService, validator) {
    this.service = service;
    this.validator = validator;
    this.songsService = songsService;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postPlaylistSongByIdHandler = this.postPlaylistSongByIdHandler.bind(this);
    this.getPlaylistSongByIdHandler = this.getPlaylistSongByIdHandler.bind(this);
    this.deletePlaylistSongByIdHandler = this.deletePlaylistSongByIdHandler.bind(this);
    this.getPlaylistActivitiesByIdHandler = this.getPlaylistActivitiesByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    await this.validator.validatePlaylistSchema(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const playlistId = await this.service.addPlaylist({ name, owner });
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id } = request.auth.credentials;
    const playlists = await this.service.getPlaylist(id);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistOwner(id, credentialId);
    await this.service.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongByIdHandler(request, h) {
    await this.validator.validatePlaylistSongSchema(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this.service.verifyPlaylistAccess(playlistId, credentialId);
    await this.songsService.getSongById(songId);
    await this.service.addSongIntoPlaylist({
      playlistId,
      songId,
      userId: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist Song berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this.service.getSongInPlaylist({ playlistId });
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongByIdHandler(request) {
    await this.validator.validatePlaylistSongSchema(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this.service.verifyPlaylistAccess(id, credentialId);
    await this.service.deleteSongInPlaylist({ songId, userId: credentialId });

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async getPlaylistActivitiesByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(id, credentialId);
    const data = await this.service.getPlaylistActivities(id);

    return {
      status: 'success',
      data,
    };
  }
}

module.exports = PlaylistsHandler;
