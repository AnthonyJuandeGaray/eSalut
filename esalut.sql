-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-06-2025 a las 17:19:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `esalut`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

CREATE TABLE `cita` (
  `id` int(11) NOT NULL,
  `fecha` datetime(3) NOT NULL,
  `usuarioId` int(11) NOT NULL,
  `medicoId` int(11) NOT NULL,
  `creadoEn` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `estado` enum('PENDIENTE','ACEPTADA','COMPLETADA','CANCELADA') NOT NULL DEFAULT 'PENDIENTE',
  `motivoConsulta` varchar(191) DEFAULT NULL,
  `observaciones` varchar(191) DEFAULT NULL,
  `presencial` tinyint(1) NOT NULL DEFAULT 1,
  `tipo` varchar(191) DEFAULT NULL,
  `ubicacion` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cita`
--

INSERT INTO `cita` (`id`, `fecha`, `usuarioId`, `medicoId`, `creadoEn`, `estado`, `motivoConsulta`, `observaciones`, `presencial`, `tipo`, `ubicacion`) VALUES
(13, '2025-03-06 09:30:00.000', 14, 11, '2025-06-01 12:15:38.916', 'COMPLETADA', 'Veo Borroso por el ojo izquierdo', NULL, 1, NULL, NULL),
(14, '2025-02-06 07:15:00.000', 13, 2, '2025-06-01 12:18:23.141', 'COMPLETADA', 'Me ha salido una mancha extraña', NULL, 1, NULL, NULL),
(15, '2025-02-06 11:00:00.000', 4, 10, '2025-06-01 12:20:32.165', 'COMPLETADA', 'Dolor abdominal muy intenso', NULL, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disponibilidad`
--

CREATE TABLE `disponibilidad` (
  `id` int(11) NOT NULL,
  `dia` enum('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO') NOT NULL,
  `horaInicio` varchar(191) NOT NULL,
  `horaFin` varchar(191) NOT NULL,
  `medicoId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `disponibilidad`
--

INSERT INTO `disponibilidad` (`id`, `dia`, `horaInicio`, `horaFin`, `medicoId`) VALUES
(5, 'LUNES', '08:00', '16:00', 1),
(6, 'MARTES', '09:00', '17:00', 1),
(8, 'MIERCOLES', '08:00', '16:00', 1),
(9, 'JUEVES', '10:00', '17:00', 1),
(11, 'VIERNES', '08:00', '14:00', 1),
(27, 'MARTES', '10:00', '18:00', 11),
(28, 'JUEVES', '08:00', '16:00', 11),
(29, 'VIERNES', '08:00', '13:00', 11),
(30, 'LUNES', '12:00', '20:00', 10),
(31, 'VIERNES', '10:00', '14:00', 10),
(32, 'LUNES', '08:00', '14:00', 9),
(33, 'MARTES', '09:00', '15:00', 9),
(34, 'MIERCOLES', '10:00', '13:00', 9),
(35, 'MIERCOLES', '13:00', '20:00', 8),
(36, 'JUEVES', '10:00', '14:00', 8),
(37, 'VIERNES', '08:00', '14:00', 8),
(38, 'MARTES', '08:00', '14:00', 2),
(39, 'LUNES', '08:00', '15:00', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documento`
--

CREATE TABLE `documento` (
  `id` int(11) NOT NULL,
  `fecha` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `citaId` int(11) NOT NULL,
  `observaciones` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `documento`
--

INSERT INTO `documento` (`id`, `fecha`, `citaId`, `observaciones`) VALUES
(4, '2025-06-01 12:17:25.932', 13, 'Tiene conjuntivitis, tomar la medicación y en una semana estará mejor.'),
(5, '2025-06-01 12:19:22.200', 14, 'Es una marca de nacimiento, habrá que hacer un control de ella cada año'),
(6, '2025-06-01 12:21:42.354', 15, 'Tiene una infección urinaria, tomar la medicación y en una semana ya estaría mejor.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especialidad`
--

CREATE TABLE `especialidad` (
  `id` int(11) NOT NULL,
  `nombre` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `especialidad`
--

INSERT INTO `especialidad` (`id`, `nombre`) VALUES
(1, 'Cardiología'),
(2, 'Dermatología'),
(6, 'Ginecología'),
(4, 'Medicina Interna'),
(5, 'Neurología'),
(7, 'Oftalmología'),
(3, 'Pediatría');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamento`
--

CREATE TABLE `medicamento` (
  `id` int(11) NOT NULL,
  `nombre` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `medicamento`
--

INSERT INTO `medicamento` (`id`, `nombre`) VALUES
(3, 'Amoxicilina'),
(9, 'Atorvastatina'),
(10, 'Azitromicina'),
(11, 'Diclofenaco'),
(2, 'Ibuprofeno'),
(6, 'Loratadina'),
(8, 'Losartán'),
(7, 'Metformina'),
(4, 'Omeprazol'),
(1, 'Paracetamol'),
(5, 'Salbutamol');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamentorecetado`
--

CREATE TABLE `medicamentorecetado` (
  `id` int(11) NOT NULL,
  `dosis` varchar(191) NOT NULL,
  `frecuencia` varchar(191) NOT NULL,
  `duracion` varchar(191) NOT NULL,
  `documentoId` int(11) NOT NULL,
  `medicamentoId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `medicamentorecetado`
--

INSERT INTO `medicamentorecetado` (`id`, `dosis`, `frecuencia`, `duracion`, `documentoId`, `medicamentoId`) VALUES
(2, '1', 'cada 8 horas', '7 días', 4, 3),
(3, '1', 'cada 8 horas', '7 días', 6, 3),
(4, '1', 'cada 8 horas', '7 días', 6, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medico`
--

CREATE TABLE `medico` (
  `id` int(11) NOT NULL,
  `nombre` varchar(191) NOT NULL,
  `especialidadId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `dni` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `medico`
--

INSERT INTO `medico` (`id`, `nombre`, `especialidadId`, `createdAt`, `dni`, `email`, `password`, `updatedAt`) VALUES
(1, 'Juan Sebastián Melo', 1, '2025-03-22 16:50:53.850', '19866698W', 'juan.melo@esalut.com', '$2b$10$wV/uyfJhJAZK3RsWV4J71OTStt3xjHY3McVQzPdxYGGXJpPlEVCE2', '2025-03-22 16:50:53.850'),
(2, 'Pedro Quiles', 2, '2025-03-23 12:19:16.884', '19866699W', 'pedro.quiles@esalut.com', '$2b$10$sENRMb65o0QLI9T2kkzDcOylnTXzPv01vWvs6/kQWfMvT3sDgnuZK', '2025-03-23 14:14:29.483'),
(8, 'Milo Barrera', 4, '2025-06-01 11:49:30.729', '19866697W', 'milo.barrera@esalut.com', '$2b$10$Bb/BtOt0id9tOHiVNTs7BO02K3qJnvoULW4Gisy498yG6OsImQ4Y6', '2025-06-01 12:10:05.378'),
(9, 'Kike Salas', 5, '2025-06-01 11:49:35.481', '19866696W', 'kike.salas@esalut.com', '$2b$10$twKi.Ye8IDRRbdc2zNNN5u9JZDU95/PgKLkNsrW55eKW4cb5hw7D.', '2025-06-01 12:10:17.680'),
(10, 'Sandra Palacios', 6, '2025-06-01 11:49:39.581', '19866695W', 'sandra.palacios@esalut.com', '$2b$10$w8WRSEZyEHqdmFKU01w3wewbfJw03lVgnixQKozA0uYYOF8Qa9CKe', '2025-06-01 12:10:09.364'),
(11, 'Paula Machado', 7, '2025-06-01 11:49:44.080', '19866694W', 'paula.machado@esalut.com', '$2b$10$c.QcrM.iSX3x5FzkFRVw.uGNo1bTi6tdWumRzkX6AX0tD4Ql4B/lW', '2025-06-01 12:10:29.266'),
(12, 'Salma Giro', 3, '2025-06-01 11:49:47.783', '19866693W', 'salma.giro@esalut.com', '$2b$10$5LtTtKsstYdNsVYmVylXkesyGotM/ntduGbu05HCvhsr07tw7iq/O', '2025-06-01 12:10:32.762');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombre` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `dni` varchar(191) NOT NULL,
  `fechaNacimiento` datetime(3) NOT NULL,
  `sexo` enum('HOMBRE','MUJER','OTRO') NOT NULL,
  `telefono` varchar(191) NOT NULL,
  `verificado` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `direccion` varchar(191) DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  `rol` enum('PACIENTE','MEDICO','ADMIN') NOT NULL DEFAULT 'PACIENTE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `email`, `password`, `dni`, `fechaNacimiento`, `sexo`, `telefono`, `verificado`, `createdAt`, `direccion`, `updatedAt`, `rol`) VALUES
(0, 'Anthony Zamora Martínez', 'anthonyzamoram03@gmail.com', '$2b$10$sUQSzF61G61g7OmhZPfmye7HNnpbMukIWxmfKRqxsjuaQb4DZPRDC', '26754029S', '2003-01-06 00:00:00.000', 'HOMBRE', '634454938', 1, '2025-03-22 23:27:36.551', 'Calle del Beato Nicolás Factor,7', '2025-03-22 23:27:36.551', 'ADMIN'),
(1, 'Juan Sebastián Melo', 'juan.melo@esalut.com', '$2b$10$wV/uyfJhJAZK3RsWV4J71OTStt3xjHY3McVQzPdxYGGXJpPlEVCE2', '19866698W', '2003-10-25 00:00:00.000', 'HOMBRE', '643356902', 1, '2025-03-22 11:49:28.157', 'Clínica Central', '2025-03-22 16:50:53.843', 'MEDICO'),
(2, 'Pedro Quiles', 'pedro.quiles@esalut.com', '$2b$10$sENRMb65o0QLI9T2kkzDcOylnTXzPv01vWvs6/kQWfMvT3sDgnuZK', '19866699W', '2000-10-01 00:00:00.000', 'HOMBRE', '666378902', 1, '2025-03-23 12:18:50.400', 'Central Clínica ', '2025-03-23 12:19:17.071', 'MEDICO'),
(4, 'Andrea Galarte', 'andrea.galarte@gmail.com', '$2b$10$0A2RR8fljWY7jpfVKIW33uxnI9LXqQGv3SRl5G.rkcxtiJ.Vzv5v6', '78935619S', '2004-01-25 00:00:00.000', 'MUJER', '611234567', 1, '2025-03-23 16:14:04.919', 'Calle Luna, 45', '2025-03-23 16:50:36.840', 'PACIENTE'),
(8, 'Milo Barrera', 'milo.barrera@esalut.com', '$2b$10$Bb/BtOt0id9tOHiVNTs7BO02K3qJnvoULW4Gisy498yG6OsImQ4Y6', '19866697W', '1999-04-01 00:00:00.000', 'HOMBRE', '666390092', 1, '2025-03-24 11:31:48.723', 'Clínica Central', '2025-03-24 11:49:30.724', 'MEDICO'),
(9, 'Kike Salas', 'kike.salas@esalut.com', '$2b$10$twKi.Ye8IDRRbdc2zNNN5u9JZDU95/PgKLkNsrW55eKW4cb5hw7D.', '19866696W', '2001-02-01 00:00:00.000', 'HOMBRE', '634454939', 1, '2025-03-24 11:44:54.777', 'Clínica Central', '2025-03-24 11:49:35.474', 'MEDICO'),
(10, 'Sandra Palacios', 'sandra.palacios@esalut.com', '$2b$10$w8WRSEZyEHqdmFKU01w3wewbfJw03lVgnixQKozA0uYYOF8Qa9CKe', '19866695W', '1998-02-08 00:00:00.000', 'MUJER', '634454932', 1, '2025-03-24 11:46:28.018', 'Clínica Central', '2025-03-24 11:49:39.574', 'MEDICO'),
(11, 'Paula Machado', 'paula.machado@esalut.com', '$2b$10$c.QcrM.iSX3x5FzkFRVw.uGNo1bTi6tdWumRzkX6AX0tD4Ql4B/lW', '19866694W', '2003-02-01 00:00:00.000', 'HOMBRE', '634454931', 1, '2025-03-24 11:47:45.609', 'Clínica Central', '2025-03-24 11:49:44.072', 'MEDICO'),
(12, 'Salma Giro', 'salma.giro@esalut.com', '$2b$10$5LtTtKsstYdNsVYmVylXkesyGotM/ntduGbu05HCvhsr07tw7iq/O', '19866693W', '2000-01-06 00:00:00.000', 'MUJER', '633454938', 1, '2025-03-24 11:48:56.944', 'Clínica Central', '2025-03-24 11:49:47.776', 'MEDICO'),
(13, 'Pol Ortega', 'pol.ortega@gmail.com', '$2b$10$SRzpQAd1428C1E8BerM.QuZc.I0oBaYUhcfZlMSnAwwD8LEOlNh4S', '26824030S', '2005-10-23 00:00:00.000', 'HOMBRE', '634504920', 1, '2025-03-24 11:52:52.168', 'Calle Bareto,4', '2025-03-24 11:54:15.392', 'PACIENTE'),
(14, 'Lidia Hernández ', 'lidia.hernandez@gmail.com', '$2b$10$PnJw9BlzTsqmhDHZqv/pHuGplPIv6qSlBp7Il8llzJwRIwrMI7Eei', '20354039S', '2003-08-03 00:00:00.000', 'MUJER', '634455948', 1, '2025-03-24 11:54:01.236', 'Calle Pio XI, 9', '2025-03-24 11:54:18.678', 'PACIENTE'),
(15, 'Carlos Alcará', 'carlos.alcara@gmail.com', '$2b$10$oUlnkadvdCyLv0o.aZv/4.mdGvLxtHgRBRk/7WDag8dUk7nY/M2pO', '19998345P', '2003-05-07 00:00:00.000', 'HOMBRE', '635674938', 0, '2025-03-24 11:57:02.503', 'Calle Menestral, 9', '2025-03-24 11:57:02.503', 'PACIENTE'),
(16, 'Marcos Moleros', 'marcos.molero@gmail.com', '$2b$10$aBD4sRkUmW1i6AUukSilwOfv2VR6k9sq0hfbHIsKWQWK28Erxt4aW', '26754028Z', '2001-02-01 00:00:00.000', 'HOMBRE', '634423938', 0, '2025-06-01 14:37:00.616', 'Calle del Cristo, 8', '2025-06-01 15:10:44.265', 'PACIENTE');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('1a2ee975-9594-4b13-9a55-e966a05e1221', '434bcf71f33e52d1d0e4c7cd85bd720a2c7634d88e0e510fefd3c6d36e1baba8', '2025-05-22 23:10:14.563', '20250504221015_init', NULL, NULL, '2025-05-22 23:10:14.457', 1),
('24075092-4cb9-4abe-b2b0-650a8a5e7079', '55a8ae17337c590cb93a3109dbea8f9243a70917193c83d3696615b47ac8fafa', '2025-05-28 15:30:43.490', '20250528153042_add_estado_aceptada', NULL, NULL, '2025-05-28 15:30:43.439', 1),
('5a21bfcb-9a05-402c-8de7-cf6abd70e640', 'e80d77694bb36b92e65ed7cca66504974fd79f0085666a51c18795c57989914a', '2025-05-22 23:10:14.634', '20250504223351_add_especialidad', NULL, NULL, '2025-05-22 23:10:14.565', 1),
('722731cf-c45b-453e-9ad6-1edb8f804675', 'ccd44bc9a367b1b355b0fa1f83494119382b6de5b51960b13a726ea89751ad3a', '2025-05-22 23:10:14.648', '20250507195325_cambio_a_dni_y_datos_personales', NULL, NULL, '2025-05-22 23:10:14.635', 1),
('91f70f0b-b332-490a-b640-0fced62b48b3', '653416be917f8499731aeebf5a73a99d161caf2ab9b3ef90061c0c55b1162f10', '2025-05-28 12:28:09.565', '20250528122808_refactor_documento', NULL, NULL, '2025-05-28 12:28:09.466', 1),
('9cba29be-f054-4394-8ffb-d00c0e4cd269', '1a27a4ac1af6e0855cce5c0ffe923964cc49bdca15593b2d15a79078109c2438', '2025-05-27 23:04:55.951', '20250527230455_change_hora_to_string', NULL, NULL, '2025-05-27 23:04:55.913', 1),
('a495fcd9-ba0c-474c-8cd8-5ab58995c846', '5dfa6d85d10810eaf0899b6edc49f645cebe8d85d481aa3ceb41f7ec218a6e3a', '2025-05-22 23:10:14.858', '20250507231959_cambios_total', NULL, NULL, '2025-05-22 23:10:14.820', 1),
('bdc4f44a-eb55-4136-82ae-dd28b9277657', '0c493600214aa4193da4a8a843648a71633b74086af59893c9ef548672100ef5', '2025-05-29 14:22:37.750', '20250529142237_add_medicamentos_remove_notificaciones', NULL, NULL, '2025-05-29 14:22:37.699', 1),
('bf838c43-f52b-43e4-97d8-1dabf3ee11db', '535de0319ff7b5cd51007a8f4f8e55e04bb128fb1c8607b95a8ac3a664aa7867', '2025-05-22 23:11:35.278', '20250522231134_add_rol', NULL, NULL, '2025-05-22 23:11:35.269', 1),
('c9543590-1cde-4e81-aa9e-f8fb8e6ada75', '9614143f9218eac4fcddd94016e8d70232a4d715e42a5aec98e4ea65a90f3f67', '2025-05-22 23:10:14.819', '20250507231210_cambios_total', NULL, NULL, '2025-05-22 23:10:14.649', 1),
('cdd3fd24-218d-4195-973c-2036e5f5aa7d', '5d577de666bc27582d7f4e3b7bb476e4e2d9ed4525c040397804b21d8b788296', '2025-05-29 14:26:04.970', '20250529142604_medicamentos_recetados', NULL, NULL, '2025-05-29 14:26:04.878', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Cita_usuarioId_fkey` (`usuarioId`),
  ADD KEY `Cita_medicoId_fkey` (`medicoId`);

--
-- Indices de la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Disponibilidad_medicoId_fkey` (`medicoId`);

--
-- Indices de la tabla `documento`
--
ALTER TABLE `documento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Documento_citaId_key` (`citaId`);

--
-- Indices de la tabla `especialidad`
--
ALTER TABLE `especialidad`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Especialidad_nombre_key` (`nombre`);

--
-- Indices de la tabla `medicamento`
--
ALTER TABLE `medicamento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Medicamento_nombre_key` (`nombre`);

--
-- Indices de la tabla `medicamentorecetado`
--
ALTER TABLE `medicamentorecetado`
  ADD PRIMARY KEY (`id`),
  ADD KEY `MedicamentoRecetado_documentoId_fkey` (`documentoId`),
  ADD KEY `MedicamentoRecetado_medicamentoId_fkey` (`medicamentoId`);

--
-- Indices de la tabla `medico`
--
ALTER TABLE `medico`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Medico_dni_key` (`dni`),
  ADD UNIQUE KEY `Medico_email_key` (`email`),
  ADD KEY `Medico_especialidadId_fkey` (`especialidadId`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Usuario_email_key` (`email`),
  ADD UNIQUE KEY `Usuario_dni_key` (`dni`);

--
-- Indices de la tabla `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de la tabla `documento`
--
ALTER TABLE `documento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `especialidad`
--
ALTER TABLE `especialidad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `medicamento`
--
ALTER TABLE `medicamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `medicamentorecetado`
--
ALTER TABLE `medicamentorecetado`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `medico`
--
ALTER TABLE `medico`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cita`
--
ALTER TABLE `cita`
  ADD CONSTRAINT `Cita_medicoId_fkey` FOREIGN KEY (`medicoId`) REFERENCES `medico` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Cita_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  ADD CONSTRAINT `Disponibilidad_medicoId_fkey` FOREIGN KEY (`medicoId`) REFERENCES `medico` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `documento`
--
ALTER TABLE `documento`
  ADD CONSTRAINT `Documento_citaId_fkey` FOREIGN KEY (`citaId`) REFERENCES `cita` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `medicamentorecetado`
--
ALTER TABLE `medicamentorecetado`
  ADD CONSTRAINT `MedicamentoRecetado_documentoId_fkey` FOREIGN KEY (`documentoId`) REFERENCES `documento` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `MedicamentoRecetado_medicamentoId_fkey` FOREIGN KEY (`medicamentoId`) REFERENCES `medicamento` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `medico`
--
ALTER TABLE `medico`
  ADD CONSTRAINT `Medico_especialidadId_fkey` FOREIGN KEY (`especialidadId`) REFERENCES `especialidad` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
