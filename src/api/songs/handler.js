class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    await this.validator.validateSongPayload(request.payload);
    const {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    } = request.payload;

    const songId = await this.service.addSong({
      title, year, genre, performer, duration, albumId,
    });
    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;

    const songs = await this.service.getSongs({ search: { title, performer } });
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this.service.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    await this.validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    } = request.payload;

    await this.service.editSongById(id, {
      title, year, genre, performer, duration, albumId,
    });

    return {
      status: 'success',
      message: 'Song berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this.service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
