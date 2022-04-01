const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { InvariantError, NotFoundError, AuthorizationError } = require('../../exceptions');

class PlaylistsService {
  constructor(collaborationsService) {
    this.pool = new Pool();
    this.collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylist(owner) {
    const query = {
      text: `SELECT p.id as id, p.name as name, u.username as username
             FROM playlist p
                    LEFT JOIN collaboration c on p.id = c.playlist_id
                    LEFT JOIN "user" u on u.id = p.owner
             WHERE p.owner = $1
                OR c.user_id = $1
             GROUP BY p.id, u.username, p.name`,
      values: [owner],
    };
    const result = await this.pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongIntoPlaylist({ playlistId, songId }) {
    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
  }

  async getSongInPlaylist({ playlistId }) {
    try {
      await this.pool.query('BEGIN');
      const query = {
        text: `SELECT p.id as id, p.name as name, u.username as username
               FROM playlist p
                  LEFT JOIN playlist_song ps ON p.id = ps.playlist_id
                  LEFT JOIN "user" u ON u.id = p.owner
               WHERE ps.playlist_id = $1
                  OR p.id = $1 `,
        values: [playlistId],
      };
      const result = await this.pool.query(query);
      const querySongs = {
        text: `SELECT id, title, performer
               FROM song
               WHERE id IN (
                   SELECT ps.song_id 
                   FROM playlist p
                      LEFT JOIN playlist_song ps ON p.id = ps.playlist_id
                   WHERE playlist_id = $1
               )`,
        values: [playlistId],
      };
      const resultSongs = await this.pool.query(querySongs);
      await this.pool.query('COMMIT');

      result.rows[0].songs = resultSongs.rows;
      return result.rows[0];
    } catch (e) {
      await this.pool.query('ROLLBACK');
      throw e;
    }
  }

  async deleteSongInPlaylist({ songId }) {
    const querySong = {
      text: 'DELETE FROM song WHERE id = $1 RETURNING id',
      values: [songId],
    };

    await this.pool.query(querySong);
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const note = result.rows[0];
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this.collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
