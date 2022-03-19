\echo 'Delete and recreate ivytutors db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE ivytutors;
CREATE DATABASE ivytutors;
\connect ivytutors

\i ivytutors-schema.sql
\i ivytutors-seed.sql

\echo 'Delete and recreate ivytutors_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE ivytutors_test;
CREATE DATABASE ivytutors_test;
\connect ivytutors_test

\i ivytutors-schema.sql
