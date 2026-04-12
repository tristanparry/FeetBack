#pragma once
#include <Arduino.h>
#include <Crypto.h>
#include <ChaChaPoly.h>
#include <Entropy.h>
using namespace std;

#define CHACHA_KEY_SIZE 32
#define CHACHA_NONCE_SIZE 12
#define CHACHA_TAG_SIZE 16

// Typical storage:
// [nonce (12 bytes)][ciphertext (N bytes)][tag (16 bytes)]

class ChaCha {
    public:
        ChaCha();
        bool encrypt(uint8_t *data, size_t len, const uint8_t nonce[CHACHA_NONCE_SIZE], uint8_t tag[CHACHA_TAG_SIZE]);
        bool decrypt(uint8_t *data, size_t len, const uint8_t nonce[CHACHA_NONCE_SIZE], const uint8_t tag[CHACHA_TAG_SIZE]);
    private:
        uint8_t _key[CHACHA_KEY_SIZE] = "FeetBackFeetBackFeetBackFeetBack";
        ChaChaPoly _aead;
};