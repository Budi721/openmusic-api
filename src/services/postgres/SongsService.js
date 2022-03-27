const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { NotFoundError, InvariantError } = require('../../exceptions');

class SongsService {
  constructor() {
    this.pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT into song VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs({ search: { title = undefined, performer = undefined } }) {
    let query = 'SELECT id, title, performer FROM song';
    if (title && performer) {
      query = {
        text: 'SELECT id, title, performer FROM song WHERE LOWER(title) LIKE LOWER($1) AND LOWER(performer) LIKE LOWER($2)',
        values: [`%${title}%`, `%${performer}%`],
      };
    }
    if (title) {
      query = {
        text: 'SELECT id, title, performer FROM song WHERE LOWER(title) LIKE LOWER($1)',
        values: [`%${title}%`],
      };
    }
    if (performer) {
      query = {
        text: 'SELECT id, title, performer FROM song WHERE LOWER(performer) LIKE LOWER($1)',
        values: [`%${performer}%`],
      };
    }

    const result = await this.pool.query(query);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM song WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE song SET title = $2, year = $3, genre = $4, performer = $5, duration = $6, album_id = $7 WHERE id = $1 RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM song WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus song. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
