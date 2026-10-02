-- Rollback for 20261004b_toolkit_leads.sql.
-- Revert app/api/toolkit-capture, toolkit-open and unsubscribe first: the
-- capture route returns 500 when the table is missing.
-- This drops every captured lead. Export the table first if they matter:
--   COPY (SELECT * FROM public.toolkit_leads) TO STDOUT WITH CSV HEADER;

drop table if exists public.toolkit_leads;
