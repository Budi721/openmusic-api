/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumns('song', {
    deleted_at: { type: 'text', notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('song', 'deleted_at');
};
