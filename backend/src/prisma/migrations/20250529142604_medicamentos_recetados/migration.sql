/*
  Warnings:

  - You are about to drop the column `documentoId` on the `medicamento` table. All the data in the column will be lost.
  - You are about to drop the column `dosis` on the `medicamento` table. All the data in the column will be lost.
  - You are about to drop the column `duracion` on the `medicamento` table. All the data in the column will be lost.
  - You are about to drop the column `frecuencia` on the `medicamento` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `Medicamento` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `medicamento` DROP FOREIGN KEY `Medicamento_documentoId_fkey`;

-- DropIndex
DROP INDEX `Medicamento_documentoId_fkey` ON `medicamento`;

-- AlterTable
ALTER TABLE `medicamento` DROP COLUMN `documentoId`,
    DROP COLUMN `dosis`,
    DROP COLUMN `duracion`,
    DROP COLUMN `frecuencia`;

-- CreateTable
CREATE TABLE `MedicamentoRecetado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dosis` VARCHAR(191) NOT NULL,
    `frecuencia` VARCHAR(191) NOT NULL,
    `duracion` VARCHAR(191) NOT NULL,
    `documentoId` INTEGER NOT NULL,
    `medicamentoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Medicamento_nombre_key` ON `Medicamento`(`nombre`);

-- AddForeignKey
ALTER TABLE `MedicamentoRecetado` ADD CONSTRAINT `MedicamentoRecetado_documentoId_fkey` FOREIGN KEY (`documentoId`) REFERENCES `Documento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicamentoRecetado` ADD CONSTRAINT `MedicamentoRecetado_medicamentoId_fkey` FOREIGN KEY (`medicamentoId`) REFERENCES `Medicamento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
