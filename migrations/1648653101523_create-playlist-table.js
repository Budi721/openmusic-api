/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlist', {
    id: {
      type: 'VARCHAR(50)',
      notNull: true,
      unique: true,
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      references: '"user"',
      onDelete: 'cascade',
    },
  });
  // pgm.addConstraint(
  //   'playlist',
  //   'fk_playlist.user_id_user.id',
  //   'FOREIGN KEY(owner) REFERENCES user(id) ON DELETE CASCADE',
  // );
  pgm.createIndex('playlist', 'owner');

  pgm.createTable('playlist_song', {
    id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"playlist"',
      onDelete: 'cascade',
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"song"',
      onDelete: 'cascade',
    },
  });

  pgm.addConstraint(
    'playlist_song',
    'unique_playlist_id_and_song_id',
    'UNIQUE(playlist_id, song_id)',
  );

  // pgm.addConstraint(
  //   'playlist_song',
  //   'fk_playlist_song.playlist_id_playlist.id',
  //   'FOREIGN KEY(playlist_id) REFERENCES playlist(id) ON DELETE CASCADE',
  // );
  // pgm.addConstraint(
  //   'playlist_song',
  //   'fk_playlist_song.song_id_song.id',
  //   'FOREIGN KEY(song_id) REFERENCES song(id) ON DELETE CASCADE',
  // );
  pgm.createIndex('playlist_song', 'playlist_id');
  pgm.createIndex('playlist_song', 'song_id');

  pgm.createTable('collaboration', {
    id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"playlist"',
      onDelete: 'cascade',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"user"',
      onDelete: 'cascade',
    },
  });

  // pgm.addConstraint(
  //   'collaboration',
  //   'unique_playlist_id_and_user_id',
  //   'UNIQUE(playlist_id, user_id)',
  // );

  // pgm.addConstraint(
  //   'collaboration',
  //   'fk_collaboration.playlist_id_playlist.id',
  //   'FOREIGN KEY(playlist_id) REFERENCES playlist(id) ON DELETE CASCADE',
  // );
  // pgm.addConstraint(
  //   'playlist_song',
  //   'fk_collaboration.user_id_user.id',
  //   'FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE',
  // );
  pgm.createIndex('collaboration', 'playlist_id');
  pgm.createIndex('collaboration', 'user_id');

  pgm.createTable('playlist_song_activity', {
    id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"playlist"',
      onDelete: 'cascade',
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    action: {
      type: 'VARCHAR',
      notNull: true,
    },
    time: {
      type: 'VARCHAR',
      notNull: true,
    },
  });
  // pgm.addConstraint(
  //   'playlist_song_activity',
  //   'fk_playlist_song_activity.playlist_id_playlist.id',
  //   'FOREIGN KEY(playlist_id) REFERENCES playlist(id) ON DELETE CASCADE',
  // );
  pgm.createIndex('playlist_song_activity', 'playlist_id');
};

exports.down = (pgm) => {
  pgm.dropTable('playlist');
  pgm.dropTable('playlist_song');
  pgm.dropTable('collaboration');
  pgm.dropTable('playlist_song_activity');
};
