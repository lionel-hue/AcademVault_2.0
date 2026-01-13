CREATE DATABASE IF NOT EXISTS AcademVault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'academ_vault_user'@'%' IDENTIFIED BY 'Secret123!';
GRANT ALL PRIVILEGES ON AcademVault.* TO 'academ_vault_user'@'%';
FLUSH PRIVILEGES;