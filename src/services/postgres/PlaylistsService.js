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

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows[0];
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

  async addSongIntoPlaylist({ playlistId, songId, userId }) {
    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    await this.addPlaylistActivities({
      playlistId,
      songId,
      userId,
      action: 'add',
    });
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
               ) AND deleted_at IS NULL`,
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

  async deleteSongInPlaylist({ songId, userId }) {
    const queryPlaylist = {
      text: 'SELECT playlist_id FROM playlist_song WHERE song_id = $1',
      values: [songId],
    };

    const result = await this.pool.query(queryPlaylist);
    await this.addPlaylistActivities({
      playlistId: result.rows[0].playlist_id,
      songId,
      userId,
      action: 'delete',
    });

    const timeDeleted = new Date().toISOString();
    const querySong = {
      text: 'UPDATE song SET deleted_at = $1 WHERE id = $2 RETURNING id',
      values: [timeDeleted, songId],
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

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT u.username as username, s.title as title, action, time
             FROM playlist_song_activity
                      LEFT JOIN "user" u on u.id = playlist_song_activity.user_id
                      LEFT JOIN song s on s.id = playlist_song_activity.song_id
             WHERE playlist_song_activity.playlist_id = $1
             ORDER BY time`,
      values: [playlistId],
    };

    const activities = await this.pool.query(query);
    if (!activities.rows.length) {
      throw new NotFoundError('Playlist activities tidak ditemukan!');
    }
    return {
      playlistId,
      activities: activities.rows,
    };
  }

  async addPlaylistActivities({
    playlistId, songId, userId, action,
  }) {
    await this.getPlaylistById(playlistId);
    const id = `activities-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activity VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this.pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan activities');
    }
  }
}

module.exports = PlaylistsService;
