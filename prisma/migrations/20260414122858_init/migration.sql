-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatarInitial" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "desktopNotifications" BOOLEAN NOT NULL DEFAULT true,
    "autoSave" BOOLEAN NOT NULL DEFAULT true,
    "mapQuality" TEXT NOT NULL DEFAULT 'high',
    "language" TEXT NOT NULL DEFAULT 'ar',
    "region" TEXT NOT NULL DEFAULT 'ps',
    CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Street" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT,
    "type" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "width" REAL NOT NULL,
    "speedLimit" INTEGER NOT NULL,
    "congestion" REAL NOT NULL DEFAULT 0,
    "avgSpeed" REAL NOT NULL DEFAULT 30,
    "isProposed" BOOLEAN NOT NULL DEFAULT false,
    "mapLayerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Street_mapLayerId_fkey" FOREIGN KEY ("mapLayerId") REFERENCES "MapLayer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT,
    "nameEn" TEXT,
    "type" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "footprint" TEXT NOT NULL,
    "height" REAL NOT NULL,
    "floors" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MapLayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "TrafficData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "streetId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "congestion" REAL NOT NULL,
    "avgSpeed" REAL NOT NULL,
    "vehicleCount" INTEGER NOT NULL,
    "pedestrianCount" INTEGER NOT NULL DEFAULT 0,
    "co2Level" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "TrafficData_streetId_fkey" FOREIGN KEY ("streetId") REFERENCES "Street" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IoTDevice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "batteryLevel" REAL,
    "lastReading" TEXT,
    "lastReadingAt" DATETIME,
    "installDate" DATETIME NOT NULL,
    "maintenanceDue" DATETIME,
    "firmwareVersion" TEXT,
    "mapLayerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IoTDevice_mapLayerId_fkey" FOREIGN KEY ("mapLayerId") REFERENCES "MapLayer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "inputData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Simulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SimulationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "simulationId" TEXT NOT NULL,
    "congestionReduction" REAL NOT NULL,
    "speedIncrease" REAL NOT NULL,
    "emissionReduction" REAL NOT NULL,
    "safetyScore" REAL NOT NULL,
    "beforeMetrics" TEXT NOT NULL,
    "afterMetrics" TEXT NOT NULL,
    "explanationAr" TEXT NOT NULL,
    "dataPointsProcessed" INTEGER NOT NULL,
    "modelAccuracy" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SimulationResult_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "simulationResultId" TEXT,
    "titleAr" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIRecommendation_simulationResultId_fkey" FOREIGN KEY ("simulationResultId") REFERENCES "SimulationResult" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "reliability" REAL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleAr" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fileSize" TEXT,
    "pageCount" INTEGER,
    "dateAr" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titleAr" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MapLayer_key_key" ON "MapLayer"("key");
