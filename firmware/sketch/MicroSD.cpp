#include "MicroSD.hpp"
#include "SensorReading.hpp"
#include "Encryption.hpp"

MicroSD::MicroSD() = default;

bool MicroSD::init() {
  if (!sd.begin(SD_CONFIG)) {
    sd.initErrorHalt(&Serial);
    return false;
  }
  return true;
}

bool MicroSD::openFile(oflag_t mode) {
  return file.open(DATA_FILE, mode);
}

bool MicroSD::batchWrite(CircularBuffer<SensorReading, FIFO_CAPACITY>& fifo) {
  if (!openFile(FILE_WRITE)) {
    return false;
  }

  if (file.fileSize() >= MAX_SD_FILE_SIZE) {
    file.close();
    reset();
    if (!openFile(FILE_WRITE)) {
      return false;
    }
  }

  char* buf = new char[SD_BLOCK_SIZE];
  if (!buf) {
    file.close();
    return false;
  }
  memset(buf, 0, SD_BLOCK_SIZE);

  if (!fifo.isFull()) {
    file.close();
    delete[] buf;
    buf = nullptr;
    return false;
  }

  for (size_t i = 0; i < FIFO_CAPACITY; i++) {
    SensorReading data = fifo.pop();
    data.serialize(buf + CHACHA_NONCE_SIZE + (i * SENSOR_READING_SIZE));
  }

  if (sd.freeClusterCount() < 2) {
    delete[] buf;
    buf = nullptr;
    file.close();
    return false;
  }

  uint8_t nonce[CHACHA_NONCE_SIZE];
  uint8_t tag[CHACHA_TAG_SIZE];
  Entropy.randomBytes(nonce, sizeof(nonce)); // Utilize Teensy hardware for True RNG (not pseudorandom)
  memcpy(buf, nonce, CHACHA_NONCE_SIZE);
  chacha.encrypt(buf + CHACHA_NONCE_SIZE, SD_RECORDS_SIZE, nonce, tag);
  memcpy(buf + SD_BLOCK_SIZE - CHACHA_TAG_SIZE, tag, CHACHA_TAG_SIZE);
  size_t written = file.write((const uint8_t*)buf, SD_BLOCK_SIZE);

  delete[] buf;
  buf = nullptr;
  file.close();
  return written == SD_BLOCK_SIZE && nonce_written == CHACHA_NONCE_SIZE && tag_written == CHACHA_TAG_SIZE;
}

int MicroSD::batchRead() {
  if (!openFile(FILE_READ)) {
    return -1;
  }

  uint8_t* block = new uint8_t[SD_BLOCK_SIZE];

  if (file.available() >= SD_BLOCK_SIZE) {
    uint32_t offset = file.position();

    size_t bytesRead = file.read(block, SD_BLOCK_SIZE);
    if (bytesRead != SD_BLOCK_SIZE) {
      // Partial block error
      break;
    }

    uint8_t* nonce = block;
    uint8_t* data = block + CHACHA_NONCE_SIZE;
    uint8_t* tag = block + SD_BLOCK_SIZE - CHACHA_TAG_SIZE;

    if (!crypto.decrypt(data, SD_RECORDS_SIZE, nonce, tag)) {
      // Data corrupted or tampered with
      break;
    }

    memcpy(readBuffer, data, SD_RECORDS_SIZE);
    delete[] block;
    block = nullptr;
    file.close();
    readPointer = 0;
    return static_cast<int>(offset);
  }

  memset(readBuffer, 0x00, SD_RECORDS_SIZE);
  delete[] block;
  block = nullptr;
  file.close();
  return -1;
}

pair<char*, int> MicroSD::readNext() {
  int offset = -1;
  if (readIndex >= FIFO_CAPACITY) {
    offset = batchRead();

    if (offset < 0) {
      return {nullptr, -1};
    }
  }

  while (readIndex < FIFO_CAPACITY) {
    char* res = new char[SENSOR_READING_SIZE];
    memcpy(res, readBuffer + readIndex * SENSOR_READING_SIZE, SENSOR_READING_SIZE);
    readIndex++;
    
    if (res[0] != START_FLAG) {
      delete[] res;
      res = nullptr;
    } else {
      return {res, offset};
    }
  }

  return {nullptr, -1};
}

bool MicroSD::clearReading(int byteOffset) {
  if (!openFile(O_RDWR) || byteOffset < 0) {
    return false;
  }

  uint32_t sdStartBlock, sdEndBlock;
  if (!file.contiguousRange(&sdStartBlock, &sdEndBlock)) {
    file.close();
    return false;
  }
  file.close();

  uint32_t sdBlockNumber = sdStartBlock + (byteOffset / SD_BLOCK_SIZE);

  uint8_t* sdBlockBuffer = new uint8_t[SD_BLOCK_SIZE];
  if (!sd.card()->readSector(sdBlockNumber, sdBlockBuffer)) {
    delete[] sdBlockBuffer;
    sdBlockBuffer = nullptr;
    return false;
  }

  memset(sdBlockBuffer, 0x00, SD_BLOCK_SIZE);
  if (!sd.card()->writeSector(sdBlockNumber, sdBlockBuffer)) {
    delete[] sdBlockBuffer;
    sdBlockBuffer = nullptr;
    return false;
  }

  delete[] sdBlockBuffer;
  sdBlockBuffer = nullptr;
  return true;
}

void MicroSD::reset() {
  if (openFile(O_WRITE)) {
    file.truncate(0);
    file.close();
  }
}
