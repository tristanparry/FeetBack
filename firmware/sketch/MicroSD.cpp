#include "MicroSD.hpp"
#include "SensorReading.hpp"

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
    data.serialize(buf + (i * SENSOR_READING_SIZE));
  }

  if (sd.freeClusterCount() < 2) {
    delete[] buf;
    buf = nullptr;
    file.close();
    return false;
  }

  size_t written = file.write((const uint8_t*)buf, SD_BLOCK_SIZE);

  delete[] buf;
  buf = nullptr;
  file.close();
  return written == SD_BLOCK_SIZE;
}

pair<char*, int> MicroSD::readNext() {
  if (!openFile(FILE_READ)) {
    return {nullptr, -1};
  }

  while (file.available()) {
    char checkByte = file.read();
    if (checkByte == START_FLAG) {
      uint32_t offset = file.position() - 1;
      file.seek(offset);
      char* readBuffer = new char[SENSOR_READING_SIZE];
      memset(readBuffer, 0, SENSOR_READING_SIZE);
      file.read(readBuffer, SENSOR_READING_SIZE);

      if (readBuffer[0] != START_FLAG) {
        delete[] readBuffer;
        readBuffer = nullptr;
        continue;
      }

      file.close();
      return {readBuffer, static_cast<int>(offset)};
    } else {
      file.seek(file.position() + (SENSOR_READING_SIZE - 1));
    }
  }

  file.close();
  return {nullptr, -1};
}

bool MicroSD::clearReading(int byteOffset) {
  if (!openFile(O_RDWR)) {
    return false;
  }

  uint32_t sdStartBlock, sdEndBlock;
  if (!file.contiguousRange(&sdStartBlock, &sdEndBlock)) {
    file.close();
    return false;
  }
  file.close();

  uint32_t sdBlockNumber = sdStartBlock + (byteOffset / SD_BLOCK_SIZE);
  uint32_t sdBlockOffset = byteOffset % SD_BLOCK_SIZE;

  uint8_t* sdBlockBuffer = new uint8_t[SD_BLOCK_SIZE];
  if (!sd.card()->readSector(sdBlockNumber, sdBlockBuffer)) {
    delete[] sdBlockBuffer;
    sdBlockBuffer = nullptr;
    return false;
  }

  memset(sdBlockBuffer + sdBlockOffset, 0x00, SENSOR_READING_SIZE);
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
