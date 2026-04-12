#include "Encryption.hpp"

ChaCha::ChaCha() {
  // Do nothing
}

bool ChaCha::encrypt(uint8_t *data, size_t len, const uint8_t nonce[CHACHA_NONCE_SIZE], uint8_t tag[CHACHA_TAG_SIZE]) {
  _aead.clear();
  _aead.setKey(_key, CHACHA_KEY_SIZE);
  _aead.setIV(nonce, CHACHA_NONCE_SIZE);
  _aead.encrypt(data, data, len);
  _aead.computeTag(tag, CHACHA_TAG_SIZE);
  return true;
}

bool ChaCha::decrypt(uint8_t *data, size_t len,
                            const uint8_t nonce[CHACHA_NONCE_SIZE],
                            const uint8_t tag[CHACHA_TAG_SIZE]) {
    _aead.clear();
    _aead.setKey(_key, CHACHA_KEY_SIZE);
    _aead.setIV(nonce, CHACHA_NONCE_SIZE);
    _aead.decrypt(data, data, len);
    return _aead.checkTag(tag, CHACHA_TAG_SIZE);
}