const SongValidateSchema = require('./schema');
const { InvariantError } = require('../../exceptions');

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongValidateSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;
