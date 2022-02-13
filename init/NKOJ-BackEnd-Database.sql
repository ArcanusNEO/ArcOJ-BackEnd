/*
 Navicat Premium Data Transfer
 
 Source Server         : NKOJ-BackEnd-Database
 Source Server Type    : PostgreSQL
 Source Server Version : 130005
 Source Host           : localhost:5432
 Source Catalog        : NKOJ-BackEnd-Database
 Source Schema         : public
 
 Target Server Type    : PostgreSQL
 Target Server Version : 130005
 File Encoding         : 65001
 
 Date: 13/02/2022 14:51:49
 */
-- ----------------------------
-- Sequence structure for contest_cid_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."contest_cid_seq";
CREATE SEQUENCE "public"."contest_cid_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE "public"."contest_cid_seq" OWNER TO "OJMaster";
-- ----------------------------
-- Sequence structure for course_cid_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."course_cid_seq";
CREATE SEQUENCE "public"."course_cid_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE "public"."course_cid_seq" OWNER TO "OJMaster";
-- ----------------------------
-- Sequence structure for group_gid_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."group_gid_seq";
CREATE SEQUENCE "public"."group_gid_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE "public"."group_gid_seq" OWNER TO "OJMaster";
-- ----------------------------
-- Sequence structure for message_mid_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."message_mid_seq";
CREATE SEQUENCE "public"."message_mid_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE "public"."message_mid_seq" OWNER TO "OJMaster";
-- ----------------------------
-- Sequence structure for problem_pid_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."problem_pid_seq";
CREATE SEQUENCE "public"."problem_pid_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE "public"."problem_pid_seq" OWNER TO "OJMaster";
-- ----------------------------
-- Sequence structure for solution_sid_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."solution_sid_seq";
CREATE SEQUENCE "public"."solution_sid_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE "public"."solution_sid_seq" OWNER TO "OJMaster";
-- ----------------------------
-- Sequence structure for user_uid_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."user_uid_seq";
CREATE SEQUENCE "public"."user_uid_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;
ALTER SEQUENCE "public"."user_uid_seq" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for course
-- ----------------------------
DROP TABLE IF EXISTS "public"."course";
CREATE TABLE "public"."course" (
  "cid" int4 NOT NULL DEFAULT nextval('course_cid_seq'::regclass),
  "title" text COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "owner_id" int4 NOT NULL,
  "visiable" bool NOT NULL DEFAULT false,
  "teacher" text COLLATE "pg_catalog"."default",
  "number" text COLLATE "pg_catalog"."default",
  "semester" text COLLATE "pg_catalog"."default"
);
ALTER TABLE "public"."course" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for course_maintainer
-- ----------------------------
DROP TABLE IF EXISTS "public"."course_maintainer";
CREATE TABLE "public"."course_maintainer" ("cid" int4 NOT NULL, "uid" int4 NOT NULL);
ALTER TABLE "public"."course_maintainer" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for course_user
-- ----------------------------
DROP TABLE IF EXISTS "public"."course_user";
CREATE TABLE "public"."course_user" ("cid" int4 NOT NULL, "uid" int4 NOT NULL);
ALTER TABLE "public"."course_user" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for group
-- ----------------------------
DROP TABLE IF EXISTS "public"."group";
CREATE TABLE "public"."group" (
  "gid" int4 NOT NULL DEFAULT nextval('group_gid_seq'::regclass),
  "title" text COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "perm" varbit [] NOT NULL
);
ALTER TABLE "public"."group" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for message
-- ----------------------------
DROP TABLE IF EXISTS "public"."message";
CREATE TABLE "public"."message" (
  "mid" int4 NOT NULL DEFAULT nextval('message_mid_seq'::regclass),
  "from" int4 NOT NULL,
  "to" int4,
  "title" text COLLATE "pg_catalog"."default",
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "when" timestamptz(6) NOT NULL,
  "from_del" bool NOT NULL DEFAULT false,
  "to_del" bool NOT NULL DEFAULT false,
  "cid" int4,
  "psid" int4
);
ALTER TABLE "public"."message" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for problem
-- ----------------------------
DROP TABLE IF EXISTS "public"."problem";
CREATE TABLE "public"."problem" (
  "pid" int4 NOT NULL DEFAULT nextval('problem_pid_seq'::regclass),
  "psid" int4,
  "title" text COLLATE "pg_catalog"."default" NOT NULL,
  "extra" text COLLATE "pg_catalog"."default",
  "submit_ac" int4 NOT NULL,
  "submit_all" int4 NOT NULL,
  "special_judge" int4 NOT NULL,
  "detail_judge" bool NOT NULL,
  "cases" int4 NOT NULL,
  "time_limit" int4 NOT NULL,
  "memory_limit" int8 NOT NULL,
  "owner_id" int4 NOT NULL
);
ALTER TABLE "public"."problem" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for problem_maintainer
-- ----------------------------
DROP TABLE IF EXISTS "public"."problem_maintainer";
CREATE TABLE "public"."problem_maintainer" ("pid" int4 NOT NULL, "uid" int4 NOT NULL);
ALTER TABLE "public"."problem_maintainer" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for problemset
-- ----------------------------
DROP TABLE IF EXISTS "public"."problemset";
CREATE TABLE "public"."problemset" (
  "psid" int4 NOT NULL DEFAULT nextval('contest_cid_seq'::regclass),
  "title" text COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "type" text COLLATE "pg_catalog"."default" NOT NULL,
  "private" bool NOT NULL,
  "during" tstzrange NOT NULL,
  "secret_time" tstzrange,
  "cid" int4,
  "owner_id" int4 NOT NULL
);
ALTER TABLE "public"."problemset" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for problemset_maintainer
-- ----------------------------
DROP TABLE IF EXISTS "public"."problemset_maintainer";
CREATE TABLE "public"."problemset_maintainer" ("psid" int4 NOT NULL, "uid" int4 NOT NULL);
ALTER TABLE "public"."problemset_maintainer" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for problemset_user
-- ----------------------------
DROP TABLE IF EXISTS "public"."problemset_user";
CREATE TABLE "public"."problemset_user" ("psid" int4 NOT NULL, "uid" int4 NOT NULL);
ALTER TABLE "public"."problemset_user" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for solution
-- ----------------------------
DROP TABLE IF EXISTS "public"."solution";
CREATE TABLE "public"."solution" (
  "sid" int4 NOT NULL DEFAULT nextval('solution_sid_seq'::regclass),
  "uid" int4 NOT NULL,
  "pid" int4 NOT NULL,
  "status_id" int4 NOT NULL,
  "lang_id" int4 NOT NULL,
  "code_size" int4 NOT NULL,
  "share" bool NOT NULL DEFAULT false,
  "run_time" int4 NOT NULL,
  "run_memory" int4 NOT NULL,
  "when" timestamptz(6) NOT NULL,
  "detail" json,
  "compile_info" text COLLATE "pg_catalog"."default",
  "score" int4 NOT NULL
);
ALTER TABLE "public"."solution" OWNER TO "OJMaster";
-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS "public"."user";
CREATE TABLE "public"."user" (
  "uid" int4 NOT NULL DEFAULT nextval('user_uid_seq'::regclass),
  "gid" int4 NOT NULL,
  "nickname" text COLLATE "pg_catalog"."default" NOT NULL,
  "email" text COLLATE "pg_catalog"."default" NOT NULL,
  "password" text COLLATE "pg_catalog"."default" NOT NULL,
  "qq" text COLLATE "pg_catalog"."default",
  "tel" text COLLATE "pg_catalog"."default",
  "realname" text COLLATE "pg_catalog"."default",
  "school" text COLLATE "pg_catalog"."default",
  "words" text COLLATE "pg_catalog"."default",
  "signup_time" timestamptz(6),
  "removed" bool NOT NULL DEFAULT false
);
ALTER TABLE "public"."user" OWNER TO "OJMaster";
-- ----------------------------
-- Function structure for ac_counter
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."ac_counter"();
CREATE OR REPLACE FUNCTION "public"."ac_counter"() RETURNS "pg_catalog"."trigger" AS $BODY$ BEGIN IF NEW.score >= 100
  AND OLD.score < 100 THEN
UPDATE problems
SET "submmit_ac" = "submit_ac" + 1
WHERE pid = NEW.pid;
END IF;
IF NEW.score < 100
AND OLD.score >= 100 THEN
UPDATE problems
SET "submit_ac" = "submit_ac" - 1
WHERE pid = NEW.pid;
END IF;
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql VOLATILE COST 100;
ALTER FUNCTION "public"."ac_counter"() OWNER TO "OJMaster";
-- ----------------------------
-- Function structure for submit_counter
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."submit_counter"();
CREATE OR REPLACE FUNCTION "public"."submit_counter"() RETURNS "pg_catalog"."trigger" AS $BODY$ BEGIN
UPDATE problems
SET "submit_all" = "submit_all" + 1
WHERE pid = NEW.pid;
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql VOLATILE COST 100;
ALTER FUNCTION "public"."submit_counter"() OWNER TO "OJMaster";
-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."contest_cid_seq" OWNED BY "public"."problemset"."psid";
SELECT setval('"public"."contest_cid_seq"', 2, false);
-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."course_cid_seq" OWNED BY "public"."course"."cid";
SELECT setval('"public"."course_cid_seq"', 2, false);
-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."group_gid_seq" OWNED BY "public"."group"."gid";
SELECT setval('"public"."group_gid_seq"', 5, true);
-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."message_mid_seq" OWNED BY "public"."message"."mid";
SELECT setval('"public"."message_mid_seq"', 2, false);
-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."problem_pid_seq" OWNED BY "public"."problem"."pid";
SELECT setval('"public"."problem_pid_seq"', 2, false);
-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."solution_sid_seq" OWNED BY "public"."solution"."sid";
SELECT setval('"public"."solution_sid_seq"', 2, false);
-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."user_uid_seq" OWNED BY "public"."user"."uid";
SELECT setval('"public"."user_uid_seq"', 4, false);
-- ----------------------------
-- Primary Key structure for table course
-- ----------------------------
ALTER TABLE "public"."course"
ADD CONSTRAINT "course_pkey" PRIMARY KEY ("cid");
-- ----------------------------
-- Primary Key structure for table course_maintainer
-- ----------------------------
ALTER TABLE "public"."course_maintainer"
ADD CONSTRAINT "course_maintainer_pkey" PRIMARY KEY ("cid", "uid");
-- ----------------------------
-- Primary Key structure for table course_user
-- ----------------------------
ALTER TABLE "public"."course_user"
ADD CONSTRAINT "course_user_pkey" PRIMARY KEY ("cid", "uid");
-- ----------------------------
-- Primary Key structure for table group
-- ----------------------------
ALTER TABLE "public"."group"
ADD CONSTRAINT "group_pkey" PRIMARY KEY ("gid");
-- ----------------------------
-- Primary Key structure for table message
-- ----------------------------
ALTER TABLE "public"."message"
ADD CONSTRAINT "message_pkey" PRIMARY KEY ("mid");
-- ----------------------------
-- Primary Key structure for table problem
-- ----------------------------
ALTER TABLE "public"."problem"
ADD CONSTRAINT "problem_pkey" PRIMARY KEY ("pid");
-- ----------------------------
-- Primary Key structure for table problem_maintainer
-- ----------------------------
ALTER TABLE "public"."problem_maintainer"
ADD CONSTRAINT "problem_maintainer_pkey" PRIMARY KEY ("pid", "uid");
-- ----------------------------
-- Primary Key structure for table problemset
-- ----------------------------
ALTER TABLE "public"."problemset"
ADD CONSTRAINT "contest_pkey" PRIMARY KEY ("psid");
-- ----------------------------
-- Primary Key structure for table problemset_maintainer
-- ----------------------------
ALTER TABLE "public"."problemset_maintainer"
ADD CONSTRAINT "problemset_maintainer_pkey" PRIMARY KEY ("psid", "uid");
-- ----------------------------
-- Primary Key structure for table problemset_user
-- ----------------------------
ALTER TABLE "public"."problemset_user"
ADD CONSTRAINT "problemset_user_pkey" PRIMARY KEY ("psid", "uid");
-- ----------------------------
-- Triggers structure for table solution
-- ----------------------------
CREATE TRIGGER "ac_counter_trigger"
AFTER
UPDATE ON "public"."solution" FOR EACH ROW EXECUTE PROCEDURE "public"."ac_counter"();
CREATE TRIGGER "submit_counter_trigger"
AFTER
INSERT ON "public"."solution" FOR EACH ROW EXECUTE PROCEDURE "public"."submit_counter"();
-- ----------------------------
-- Primary Key structure for table solution
-- ----------------------------
ALTER TABLE "public"."solution"
ADD CONSTRAINT "solution_pkey" PRIMARY KEY ("sid");
-- ----------------------------
-- Indexes structure for table user
-- ----------------------------
CREATE INDEX "user_email_idx" ON "public"."user" USING hash (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops"
);
-- ----------------------------
-- Uniques structure for table user
-- ----------------------------
ALTER TABLE "public"."user"
ADD CONSTRAINT "user_nickname_key" UNIQUE ("nickname");
ALTER TABLE "public"."user"
ADD CONSTRAINT "user_email_key" UNIQUE ("email");
-- ----------------------------
-- Primary Key structure for table user
-- ----------------------------
ALTER TABLE "public"."user"
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("uid");
-- ----------------------------
-- Foreign Keys structure for table course
-- ----------------------------
ALTER TABLE "public"."course"
ADD CONSTRAINT "course_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."user" ("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
-- Foreign Keys structure for table course_maintainer
-- ----------------------------
ALTER TABLE "public"."course_maintainer"
ADD CONSTRAINT "course——maintainer_cid_fkey" FOREIGN KEY ("cid") REFERENCES "public"."course" ("cid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."course_maintainer"
ADD CONSTRAINT "course——maintainer_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."user" ("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
-- Foreign Keys structure for table course_user
-- ----------------------------
ALTER TABLE "public"."course_user"
ADD CONSTRAINT "course_user_cid_fkey" FOREIGN KEY ("cid") REFERENCES "public"."course" ("cid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."course_user"
ADD CONSTRAINT "course_user_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."user" ("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
-- Foreign Keys structure for table message
-- ----------------------------
ALTER TABLE "public"."message"
ADD CONSTRAINT "message_cid_fkey" FOREIGN KEY ("cid") REFERENCES "public"."course" ("cid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."message"
ADD CONSTRAINT "message_from_fkey" FOREIGN KEY ("from") REFERENCES "public"."user" ("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."message"
ADD CONSTRAINT "message_psid_fkey" FOREIGN KEY ("psid") REFERENCES "public"."problemset" ("psid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."message"
ADD CONSTRAINT "message_to_fkey" FOREIGN KEY ("to") REFERENCES "public"."user" ("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
-- Foreign Keys structure for table problem
-- ----------------------------
ALTER TABLE "public"."problem"
ADD CONSTRAINT "problem_cid_fkey" FOREIGN KEY ("psid") REFERENCES "public"."problemset" ("psid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."problem"
ADD CONSTRAINT "problem_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."user" ("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
-- Foreign Keys structure for table problem_maintainer
-- ----------------------------
ALTER TABLE "public"."problem_maintainer"
ADD CONSTRAINT "problem_maintainer_pid_fkey" FOREIGN KEY ("pid") REFERENCES "public"."problem" ("pid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."problem_maintainer"
ADD CONSTRAINT "problem_maintainer_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."user" ("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
-- Foreign Keys structure for table problemset
-- ----------------------------
ALTER TABLE "public"."problemset"
ADD CONSTRAINT "problemset_cid_fkey" FOREIGN KEY ("cid") REFERENCES "public"."course" ("cid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."problemset"
ADD CONSTRAINT "problemset_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."user" ("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
-- Foreign Keys structure for table problemset_maintainer
-- ----------------------------
ALTER TABLE "public"."problemset_maintainer"
ADD CONSTRAINT "problemset_maintainer_psid_fkey" FOREIGN KEY ("psid") REFERENCES "public"."problemset" ("psid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."problemset_maintainer"
ADD CONSTRAINT "problemset_maintainer_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."user" ("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
-- Foreign Keys structure for table problemset_user
-- ----------------------------
ALTER TABLE "public"."problemset_user"
ADD CONSTRAINT "contest_user_cid_fkey" FOREIGN KEY ("psid") REFERENCES "public"."problemset" ("psid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."problemset_user"
ADD CONSTRAINT "contest_user_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."user" ("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
-- Foreign Keys structure for table solution
-- ----------------------------
ALTER TABLE "public"."solution"
ADD CONSTRAINT "solution_pid_fkey" FOREIGN KEY ("pid") REFERENCES "public"."problem" ("pid") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."solution"
ADD CONSTRAINT "solution_uid_fkey" FOREIGN KEY ("uid") REFERENCES "public"."user" ("uid") ON DELETE NO ACTION ON UPDATE NO ACTION;
-- ----------------------------
-- Foreign Keys structure for table user
-- ----------------------------
ALTER TABLE "public"."user"
ADD CONSTRAINT "user_gid_fkey" FOREIGN KEY ("gid") REFERENCES "public"."group" ("gid") ON DELETE NO ACTION ON UPDATE NO ACTION;