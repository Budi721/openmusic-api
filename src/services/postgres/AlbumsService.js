const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { NotFoundError, InvariantError } = require('../../exceptions');

class AlbumsService {
  constructor() {
    this.pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT into album VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const queryAlbums = {
      text: 'SELECT * FROM album WHERE id = $1',
      values: [id],
    };

    const albums = await this.pool.query(queryAlbums);
    if (!albums.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const querySongsInAlbum = {
      text: 'SELECT id, title, performer FROM song WHERE album_id = $1',
      values: [id],
    };

    const songs = await this.pool.query(querySongsInAlbum);

    return {
      album: albums.rows[0],
      songs: songs.rows,
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE album SET name = $2, year = $3 WHERE id = $1 RETURNING id',
      values: [id, name, year],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM album WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
