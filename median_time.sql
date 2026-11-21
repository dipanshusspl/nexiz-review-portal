-- Median time (minutes) to complete a person's FIRST expert review, from the timings saved on submit.
select round((percentile_cont(0.5) within group (order by ms) / 60000.0)::numeric, 1) as median_minutes, count(*) as people
from (
  select distinct on (user_id) user_id, total_ms as ms
  from rv_form_timing
  where form = 'expert'
  order by user_id, created_at
) first_reviews;
