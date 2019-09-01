import {MigrationInterface, QueryRunner} from "typeorm";

export class createBase1567196895444 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `countries` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(50) NOT NULL, `code` varchar(2) NOT NULL, UNIQUE INDEX `IDX_b47cbb5311bad9c9ae17b8c1ed` (`code`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `currencies` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(50) NOT NULL, `code` varchar(3) NOT NULL, UNIQUE INDEX `IDX_9f8d0972aeeb5a2277e40332d2` (`code`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `formStatuses` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(50) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `roles` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(50) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `firstName` varchar(50) NOT NULL, `lastName` varchar(50) NULL, `email` varchar(50) NULL, `phone` varchar(50) NULL, `username` varchar(50) NULL, `telegramCode` int NOT NULL, `languageCode` varchar(50) NOT NULL DEFAULT 'en', `roleId` int NULL, UNIQUE INDEX `IDX_ef8ef8d543e43f6e113289b50a` (`telegramCode`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `forms` (`id` int NOT NULL AUTO_INCREMENT, `peopleCount` varchar(50) NOT NULL, `dateFrom` date NOT NULL, `dateTo` date NOT NULL, `priceFrom` int NOT NULL DEFAULT 0, `priceTo` int NULL, `comment` varchar(200) NOT NULL, `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `currencyId` int NULL, `countryId` int NULL, `formStatusId` int NULL, `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `users` ADD CONSTRAINT `FK_368e146b785b574f42ae9e53d5e` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE");
        await queryRunner.query("ALTER TABLE `forms` ADD CONSTRAINT `FK_8c85700c703e4e9ffd4520dad40` FOREIGN KEY (`currencyId`) REFERENCES `currencies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE");
        await queryRunner.query("ALTER TABLE `forms` ADD CONSTRAINT `FK_1a70abfe9ece6e3d8bd45b5eda5` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE");
        await queryRunner.query("ALTER TABLE `forms` ADD CONSTRAINT `FK_be5c364bf40a793da7e75752d95` FOREIGN KEY (`formStatusId`) REFERENCES `formStatuses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE");
        await queryRunner.query("ALTER TABLE `forms` ADD CONSTRAINT `FK_08f0ffcce17394ec4aafcbed2f9` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `forms` DROP FOREIGN KEY `FK_08f0ffcce17394ec4aafcbed2f9`");
        await queryRunner.query("ALTER TABLE `forms` DROP FOREIGN KEY `FK_be5c364bf40a793da7e75752d95`");
        await queryRunner.query("ALTER TABLE `forms` DROP FOREIGN KEY `FK_1a70abfe9ece6e3d8bd45b5eda5`");
        await queryRunner.query("ALTER TABLE `forms` DROP FOREIGN KEY `FK_8c85700c703e4e9ffd4520dad40`");
        await queryRunner.query("ALTER TABLE `users` DROP FOREIGN KEY `FK_368e146b785b574f42ae9e53d5e`");
        await queryRunner.query("DROP TABLE `forms`");
        await queryRunner.query("DROP INDEX `IDX_ef8ef8d543e43f6e113289b50a` ON `users`");
        await queryRunner.query("DROP TABLE `users`");
        await queryRunner.query("DROP TABLE `roles`");
        await queryRunner.query("DROP TABLE `formStatuses`");
        await queryRunner.query("DROP INDEX `IDX_9f8d0972aeeb5a2277e40332d2` ON `currencies`");
        await queryRunner.query("DROP TABLE `currencies`");
        await queryRunner.query("DROP INDEX `IDX_b47cbb5311bad9c9ae17b8c1ed` ON `countries`");
        await queryRunner.query("DROP TABLE `countries`");
    }

}
