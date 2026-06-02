-- Rate-limit Google Places usage by stretching cron schedules

-- 1. Ratings: daily -> weekly (Mondays 04:00)
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'refresh-google-ratings-daily'),
  schedule := '0 4 * * 1'
);

-- 2. All photos: weekly -> monthly (1st of month, 03:00)
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'refresh-all-hotel-photos-weekly'),
  schedule := '0 3 1 * *'
);

-- 3. Missing photos: daily -> weekly (Tuesdays 03:15)
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'refresh-missing-photos-daily'),
  schedule := '15 3 * * 2'
);