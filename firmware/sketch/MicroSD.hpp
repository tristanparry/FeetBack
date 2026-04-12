#pragma once
#include <CircularBuffer.hpp>
#include "SdFat.h"
#include "sdios.h"
#include "SensorReading.hpp"
#include "Encryption.hpp"
using namespace std;

#define SD_BLOCK_SIZE 512
#define SD_RECORDS_SIZE SD_BLOCK_SIZE - CHACHA_NONCE_SIZE - CHACHA_TAG_SIZE
#define MAX_SD_FILE_SIZE 51200
#define FIFO_CAPACITY SD_RECORDS_SIZE / SENSOR_READING_SIZE
#define DATA_FILE "data.bin"

#if HAS_SDIO_CLASS
#define SD_CONFIG SdioConfig(FIFO_SDIO)
#endif

class MicroSD {
    public:
        MicroSD();
        bool init();
        void reset();
        bool batchWrite(CircularBuffer<SensorReading, FIFO_CAPACITY>& fifo);
        int batchRead();
        pair<char*, int> readNext();
        bool clearReading(int byteOffset);
    private:
        SdFat32 sd;
        File32 file;
        ChaCha chacha;
        char readBuffer[SD_RECORDS_SIZE];
        int readIndex = 0;
        bool openFile(oflag_t mode);
};