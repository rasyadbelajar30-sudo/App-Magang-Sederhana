-- ===== supabase/schema.sql =====
create extension if not exists pgcrypto;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text default '',
  avatar_color text default '#4F46E5',
  education_level text not null default 'Mahasiswa' check (education_level in ('SMK','Mahasiswa')),
  institution_name text default '', major text default '', grade_or_semester text default '',
  gpa_or_score numeric(5,2) default 0,
  city text default '', bio text default '',
  skills text[] not null default '{}',
  portfolio_url text default '',
  readiness_score int not null default 0 check (readiness_score between 0 and 100),
  xp_points int not null default 0,
  xp_events text[] not null default '{}',
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table public.user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  doc_type text not null check (doc_type in ('CV','SURAT_PENGANTAR','TRANSKRIP','PORTOFOLIO','KARTU_PELAJAR_KTM','BPJS')),
  doc_name text not null,
  source text not null check (source in ('generated','upload','link')),
  content_html text,          -- diisi jika source='generated'
  storage_path text,          -- diisi jika source='upload'  (format: {user_id}/{doc_type}-{timestamp}.{ext})
  external_url text,          -- diisi jika source='link'
  mime_type text,
  is_verified boolean not null default true,
  updated_at timestamptz default now(),
  unique (user_id, doc_type)
);

create table public.internships (
  id text primary key,        -- 'in_01'..'in_10'
  company_name text not null, company_logo text, company_theme_color text,
  company_industry text, company_address text, role_title text not null,
  education_target text not null check (education_target in ('SMK','Mahasiswa','Semua')),
  work_type text not null check (work_type in ('WFO','WFH','Hybrid')),
  city text, duration_months int not null,
  is_paid boolean not null, stipend_amount int not null default 0,
  quota int not null check (quota >= 0),
  required_skills text[] not null, required_docs text[] not null,
  description text, responsibilities text[] not null default '{}',
  mentor_name text, mentor_role text, case_study_question text not null,
  start_date date not null,
  created_at timestamptz default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  internship_id text not null references public.internships(id),
  status text not null default 'SUBMITTED' check (status in
    ('SUBMITTED','DOC_REVIEW','INTERVIEW_SCHEDULED','TEST_SUBMITTED','OFFERING_SENT','ACCEPTED_ONBOARDING','REJECTED')),
  match_score int not null,
  cover_letter text not null, available_start_date date not null,
  interview_date date, interview_time text,
  interview_method text check (interview_method in ('Zoom','Google Meet','Offline')),
  test_answer text, offering_letter_no text unique,
  signature_name text, signed_by_user_at timestamptz,
  reject_reason text,
  history jsonb not null default '[]',   -- [{status, at}]
  created_at timestamptz default now(), updated_at timestamptz default now()
);
-- 1 lamaran aktif per lowongan per user
create unique index uq_active_application on public.applications(user_id, internship_id) where status <> 'REJECTED';
-- maksimal 1 magang aktif per user
create unique index uq_one_accepted on public.applications(user_id) where status = 'ACCEPTED_ONBOARDING';

create table public.prep_questions (
  id text primary key,        -- 'pq_01'..'pq_12'
  category text not null check (category in ('HR','Teknis','Etika Magang')),
  question text not null, ideal_answer_guide text not null, tips text not null
);

create table public.user_prep_practice (
  user_id uuid references public.users(id) on delete cascade,
  question_id text references public.prep_questions(id) on delete cascade,
  user_answer text not null,
  practiced_at timestamptz default now(),
  primary key (user_id, question_id)
);

create table public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  task_title text not null,
  category text not null check (category in ('Administrasi','Perangkat','Pengenalan')),
  xp_reward int not null, is_completed boolean not null default false, order_no int not null
);

create table public.daily_logbooks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  date date not null,
  mood text not null check (mood in ('🔥 Semangat','😊 Lancar','🤔 Menantang')),
  activity_summary text not null check (char_length(activity_summary) >= 20),
  obstacle text default '',
  mentor_status text not null default 'Reviewed' check (mentor_status in ('Reviewed','Approved')),
  created_at timestamptz default now(),
  unique (application_id, date)
);

-- ===== Atomic quota (dipanggil server via supabaseAdmin.rpc) =====
create or replace function public.take_quota(p_internship_id text) returns boolean
language plpgsql security definer as $$
begin
  update public.internships set quota = quota - 1 where id = p_internship_id and quota > 0;
  return found;
end $$;

create or replace function public.return_quota(p_internship_id text) returns void
language plpgsql security definer as $$
begin
  update public.internships set quota = quota + 1 where id = p_internship_id;
end $$;

-- ===== RLS: semua tabel aktif; tulis hanya via service role (server) =====
alter table public.users enable row level security;
alter table public.user_documents enable row level security;
alter table public.internships enable row level security;
alter table public.applications enable row level security;
alter table public.prep_questions enable row level security;
alter table public.user_prep_practice enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.daily_logbooks enable row level security;
create policy "public read internships" on public.internships for select using (true);
create policy "public read prep" on public.prep_questions for select using (true);

-- ===== Storage bucket privat =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents','documents', false, 2097152, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;
