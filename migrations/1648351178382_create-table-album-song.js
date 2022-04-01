/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('album', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR',
      notNull: true,
    },
    year: {
      type: 'SMALLINT',
      notNull: true,
    },
  });

  pgm.createTable('song', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR',
      notNull: true,
    },
    year: {
      type: 'SMALLINT',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(24)',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    duration: {
      type: 'INT',
      notNull: false,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: '"album"',
      onDelete: 'cascade',
    },
  });
  pgm.createIndex('song', 'album_id');
  // pgm.addConstraint(
  //   'song',
  //   'fk_song.album_id_album.id',
  //   'FOREIGN KEY(album_id) REFERENCES album(id) ON DELETE CASCADE',
  // );
};

exports.down = (pgm) => {
  pgm.dropTable('song');
  pgm.dropTable('album');
};
