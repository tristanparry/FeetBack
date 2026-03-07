#pragma once
#include <CircularBuffer.hpp>
#include "SdFat.h"
#include "sdios.h"
#include "SensorReading.hpp"
using namespace std;

#define SD_BLOCK_SIZE 512
#define MAX_SD_FILE_SIZE 51200
#define FIFO_CAPACITY SD_BLOCK_SIZE / SENSOR_READING_SIZE
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
        pair<char*, int> readNext();
        bool clearReading(int byteOffset);
    private:
        SdFat32 sd;
        File32 file;
        bool openFile(oflag_t mode);
};