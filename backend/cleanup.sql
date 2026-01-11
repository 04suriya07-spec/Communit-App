DELETE FROM "public"."personas";
DELETE FROM "public"."accountability_profiles";
DELETE FROM "public"."auth_profiles" WHERE "email_encrypted" = 'test@example.com';
