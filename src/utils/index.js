/* eslint-disable camelcase */

const { ClientError } = require('../exceptions');

const catchErrorResponse = (request, h) => {
  // mendapatkan konteks response dari request
  const { response } = request;

  if (response instanceof ClientError) {
    // membuat response baru dari response toolkit sesuai kebutuhan error handling
    const newResponse = h.response({
      status: 'fail',
      message: response.message,
    });
    newResponse.code(response.statusCode);
    return newResponse;
  }

  // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
  return response.continue || response;
};

module.exports = { catchErrorResponse };
