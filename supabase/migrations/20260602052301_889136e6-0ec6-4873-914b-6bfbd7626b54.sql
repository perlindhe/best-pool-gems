SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'refresh-google-ratings-daily'),
  schedule := '0 4 1 * *'
);

SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'refresh-missing-photos-daily'),
  schedule := '15 3 2 * *'
);