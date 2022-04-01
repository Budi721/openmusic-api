const { PlaylistSchema, PlaylistSongSchema } = require('./schema');
const { InvariantError } = require('../../exceptions');

const PlaylistsValidator = {
  validatePlaylistSchema: (payload) => {
    const validationResult = PlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePlaylistSongSchema: (payload) => {
    const validationResult = PlaylistSongSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
