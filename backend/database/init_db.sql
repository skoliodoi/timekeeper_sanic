-- DROP TABLE IF EXISTS `dummy_current_work`; 

-- dpanel.tk_current_work_table definition

-- DROP TABLE IF EXISTS `dummy_users`; 

-- dpanel.tk_users definition

CREATE TABLE IF NOT EXISTS `tk_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `moccarz_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci,
  `login` varchar(255) COLLATE utf8mb4_unicode_ci,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci,
  `edited_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `koordynator` tinyint DEFAULT '0',
  `project_owner` tinyint DEFAULT '0',
  `admin` tinyint DEFAULT '0',
  `show_counter` tinyint DEFAULT '0',
  `active` tinyint DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tk_users_login_unique` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tk_current_work_table` (
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_stage_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_stage` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_stage_additional_info` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `campaign_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_stage_started` timestamp NULL DEFAULT NULL,
  `work_stage_began` timestamp NULL DEFAULT NULL,
  `work_stage_ended` timestamp NULL DEFAULT NULL,
  `work_stage_duration` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_time_started` timestamp NULL DEFAULT NULL,
  `scheduled_start_time` timestamp NULL DEFAULT NULL,
  `work_time_ended` timestamp NULL DEFAULT NULL,
  `scheduled_end_time` timestamp NULL DEFAULT NULL,
  `auto_logout_time` timestamp NULL DEFAULT NULL,
  `sent_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`work_stage_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DROP TABLE IF EXISTS `dummy_finished_work`;

-- dpanel.tk_finished_work_table definition

CREATE TABLE IF NOT EXISTS `tk_finished_work` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_stage_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_stage` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_stage_additional_info` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `campaign_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comments` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_stage_started` timestamp NULL DEFAULT NULL,
  `work_stage_ended` timestamp NULL DEFAULT NULL,
  `work_stage_duration` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_time_started` timestamp NULL DEFAULT NULL,
  `scheduled_start_time` timestamp NULL DEFAULT NULL,
  `work_time_ended` timestamp NULL DEFAULT NULL,
  `scheduled_end_time` timestamp NULL DEFAULT NULL,
  `auto_logout` tinyint DEFAULT '0',
  `is_ghost` boolean DEFAULT FALSE,
  `update_case` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `update_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `edited_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tk_campaigns` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `campaign_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `starting_hours` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ending_hours` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logout_buffer` int DEFAULT '15',
  `next_ghost_creation` timestamp DEFAULT NULL,
  `ending_next_day` boolean DEFAULT FALSE,
  `edited_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DROP TABLE IF EXISTS `dummy_deleted_records`;

-- dpanel.tk_deleted_records definition

CREATE TABLE IF NOT EXISTS `tk_user_campaign` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `login` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tk_po_campaign` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `login` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tk_campaign_statuses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campaign_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tk_deleted_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) DEFAULT NULL,
  `work_stage_id` varchar(100) DEFAULT NULL,
  `work_stage` varchar(100) DEFAULT NULL,
  `work_stage_additional_info` varchar(100) DEFAULT NULL,
  `campaign_name` varchar(100) DEFAULT NULL,
  `campaign_id` varchar(100) DEFAULT NULL,
  `comments` varchar(500) DEFAULT NULL,
  `work_stage_started` timestamp NULL DEFAULT NULL,
  `work_stage_ended` timestamp NULL DEFAULT NULL,
  `work_stage_duration` varchar(1000) DEFAULT NULL,
  `work_time_started` timestamp NULL DEFAULT NULL,
  `scheduled_start_time` timestamp NULL DEFAULT NULL,
  `work_time_ended` timestamp NULL DEFAULT NULL,
  `scheduled_end_time` timestamp NULL DEFAULT NULL,
  `auto_logout` tinyint DEFAULT NULL,
  `edited_by` varchar(255) DEFAULT NULL,
  `time_of_update` timestamp NULL DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

-- DROP TABLE IF EXISTS `dummy_projects`; 






-- INSERT INTO `dummy_users` (moccarz_id,name,last_name,login, password,edited_by,koordynator,project_owner,admin,show_counter,active) VALUES
-- 	 (NULL,'Szymon','Ułanowski','ulanowskisz','$2y$10$KfQMYNrB4DiKaLjxOCajTuKBFNuTWRNix7BkzzFQn10rAIap4yyD2',NULL,0,0,1,0,1),
-- 	 (NULL,'Agent','Testowy','agenttest', '$2y$10$aqtDnnL/uChnghNbrd7L/OABRMo/gn1kEMJumXUPsmJwKI7yPwCAm',NULL,1,1,0,0,1),
-- 	 (NULL,'Koordynator','Testowy','koordynatortest', '$2y$10$0k816yOe72tRvpmFpISLL.HI72W3kmzxLHRQRpJ4LLQXT12LJOgjG',NULL,1,0,0,0,1),
-- 	 (NULL,'Uno','Numero','uno','$2y$10$I0Bk1eN4MvsMi9Dnxt/GNOUFynlq4qNpcLrO3ynS1AP0m8Bvr7q0q',NULL,0,0,0,0,1),
-- 	 (NULL,'Numero','Dos','dos','$2y$10$OaWaLuTiu3yaysQNX7/ROemmL.akQKzXwFdHOrG8sSP1Y6IxA.acK',NULL,0,0,0,0,0),	
-- 	 (NULL,'Gandalf','Biały','gandalf','$2y$10$0Te1bjCrDFohfCoS5E7qHeM3q9jC78bFlfwx4D1mqCdIXlfU/Dtga',NULL,1,0,0,0,1),
-- 	 (NULL,'J.R.R.','Tolkien','tolkien','$2y$10$368mvfus/PpcmlovDCmL5eAK18xY3XwqIHwtLyazCPadaC7i/oZI.',NULL,1,1,0,0,1),
--    (NULL,'Iga','Szwedo','4Iga.Szwedo','$2y$10$QAkgcAZVhvODYrsn7ZXLT.YdSY3gwD9UMY5Q.uHSCT3xJ3E2ZCyVK',NULL,0,0,0,0,1),
--    (NULL,'Magdalena','Drozd','4Magdalena.Drozd','$2y$10$XaZgEhQ3AesWYiD9lo7/LuEAsTjmGUYY8LM9Y/Yo.A3Mcg/ELUpfS',NULL,1,0,0,0,1),
--    (NULL,'Kathrin','Karcz','4Kathrin.Karcz','$2y$10$.ozf1P4SM9KhD90eqasDG.34SbfAoEGGAPcnUh1s5rgYyDkH6oE0e',NULL,0,0,0,0,1),
--    (NULL,'Bartosz','Małek','4malekba','$2y$10$D9rHzd2U39GkcOlJSC0W5OulkhEmIuEd./5y5EgOHyEOaNg1aMc/2',NULL,1,1,0,0,1);
-- DROP TABLE IF EXISTS `dummy_user_project`;

-- dpanel.tk_user_campaign_table definition


	 
-- DROP TABLE IF EXISTS `dummy_coordinator_project`;

-- dpanel.tk_project_owner_table definition


