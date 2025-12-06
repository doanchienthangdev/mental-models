insert into public.models (title, slug, summary, body, tags, category, read_time, status, audio_status)
values
  (
    'First-Principles Thinking',
    'first-principles-thinking',
    'Break down complex problems into their most basic elements to find innovative solutions.',
    '## Overview

First-principles thinking pushes you to reduce problems to their fundamental truths and reason up from there.',
    array['Problem Solving','Innovation'],
    'Decision Making',
    5,
    'published',
    'ready'
  ),
  (
    'Second-Order Thinking',
    'second-order-thinking',
    'Consider the consequences of your decisions beyond the immediate effects to avoid unintended outcomes.',
    '## Overview

Second-order thinking anticipates the downstream effects of a choice.',
    array['Decision Making'],
    'Strategy',
    7,
    'published',
    'generating'
  ),
  (
    'Circle of Competence',
    'circle-of-competence',
    'Understand the boundaries of your own knowledge and operate within them to make better decisions.',
    '## Overview

Circle of Competence reminds you to stay within the domains where you hold deep knowledge.',
    array['Business','Strategy'],
    'Business',
    4,
    'published',
    'ready'
  )
on conflict (slug) do nothing;

-- Seed categories
insert into public.categories (name, slug, description) values
  ('Decision Making', 'decision-making', 'Frameworks for better choices'),
  ('Strategy', 'strategy', 'Strategic thinking models'),
  ('Business', 'business', 'Business-focused models')
on conflict (slug) do nothing;

-- Seed tags
insert into public.tags (name, slug) values
  ('Problem Solving', 'problem-solving'),
  ('Innovation', 'innovation'),
  ('Decision Making', 'decision-making'),
  ('Strategy', 'strategy'),
  ('Business', 'business')
on conflict (slug) do nothing;

-- Link models to categories/tags (example)
insert into public.model_categories (model_id, category_id)
select m.id, c.id
from public.models m
join public.categories c on c.slug = 'decision-making'
where m.slug in ('first-principles-thinking', 'second-order-thinking')
on conflict do nothing;

insert into public.model_categories (model_id, category_id)
select m.id, c.id
from public.models m
join public.categories c on c.slug = 'business'
where m.slug = 'circle-of-competence'
on conflict do nothing;

insert into public.model_tags (model_id, tag_id)
select m.id, t.id
from public.models m
join public.tags t on t.slug = 'problem-solving'
where m.slug = 'first-principles-thinking'
on conflict do nothing;

insert into public.model_tags (model_id, tag_id)
select m.id, t.id
from public.models m
join public.tags t on t.slug = 'innovation'
where m.slug = 'first-principles-thinking'
on conflict do nothing;

insert into public.model_tags (model_id, tag_id)
select m.id, t.id
from public.models m
join public.tags t on t.slug = 'decision-making'
where m.slug = 'second-order-thinking'
on conflict do nothing;

insert into public.model_tags (model_id, tag_id)
select m.id, t.id
from public.models m
join public.tags t on t.slug = 'business'
where m.slug = 'circle-of-competence'
on conflict do nothing;

insert into public.model_tags (model_id, tag_id)
select m.id, t.id
from public.models m
join public.tags t on t.slug = 'strategy'
where m.slug = 'circle-of-competence'
on conflict do nothing;

-- Seed admin user (hashed password using pbkdf2_sha512$120000$salt$hash)
insert into public.users (email, hashed_password, role, display_name)
values (
  'doanchienthangdev@gmail.com',
  'pbkdf2_sha512$120000$167295037a9f90848fb179d8705283d6$13a255b7b0214340fb67cace7186ba162a9cb585f477bfee91714bb5a54636f2d195bd76d4e7c9cc6de4ec67fa8de4fdf4787bed3a5e2f103db6482977ff265b',
  'admin',
  'Super Admin'
)
on conflict (email) do nothing;
