-- Remove global defaults for mechanic-specific fields on User
ALTER TABLE `User`
  ALTER COLUMN `shiftStart` DROP DEFAULT,
  ALTER COLUMN `shiftEnd` DROP DEFAULT,
  ALTER COLUMN `workDays` DROP DEFAULT;

-- Clear mechanic-specific values for customer users
UPDATE `User`
SET
  `speciality` = NULL,
  `shiftStart` = NULL,
  `shiftEnd` = NULL,
  `workDays` = NULL,
  `notificationPrefs` = NULL
WHERE `role` = 'USER';
