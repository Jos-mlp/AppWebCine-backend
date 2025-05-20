SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema bdcine
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `bdcine` DEFAULT CHARACTER SET utf8;
USE `bdcine`;

-- -----------------------------------------------------
-- Table `bdcine`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bdcine`.`usuario` (
  `id_usuarios` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `rol` ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  `estado` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_usuarios`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `bdcine`.`sala`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bdcine`.`sala` (
  `id_sala` INT NOT NULL AUTO_INCREMENT,
  `numero_sala` VARCHAR(45) NOT NULL,
  `filas` INT NOT NULL,
  `columnas` INT NOT NULL,
  PRIMARY KEY (`id_sala`),
  UNIQUE INDEX `numero_sala_UNIQUE` (`numero_sala` ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `bdcine`.`funcion_pelicula`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bdcine`.`funcion_pelicula` (
  `id_funcion_pelicula` INT NOT NULL AUTO_INCREMENT,
  `pelicula_nombre` VARCHAR(45) NOT NULL,
  `pelicula_descripcion` VARCHAR(50) NOT NULL,
  `poster_pelicula` VARCHAR(255) NULL,
  `fecha` DATE NOT NULL,
  `id_sala` INT NOT NULL,
  PRIMARY KEY (`id_funcion_pelicula`),
  INDEX `fk_funcion_pelicula_sala1_idx` (`id_sala` ASC),
  CONSTRAINT `fk_funcion_pelicula_sala1`
    FOREIGN KEY (`id_sala`)
    REFERENCES `bdcine`.`sala` (`id_sala`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `bdcine`.`reserva`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bdcine`.`reserva` (
  `id_reserva` INT NOT NULL AUTO_INCREMENT,
  `codigoqr` VARCHAR(245) NOT NULL,
  `estado` ENUM('confirmada', 'canjeada', 'cancelada') NOT NULL DEFAULT 'confirmada',
  `id_usuarios` INT NOT NULL,
  `id_funcion_pelicula` INT NOT NULL,
  PRIMARY KEY (`id_reserva`),
  INDEX `fk_reserva_usuario1_idx` (`id_usuarios` ASC),
  INDEX `fk_reserva_funcion_pelicula1_idx` (`id_funcion_pelicula` ASC),
  CONSTRAINT `fk_reserva_usuario1`
    FOREIGN KEY (`id_usuarios`)
    REFERENCES `bdcine`.`usuario` (`id_usuarios`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reserva_funcion_pelicula1`
    FOREIGN KEY (`id_funcion_pelicula`)
    REFERENCES `bdcine`.`funcion_pelicula` (`id_funcion_pelicula`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `bdcine`.`asiento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bdcine`.`asiento` (
  `id_asiento` INT NOT NULL AUTO_INCREMENT,
  `fila` INT NOT NULL,
  `columna` INT NOT NULL,
  `id_sala` INT NOT NULL,
  PRIMARY KEY (`id_asiento`),
  INDEX `fk_asiento_sala1_idx` (`id_sala` ASC),
  CONSTRAINT `fk_asiento_sala1`
    FOREIGN KEY (`id_sala`)
    REFERENCES `bdcine`.`sala` (`id_sala`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  UNIQUE INDEX `asiento_unique` (`id_sala`, `fila`, `columna`)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `bdcine`.`estado_asiento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bdcine`.`estado_asiento` (
  `idestado_asiento` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `estado` ENUM('Disponible', 'Reservado', 'Ocupado') NOT NULL DEFAULT 'Disponible',
  `id_asiento` INT NOT NULL,
  `id_reserva` INT NULL,
  PRIMARY KEY (`idestado_asiento`),
  INDEX `fk_estado_asiento_asiento1_idx` (`id_asiento` ASC),
  INDEX `fk_estado_asiento_reserva1_idx` (`id_reserva` ASC),
  CONSTRAINT `fk_estado_asiento_asiento1`
    FOREIGN KEY (`id_asiento`)
    REFERENCES `bdcine`.`asiento` (`id_asiento`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_estado_asiento_reserva1`
    FOREIGN KEY (`id_reserva`)
    REFERENCES `bdcine`.`reserva` (`id_reserva`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  UNIQUE INDEX `uk_asiento_fecha` (`id_asiento`, `fecha`)
) ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
