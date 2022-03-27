const { catchErrorResponse } = require('../../utils');

class AlbumsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      await this.validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;
      const albumId = await this.service.addAlbum({ name, year });
      const response = h.response({
        status: 'success',
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (e) {
      console.log(e);
      return catchErrorResponse(e, h);
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this.service.getAlbumById(id);
      return {
        status: 'success',
        data: {
          album,
        },
      };
    } catch (e) {
      return catchErrorResponse(e, h);
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this.validator.validateAlbumPayload(request.payload);

      const { id } = request.params;
      const { name, year } = request.payload;
      await this.service.editAlbumById(id, { name, year });
      return {
        status: 'success',
        message: 'Album berhasil diperbarui',
      };
    } catch (e) {
      return catchErrorResponse(e, h);
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this.service.deleteAlbumById(id);
      return {
        status: 'success',
        message: 'Album berhasil dihapus',
      };
    } catch (e) {
      return catchErrorResponse(e, h);
    }
  }
}

module.exports = AlbumsHandler;
