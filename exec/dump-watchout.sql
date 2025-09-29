--
-- PostgreSQL database dump
--

\restrict fPSJgIHolQFwqs3NH7DTFfLQYqV90sGLvqJ2wgGY6uwQKSGVxrCI8wfR9gTtPga

-- Dumped from database version 16.10
-- Dumped by pg_dump version 18.0

-- Started on 2025-09-29 10:44:55

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 874 (class 1247 OID 16844)
-- Name: accident_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.accident_type AS ENUM (
    'FALL_DOWN',
    'SOS'
);


--
-- TOC entry 901 (class 1247 OID 16882)
-- Name: blood_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.blood_type AS ENUM (
    'A',
    'B',
    'O',
    'AB'
);


--
-- TOC entry 877 (class 1247 OID 16850)
-- Name: cctv_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.cctv_type AS ENUM (
    'ACCESS',
    'CCTV'
);


--
-- TOC entry 880 (class 1247 OID 16856)
-- Name: entry_exit_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.entry_exit_type AS ENUM (
    'ENTRY',
    'EXIT'
);


--
-- TOC entry 898 (class 1247 OID 16876)
-- Name: gender_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gender_type AS ENUM (
    'MALE',
    'FEMALE'
);


--
-- TOC entry 883 (class 1247 OID 16862)
-- Name: notification_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type AS ENUM (
    'SOS',
    'VIOLATION'
);


--
-- TOC entry 904 (class 1247 OID 16892)
-- Name: rh_factor_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.rh_factor_type AS ENUM (
    'PLUS',
    'MINUS'
);


--
-- TOC entry 871 (class 1247 OID 16838)
-- Name: safety_violation_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.safety_violation_type AS ENUM (
    'HELMET',
    'VEST'
);


--
-- TOC entry 907 (class 1247 OID 16898)
-- Name: training_status_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.training_status_type AS ENUM (
    'COMPLETED',
    'EXPIRED',
    'NOT_COMPLETED'
);


--
-- TOC entry 910 (class 1247 OID 16906)
-- Name: user_role_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role_type AS ENUM (
    'ADMIN',
    'AREA_ADMIN',
    'WORKER'
);


--
-- TOC entry 895 (class 1247 OID 16868)
-- Name: watch_status_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.watch_status_type AS ENUM (
    'AVAILABLE',
    'IN_USE',
    'UNAVAILABLE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 18172)
-- Name: accident; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accident (
    uuid uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    type character varying(255) NOT NULL,
    area_uuid uuid NOT NULL,
    user_uuid uuid NOT NULL,
    CONSTRAINT accident_type_check CHECK (((type)::text = ANY ((ARRAY['AUTO_SOS'::character varying, 'MANUAL_SOS'::character varying])::text[])))
);


--
-- TOC entry 231 (class 1259 OID 18430)
-- Name: announcement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcement (
    uuid uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    content text,
    title character varying(200),
    receiver_uuid uuid NOT NULL,
    sender_uuid uuid NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 18178)
-- Name: area; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.area (
    uuid uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    area_alias character varying(50),
    area_name character varying(50) NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 18183)
-- Name: area_manager; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.area_manager (
    uuid uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    area_uuid uuid NOT NULL,
    user_uuid uuid NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 16930)
-- Name: cctv; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cctv (
    uuid uuid NOT NULL,
    cctv_name character varying(50) NOT NULL,
    is_online boolean DEFAULT false NOT NULL,
    cctv_url character varying(100) NOT NULL,
    type character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    area_uuid uuid,
    CONSTRAINT cctv_type_chk CHECK (((type)::text = ANY ((ARRAY['ACCESS'::character varying, 'CCTV'::character varying, 'TRAINING'::character varying])::text[]))),
    CONSTRAINT chk_cctv_type CHECK (((type)::text = ANY (ARRAY[('ACCESS'::character varying)::text, ('CCTV'::character varying)::text])))
);


--
-- TOC entry 227 (class 1259 OID 18188)
-- Name: company; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company (
    uuid uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    company_name character varying(50) NOT NULL
);


--
-- TOC entry 216 (class 1259 OID 16945)
-- Name: entry_exit_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entry_exit_history (
    uuid uuid NOT NULL,
    type character varying(255) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    area_uuid uuid NOT NULL,
    user_uuid uuid NOT NULL,
    CONSTRAINT chk_entry_exit_history_type CHECK (((type)::text = ANY (ARRAY[('ENTRY'::character varying)::text, ('EXIT'::character varying)::text])))
);


--
-- TOC entry 223 (class 1259 OID 16968)
-- Name: face_embedding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.face_embedding (
    uuid uuid NOT NULL,
    embedding_vector bytea NOT NULL,
    photo_key character varying(100) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_uuid uuid NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 16957)
-- Name: fcm_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fcm_tokens (
    uuid uuid NOT NULL,
    fcm_token character varying(255),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_uuid uuid NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16960)
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    uuid uuid NOT NULL,
    type character varying(16) NOT NULL,
    related_uuid uuid NOT NULL,
    content text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_uuid uuid NOT NULL,
    CONSTRAINT chk_notification_type CHECK (((type)::text = ANY ((ARRAY['SOS'::character varying, 'VIOLATION'::character varying])::text[])))
);


--
-- TOC entry 219 (class 1259 OID 16954)
-- Name: rental_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rental_history (
    uuid uuid NOT NULL,
    created_at timestamp without time zone NOT NULL,
    returned_at timestamp without time zone,
    updated_at timestamp without time zone NOT NULL,
    watch_uuid uuid NOT NULL,
    user_uuid uuid NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 16965)
-- Name: report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report (
    uuid uuid NOT NULL,
    file_path character varying(255),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    deleted_at timestamp without time zone
);


--
-- TOC entry 229 (class 1259 OID 18401)
-- Name: safety_violation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.safety_violation (
    uuid uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    image_key text,
    area_uuid uuid NOT NULL,
    cctv_uuid uuid NOT NULL
);


--
-- TOC entry 230 (class 1259 OID 18408)
-- Name: safety_violation_detail; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.safety_violation_detail (
    uuid uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    violation_type character varying(255) NOT NULL,
    safety_violation_uuid uuid NOT NULL,
    CONSTRAINT safety_violation_detail_violation_type_check CHECK (((violation_type)::text = ANY ((ARRAY['BELT_ON'::character varying, 'BELT_OFF'::character varying, 'HOOK_ON'::character varying, 'HOOK_OFF'::character varying, 'SHOES_ON'::character varying, 'SHOES_OFF'::character varying, 'HELMET_ON'::character varying, 'HELMET_OFF'::character varying])::text[])))
);


--
-- TOC entry 228 (class 1259 OID 18193)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    uuid uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    deleted_at timestamp(6) without time zone,
    assigned_at timestamp(6) without time zone,
    assignment_date integer,
    avg_embedding bytea,
    blood_type character varying(255) NOT NULL,
    contact character varying(11) NOT NULL,
    emergency_contact character varying(11) NOT NULL,
    gender character varying(255),
    is_approved boolean DEFAULT false NOT NULL,
    password character varying(100) NOT NULL,
    photo_key character varying(100),
    rh_factor character varying(255) NOT NULL,
    user_role character varying(255) NOT NULL,
    training_completed_at timestamp(6) without time zone,
    training_status character varying(255) NOT NULL,
    user_id character varying(7) NOT NULL,
    user_name character varying(20) NOT NULL,
    area_uuid uuid,
    company_uuid uuid NOT NULL,
    CONSTRAINT users_blood_type_check CHECK (((blood_type)::text = ANY ((ARRAY['A'::character varying, 'B'::character varying, 'O'::character varying, 'AB'::character varying])::text[]))),
    CONSTRAINT users_gender_check CHECK (((gender)::text = ANY ((ARRAY['MALE'::character varying, 'FEMALE'::character varying])::text[]))),
    CONSTRAINT users_rh_factor_check CHECK (((rh_factor)::text = ANY ((ARRAY['PLUS'::character varying, 'MINUS'::character varying])::text[]))),
    CONSTRAINT users_training_status_check CHECK (((training_status)::text = ANY ((ARRAY['COMPLETED'::character varying, 'EXPIRED'::character varying, 'NOT_COMPLETED'::character varying])::text[]))),
    CONSTRAINT users_user_role_check CHECK (((user_role)::text = ANY ((ARRAY['ADMIN'::character varying, 'AREA_ADMIN'::character varying, 'WORKER'::character varying])::text[])))
);


--
-- TOC entry 218 (class 1259 OID 16949)
-- Name: watch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.watch (
    uuid uuid NOT NULL,
    watch_id integer NOT NULL,
    model_name character varying(50),
    status character varying(255) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    note character varying(50),
    CONSTRAINT chk_watch_status CHECK (((status)::text = ANY (ARRAY[('AVAILABLE'::character varying)::text, ('IN_USE'::character varying)::text, ('UNAVAILABLE'::character varying)::text])))
);


--
-- TOC entry 217 (class 1259 OID 16948)
-- Name: watch_watch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.watch_watch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3590 (class 0 OID 0)
-- Dependencies: 217
-- Name: watch_watch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.watch_watch_id_seq OWNED BY public.watch.watch_id;


--
-- TOC entry 3358 (class 2604 OID 16952)
-- Name: watch watch_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch ALTER COLUMN watch_id SET DEFAULT nextval('public.watch_watch_id_seq'::regclass);


--
-- TOC entry 3577 (class 0 OID 18172)
-- Dependencies: 224
-- Data for Name: accident; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accident (uuid, created_at, updated_at, type, area_uuid, user_uuid) FROM stdin;
c5f413d5-6714-4618-971c-49c40921b50a	2025-09-29 01:04:08.471137	2025-09-29 01:04:08.471137	AUTO_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
d7966ca7-1033-46fa-b15b-e870d6ab9a5a	2025-09-29 01:04:50.820485	2025-09-29 01:04:50.820485	AUTO_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
5a3d6d98-8295-4e96-a34a-128fb4050af6	2025-09-29 01:07:29.249427	2025-09-29 01:07:29.249427	AUTO_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
770a54a8-aa6d-46b4-b9ea-0483c3b7e51c	2025-09-29 01:08:31.118128	2025-09-29 01:08:31.118128	AUTO_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
5fee6a08-ce5c-4ac6-996e-9f324bbfbb9c	2025-09-26 01:31:37.122545	2025-09-26 01:31:37.122545	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
1b75bf1e-8cd7-43d0-965a-e7d1f9e295bd	2025-09-26 01:31:55.611192	2025-09-26 01:31:55.611192	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
a4a85dbb-9ce5-4c66-b2c8-d841212920b1	2025-09-26 01:32:01.320002	2025-09-26 01:32:01.320002	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
9549da2d-92a3-4331-a460-60bbd9933cac	2025-09-26 13:57:46.984546	2025-09-26 13:57:46.984546	AUTO_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
eeca5bf4-f1d2-49e1-8ee4-2ef7c8540044	2025-09-28 05:49:31.008811	2025-09-28 05:49:31.008811	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	2286c205-04a2-4e4c-b19f-7b40d7dbe277
c20b3c1c-e57c-43e9-a9d4-c9e00011d976	2025-09-26 01:31:37.227043	2025-09-26 01:31:37.227043	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
2c2c695f-0462-442b-8bd9-cb6728dfaacd	2025-09-26 01:31:55.778765	2025-09-26 01:31:55.778765	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
f1662699-9ebf-4b85-9a56-5f169ead629b	2025-09-26 01:32:01.483184	2025-09-26 01:32:01.483184	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
efd4a19e-8e78-47ab-a7ce-75702e1563a5	2025-09-26 01:50:40.916453	2025-09-26 01:50:40.916453	MANUAL_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
f0f8f66b-1ec1-41f4-ab38-234de32fa56d	2025-09-26 13:58:03.647388	2025-09-26 13:58:03.647388	AUTO_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
90b6cb07-6611-4bc4-bc06-5a5e36c61520	2025-09-28 05:51:32.77841	2025-09-28 05:51:32.77841	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	2286c205-04a2-4e4c-b19f-7b40d7dbe277
3d1dee46-c32c-42ca-aad2-b13c4855ec87	2025-09-28 05:52:17.174568	2025-09-28 05:52:17.174568	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	2286c205-04a2-4e4c-b19f-7b40d7dbe277
ef87e940-f019-4385-b4ef-62307b6256f7	2025-09-26 01:31:37.373812	2025-09-26 01:31:37.373812	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
ab6e4f62-24d8-4966-bccc-bf4e9c35ad5c	2025-09-26 01:31:37.463466	2025-09-26 01:31:37.463466	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
d0423d15-1a2d-447b-bfd2-a02492dcd2ef	2025-09-26 01:31:55.31703	2025-09-26 01:31:55.31703	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
e9172d71-de19-4996-8fc7-f0eaaecf8f2a	2025-09-26 01:31:55.884407	2025-09-26 01:31:55.884407	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
71b78911-f38d-44e3-b7f8-631c5724d38a	2025-09-26 01:31:55.989449	2025-09-26 01:31:55.989449	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
3ee3c7d8-931d-4a77-affb-68fdeffa536e	2025-09-26 01:32:00.893063	2025-09-26 01:32:00.893063	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
fb018a9b-b499-47ed-8e6d-12dabc171c70	2025-09-26 01:32:01.696823	2025-09-26 01:32:01.696823	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
ef6d3849-6d65-40db-ba50-25960f97161e	2025-09-26 01:32:01.848141	2025-09-26 01:32:01.848141	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
027f2e52-cc89-4a48-8893-80256d23295e	2025-09-26 01:32:10.117861	2025-09-26 01:32:10.117861	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
da8fca1b-9f48-4e33-95e5-1f8fa2bc7752	2025-09-28 05:03:11.209784	2025-09-28 05:03:11.209784	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	2286c205-04a2-4e4c-b19f-7b40d7dbe277
bba0f02c-64ef-4aab-be41-f7a111beeea3	2025-09-28 05:52:22.660081	2025-09-28 05:52:22.660081	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	2286c205-04a2-4e4c-b19f-7b40d7dbe277
66b9cedb-d4e5-47d6-88d3-8060fe05579f	2025-09-26 01:31:37.667457	2025-09-26 01:31:37.667457	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
cc7325e7-2daa-40d5-89b6-03d7e292895c	2025-09-26 01:31:55.041635	2025-09-26 01:31:55.041635	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
56aa4352-1beb-45e4-b604-12bb81470eee	2025-09-26 01:31:56.080388	2025-09-26 01:31:56.080388	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
f57d0e80-8675-4c5e-9e2d-e0a19076389b	2025-09-26 01:32:00.665118	2025-09-26 01:32:00.665118	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
34b4481f-aea8-4ba4-8b5e-e8a48f97729b	2025-09-26 01:32:01.995517	2025-09-26 01:32:01.995517	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
58eb6dd9-380e-4bff-aa3c-d2721f8786fc	2025-09-26 01:32:10.006274	2025-09-26 01:32:10.006274	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
a847be97-17f3-4f1c-9c19-f24b0914b3f0	2025-09-26 02:11:55.104316	2025-09-26 02:11:55.104316	AUTO_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
7e52bf18-7268-4484-8ee8-39296ac00772	2025-09-28 05:05:02.503966	2025-09-28 05:05:02.503966	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	2286c205-04a2-4e4c-b19f-7b40d7dbe277
e3e9eca6-f835-4cad-9fbb-8ad92bdb329b	2025-09-28 07:52:01.023599	2025-09-28 07:52:01.023599	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	2286c205-04a2-4e4c-b19f-7b40d7dbe277
d52819a1-f9e8-4e1e-955d-212d766d2fd4	2025-09-26 01:31:37.769075	2025-09-26 01:31:37.769075	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
63418710-5b99-4045-95a8-22857010efdb	2025-09-26 01:31:56.206659	2025-09-26 01:31:56.206659	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
79cb8eb9-cbd9-4368-8ced-06232c37da49	2025-09-26 01:33:45.222532	2025-09-26 01:33:45.222532	MANUAL_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
369f06d7-19b9-4de8-bd59-7b3136196bfd	2025-09-26 21:50:15.037129	2025-09-26 21:50:15.037129	AUTO_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
c3af592e-aeeb-4762-ae9f-1e7a1a342344	2025-09-26 21:50:34.957325	2025-09-26 21:50:34.957325	AUTO_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
e9e54cf4-dd32-4538-9182-edfdc8b36686	2025-09-26 21:50:53.77521	2025-09-26 21:50:53.77521	AUTO_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
320e6a6b-36c6-49b7-965b-38873c67e991	2025-09-28 05:10:50.096322	2025-09-28 05:10:50.096322	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	d48c08ac-a56f-4f1d-97ab-ff66a8751291
3c8b9236-98ba-44c5-b850-4380190338dd	2025-09-28 05:12:35.065898	2025-09-28 05:12:35.065898	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	d48c08ac-a56f-4f1d-97ab-ff66a8751291
d5165555-6839-4db6-bf66-dcdc85a759b7	2025-09-28 07:57:34.33254	2025-09-28 07:57:34.33254	MANUAL_SOS	550e8400-e29b-41d4-a716-446655440102	2286c205-04a2-4e4c-b19f-7b40d7dbe277
f5682808-c906-4cbb-9cc6-bac3511f219e	2025-09-26 01:31:37.877385	2025-09-26 01:31:37.877385	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
f670dbd1-db8c-4ba0-8a44-765a886e6162	2025-09-26 01:32:00.549903	2025-09-26 01:32:00.549903	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
44ea28bf-1694-4636-be79-09bad9287f1e	2025-09-26 01:34:15.245436	2025-09-26 01:34:15.245436	MANUAL_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
fce8c533-30ee-4f20-baa5-b804c4af775b	2025-09-26 13:36:35.62986	2025-09-26 13:36:35.62986	MANUAL_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
4a8a7bf4-48c5-4540-881d-c93acefe0a92	2025-09-28 05:13:23.964397	2025-09-28 05:13:23.964397	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	d48c08ac-a56f-4f1d-97ab-ff66a8751291
5661ece1-3c8e-4645-b25f-e4fc40c0b334	2025-09-28 07:59:08.029769	2025-09-28 07:59:08.029769	MANUAL_SOS	550e8400-e29b-41d4-a716-446655440102	2286c205-04a2-4e4c-b19f-7b40d7dbe277
2cc81364-e0a1-4730-9bd4-a57674c1d1da	2025-09-29 07:59:33.619	2025-09-28 07:59:33.619552	MANUAL_SOS	550e8400-e29b-41d4-a716-446655440102	2286c205-04a2-4e4c-b19f-7b40d7dbe277
d1ff4153-4efc-4975-b713-3f544085703b	2025-09-26 01:31:36.974526	2025-09-26 01:31:36.974526	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
01e95053-24a5-4bd5-863c-83e5ab6ecf60	2025-09-26 01:31:55.446194	2025-09-26 01:31:55.446194	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
7fe2caff-f28f-40ba-9e94-df49d0ae9714	2025-09-26 01:32:00.991514	2025-09-26 01:32:00.991514	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
96cdf131-e40d-4b4d-a75c-84d1a1f3c62d	2025-09-26 01:32:10.303514	2025-09-26 01:32:10.303514	MANUAL_SOS	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6df61ff2-e7de-449d-af9c-a9938f01daed
15e8dbfe-d010-437f-8b62-aa8e1d021dca	2025-09-26 13:57:13.413463	2025-09-26 13:57:13.413463	MANUAL_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
5518e35c-de9a-4c11-af55-53075fe127a2	2025-09-26 13:57:32.930312	2025-09-26 13:57:32.930312	MANUAL_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
11d8354a-0cb3-43b6-b2ee-a38cd4892fa3	2025-09-28 05:14:31.623091	2025-09-28 05:14:31.623091	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	d48c08ac-a56f-4f1d-97ab-ff66a8751291
5a70e3b7-4b24-4cb0-8abe-0d014e4d7655	2025-09-28 05:15:26.755481	2025-09-28 05:15:26.755481	AUTO_SOS	550e8400-e29b-41d4-a716-446655440102	d48c08ac-a56f-4f1d-97ab-ff66a8751291
11540a91-e457-49e7-84dd-b6ecb8daa5a3	2025-09-29 07:45:04.022	2025-09-28 23:45:04.022789	MANUAL_SOS	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
\.


--
-- TOC entry 3584 (class 0 OID 18430)
-- Dependencies: 231
-- Data for Name: announcement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcement (uuid, created_at, updated_at, content, title, receiver_uuid, sender_uuid) FROM stdin;
591281d6-0f13-4a0c-9bb8-3f1025027e1e	2025-09-16 23:24:37.622312	2025-09-16 23:24:37.622312	안녕하세요 몇시까지 모이시길 바랍니다~~!!	테스트 알림입니다!	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
ec6bd8e5-fa21-4634-af92-3f28fa155f68	2025-09-16 23:24:37.646759	2025-09-16 23:24:37.646759	안녕하세요 몇시까지 모이시길 바랍니다~~!!	테스트 알림입니다!	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
5a7aabfa-2e8e-447a-bd17-af77215ca3d0	2025-09-16 23:38:50.3918	2025-09-16 23:38:50.3918	안녕하세요	색깔테스트	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
b416efc5-4ff7-412f-bd1a-38340e34df9b	2025-09-16 23:38:50.416481	2025-09-16 23:38:50.416481	안녕하세요	색깔테스트	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
014a61fe-419d-48a2-9c0a-247ec815d689	2025-09-16 23:46:50.197523	2025-09-16 23:46:50.197523	초록색 공지사항 테스트입니다.	초록색 공지사항 테스트입니다	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
209ccb4c-a04f-4765-b847-7d3b2f1d331d	2025-09-16 23:46:50.23457	2025-09-16 23:46:50.23457	초록색 공지사항 테스트입니다.	초록색 공지사항 테스트입니다	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
fde35a0c-f9d3-406e-afbe-59f0b4508316	2025-09-16 23:48:04.748125	2025-09-16 23:48:04.748125	초록색 알림 테스트	초록색 알림 테스트	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
585110e5-a7bd-4f91-93e7-5dd8d4f63862	2025-09-16 23:48:04.769082	2025-09-16 23:48:04.769082	초록색 알림 테스트	초록색 알림 테스트	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
91a2b3a3-0699-480b-a0d8-bb00d15cdfd0	2025-09-16 23:49:08.196401	2025-09-16 23:49:08.196401	초록색 알림	초록색 알림	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
ee7e4671-464e-44b4-aef6-c84f3edb4351	2025-09-16 23:49:08.225989	2025-09-16 23:49:08.225989	초록색 알림	초록색 알림	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
7857fd48-d30f-48dc-9344-da4843d64d41	2025-09-16 23:54:01.193685	2025-09-16 23:54:01.193685	테스트입니다.	테스트입니다	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
b67cbde6-5978-42d6-8f41-b66526e08da9	2025-09-16 23:54:01.221888	2025-09-16 23:54:01.221888	테스트입니다.	테스트입니다	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
d4b693c9-710e-4dc9-9675-acf89dca6be7	2025-09-17 05:45:16.026684	2025-09-17 05:45:16.026684	공지사항입니다.	공지사항	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
1c97cb3f-fa26-47cb-9c8e-82ef69779fc4	2025-09-17 05:45:16.027949	2025-09-17 05:45:16.027949	공지사항입니다.	공지사항	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
ebbb868d-ea40-4bc7-957c-fecaac96cf76	2025-09-17 05:48:31.927645	2025-09-17 05:48:31.927645	테스트 전송입니다.	공지사항입니다	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
54c2fcda-080b-447b-a92e-23628fd48529	2025-09-17 05:48:31.9288	2025-09-17 05:48:31.9288	테스트 전송입니다.	공지사항입니다	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
f6661542-fa36-420b-9e48-43c8a3538764	2025-09-17 05:55:41.393592	2025-09-17 05:55:41.393592	몇시까지 오십쇼	첫번째 공지사항입니다.	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
cce41d47-e01f-4070-8a54-c0d12e1fcc78	2025-09-17 05:55:41.394883	2025-09-17 05:55:41.394883	몇시까지 오십쇼	첫번째 공지사항입니다.	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
7107b570-0bfe-4347-a145-714ee3f79a16	2025-09-17 05:55:56.667235	2025-09-17 05:55:56.667235	몇시까지 오십쇼	두번째 공지사항입니다.	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
4d55bec8-f00a-47a6-a982-3864576cb1f4	2025-09-17 05:55:56.668428	2025-09-17 05:55:56.668428	몇시까지 오십쇼	두번째 공지사항입니다.	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
76301fb3-57b7-4ce5-897e-ac001eaab783	2025-09-17 05:56:06.82396	2025-09-17 05:56:06.82396	몇시까지 오십쇼	세번째 공지사항입니다.	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
0eeb6522-a3e1-4bba-b90f-3bf67de47de8	2025-09-17 05:56:06.825339	2025-09-17 05:56:06.825339	몇시까지 오십쇼	세번째 공지사항입니다.	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
4348db06-651c-4aae-b27a-e8316f1ed20b	2025-09-17 05:56:23.825019	2025-09-17 05:56:23.825019	몇시까지 오십쇼	네번째 공지사항입니다.	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
c573cea8-e673-47aa-8449-86aa255da639	2025-09-17 05:56:23.826109	2025-09-17 05:56:23.826109	몇시까지 오십쇼	네번째 공지사항입니다.	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
7847eb3a-46dd-4c10-bf11-0845d9d6228c	2025-09-18 00:17:44.831255	2025-09-18 00:17:44.831255	테스트입니다.	테스트	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
1f85d31f-7483-483e-b5de-30317968150d	2025-09-18 00:17:44.835577	2025-09-18 00:17:44.835577	테스트입니다.	테스트	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
40388f9d-f6d2-418e-8a7a-f454252095a8	2025-09-21 07:21:27.312735	2025-09-21 07:21:27.312735	테스트 알림	테스트입니다.	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
d4a29612-1e4f-4d85-9755-e5a80081a97a	2025-09-21 08:26:42.207543	2025-09-21 08:26:42.207543	테스트 공지사항입니다	공지사항입니다	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
ec1c0ecc-5f36-4cac-b0de-8ef9f8beb957	2025-09-21 08:27:00.562994	2025-09-21 08:27:00.562994	테스트 공지사항입니다	공지사항입니다	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
6acf7a7f-88fc-4da3-9455-bc58f01a2a41	2025-09-22 05:54:49.126477	2025-09-22 05:54:49.126477	안녕하세요. 테스트 알림입니다.	테스트 알림	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
25be5f4a-4bf3-49b8-b370-079c478c251f	2025-09-23 13:39:58.508265	2025-09-23 13:39:58.508265	테스트용 알림 내용입니다.	테스트입니다.	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
0bb6a668-3dc0-4ba8-a820-6d43c5d1c215	2025-09-23 13:39:58.511565	2025-09-23 13:39:58.511565	테스트용 알림 내용입니다.	테스트입니다.	679931c9-9ddc-4e80-bf1c-ecd46c84fa57	2286c205-04a2-4e4c-b19f-7b40d7dbe277
b327601f-82bb-4c01-a693-2f34cedab07a	2025-09-23 14:09:27.744606	2025-09-23 14:09:27.744606	테스트용 알림 내용입니다.	테스트입니다.	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
1984d01d-8030-43e2-a4c1-934c6714f5f7	2025-09-23 14:09:27.745824	2025-09-23 14:09:27.745824	테스트용 알림 내용입니다.	테스트입니다.	679931c9-9ddc-4e80-bf1c-ecd46c84fa57	2286c205-04a2-4e4c-b19f-7b40d7dbe277
8e8966a0-5533-4e7f-8ea9-5a522057d745	2025-09-23 15:21:26.179836	2025-09-23 15:21:26.179836	테스트용 알림 내용입니다.	테스트입니다.	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
642bddb2-2158-4b81-bbb2-1871bb2487cc	2025-09-23 15:21:26.183819	2025-09-23 15:21:26.183819	테스트용 알림 내용입니다.	테스트입니다.	679931c9-9ddc-4e80-bf1c-ecd46c84fa57	2286c205-04a2-4e4c-b19f-7b40d7dbe277
5ab8597c-dba0-4818-b0b7-87a2e7e7a4a4	2025-09-23 16:11:46.972071	2025-09-23 16:11:46.972071	테스트입니다.	테스트 알림입니다.	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
bea1fa96-bf4a-47a9-b840-da99538a2c4c	2025-09-23 16:11:46.973041	2025-09-23 16:11:46.973041	테스트입니다.	테스트 알림입니다.	679931c9-9ddc-4e80-bf1c-ecd46c84fa57	2286c205-04a2-4e4c-b19f-7b40d7dbe277
2a756d5e-7635-4cd9-abcb-1c3ae0296967	2025-09-23 16:12:46.071085	2025-09-23 16:12:46.071085	테스트 알림입니다.	테스트입니다.	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
83e552c5-8ec9-4aab-b1e9-7b073cb138dc	2025-09-23 16:12:46.072217	2025-09-23 16:12:46.072217	테스트 알림입니다.	테스트입니다.	679931c9-9ddc-4e80-bf1c-ecd46c84fa57	2286c205-04a2-4e4c-b19f-7b40d7dbe277
a0421c82-39ca-401e-b912-ffba610f3c83	2025-09-23 16:12:46.075116	2025-09-23 16:12:46.075116	테스트 알림입니다.	테스트입니다.	bb35f095-cb3b-441b-975b-d76dc409f2d3	2286c205-04a2-4e4c-b19f-7b40d7dbe277
278ca45b-34ad-4109-9a38-721d9ebeb0a5	2025-09-23 16:12:46.076313	2025-09-23 16:12:46.076313	테스트 알림입니다.	테스트입니다.	754fe42d-1b12-4a3d-8614-9b76c5184d43	2286c205-04a2-4e4c-b19f-7b40d7dbe277
f4df80fc-9702-4ffb-8f89-516b5fca41bc	2025-09-23 16:12:46.079073	2025-09-23 16:12:46.079073	테스트 알림입니다.	테스트입니다.	91da42ff-d33f-448e-8663-1f5702100b97	2286c205-04a2-4e4c-b19f-7b40d7dbe277
d2ea3b5d-bd58-45c2-830a-3bb1c29c5305	2025-09-23 16:12:46.079934	2025-09-23 16:12:46.079934	테스트 알림입니다.	테스트입니다.	7eb0d73a-ec1e-4da6-886c-922a3a695651	2286c205-04a2-4e4c-b19f-7b40d7dbe277
8e7ed482-e98f-4b55-a7b2-95721131907c	2025-09-24 03:20:46.884687	2025-09-24 03:20:46.884687	테스트 공지사항입니다.	안녕하세요	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
a7bbe065-318d-47d1-a528-6fcd5ea7c37c	2025-09-24 03:20:46.885655	2025-09-24 03:20:46.885655	테스트 공지사항입니다.	안녕하세요	679931c9-9ddc-4e80-bf1c-ecd46c84fa57	2286c205-04a2-4e4c-b19f-7b40d7dbe277
258887d0-6971-4495-b899-55ef917c8953	2025-09-24 03:20:46.888281	2025-09-24 03:20:46.888281	테스트 공지사항입니다.	안녕하세요	bb35f095-cb3b-441b-975b-d76dc409f2d3	2286c205-04a2-4e4c-b19f-7b40d7dbe277
f81d6e7d-90b3-4c5f-9970-47be7ae16a20	2025-09-24 03:20:46.889168	2025-09-24 03:20:46.889168	테스트 공지사항입니다.	안녕하세요	754fe42d-1b12-4a3d-8614-9b76c5184d43	2286c205-04a2-4e4c-b19f-7b40d7dbe277
46dce09e-96e3-4ddd-ab6b-16a3f2e23855	2025-09-24 03:20:46.891869	2025-09-24 03:20:46.891869	테스트 공지사항입니다.	안녕하세요	91da42ff-d33f-448e-8663-1f5702100b97	2286c205-04a2-4e4c-b19f-7b40d7dbe277
2a9037a6-02c4-4b61-8d2a-82fad14850b4	2025-09-24 03:20:46.893024	2025-09-24 03:20:46.893024	테스트 공지사항입니다.	안녕하세요	7eb0d73a-ec1e-4da6-886c-922a3a695651	2286c205-04a2-4e4c-b19f-7b40d7dbe277
7badf265-fe1c-4a9a-8786-dea711849849	2025-09-27 02:13:33.137254	2025-09-27 02:13:33.137254	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	679931c9-9ddc-4e80-bf1c-ecd46c84fa57	2286c205-04a2-4e4c-b19f-7b40d7dbe277
61696d4a-f55e-43ff-b842-d27e45f56b00	2025-09-27 02:13:33.140778	2025-09-27 02:13:33.140778	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
841aa863-9071-4ade-b054-dadb15fd1393	2025-09-27 03:03:44.75677	2025-09-27 03:03:44.75677	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	679931c9-9ddc-4e80-bf1c-ecd46c84fa57	2286c205-04a2-4e4c-b19f-7b40d7dbe277
08e619df-1e93-4850-80a7-6b64de69e59b	2025-09-27 03:03:44.757758	2025-09-27 03:03:44.757758	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
c8e0368b-a291-4e27-a2c1-ca910867789d	2025-09-27 03:03:44.760955	2025-09-27 03:03:44.760955	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
3b0ec999-f94d-40e1-9033-0b1efbf1c186	2025-09-27 03:03:44.762012	2025-09-27 03:03:44.762012	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	4e92a8f0-62fc-480e-afb5-33901134b8fd	2286c205-04a2-4e4c-b19f-7b40d7dbe277
85db9367-b23e-4e2f-8b8e-02ae47dc2d91	2025-09-27 03:03:44.764804	2025-09-27 03:03:44.764804	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
17a7ad94-c1be-491f-b639-9c76d3ddcfef	2025-09-27 03:03:44.765733	2025-09-27 03:03:44.765733	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	4e92a8f0-62fc-480e-afb5-33901134b8fd	2286c205-04a2-4e4c-b19f-7b40d7dbe277
c02f99c7-9ef6-4f7c-9d27-f2747e460d29	2025-09-27 03:03:44.768591	2025-09-27 03:03:44.768591	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	bb35f095-cb3b-441b-975b-d76dc409f2d3	2286c205-04a2-4e4c-b19f-7b40d7dbe277
46538be1-a371-4d3a-abb4-e51f2fe16f16	2025-09-27 03:03:44.769555	2025-09-27 03:03:44.769555	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	754fe42d-1b12-4a3d-8614-9b76c5184d43	2286c205-04a2-4e4c-b19f-7b40d7dbe277
d5ebfcbf-1e1c-4c7e-a2c9-165bd2437250	2025-09-27 03:03:44.772865	2025-09-27 03:03:44.772865	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	91da42ff-d33f-448e-8663-1f5702100b97	2286c205-04a2-4e4c-b19f-7b40d7dbe277
8befe53c-5446-439a-895c-5d6183f50132	2025-09-27 03:03:44.773867	2025-09-27 03:03:44.773867	안전모를 반드시 착용해 주시기 바랍니다.	안전모 착용 준수	7eb0d73a-ec1e-4da6-886c-922a3a695651	2286c205-04a2-4e4c-b19f-7b40d7dbe277
c4491058-87bf-4150-bb97-2080260b8ce1	2025-09-28 12:51:51.910647	2025-09-28 12:51:51.910647	안전모 착용 준수 바랍니다.	안전모 착용 준수	a8f5f82d-9847-436e-aeb3-dc93f9cab16a	2286c205-04a2-4e4c-b19f-7b40d7dbe277
ba3fffff-4766-4d09-9ecd-fe6cb68ecfcc	2025-09-28 12:51:51.914165	2025-09-28 12:51:51.914165	안전모 착용 준수 바랍니다.	안전모 착용 준수	679931c9-9ddc-4e80-bf1c-ecd46c84fa57	2286c205-04a2-4e4c-b19f-7b40d7dbe277
1ce28ec0-b4b8-4ecc-8e91-dec4163fc628	2025-09-28 12:51:51.915624	2025-09-28 12:51:51.915624	안전모 착용 준수 바랍니다.	안전모 착용 준수	4e92a8f0-62fc-480e-afb5-33901134b8fd	2286c205-04a2-4e4c-b19f-7b40d7dbe277
1835a0e2-d7b6-40dc-a095-a1f856ffe98b	2025-09-28 12:51:51.916858	2025-09-28 12:51:51.916858	안전모 착용 준수 바랍니다.	안전모 착용 준수	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
3ef5e394-ca5e-4055-85b9-39e109a6305d	2025-09-28 12:51:51.923821	2025-09-28 12:51:51.923821	안전모 착용 준수 바랍니다.	안전모 착용 준수	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53	2286c205-04a2-4e4c-b19f-7b40d7dbe277
860663d6-845e-4556-b2f3-5447edcda114	2025-09-28 12:51:51.924948	2025-09-28 12:51:51.924948	안전모 착용 준수 바랍니다.	안전모 착용 준수	3eb01d13-b269-429e-87ba-0d6471f11118	2286c205-04a2-4e4c-b19f-7b40d7dbe277
18247018-f219-41aa-96ca-c4843d7b9d1e	2025-09-28 12:51:51.929029	2025-09-28 12:51:51.929029	안전모 착용 준수 바랍니다.	안전모 착용 준수	b1293189-64fa-4845-9ea3-40a51cfb2f88	2286c205-04a2-4e4c-b19f-7b40d7dbe277
612a384f-1092-498b-9343-c1e5e71dc8b4	2025-09-28 12:51:51.930159	2025-09-28 12:51:51.930159	안전모 착용 준수 바랍니다.	안전모 착용 준수	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
f09ad9f5-25f0-4e23-b4f7-f4c16ee3906f	2025-09-28 12:51:51.934542	2025-09-28 12:51:51.934542	안전모 착용 준수 바랍니다.	안전모 착용 준수	bb35f095-cb3b-441b-975b-d76dc409f2d3	2286c205-04a2-4e4c-b19f-7b40d7dbe277
0d795ea3-c474-48fa-b3c7-e605c105a4c5	2025-09-28 12:51:51.935696	2025-09-28 12:51:51.935696	안전모 착용 준수 바랍니다.	안전모 착용 준수	754fe42d-1b12-4a3d-8614-9b76c5184d43	2286c205-04a2-4e4c-b19f-7b40d7dbe277
e5221bd8-f523-4950-90e8-25989066b7b1	2025-09-28 12:51:51.940728	2025-09-28 12:51:51.940728	안전모 착용 준수 바랍니다.	안전모 착용 준수	72212bc3-ef36-49da-a0b5-4120957158d6	2286c205-04a2-4e4c-b19f-7b40d7dbe277
00f6a1d8-cc64-41de-84c2-f1c66f47bf28	2025-09-28 12:51:51.941803	2025-09-28 12:51:51.941803	안전모 착용 준수 바랍니다.	안전모 착용 준수	91da42ff-d33f-448e-8663-1f5702100b97	2286c205-04a2-4e4c-b19f-7b40d7dbe277
6d517f28-d7a0-45ea-bb9a-a55ac2cc284b	2025-09-28 12:51:51.942881	2025-09-28 12:51:51.942881	안전모 착용 준수 바랍니다.	안전모 착용 준수	d48c08ac-a56f-4f1d-97ab-ff66a8751291	2286c205-04a2-4e4c-b19f-7b40d7dbe277
49b43b4d-2e1c-4052-bbc9-fb8dbf99ac64	2025-09-28 12:51:51.943972	2025-09-28 12:51:51.943972	안전모 착용 준수 바랍니다.	안전모 착용 준수	7eb0d73a-ec1e-4da6-886c-922a3a695651	2286c205-04a2-4e4c-b19f-7b40d7dbe277
9cf89fa3-6782-414c-8b79-a77bdf2f5074	2025-09-28 12:52:38.773286	2025-09-28 12:52:38.773286	안전모 착용 준수 바랍니다.	안전모 착용 준수	a8f5f82d-9847-436e-aeb3-dc93f9cab16a	2286c205-04a2-4e4c-b19f-7b40d7dbe277
798eab83-8604-418f-9dff-d73ce913e84b	2025-09-28 12:52:38.774752	2025-09-28 12:52:38.774752	안전모 착용 준수 바랍니다.	안전모 착용 준수	679931c9-9ddc-4e80-bf1c-ecd46c84fa57	2286c205-04a2-4e4c-b19f-7b40d7dbe277
c1f0ad34-8829-4d55-931f-0206a08ae3f6	2025-09-28 12:52:38.775927	2025-09-28 12:52:38.775927	안전모 착용 준수 바랍니다.	안전모 착용 준수	4e92a8f0-62fc-480e-afb5-33901134b8fd	2286c205-04a2-4e4c-b19f-7b40d7dbe277
a81fbddc-64f6-49b0-b33c-b8141493b0d3	2025-09-28 12:52:38.777029	2025-09-28 12:52:38.777029	안전모 착용 준수 바랍니다.	안전모 착용 준수	6667a4d8-7206-422e-9789-1846747a4ee8	2286c205-04a2-4e4c-b19f-7b40d7dbe277
0437eed7-200f-4992-9935-f057244b50ec	2025-09-28 12:52:38.780792	2025-09-28 12:52:38.780792	안전모 착용 준수 바랍니다.	안전모 착용 준수	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53	2286c205-04a2-4e4c-b19f-7b40d7dbe277
7f40ca7d-4fb3-4ae6-80d6-795490111745	2025-09-28 12:52:38.78214	2025-09-28 12:52:38.78214	안전모 착용 준수 바랍니다.	안전모 착용 준수	3eb01d13-b269-429e-87ba-0d6471f11118	2286c205-04a2-4e4c-b19f-7b40d7dbe277
a84eb3cf-fb5f-490c-85fa-34208794969f	2025-09-28 12:52:38.786063	2025-09-28 12:52:38.786063	안전모 착용 준수 바랍니다.	안전모 착용 준수	b1293189-64fa-4845-9ea3-40a51cfb2f88	2286c205-04a2-4e4c-b19f-7b40d7dbe277
117f0c5f-2200-4a24-a8f6-0b66fa5e2331	2025-09-28 12:52:38.787244	2025-09-28 12:52:38.787244	안전모 착용 준수 바랍니다.	안전모 착용 준수	6df61ff2-e7de-449d-af9c-a9938f01daed	2286c205-04a2-4e4c-b19f-7b40d7dbe277
0450a4be-46e9-43b8-8bb3-71f6be363eba	2025-09-28 12:52:38.791077	2025-09-28 12:52:38.791077	안전모 착용 준수 바랍니다.	안전모 착용 준수	bb35f095-cb3b-441b-975b-d76dc409f2d3	2286c205-04a2-4e4c-b19f-7b40d7dbe277
84a6e528-b512-4b0b-95ab-865e2345a01e	2025-09-28 12:52:38.792141	2025-09-28 12:52:38.792141	안전모 착용 준수 바랍니다.	안전모 착용 준수	754fe42d-1b12-4a3d-8614-9b76c5184d43	2286c205-04a2-4e4c-b19f-7b40d7dbe277
28750b8c-e5ec-4b56-8566-aab806102a5d	2025-09-28 12:52:38.796706	2025-09-28 12:52:38.796706	안전모 착용 준수 바랍니다.	안전모 착용 준수	72212bc3-ef36-49da-a0b5-4120957158d6	2286c205-04a2-4e4c-b19f-7b40d7dbe277
c2665a57-6797-4be4-9a57-ef704b235455	2025-09-28 12:52:38.797839	2025-09-28 12:52:38.797839	안전모 착용 준수 바랍니다.	안전모 착용 준수	91da42ff-d33f-448e-8663-1f5702100b97	2286c205-04a2-4e4c-b19f-7b40d7dbe277
d2392064-4cae-4b2c-86cf-48a0e872dad1	2025-09-28 12:52:38.798918	2025-09-28 12:52:38.798918	안전모 착용 준수 바랍니다.	안전모 착용 준수	d48c08ac-a56f-4f1d-97ab-ff66a8751291	2286c205-04a2-4e4c-b19f-7b40d7dbe277
2c251f2f-e0f7-4cfd-bb76-72e842ec51d8	2025-09-28 12:52:38.80012	2025-09-28 12:52:38.80012	안전모 착용 준수 바랍니다.	안전모 착용 준수	7eb0d73a-ec1e-4da6-886c-922a3a695651	2286c205-04a2-4e4c-b19f-7b40d7dbe277
\.


--
-- TOC entry 3578 (class 0 OID 18178)
-- Dependencies: 225
-- Data for Name: area; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.area (uuid, created_at, updated_at, area_alias, area_name) FROM stdin;
550e8400-e29b-41d4-a716-446655440104	2025-09-14 11:23:31.974284	2025-09-14 11:23:31.974284	공동 구역	공동 구역
550e8400-e29b-41d4-a716-446655440102	2025-09-14 11:23:31.974284	2025-09-14 11:23:31.974284	자재 하적장	자재 하적장
550e8400-e29b-41d4-a716-446655440101	2025-09-14 11:23:31.974284	2025-09-18 02:04:57.129328	A-1 구역	A-1 구역
ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	2025-09-17 05:42:04.518384	2025-09-17 05:42:04.518384	B-1 구역	B-1 구역
550e8400-e29b-41d4-a716-446655440103	2025-09-14 11:23:31.974284	2025-09-14 11:23:31.974284	물류 창고	물류 창고
\.


--
-- TOC entry 3579 (class 0 OID 18183)
-- Dependencies: 226
-- Data for Name: area_manager; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.area_manager (uuid, created_at, updated_at, area_uuid, user_uuid) FROM stdin;
679931c9-9ddc-4e80-bf1c-ecd46c84fa51	2025-09-23 11:28:35.6365	2025-09-23 11:28:35.6365	550e8400-e29b-41d4-a716-446655440101	679931c9-9ddc-4e80-bf1c-ecd46c84fa57
a58683ed-c2aa-4ce2-9d47-864e3f47b21e	2025-09-26 17:27:38.606176	2025-09-26 17:27:38.606176	550e8400-e29b-41d4-a716-446655440104	6df61ff2-e7de-449d-af9c-a9938f01daed
85091956-4919-4f71-934f-a60fbae63c87	2025-09-27 21:13:09.520282	2025-09-27 21:13:09.520282	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	3eb01d13-b269-429e-87ba-0d6471f11118
\.


--
-- TOC entry 3568 (class 0 OID 16930)
-- Dependencies: 215
-- Data for Name: cctv; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cctv (uuid, cctv_name, is_online, cctv_url, type, created_at, updated_at, area_uuid) FROM stdin;
550e8400-e29b-41d4-a716-446655440504	CCTV-하적장	t	https://media-test.hssu.dev/live/iphone/index.m3u8	ACCESS	2025-09-13 06:11:02.637839	2025-09-27 17:11:53.026893	550e8400-e29b-41d4-a716-446655440102
550e8400-e29b-41d4-a716-446655440502	CCTV-03	f	https://media-test.hssu.dev/live/ipad/index.m3u8	CCTV	2025-09-23 22:22:41.97141	2025-09-23 22:22:41.97141	550e8400-e29b-41d4-a716-446655440104
45138089-4943-48fe-80e0-968e6d7515f8	CCTV-02	f	https://media-test.hssu.dev/live/iphone4/index.m3u8	ACCESS	2025-09-25 01:15:52.132359	2025-09-25 01:15:52.132359	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33
ca80d34b-0d3f-47a7-a978-4df3d7f893b3	CCTV-01	t	https://media-test.hssu.dev/live/iphone3/index.m3u8	CCTV	2025-09-18 06:19:05.820085	2025-09-27 17:11:52.694421	550e8400-e29b-41d4-a716-446655440101
f329d15e-f860-4f38-9d44-f63d46184e48	CCTV-01	f	https://media-test.hssu.dev/live/iphone2/index.m3u8	CCTV	2025-09-17 11:45:53.253056	2025-09-27 10:47:20.769844	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33
\.


--
-- TOC entry 3580 (class 0 OID 18188)
-- Dependencies: 227
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company (uuid, created_at, updated_at, company_name) FROM stdin;
550e8400-e29b-41d4-a716-446655440201	2025-09-14 03:46:41.724394	2025-09-14 03:46:41.724394	협력업체 A
550e8400-e29b-41d4-a716-446655440202	2025-09-14 03:46:41.724394	2025-09-14 03:46:41.724394	협력업체 B
550e8400-e29b-41d4-a716-446655440203	2025-09-14 03:46:41.724394	2025-09-14 03:46:41.724394	협력업체 C
550e8400-e29b-41d4-a716-446655440204	2025-09-14 03:46:41.724394	2025-09-14 03:46:41.724394	협력업체 D
27fe1fe5-9ddb-4f9f-a65d-dea18e07813f	2025-09-17 10:14:36.389243	2025-09-17 10:14:36.389243	SSAFY 사무국
\.


--
-- TOC entry 3569 (class 0 OID 16945)
-- Dependencies: 216
-- Data for Name: entry_exit_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.entry_exit_history (uuid, type, created_at, updated_at, area_uuid, user_uuid) FROM stdin;
421f7191-4603-459c-b1f4-04d940c6e1ab	ENTRY	2025-09-19 00:10:08.633771	2025-09-19 00:10:08.633771	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6ca69fc1-f198-41e5-b789-4734d0995606
b09c33a7-d91a-4ede-9a15-a06628bb7dbe	EXIT	2025-09-19 00:10:40.786776	2025-09-19 00:10:40.786776	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	6ca69fc1-f198-41e5-b789-4734d0995606
9147677d-c63e-4043-b37f-280ad40fae6d	ENTRY	2025-09-22 01:57:06.779895	2025-09-22 01:57:06.779895	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
8e92c52e-4f91-46b2-a93f-751c880c86c3	ENTRY	2025-09-22 01:57:13.422353	2025-09-22 01:57:13.422353	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
bfb378a1-c69a-46e5-8f08-04d109d08566	EXIT	2025-09-23 12:19:23.863942	2025-09-23 12:19:23.863942	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
ab64aefc-65d7-47ca-9ce3-ac46069c2b0d	ENTRY	2025-09-23 12:19:26.217814	2025-09-23 12:19:26.217814	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
ed2c944e-f237-46c3-b58f-e74ab1724ce8	ENTRY	2025-09-23 12:19:54.312431	2025-09-23 12:19:54.312431	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
210723ee-c904-4fd2-802a-5214821bcd2b	EXIT	2025-09-23 12:20:12.923514	2025-09-23 12:20:12.923514	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
d0c98316-5ea4-49d1-b156-b24e90bf1911	EXIT	2025-09-23 12:24:13.756025	2025-09-23 12:24:13.756025	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
c51a8fd7-1d4a-4c81-be76-5e103ace4e9d	ENTRY	2025-09-23 12:24:29.441456	2025-09-23 12:24:29.441456	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
32522c92-d7ee-45f7-be48-e1a06c8b6687	EXIT	2025-09-23 12:28:19.541563	2025-09-23 12:28:19.541563	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
7a59a676-2834-43ec-b344-59dbab1dd6b7	ENTRY	2025-09-23 12:29:06.886401	2025-09-23 12:29:06.886401	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
4220219e-4879-43b7-bfdf-5e09b1adc2b4	EXIT	2025-09-23 12:29:11.562975	2025-09-23 12:29:11.562975	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
f0cdb766-3ee7-46c0-9f9c-ab9e9dfc8966	ENTRY	2025-09-23 12:29:50.602804	2025-09-23 12:29:50.602804	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
16246c96-f504-437d-87c0-7d7817039fc5	EXIT	2025-09-23 12:35:19.796892	2025-09-23 12:35:19.796892	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
f35454da-c161-47d5-b7fa-9ad5fa498e1a	ENTRY	2025-09-23 12:35:39.806776	2025-09-23 12:35:39.806776	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
496c9c73-5770-430c-ac91-f7db34672dc2	ENTRY	2025-09-23 12:36:36.41577	2025-09-23 12:36:36.41577	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
b7e7e2d5-20db-4648-b58b-862d266573ec	EXIT	2025-09-23 12:36:56.575236	2025-09-23 12:36:56.575236	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
0cab2740-597f-487a-ad83-777b9aff6ceb	EXIT	2025-09-23 12:37:27.526633	2025-09-23 12:37:27.526633	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
7bf6cd6a-71c0-4345-b765-4d76b82f92a7	EXIT	2025-09-23 12:37:35.990451	2025-09-23 12:37:35.990451	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
fd2bb844-9b78-4e3e-b974-64ff8651357b	ENTRY	2025-09-23 12:38:05.172236	2025-09-23 12:38:05.172236	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
31cf8e0e-afd3-4811-8555-686f26f8a046	EXIT	2025-09-23 12:38:35.878464	2025-09-23 12:38:35.878464	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
50aa935b-3a86-4e73-91ce-067902756fdd	ENTRY	2025-09-23 12:38:48.278092	2025-09-23 12:38:48.278092	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
ae9f2b22-ae99-436b-bb67-5acf5b44323b	ENTRY	2025-09-23 12:38:50.372771	2025-09-23 12:38:50.372771	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
dd5244d0-5298-444d-b41d-d66c031bef7d	EXIT	2025-09-23 12:42:57.080054	2025-09-23 12:42:57.080054	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
0b1c6f24-2c0d-420a-ac77-4186b93bcb1e	ENTRY	2025-09-23 12:43:15.286292	2025-09-23 12:43:15.286292	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
f0906fb7-d2a2-4b0b-848d-a24ab81a149c	EXIT	2025-09-24 12:12:20.800994	2025-09-24 12:12:20.800994	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
aab87634-34df-4c34-b90f-8f06c2a69a53	ENTRY	2025-09-24 12:12:21.232065	2025-09-24 12:12:21.232065	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
24df1413-1671-4812-a662-fa47059669ec	EXIT	2025-09-24 12:12:25.38726	2025-09-24 12:12:25.38726	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
00afe3b0-adae-4d2c-97c2-0097798551c6	ENTRY	2025-09-24 12:12:56.385163	2025-09-24 12:12:56.385163	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
5a94a915-90be-4c49-b6b3-eaf8bed8275b	ENTRY	2025-09-24 12:26:04.375428	2025-09-24 12:26:04.375428	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
36e98d4a-d987-4a4a-893d-245032420855	EXIT	2025-09-24 12:26:24.431696	2025-09-24 12:26:24.431696	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
849b5e57-44e1-47b8-945f-3fdca614f4a3	EXIT	2025-09-24 12:26:26.580057	2025-09-24 12:26:26.580057	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
09d3b1e3-1947-4673-99d1-1847b0efd895	EXIT	2025-09-24 12:26:34.74051	2025-09-24 12:26:34.74051	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
ed8fb627-9ff6-491c-bebd-e2a5aa05b9e0	ENTRY	2025-09-24 12:27:07.808161	2025-09-24 12:27:07.808161	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
18b6d94a-f4e2-435f-beb3-6ce916bbd399	EXIT	2025-09-24 12:41:40.749034	2025-09-24 12:41:40.749034	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
5412eddf-066b-4104-b198-5f5e6dd96b3c	ENTRY	2025-09-24 12:49:22.241228	2025-09-24 12:49:22.241228	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
04ca71eb-e386-4580-a53c-81f5cbd0933f	EXIT	2025-09-24 13:41:06.969016	2025-09-24 13:41:06.969016	550e8400-e29b-41d4-a716-446655440101	b1293189-64fa-4845-9ea3-40a51cfb2f88
0d93038e-5914-4a66-af99-6f7b5808dde4	ENTRY	2025-09-24 13:41:08.294939	2025-09-24 13:41:08.294939	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
8e1d5f94-1ab0-4bc1-8e49-0c202d75a9ce	ENTRY	2025-09-24 17:32:59.414696	2025-09-24 17:32:59.414696	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
22410ffb-8382-4b09-bdcf-641447f2116c	EXIT	2025-09-24 17:33:01.51869	2025-09-24 17:33:01.51869	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
a66a3f40-3a6f-483c-a3aa-13d638b51e25	ENTRY	2025-09-24 17:33:03.530947	2025-09-24 17:33:03.530947	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
2419ca8c-4bf7-4cd1-a841-638712ef209a	EXIT	2025-09-24 17:33:05.573465	2025-09-24 17:33:05.573465	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
b742ae23-55a5-4a12-9f27-ff4b464bf29a	ENTRY	2025-09-24 17:34:51.756145	2025-09-24 17:34:51.756145	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
7d17cd68-4986-4287-8031-c976ba40c631	EXIT	2025-09-24 17:35:07.942355	2025-09-24 17:35:07.942355	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
db4a138c-fdce-468c-b359-6cc73632f1c9	ENTRY	2025-09-24 17:35:10.062968	2025-09-24 17:35:10.062968	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
d12dfdae-0d02-45d6-822c-78a5833acde9	EXIT	2025-09-24 17:37:30.858691	2025-09-24 17:37:30.858691	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
fb92367c-7646-4e93-a910-d4064d007b14	ENTRY	2025-09-24 17:37:32.860551	2025-09-24 17:37:32.860551	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
228a2a8f-6977-4ddf-bf16-971110173ae6	EXIT	2025-09-24 17:37:35.02705	2025-09-24 17:37:35.02705	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
eec82297-b6e9-4309-bcc9-ef4af2227427	ENTRY	2025-09-24 17:37:37.095423	2025-09-24 17:37:37.095423	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
f1a02497-5eca-4728-a426-62506bfdec6b	EXIT	2025-09-24 17:37:39.174428	2025-09-24 17:37:39.174428	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
ebd9a68b-fe10-4c2b-8f33-842abe0e67dc	ENTRY	2025-09-24 17:37:41.318794	2025-09-24 17:37:41.318794	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
4b0f423f-f5ac-45c4-86a9-1e08ddf2b9b7	EXIT	2025-09-24 17:37:43.36256	2025-09-24 17:37:43.36256	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
dd5e2c59-ac8a-4114-8f6b-265472f86684	ENTRY	2025-09-24 17:37:45.377022	2025-09-24 17:37:45.377022	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
d655eaa0-d3b3-4f09-aaa9-ba47e5dfb8e6	EXIT	2025-09-24 17:37:47.419712	2025-09-24 17:37:47.419712	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
c64ea029-462e-40c0-abc7-743b5d70685c	ENTRY	2025-09-24 17:37:49.598731	2025-09-24 17:37:49.598731	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
03196e63-b5b8-4235-887b-99265f1341f6	EXIT	2025-09-25 08:07:06.07489	2025-09-25 08:07:06.07489	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
a446a208-b294-43fc-832d-1489ccbe6d60	ENTRY	2025-09-25 08:07:07.861021	2025-09-25 08:07:07.861021	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
da3cadab-15b9-45bc-9824-881962e82863	EXIT	2025-09-25 08:07:08.290824	2025-09-25 08:07:08.290824	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
dbe46884-1778-4fc3-af6f-a5c1dbdb6646	ENTRY	2025-09-25 08:07:38.641408	2025-09-25 08:07:38.641408	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
f4e6371f-c1c1-4604-8d53-4c32fb283b2c	EXIT	2025-09-25 08:07:39.004371	2025-09-25 08:07:39.004371	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
addb065e-89e2-41e1-b8e0-a06a48d3fba5	ENTRY	2025-09-25 08:07:40.251289	2025-09-25 08:07:40.251289	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
a6a2524a-8d3d-4e3c-9e22-02ef554874ef	EXIT	2025-09-25 08:08:15.503377	2025-09-25 08:08:15.503377	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
026e0c6a-e85d-427c-a1b2-29e9b4b80a11	ENTRY	2025-09-25 08:08:18.004925	2025-09-25 08:08:18.004925	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
ec2c00b5-f8c6-42f0-89f8-8414fc4cb175	EXIT	2025-09-25 08:08:19.324608	2025-09-25 08:08:19.324608	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
cdbcb4f9-9d06-44d7-b9bb-3f30acaf3497	ENTRY	2025-09-26 21:46:50.003835	2025-09-26 21:46:50.003835	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
572c5c10-d86c-4b80-aa2f-e173528fbeb8	ENTRY	2025-09-26 13:24:57.863774	2025-09-26 13:24:57.863774	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
fc3db4f7-9962-4bb3-b7f4-8591d3e6478d	ENTRY	2025-09-26 13:50:30.886014	2025-09-26 13:50:30.886014	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
8d912a7a-1ff2-4c9d-8056-6e900060fdce	ENTRY	2025-09-26 13:50:41.667017	2025-09-26 13:50:41.667017	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
f22c30d8-03de-4127-988a-125672d33312	ENTRY	2025-09-26 13:51:59.122588	2025-09-26 13:51:59.122588	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
5923ffd8-52f7-4038-bbbc-77e5444553f2	ENTRY	2025-09-26 13:52:15.87929	2025-09-26 13:52:15.87929	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
2347252a-0980-4d7b-8b6d-24d057fa848f	ENTRY	2025-09-26 13:52:53.284064	2025-09-26 13:52:53.284064	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
0ff9db77-bb44-4ef0-90e0-680702395dfc	ENTRY	2025-09-26 13:54:14.571064	2025-09-26 13:54:14.571064	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
f219e34c-0943-41ac-9dd3-f17f433d769b	ENTRY	2025-09-26 13:54:30.741768	2025-09-26 13:54:30.741768	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
4c428852-5904-444c-8ec4-bb2289fbc6d4	ENTRY	2025-09-26 13:54:59.779767	2025-09-26 13:54:59.779767	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
37d75bb5-050c-4524-8499-19a4c843098d	ENTRY	2025-09-26 13:56:03.013387	2025-09-26 13:56:03.013387	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
3f2d9a3d-f00f-494a-a982-fc57743b5f7e	ENTRY	2025-09-26 13:56:05.020953	2025-09-26 13:56:05.020953	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
9bbf91a9-a5ab-459c-90a7-3a58188c71ce	ENTRY	2025-09-26 13:56:45.489122	2025-09-26 13:56:45.489122	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
ee6d0780-92b5-442f-b343-ad3a7d79130d	ENTRY	2025-09-28 05:48:56.91616	2025-09-28 05:48:56.91616	550e8400-e29b-41d4-a716-446655440102	3eb01d13-b269-429e-87ba-0d6471f11118
776301c7-b2a2-4cff-af00-e94b64f38988	ENTRY	2025-09-28 05:51:36.664462	2025-09-28 05:51:36.664462	550e8400-e29b-41d4-a716-446655440102	3eb01d13-b269-429e-87ba-0d6471f11118
fc691c59-b29e-46d0-9b5f-acb22c6b5edd	ENTRY	2025-09-28 05:52:26.212599	2025-09-28 05:52:26.212599	550e8400-e29b-41d4-a716-446655440102	3eb01d13-b269-429e-87ba-0d6471f11118
0f78aae9-337f-498e-bb11-cac42b972355	ENTRY	2025-09-28 11:38:51.308555	2025-09-28 11:38:51.308555	550e8400-e29b-41d4-a716-446655440101	e9b485e8-e0f7-449f-8911-a299a1eedb9f
fa3e11f7-1eee-433b-a406-37959e6e4eef	EXIT	2025-09-28 11:38:52.996942	2025-09-28 11:38:52.996942	550e8400-e29b-41d4-a716-446655440101	e9b485e8-e0f7-449f-8911-a299a1eedb9f
4c5d80cf-72e2-468c-bf6d-3bfb9ee72b97	ENTRY	2025-09-28 11:38:53.218294	2025-09-28 11:38:53.218294	550e8400-e29b-41d4-a716-446655440101	e9b485e8-e0f7-449f-8911-a299a1eedb9f
d489e491-2d33-4962-86ff-ee1533cd3ba1	EXIT	2025-09-28 11:38:53.421852	2025-09-28 11:38:53.421852	550e8400-e29b-41d4-a716-446655440101	e9b485e8-e0f7-449f-8911-a299a1eedb9f
91eebd8e-039d-4422-b7a9-d1adadf0c0ee	ENTRY	2025-09-28 11:38:53.627433	2025-09-28 11:38:53.627433	550e8400-e29b-41d4-a716-446655440101	e9b485e8-e0f7-449f-8911-a299a1eedb9f
b31e4416-7138-463f-ab4f-da61b07aaab3	ENTRY	2025-09-28 11:38:53.779091	2025-09-28 11:38:53.779091	550e8400-e29b-41d4-a716-446655440104	e9b485e8-e0f7-449f-8911-a299a1eedb9f
e21a48ff-4003-4e89-91bd-2476d173da66	EXIT	2025-09-28 11:38:53.978833	2025-09-28 11:38:53.978833	550e8400-e29b-41d4-a716-446655440104	e9b485e8-e0f7-449f-8911-a299a1eedb9f
53e71a2f-f4d4-4516-a1ad-fd53a7cc4343	EXIT	2025-09-28 11:38:54.184429	2025-09-28 11:38:54.184429	550e8400-e29b-41d4-a716-446655440101	e9b485e8-e0f7-449f-8911-a299a1eedb9f
4fcc015f-f143-4683-93f3-2af126336e68	ENTRY	2025-09-28 11:38:54.342316	2025-09-28 11:38:54.342316	550e8400-e29b-41d4-a716-446655440104	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
6134ee75-32b3-4c8b-b1a6-df99d9fca8c9	EXIT	2025-09-28 11:38:54.484977	2025-09-28 11:38:54.484977	550e8400-e29b-41d4-a716-446655440104	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
1f8eb171-07db-45db-a5aa-6548dd7c8611	ENTRY	2025-09-28 11:38:54.664453	2025-09-28 11:38:54.664453	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
65a2e793-adba-48f7-8834-72df73f4fe12	ENTRY	2025-09-28 11:38:54.814729	2025-09-28 11:38:54.814729	550e8400-e29b-41d4-a716-446655440101	e9b485e8-e0f7-449f-8911-a299a1eedb9f
a892bb3c-eb12-42cd-96f8-48a5dccd6603	ENTRY	2025-09-28 11:38:55.017892	2025-09-28 11:38:55.017892	550e8400-e29b-41d4-a716-446655440104	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
0cf07136-5cee-4b59-a757-e3ffe399c45e	EXIT	2025-09-28 11:38:55.22532	2025-09-28 11:38:55.22532	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
5fb5d5a4-2eba-4887-ba7b-0273682f989c	ENTRY	2025-09-28 11:38:55.432412	2025-09-28 11:38:55.432412	550e8400-e29b-41d4-a716-446655440104	e9b485e8-e0f7-449f-8911-a299a1eedb9f
513c2add-5a95-4637-b9af-c1af8a425b29	ENTRY	2025-09-28 11:38:55.608225	2025-09-28 11:38:55.608225	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
846cc96a-404a-4762-a44b-199cee5af115	EXIT	2025-09-28 11:38:55.813824	2025-09-28 11:38:55.813824	550e8400-e29b-41d4-a716-446655440104	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
491d6856-1bc5-4cd8-b187-d6d66b32b86c	EXIT	2025-09-28 11:38:56.033465	2025-09-28 11:38:56.033465	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
f195f437-1817-4cb8-8403-b5da27362624	ENTRY	2025-09-28 11:38:56.197719	2025-09-28 11:38:56.197719	550e8400-e29b-41d4-a716-446655440104	7eb0d73a-ec1e-4da6-886c-922a3a695651
96a8f7d3-a301-4570-8013-29b0a74f4c87	ENTRY	2025-09-28 11:38:56.400041	2025-09-28 11:38:56.400041	550e8400-e29b-41d4-a716-446655440104	6ca69fc1-f198-41e5-b789-4734d0995606
2f280cd3-3566-4547-b243-4656786d7c8f	ENTRY	2025-09-28 11:38:56.541396	2025-09-28 11:38:56.541396	550e8400-e29b-41d4-a716-446655440104	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
d8fea104-9e80-4f9a-b3ad-96055ee232b1	EXIT	2025-09-28 11:38:56.692082	2025-09-28 11:38:56.692082	550e8400-e29b-41d4-a716-446655440104	6ca69fc1-f198-41e5-b789-4734d0995606
19418a25-812e-4ec2-871c-ce6de28a3f77	EXIT	2025-09-28 11:38:56.884974	2025-09-28 11:38:56.884974	550e8400-e29b-41d4-a716-446655440104	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
4fbec615-8023-45fb-a7bf-583e33cd7251	ENTRY	2025-09-28 11:38:57.021151	2025-09-28 11:38:57.021151	550e8400-e29b-41d4-a716-446655440104	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
179fecc8-89bd-481c-98f2-337c5d575a02	ENTRY	2025-09-28 11:38:57.217104	2025-09-28 11:38:57.217104	550e8400-e29b-41d4-a716-446655440104	6ca69fc1-f198-41e5-b789-4734d0995606
31bc8d70-4249-4a2f-9d54-a0212109afda	EXIT	2025-09-28 11:38:57.35386	2025-09-28 11:38:57.35386	550e8400-e29b-41d4-a716-446655440104	6ca69fc1-f198-41e5-b789-4734d0995606
519109c0-f524-4989-b9e8-0b955eb820e2	EXIT	2025-09-28 11:38:57.479786	2025-09-28 11:38:57.479786	550e8400-e29b-41d4-a716-446655440104	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
6df6f2ed-d048-4d97-9ac5-37b19baedb00	ENTRY	2025-09-28 11:38:57.676075	2025-09-28 11:38:57.676075	550e8400-e29b-41d4-a716-446655440104	6ca69fc1-f198-41e5-b789-4734d0995606
254b8a26-64a0-4f52-b042-2361c67f7839	EXIT	2025-09-28 11:38:57.810186	2025-09-28 11:38:57.810186	550e8400-e29b-41d4-a716-446655440104	6ca69fc1-f198-41e5-b789-4734d0995606
09f1a0a4-57b0-46c2-97d7-dee4dea13639	ENTRY	2025-09-28 11:38:58.010057	2025-09-28 11:38:58.010057	550e8400-e29b-41d4-a716-446655440104	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
f9dbd158-844d-40cb-a781-25281c6cabfb	ENTRY	2025-09-28 11:38:58.2103	2025-09-28 11:38:58.2103	550e8400-e29b-41d4-a716-446655440104	6ca69fc1-f198-41e5-b789-4734d0995606
2f6300b1-1dae-4b34-ba75-949ce4abb6af	EXIT	2025-09-28 11:38:58.416028	2025-09-28 11:38:58.416028	550e8400-e29b-41d4-a716-446655440101	e9b485e8-e0f7-449f-8911-a299a1eedb9f
7764de86-1cf9-4d9e-86ec-fd6a63920023	ENTRY	2025-09-28 11:38:58.549819	2025-09-28 11:38:58.549819	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
12f87df3-4f3b-4d54-b70a-621a134db634	EXIT	2025-09-28 11:38:58.753744	2025-09-28 11:38:58.753744	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
a9f3d9e0-59ab-4763-bc63-307a153ec52e	ENTRY	2025-09-28 11:38:58.879189	2025-09-28 11:38:58.879189	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
f2ac987f-cdd0-478f-aa0f-94bd2dc0aa54	EXIT	2025-09-28 11:38:59.079546	2025-09-28 11:38:59.079546	550e8400-e29b-41d4-a716-446655440104	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
94f061b2-76d0-43a7-a3f7-33354cfd10be	EXIT	2025-09-28 11:38:59.232841	2025-09-28 11:38:59.232841	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
0eed08ae-21f9-4567-b9a0-0e8d682309a3	ENTRY	2025-09-28 11:38:59.432956	2025-09-28 11:38:59.432956	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
cc8c3f10-4690-4ae0-8f02-4d1f5d4a6ead	ENTRY	2025-09-28 11:38:59.590181	2025-09-28 11:38:59.590181	550e8400-e29b-41d4-a716-446655440104	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
f6181563-0c1a-4315-aee8-e0ae3016663a	EXIT	2025-09-28 11:38:59.713737	2025-09-28 11:38:59.713737	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
8b4a017e-082c-480a-a31c-a3f72723d15e	ENTRY	2025-09-28 11:38:59.919624	2025-09-28 11:38:59.919624	550e8400-e29b-41d4-a716-446655440101	e9b485e8-e0f7-449f-8911-a299a1eedb9f
ea697ba5-1e6e-43ac-a256-f19d25a495d9	ENTRY	2025-09-28 11:39:00.045844	2025-09-28 11:39:00.045844	550e8400-e29b-41d4-a716-446655440101	7eb0d73a-ec1e-4da6-886c-922a3a695651
5ef97b9f-fd38-4bdd-8232-636568a437d3	ENTRY	2025-09-28 12:22:03.778398	2025-09-28 12:22:03.778398	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
6af419be-f403-4a19-acce-9eeee79e2fc2	ENTRY	2025-09-28 12:22:22.682292	2025-09-28 12:22:22.682292	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
21863b0a-952e-4493-8801-0447de90a0df	ENTRY	2025-09-28 12:23:26.620343	2025-09-28 12:23:26.620343	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
f81b936d-5873-44eb-8b00-82650b3d00a1	ENTRY	2025-09-28 12:23:28.108807	2025-09-28 12:23:28.108807	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
4710a5ab-3961-4c36-b863-0c40eb68808c	ENTRY	2025-09-28 12:29:40.573243	2025-09-28 12:29:40.573243	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
f8f5d296-3746-4bad-b092-6345a0e491f5	ENTRY	2025-09-28 12:29:50.311068	2025-09-28 12:29:50.311068	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
cbe1c31c-eb97-405b-86eb-60fc7c3ea31c	ENTRY	2025-09-28 12:30:24.456659	2025-09-28 12:30:24.456659	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
cf48f0f4-0fa3-4ede-b6ac-f28c4b4ceff1	ENTRY	2025-09-28 12:42:49.501488	2025-09-28 12:42:49.501488	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
9884b0b7-941d-4e0a-88f9-090683b9cd30	ENTRY	2025-09-28 12:43:05.315359	2025-09-28 12:43:05.315359	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
95c0cda6-73e5-4fd8-abc2-4e7c487010d6	ENTRY	2025-09-28 12:43:06.588241	2025-09-28 12:43:06.588241	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
37ae6569-b704-468b-8d6e-3bb736295bd3	ENTRY	2025-09-28 12:44:01.877939	2025-09-28 12:44:01.877939	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
a7133383-e412-4cc2-8d24-f0f99508c6ac	ENTRY	2025-09-28 12:44:14.386284	2025-09-28 12:44:14.386284	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
02e69a02-dff3-4587-ab98-8b93cc71c033	ENTRY	2025-09-28 12:46:12.963724	2025-09-28 12:46:12.963724	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
be181f08-6d90-4cb8-8bea-e0082d2da325	ENTRY	2025-09-28 12:47:32.5627	2025-09-28 12:47:32.5627	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
f9871d41-e98b-43b4-af82-d05b992be350	ENTRY	2025-09-28 12:47:33.214221	2025-09-28 12:47:33.214221	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
eefb8bd9-e5b3-467b-949c-2c03e743447a	ENTRY	2025-09-28 12:48:02.774682	2025-09-28 12:48:02.774682	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
7e57a2f3-cd14-4281-811b-3aa45618f030	ENTRY	2025-09-28 12:49:49.657916	2025-09-28 12:49:49.657916	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
77fc3b9f-4f43-4f6f-8c76-38d75cfee841	ENTRY	2025-09-28 12:50:08.578664	2025-09-28 12:50:08.578664	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
70d16261-830c-44b7-b04e-4d20cd7a708a	ENTRY	2025-09-28 12:51:09.272803	2025-09-28 12:51:09.272803	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
91bdde1f-e5d4-4927-ba8c-7b656269c966	ENTRY	2025-09-28 12:51:27.910377	2025-09-28 12:51:27.910377	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
c1c88aa0-63a0-4997-a99d-4f654033b120	ENTRY	2025-09-28 12:52:22.483933	2025-09-28 12:52:22.483933	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
08b9b285-9eba-42d0-b2dc-c8c410c669c6	ENTRY	2025-09-28 12:52:24.325355	2025-09-28 12:52:24.325355	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
4f54d214-ad2c-4963-a5e3-ef67fd301287	ENTRY	2025-09-28 13:03:03.955651	2025-09-28 13:03:03.955651	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
829d6abb-b423-47c5-bd8f-dc02e17e4953	ENTRY	2025-09-28 13:03:07.536033	2025-09-28 13:03:07.536033	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
bbede42e-a16a-443d-8160-41e92f9136ad	ENTRY	2025-09-28 13:04:24.331849	2025-09-28 13:04:24.331849	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
2dda94d9-253c-4dc5-b827-4b92a7d0c926	ENTRY	2025-09-28 13:04:29.018911	2025-09-28 13:04:29.018911	550e8400-e29b-41d4-a716-446655440101	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
350d056c-aa9c-44af-9b03-c3b088a3d537	ENTRY	2025-09-28 13:52:37.845933	2025-09-28 13:52:37.845933	550e8400-e29b-41d4-a716-446655440101	6667a4d8-7206-422e-9789-1846747a4ee8
9ca66da5-8a27-441f-b747-ee0ce1db7cc5	ENTRY	2025-09-28 13:52:47.942835	2025-09-28 13:52:47.942835	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
c3287ab8-11e7-4862-ac10-d768dfe3705f	ENTRY	2025-09-28 13:57:19.17045	2025-09-28 13:57:19.17045	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
28d7ee45-80eb-4ee4-86ac-4c286df95ea2	ENTRY	2025-09-28 13:57:40.608762	2025-09-28 13:57:40.608762	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
2e20658f-9347-4249-a61a-c10e670efacc	ENTRY	2025-09-28 13:57:57.591866	2025-09-28 13:57:57.591866	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
0cc706ef-b48f-4226-bce5-16fbc6ba1ef0	ENTRY	2025-09-28 13:58:11.036102	2025-09-28 13:58:11.036102	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
ba3a4525-f4c9-4e36-adfb-29f0d536cb7a	ENTRY	2025-09-28 23:45:57.070206	2025-09-28 23:45:57.070206	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
b8599358-4666-4419-9380-8964f00ade1e	ENTRY	2025-09-28 23:46:04.903727	2025-09-28 23:46:04.903727	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
80f98a58-f4fd-4ed6-8ba3-43931fac148e	ENTRY	2025-09-28 23:46:39.334413	2025-09-28 23:46:39.334413	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
2cd78bd4-03b3-4930-b203-6346a4b843f6	ENTRY	2025-09-28 23:46:56.041626	2025-09-28 23:46:56.041626	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
39115d85-845b-414c-82dc-cbf3ffed095a	ENTRY	2025-09-28 23:47:27.263635	2025-09-28 23:47:27.263635	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
6be7b8cd-8471-4bf5-8f04-5f5212e05069	ENTRY	2025-09-29 00:37:36.463621	2025-09-29 00:37:36.463621	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
8174d593-f438-4e4c-b4db-2a7b45f78d66	ENTRY	2025-09-29 00:37:38.605818	2025-09-29 00:37:38.605818	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
977e94d2-154b-4972-97cf-e665b6e2dae9	ENTRY	2025-09-29 00:37:52.444777	2025-09-29 00:37:52.444777	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
7937c74a-eb21-435f-adb2-1f58c1ff93fc	ENTRY	2025-09-29 00:44:34.674242	2025-09-29 00:44:34.674242	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
0cbd4a12-95f6-4ff7-b192-7571ae384a0d	ENTRY	2025-09-29 00:44:38.621603	2025-09-29 00:44:38.621603	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
2cd8c756-782f-4fb3-adaa-ecb783fb7ac5	ENTRY	2025-09-29 00:44:55.632259	2025-09-29 00:44:55.632259	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
04cb4954-0509-40cf-9c5a-f7b045e07447	ENTRY	2025-09-29 00:44:57.256397	2025-09-29 00:44:57.256397	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
803ef664-7993-4371-b741-942395d727be	ENTRY	2025-09-29 00:45:16.206331	2025-09-29 00:45:16.206331	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
4f597b10-cad9-4cd4-ad9d-06a7e44044ac	ENTRY	2025-09-29 00:45:17.235043	2025-09-29 00:45:17.235043	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
e9640029-c8dc-4d4a-9ac1-165462a8e3be	ENTRY	2025-09-29 00:46:56.431262	2025-09-29 00:46:56.431262	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
af3c7ad5-6205-4c87-8a65-8353704fd6b3	ENTRY	2025-09-29 00:46:58.008744	2025-09-29 00:46:58.008744	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
bb6b217b-9462-4158-bb9d-02b677594e4a	ENTRY	2025-09-29 00:49:21.611402	2025-09-29 00:49:21.611402	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
d5ef1a5f-2e8f-45aa-89f2-575341a19308	ENTRY	2025-09-29 00:49:44.349095	2025-09-29 00:49:44.349095	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
7d9b4adf-98ba-4b4f-9f84-339c3289e35f	ENTRY	2025-09-29 00:50:01.028909	2025-09-29 00:50:01.028909	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
20ea662d-1a43-4b0d-9bae-4dec6b808b3b	ENTRY	2025-09-29 00:50:04.016152	2025-09-29 00:50:04.016152	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
b46bda83-8a9f-4c03-ac98-66d48704b634	ENTRY	2025-09-29 00:50:07.016231	2025-09-29 00:50:07.016231	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
5e48461e-391a-4912-b45c-9a56fa6fcdec	ENTRY	2025-09-29 00:55:32.952793	2025-09-29 00:55:32.952793	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
705d5f9a-a0b5-46ba-b5ef-2528d864f5c3	ENTRY	2025-09-29 00:55:57.44909	2025-09-29 00:55:57.44909	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
8c49eefe-d78e-4b54-8ede-23c4ad91a352	ENTRY	2025-09-29 00:56:49.158592	2025-09-29 00:56:49.158592	550e8400-e29b-41d4-a716-446655440101	4e92a8f0-62fc-480e-afb5-33901134b8fd
96c809eb-b521-43c5-a04a-029967dd9282	ENTRY	2025-09-29 00:56:52.483965	2025-09-29 00:56:52.483965	550e8400-e29b-41d4-a716-446655440101	6ca69fc1-f198-41e5-b789-4734d0995606
\.


--
-- TOC entry 3576 (class 0 OID 16968)
-- Dependencies: 223
-- Data for Name: face_embedding; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.face_embedding (uuid, embedding_vector, photo_key, created_at, updated_at, user_uuid) FROM stdin;
1990d1b9-cd64-44b0-9d7a-7a9794b0c898	\\xefd5d23cefaeb73bc91a263e21e2ca3cd1b3e4bdd6e293bd8f1fb3bc118db13de5a7ebbd926cae3d96c8d23c8063db3ad418c83ddabce43dad048c3d1aea25be209876bdab8691bd123b673d41b0adbdbdabf6bdd2853e3de9aa6abde8f81bbd976583bcf7f9babd347802bc62d8a63dda0631bc43fd753d5a0223befbe4d93cfd9037bdb09580bbd9a53d3dbddd8d3cb98a4dbeae68cbbd4ac5143de06ce6bced07d63d0dd0db3d0be711becd01a63d8f74053ec3de903cb19857bd1a25acbc9725babdc4e5ac3dadfd7a3c127898bd0a1a1cbeb892a5bd3db4cfbc15ea893c496d873d7536783d8674923b4f1e9c3c7b0f46bdf3300b3e7041013ed88219be01a9b93d0c1696bd4bebc4bd1f88773c5e0711bd6d38b73db987a23d9fd8853d4c84293e5c126fbd3f8dc1bd7088f03cafeb52bdf3ece03bce9284bdb0404bbda6f2093ec2e9303ebad44bbb2b7e29be1df0093adc6456bd9b1890bcfe4dfbbc227cbbbdaf31383d9bc4f53cf2a88e3e3402f53d13481dbe89eb3abdfc7546beb2d9babd92ca213e31a92b3e586d8e3d83a1efbc4d3b753df9eac6bd9ec0ed3d826ccd3c2fd2d5bca2e5933d9c6dd0bd8da1cf3c98a5193e0737753d489e7abdbfb2d53c8d8cb03c017ac6bc6c56f2bd12e0fe3c247d41bcb804aebd38af85bd376322bd8c83d33df6de0a3d9193a53da0a649bdd5b3903d30827a3dbce7333d	faces/91da42ff-d33f-448e-8663-1f5702100b97/95782537-cee9-4914-b4fd-666d97285c37/front-face.jpg	2025-09-17 11:34:17.741904	2025-09-17 11:34:17.741904	b1293189-64fa-4845-9ea3-40a51cfb2f88
87b3054b-278e-4de9-a455-a72b3b82ae53	\\x19e95dbe3ad5a4bb624d943da2398abd412974bd55dc64bdac84573d305a0f3ed5afc1bdbda3bb3da9d8adbd0f2c4ebc7a7a1f3dea63d13ca79dec3c8e2f3cbeb578273df83940bd4a14323dfa5e80bc0379a23dfa2722be696b07bb1ca3a8bdafdf8ebd818ec4bd5aa11b3d5387b9bc1eec9b3cdae1943c208612bea69e34bddcd4c7bd8ef0acbc1facf33bb7ee533dd220f3bd9d1e893c52ab163dfd9c5abde3f9a93c637921bb3c6ff1bdf9459dbd2089a73dd082b3bc6c1f94bdd40b6c3cd39ecd3d277cb93ddd209b3b2eede0bd7f2856bceb1d07be933efdbd49381d3d3fd60f3d95d6b23d5c1ca73d47a6b2bdd05da63de50ac23d305ce3bb162bfebdf0df0f3d5f4becbd37a28dbc60941ebd737f263d710c533ec626543c83b82d3ec664d23da626c53c899e10be868b3dbd469a0cbd48eb9a3ced49ecbd8004973d3f5aa03db79b863ea72b023e8a89a1bc124521bc0cf023bda25f933c901b03be5be5c9bde6a1533d0a8f8abc28b80f3e2f26fb3c346ab8bc205511bd83c587be4283cebd64e74a3e0a00373dffdc3e3ef17839bddb06723d072f913d34d505bd03c0a83db7b6313d1ad91d3e6229c8bd731c56bdef4e6cbcd0f894bd42243b3da9ef9bbd196557bdbe60293de57bdbbcef20933cc4d40b3d6c76cabda3ffacbddbf5803c7649bf3d5160593cd394003eb1208fbd8ab1093e4cdb883b0416b13c	faces/91da42ff-d33f-448e-8663-1f5702100b97/95782537-cee9-4914-b4fd-666d97285c37/left-face.jpg	2025-09-17 11:34:18.245927	2025-09-17 11:34:18.245927	b1293189-64fa-4845-9ea3-40a51cfb2f88
4cef44d3-cdf9-4cbb-a854-fb70f41e26d5	\\xa316c1bde9d9483dc67b153eba7011bdd50f40bd275165bd521bdb3d7c27a63d1ded7fbdae32ecbc508504bded43f43ad6ab563d25f9053e6b5c183d6cd538beed8c4b3da0c7a8bbfd77073e3e4b7ebb9f615abd1856a53cada027bdbdfba4bda4926bbd9ea6dabbb86ca43dc7182b3cc9bf2cbdc525b83da5a5febd0c50273c586bec3c4166d7bd30a48d3d7d65743dcf4645bd183f2abeac3727bc1387ac3ad24bd03d9b14f23d970f41be719454bd8a99d33d78ff97bcc0d402bd437d1ebe1d6bfb3c5815e53d0232653cd37fdc3c0846b0bdc38904be660a3ebd9217aabc16d2843d9f7edd3d243731bc661223bda7b66c3d41b9653d80fa0d3d38d314bebb5682bba9c227be8010a53b2a9b96bc8ad9613cbd45f33dcb0eb53c65d5e43df66f263ebba7bc3cda384ebea105783cd85f47bd54aa33bd076967bd0543823dc611363e3305753e6dfceb3d9f204bbda15eccbb58bbfabc2836e8bb74c91bbedf91ecbd14345d3de3874f3d5db48b3eb419e93d8c8d35bdb6fb2d3da0586dbea7f345bd3966213eb8477b3dfdeb2a3eb834febc574906bd6613aebccc0a7a3dbbf1b73c128093bcde2f5c3ddf8f01be6ade1dbd849b0e3d01cbaabdccc64f3d3039093d05a80fbd98c684bb9cfacfbd12ab7dbde25bc73ca74e66bdd7c1b8bbec0bbd3ca011c53d911c56bdb71bfd3db5ab10bd720cac3d08ab9c3c2bc8243b	faces/91da42ff-d33f-448e-8663-1f5702100b97/95782537-cee9-4914-b4fd-666d97285c37/right-face.jpg	2025-09-17 11:34:18.6582	2025-09-17 11:34:18.6582	b1293189-64fa-4845-9ea3-40a51cfb2f88
bf63ccb3-81c5-49ec-98a8-8b51cc08d1bb	\\x80b823bdf9403b3d50a056bc6edb8ebd1b733e3dfb6d043d3efe85bcf2b0efbc17d266bba940b5bc7b50a83dd04b703c09c820bda4b0bb3b907e1dbda0d686bd2d4af13c69a65fbb40f645bd681aa8bd26facf3896b10a3dc4c0a03d85da89bd77b715bd5526d5bcac3a0abc5c5e6e3d8332bfbd15ea0cbd2d3981bdec274a3d7e00b1bd8f506a3dd38f07bbb6d693bd2350563c27a40dbc65531dbce893c8bcbd8b1f3d56a2e4bc25f417be0a5b163d09b328bd8b2ec43da55d91bc8b22083d8215463c283f28bdb4e083bbca1105bceaab833dba9fc13bc5570f3d3a68f73bbf3a11bca4c0873cff60a53c42914a3cd1845c3d7576133d67edaf3c97239ebc013c143d9b86efbdb56bee3cc4acc1bd2bf52a3df0a54f3dc8ec06bef13647bc3e381e3ded6155bbde828abd1dc9acba539a54bc382b60bd142a993bfb92143ca5f93f3d5fe90cbd98d8cabb40abd9bc57a322bda18a863d4b6ab8bc6abe61bd53730fbc867bccbc175690bced0d7e3cb66cb2bb6bb9893c045126bb63759e3b2f5597bc4115413d8fb5ff3d917a5b3d945d35bdf2afcdbb2b04d7ba080f2a3bf64a0dbdf5bbf8bc4824a8bd24bad73cdba9d3bb7867343c98771ebc8e27f13ca8ed923d544fa63cd26fd9bb1e6abebc1cd62dbcb34e1b3cbb007f3af0ba0f3df11cf9bb3f3f01baba7a1dbd9869193dd091d9bc0eb3ea3cd358e6bddc0ebf3dd007b23d9b572c3dc6d445bdd3b0a13cf4ba51bdda11453d7e7b4b3df24df93ab078e23b01907dbc23911d3dea129d3c7387243ddc4102bc0ae8e3bc41df6ebdc1c8bebc36c222bc4d19acbd005b16bc568ced3c56c244bcbd73e93c17e3fb3c6c656bbda5e7a33bf5c11bbd6e87a83b80b9d33c15b180b9671337baaa6cef3c606cbcbcbce447bd0a23f83c815b3bbd8ab9443cd520493c5c40c43d2c47c53ca428003a0c371c3c2edec8bc0d26793b0c02163da253fe3d41d88abd2489193b7ad561bcef18acbb9a1a35bcb3c857bce2d3c9bdd58b38ba5118a03a420e5b3ba76b8e3a32abcc3da586933d3539923c1875b03b6de831bdfa0d3d3d05cb5abcc9457fbccd67503da5af7e3dcfa477bb932f65bd513284b9fc7802bddf4f4bbca5eea23d60bb153d3a45ebbc2b58183d6a1b26bc153bdfbc4d86a8bdf427dabcab6270bc901e22bdeae300bd143ea93c005ec9bc46e841bdd8d3a6bb1f1d683d75b7263d69f7b33d00df633d9a7147bc54ff27bc7f5e1f3d032b983d38b33dbdc04dc13b70d93f3ce81b9bbddad68cbb6b0d953b5994b9bc2b4aafbca2e05abc0f4a7d3bad89ecbb60ed873c034b88bd08771c3c120d6dbc3f623a3d904dbe3c9cc80ebd19638ebd6511653ca3d9683dc8db87bdb40fd93c778b04bd70eb1dbd0e1003bbb83381bce905723db02d43bcdc6da4bd02a5e4bc3f4d873c96d02e3c572f1c390b2a053d47d663bd74e697bdba7f14bd1cb9d33c0d3fd43bef0d0dbd4cb8bebce85b503bb45d943dea16a63b74922c3b8fc86e3db049bdbcd1f326bd6a0d493d6ac82fbd4657933c4047683dc67706bd5ad43c3d0b629bbc02cb343c1d783e3dfb98583bf172d4bc58b0d63ca19162bd382a80bd42b653bc4cb7593d95ece8bd2d47e03b9eea2dbd9ee8e43cecf916bd8def62bd05a7cebb3a324cbb8b53843d2db5b03dc6b6223cb05c163db9ef633cf0cea33d82e505bd8a1da6bda994fbbbbc68853d7b90503cba2f3e3c199887bdaaec28bdd80e4f3c8880d83c8d13c83db1a229bdba54b43d8518abbc782da5bcb5aa71bdb3a83ebc61824abc9b2bcb3c23afb13d59cb81bcfc852cbdc08a663bc0745bbd4d8c193d0e4ab7bdd9d38fbd5cc8b2bc15eb5abd6724d1bce53b85b90f67d0bccc2e22bdb958153dad286abd92e156bc3ad5cfbd4771113dff7e713c962f3d3dc2be46bd65d838bd50a82fbdc8c0e1bcc1e618bb7166b7bc029f323dac7cb23ce4cf313d4411a13dc49216bdc36c60bc98b3473dcffaacbcee85b63d6721983dbc643abd76bf38bd81c9e03c839b28bc63c9743c5fc3333d0c0f423dd93e8cbc827978bcf9d8ccbd74a2313c60b45cbde60a33bcaa40e8bc0e270bbd016ea9bcc137f33cfe735ebc231b273c3f1bbebc5e58a1bcc9743fbdd0fd1ebd47071cbd86bf6f3dbe9beb3ca85b1f3d4cfc243bb6b5ae3d6ac24dbd5cb807bdfa7c9d3b635b05bcf4ab15bcbe38b1bd19d2aebc35bde1bc0cc732bcca1310bd42d034bc16a8853c80d0323d250ce43d98c2cb3c90b4bc3b4466abbc500e993c4ae68cbcf96dabb9407cdebc5ff61b3d6c62573c8aeb203d546d05bc03e4433d5edc86bd39d0bb3cfd62fcbc5db680bc11448d3cf6bfda3c7644a63d1e664ebd98a7563ce41ccfbc889f04bde423893d50513d3dd77ece3b5284d4bc097015bcabd4073de3dd18bdd138d13a0ede44bc4cd61abbf8a4c93c74c73bbd3def78bdf4658c3c6386dfbc5a8160bc146ad5bc4cf83b3da239103c27bb28bd5c3cb73b5f7ecc3abfc00abdb6beaabd8f4acfbd63a6ce3bb7279f3c297a50bd45f4d2bc3c3f973d9b4c813db7e20f3dd90099bdd3beb63b29ddfabc0ce772bc4edab4b9b71449bdafabc3bc7e80843dcbd2113d22e63ebc33ecf13d4d1dbebd65a9a2bc78c311bd41c2ea3c3373a23ca8c7943d8eff36bd02e74c3df5e613bd08d6cebd326ef93cebbcc13ce8a3ae3d95ebdc3b1e36efbcdbea92bceb3ae9bb8441523bc866083c70ff5dbc75df7d3d1153ef3c51348e3c7f73623d80ae15bc1200f6bc0795183d68520cbd9be8f63c2871dc3dcb3d313d088f47bd468a38bd97a88c3c68b3bbbd76871cbd43a22bbcf7b64f3dc0282cbd2cc34cbc3d02eebc67c2da3bc829fe3b73f547bd065ccebd	faces/620e637d-2c7c-4af7-b247-a3aebd5480c1/b7a8a3c4-8919-4e72-8e8d-5a40936e84bc/left.jpg	2025-09-26 22:39:35.03729	2025-09-26 22:39:35.03729	3eb01d13-b269-429e-87ba-0d6471f11118
057065e5-dbbe-4883-8b82-2f47b5a7c5f7	\\xaf9bc7bc99b1bf3b375d5d3cf5c064bced42e1bd2dfd0dbd3a93f13ce90610bd11d8a43d39225ebc463af33ca16beb3bc6690a3d009956bbae39b5baa3f9e73c5bc1adbc57a7ea3cad30c63c5b9c94bd6b9c28bd68bd0b3ca4c7123c797a45bda97f443cb21e9a3cfc95b13ce139833d4dca4cbd79b8d83cf84caeb94a32253d6e7e943d1c1bb93d5c330c3d81ada73c96e769bb427ec73c3138523ca6fce03ce15e763c8d92b8bc85c7193df3945dbc58067fbd5cf4ab3ded95a1bce7c2fd3c4f77953c1d610d3dc3d8893d13f1ad3a7e0c5abcc5c3a13c7e4283bc419d453cb16c523da516203dbdee01bcd8281cbe755a4ebd780436bdf33bd13ca9154ebc78fa963d72be503d8e7e22bd931edabc7e86063ee23457bda8d0c5bd1898923d4d122d3dd2df1a3dc960f9bb776577bae5dcba3cb36078bd513ad8bc31a40fbd73e4053c8722e93bc172c03c7bdde1ba7c0f293c8f64ae3dd72ee3bc8974be3c2848a63d8d9812bcfde50cbd45818c3c3d60003c81e5e73cb24f3abd6a453ebdb504953cab11e53c9eed8ebc008317bd667e45bdac8e393ddce811bdd13680bd1fa4843c1554b63cbd28eb3d51dc3dbdcde8cd3c82b32f3dcd0c7a3c03e6d23c6c1b5eb96128a23c7f2c463b2b5125bd194d85bd9672f8bcdbf8c5bddd1cdd3a1439963cf8602cbdc481003dc63d933db5d7da3ccb4c293d44146dbddb64a43c4f44263df6ad91bd2d70a33d65eb53bd03c562bda21555bdc0acfabbc0a680bdf413583c3628b6bdc86e2e3d1ef8fb3c0f74c13c18efe03cc0108b3c1e20063dc0ac34bd70f2bf3dbdd522bc65a8573c7c3fe63a14b1363d1d2abe3dd54bd23a7288373cd358b7bb4c5dd63d5683fabc441ee43d14c3173dd754f8ba2e8ebf3db62247bb6e90193da0534a3cda8a84bd8384b23de3cb66bdbae43cba5f2972bd675db73c3851153d9cba503a6ed1463c7c04f43ac143803dfd6ade3c5954283def6a80bdf65170bcf6a42bbd6c4e1fbd44d1ffbc23a904bc2b5ef53bde4abc3bc4967a3cf9a3d9ba6afe483df6f17e3d7effa13c122d3dbb03a51dbd705d1b3cd7ed513c81ea2d3cb53a36bd87c574bdda9e2dbd72f4a13ddaf9603dfb9f4abd9bc011bc34e415bd3bf514bdec6714bdff810e3adf3ec1bd15dc07be963b5e3dfbce6cbbccb218bd9baa013df92fe939d5edb4bc2116dc3c961dd33c36a724bc6bc5853d56897ebbe99e53bbae9323bdd45533bd6bee973c9d2f893d1ad98bbd2513623c6d4cc2bd29acb2bd0ee1193d4b2bf6bcadc4233d4183953ccadd7fbc776d11bd783edcbb8a8d823d160c633db6f27dbb4e1a33bda682393c666f4cbd8fe44ebc813c13bda23159bb2d908d3b1fa803bdf42ac63b461184bdc8a5113d7b79b83a85fc533d5e488e3d615becbc41728ebce21ce83b4950923dc19386bce982323af977fbbc6832a9bc434458baa5a92a3dcd99e33cb185ffbc0e4d2f3d83610a3d3049793dfda39abdf4db9cbcd46b6f3c8d87643da9c29a3c9cc2443c28c9573df4920e3cc4c319bd284453bd8264933c19d9113dd82a94bd5cfd8fbb98bc3f3ce16059bd556cce3bcc2ec1bd53e7d4bc4d0d03bc38ab613d8082c0bdcc4f1c3ce65e5b3cff1783bdf341afbc9466f03caa63743c9d0eca3dc30750bdbea31cbcdafbc83beb224fbc36e0153d62fbeabbed1054bc5dca75bb2da3073cd905cabbfaf0c3bb1e5a093d4aaa7d3ccd8f823dfc1950bde88d9ebd3e73583ccc4a6f3c4187a0bce38a97bd59929bbdf69123bdb794223cf0f1b4bcb0bda6bc97fb7d3c196cb83b4a1a61bd95a8033dc79cc83b9dd656bc7614113d276932bdb70b4e3c7e2cb9bd97c121bc3fd32dbd27f1053db956b0bcb7225bbd12cd593df96a303bf94604be99619abc008e95bc7e53373d4f1720bc32f5bdbcbd610abd8ac222bd315115bd07fb713ce0364abb1753f03c5846953d82e15cbd777e10bc05033ebd422440bb7140f33ca7c9533d7cba393d62f0973d6c77ba3c6eea80bdb55d39bda92d0bbd4cff543cd0308ebcfcf0a6ba1aa7b73c2ab3e2bc96a7903d0aac223b82a90d3da32b9dbc0e87cd3c73bbf93c313cecbc58af06bd086bd03c973ff43c1d679dbd52587abdcfdbc5bcf7f5a83dd512e9bcf91431bc519510bb69842cbd089929bc9bafaa3c74c7a03cc42d333bfe7ba1bdf690aa3d5181b0bdd74e0fbddd0f0abd66c2dcbc2663b9ba9345e13c3c9d2fbcbd5d5ebc4aa3833d70e0e43d85c2e5bd6126473c4f7d073c0b00eebc1368a2bb5fb7593d836739bd71ba063de1ad0fbdaa85c43cfc90933d29519abb1c91bfbc6ad4863c9accd03de7148cbd4852193c0a81a3bc0429823dd12850bd86af503cbec98abce4d9f4bcc770c43b61a8373da0e507bc903f713d7fae8d3d35b0ff3c8b0d943d92aca1bc6907813ba064eabd0722103e90c1643ce072153c7f82563b3b84f43c2e6d30bc6090053d4390b1bc0891043bb1c34d3d0052473c2e6fdd3bb6de593d696366bc90d5d73c362cef3a586715bcf6fe3ebde3d8a13c29e6373d2575a1bd6cfc673c868a843c888dabbb3bd1e53cb4c218bcb33bd03b9b78a73c666b4a3dae98af3d47a29c3cd3733abce128e33c83fdf33b05b933bd971579bd1605513c99ca623d6e44a53cd39cfcbc87175d3dbede003c7c69bdbcd1fe2a3d0679883d6affc5bca3a13a3d75d0f63c658e513c7a91c23da3415b3cd3c3b8bbd34152bb8f22323d1e3b9e3916b1633c1167fd3d83c5bd3ced1c43bd56a6113c4e686f3cc6d2063d0307803c9ef1c7ba166a30bd97e5323d6f9eaa3cdceae63cc76af43c7b82393dc4ee9ebc7948a83ce380e73c008c41bd96bfbbbb04b44d3deeacf63c50e9733d	faces/620e637d-2c7c-4af7-b247-a3aebd5480c1/b7a8a3c4-8919-4e72-8e8d-5a40936e84bc/right.jpg	2025-09-26 22:39:35.539456	2025-09-26 22:39:35.539456	3eb01d13-b269-429e-87ba-0d6471f11118
36a78814-88ff-4555-b289-6c9c7cca0c76	\\x532a40bd63bea23c94b9a3bd2cb90c3da562e0bd6863af3bdf767cbcc7d8c03cb19f113d81ff183d53d8d23cc00c2f3ce7a8393c4d762bbd773614bd1bc8ee3b31a4acbcb1ef063d43dd823dca8a35bda7338c3cdb8004bd5e2dee3bcd6c00bd5cb9103d7f1a9c3ceacf8e3d12c8b5bae5c98bbd075b3e3dd4fcde3c274d0f3c1577f53c3e1f633d64729d3b018f05bdd126383de7b237bb5ee28cbdae021e3d551591bc96c44dbc0abb743a135e3b3c29a7b1bd6cb2943b9d8d8dbdb92afe3c0aff383d2bed0cbde7ad13bd60d5c73c11660abd4a1b66bc668d493d8d1cb23d86ca133df439853dd2b04bbbb9ab31bcbb4511bd13fde4bcb940293c3eb0aebda39c0bbb14d8393daccd47bb90025d3bce2d863d073b963c5b2db6bde76a813d16ca413d79dc09bd157279bd6ffa263abbb3943d9281acbdf1163cbc3f6c0bbd8442b43c890c2e3c0dc4203db8e8163c39d079bc04b2413da96320bd6d38a73b62c6cf3c0740e93cb3df97bdee78bd3ce65c35bd8c0898bc30851dbdece402bdf51f433dbbdcadbcdc90273d1a47e4bcf47d823c94de623d4273b6bd6f2877bc2588603df051503c71bb033d9ba8323d4a97d43cb76b7e3c961a21bd7d04edbc2ca67ebd6a69b33dcca1bebcc6f1ccbd90be39bd224b11befe9247bdb071bcbb1163c53d8dc1c53bd6a3b0bd771158bdb0f373bd4c55113df2142e3d4e976dbdd3f2153d068bd23c10c0e43c94c4e6bc58f7223d427315bd695015bdcc1026bd9b67f4bc4ec1cabd7a49ef3c8d1065bc522255bdf11cf93bd13ed9bb1b42a73d198059bd34a4f13d3f048d3d39590fbdd63adabb267edb3cf0b357b9de681e3bf2a6103c9deca6bcdbd2edbb6122273db0cea3bdf471383d49bd80391a5ab03d1fd652bc5756ee3d2f6e0fbc69266dbde8a4a9bcf74c49bd6519933d0f3cd63da736933c4142a2bb9356813c3582113dab77343c208eb73ba7d5c0bc19a253bd29d2d7bd11154fbb7e8db13dd80717bd8bfa9abd44cd14bd0eb080bd2ed3533defcec1bd9741c4ba959d553adcce5c3d86ae8dbd833449bbe1a08cbdfe8512bc53bf73bc2d52ee3c61bdc7ba68447cbd39d988bcdbac4c3d75dfdc3b4f1626bd5e2b3d3c4407eebaf7223b3dcf89abbc2176f03b3c6402bdc56f1ebd5ce236bcba085e3c70d0d3bca20cce3c32b89ebd790ba5bc624f843c9c2d933ccd1e8ebbec6558ba32f4273b6ef7743d0596a3bc5039c63beb9314bc108f313ddafca53c9c0b593d5bf50abdecd09ebb3024cabc8f0a253c4cbedb3c114a42bc880cfabc7b62333d1aaf993a81ff16bd7ea50abd50e2783d7263dbbc3419e63d9cb9babc52a0abbc51eeb7bc2e5df1bc90bac7bc6f25123d0e62ae3c94ec04bcaa52e53b9a06053d1f41823d1886fd3cc9f3b2bd55a218bd2d6712bd1205c33b57ed6bbd0437a8bcba337e3c2043e23cb6b6073d975debbc566782bc0289543b2cdc753d66f8fdbc41001fbc2784cabcd1a3c63b8f4d343d9599c2bce51100bdef59873d277929bde5f0d53b6df89cbce39f54bc4001123c7cc2863dc616bdbd8007a9bd4e74843aa51f2abd1a11553dee78063dcbf63cbd649553bd82c2aa3d37b4b0bd17eebe3d403a24bd28cf87bdb027a1bd82b3903c7fed01bd0f1bde3bd85f523c01e960bcc820b4bb084b393cf050643ddcff103d8546c7bd9da145bb53e22f3d36c4abbc57ba823dfc3226bd5ddff73c5a0382bd1f915d3c499f38bde2da633d70585d3cffe109bd5142cb3b3ebc69bd9edc42bd76b59e3d0a77003c4f0e16bc1cc20f3d7369163c393d2dbd0c615dbdeeb849bde0d8283dfc1884bdf595393c0be3d0bc33464fbd63d3aebc5fb0b9bc29ac55bd3937023d2182dbbc4b4a303d2bae59bd2667a6bdaf2d54bd94dca8bbc4fb743c758c9cbd64538ebc82d485bdc767453cadd6c8bd44e888bd3e829dbd442ce3bce7ab813d228a84bb25e8faba4454b5bdbaba303bf4907a3d694b5cbdbd0f0c3d8dd1b0bc7cd904bc0a6582bd839020bceec41bbbdf22c53cf8c0953c60a4983dc4f79d3b6c7c893b328a223d5441d73c4c95f7bc8362883b572b29bdae094f3cf6282e3dfaa6d0bc59235a3d2e7fd1bd1c8168bc5f4868bd9841c33de3564ebb0a28953be720e03bb1460e3d497d75bd6d9406bd3a645b3dea9d2fbd7df9d33ce0bd10bdd61457bcd54f65bd505d543c850f283d83a8ed3b0b6ec9bb0bac383d508c2d3d0896cebb26be8e3cfdda523a798ea0bdb8fd50bc926deabbb83d4f3d3b2b363d06bf7b3d72e019bd7560a23d3878dcbc5258cd3c0da273bcfc54a7bb1ca8983d9e3f65bcc2fb113d7c6b193bc850e33c92ca033c653c183d91199fbcadcfc1bc1f0c11bdbff7a63c08064d3d22ed053d91d3153db3a4963db0057d3dad7787bd21e0303de1e275bc82dccbbca240c4bcb0678f3de362223ce453fabc09c7af3c48419e3c1da027bdf849163be1a9b3bc3a373a3ca539033dfed7253ca46012bd60864fbc96364c3dd64438bd5cea6db929bb133ba51a5dbdeaf5dc3b16d7b83dc4e21fbc252ac63ce982a63df861153d133cc8bbe54055bcfc54d93c107af0bc627a1e3d30b1913d72ad803ce179bb3da2c7483d26bf8d3cb7098abdb0519cbd5305ef3cec6f6a3d2bad813cb98f563ae1758cbcb772ccbc1351ce3c4887a13d17c735bc5410aebc0eb0d9bb2325683cd5ba41bccf98ca3c21b0183d9b2417bd2a89b1bc01be293d251b0a3be8c0253992ddfe3d237d8cbcba4739bc746a203ce128d03be50cfcbba0b15b3cfb2a18bb9940c73c8413cfbd1eab463d073231bd1ad71bbd88bd723c86b8e8bc7fe9d9bc538f2dbcedcac1bdd398bdbcd1e81bbcb7a3d33ca5fd71bd	faces/f1bc0ec3-587d-4c4b-949a-ec502aafbf44/f74c57ca-88b0-4d18-9989-957760add85a/front.jpg	2025-09-26 22:39:45.460768	2025-09-26 22:39:45.460768	f1bc0ec3-587d-4c4b-949a-ec502aafbf44
14b96a1e-c311-4b85-9437-2f9dcbea87ee	\\x0abc5abdc49ebd3d7c700b3cb2ea52bd52808fbc685ec33c27e855bcd51fabbcfd3338bb545055bd6ae83a3bbd1a53bdd1280b3b989da93c2596f6bc13f53cbd6307863c3f76aebc3d0cbbbc250171bc4ee214bb7a20cebc3a45503c7ca71ebdc76039bc8675b0bdd8b3da3cfa5dbf3dbdb0bbbd92b5253caa398ebd7180b53d0e8882bd1468ea3cb01e0dbcd2a006bdae55293de66bff3ccafb5d3cfcfae7bc168fa23c434656bd8fceddbd715ff53c3e9248bde6dac13c09e607bd603ee53c2bd9513dbc3988bd1aac5cbdf12f04bd71fa523d6c5ef2bb607a093d88c9f0bc66a5923ce0c7fd3ce471b73b8aa8f93bcec5d33c589b323d43a84f3def4d76bd500096bd76dfd2bde08e203da3df06be20940a3db8e64a3de815febd6b939ebc88c5513d668004bd741f25bdd35b66bc860511bd485d6bbc550561bae3bcc6bcaf5d9abb7f8d20bd0e752b3930c7d93c753ad5bceaa1923d75833fbd054e39bb6fc919bd7280a4bc10d2fe3ca427f4bcbe68a53c9ca501bd3a119bbcf094893d6417733bbe316e3d8a8fea3b455ae6bbc7faddbcab87a83bed2e9b3d423f83bbea7dac3bd7e1d6bc1fbebabcfc6f323d3713233defd94cbcd14fefbbd827083d9257183d8ff5aa3c8983f0bc0a1ab6bd2d28a43c78267bbcda2c6e3b35abf4391e5033bd72b02f3d60c4dfbce01b24bca28076bc2a60b13c3920ddbcd2c83a3d8d59763dcb17f13c9c1881bd33be24bbb1735fbcada7c53ae686323c47e8463c882869bdde424e3d1d76cf3c3d003cbc189360bdf7828a3dd7e301bd64cf1abdb8fdc1bb5505593cf2ceccbdca745bbdc4861b3df190aebcafeda53d9557dc3c1184d2bc49167ebc509fdfbcc05a84bbf7e7c7bb08de5f3d156d37bd9794413c47c4dcbcb61c443c6c7a4b3d041a73bda32fdd3cedd48cbce2e8ce3d3caabb3de0b4abbca081dab9229019bcfd4849bcb44f58bcce90d73dd0604bbd587d1d3c4b861ebd53eadf3cb455933c078997bc592a48bd4d58d5bc9a81a33bc8c6013def2abebc319aaa3db4b4893d5011c5bb9440a2bdcd572bbd89ee883ccaff0a3d3e8a08bd1b4f1f3d04e04b3d361be7bc4712c3bcae90913b6c4383bc0b848cbc7382f33c285ce83cfdf0713c798db0bc0c40a53b619fd7ba1b56b8bd833901bdce8f92bc06ffa1bc138e88bb124a933cccf14a3d4263d5bcc48e7dbc4e19383d740b5d3dc18a983d40ec313d4c8b973bfed94dbd9d8c3e3ba6a4a73d17015fbdce20833c4415c53c529c7dbd0e53c6bc1908f23c5e4467bc4de0a8bc93e0933c3c49753d002702bc5d36d8bc052989bd0bc54dbd16fd81bd2e749d3c0108543cebb328bd6e7a59bd4715d93a65f0a8b9b4b7e9bc8ea426bb93570abd854a8ebc42b332bc5361e2bc16e5093db8d122bd078c25bdc3106fbcee3a0fbdca3ec63dce149ebcb7c9833c354c2bbda43029bc80d8fbbc2485b13c3b333d3cebfeb4bda7ca0dbd764d063c84dbf23d0ac203bbf63e8bbc68f3653d1e95583c196012bdad60133dc9b32fbd2644d0bcd7bb2b3db49a09bca4f4783deafaa33c2599a13b66495f3caac08d3d181fcabce28a353c0d1d91bd16b4e2bbab44ca3bdded833c57d5b2bdd041bc3c8ca29dbdb2f25dbd255ab13b22e189bdfc0cf2bd035becbcb2dafd3c2ff82f3d4b932d3d32b1aa3b33cb33bc8784753db165f0bc21623cbd9dc2303c832b703d392e423ccc74ab3c1ddda0bd1c5106bd60158e3cf39bb3b9b6a6173d3e5d8abd0005683d873db4bb93a9c93bf3753dbd655024bc9727523dfc30c83c5ba7d43d75cc1dbd43949abddd4b753c80cc54bdbdf8ca3c736075bd600931bdc6150cbd5ce2d238d0e6bbbc35b03e3bfda8b23c34ca13bd60a8293b438233bdd1cbd7bcfacf12beff6d823dd849923c982b433da5eab7bc794dd8bc611bf9bc5e237dbdfba0693c9a0325bd090d2b3d2528293d88a506bcd5267a3d0412dfbc3e1a1dbdc0c3d4bbcafe1abc1ef4a73d506c1a3d38e31bbd61c7abbdaaf1b3bc5af6acbc7249043e03010a3db1ee963d55ad53bd3c8e2ebdbdb295bd99171e3ca35da5bd4b4377bdecb50abdbcb4eb3c3191903c6592703c75705c3caf5793bc3ae775bc84b2a5bb148845bc18e7fcbc93ab0f3d65d45f3d3c92013d39df87bcc0138c3c0bb03b3ddca623bd1b38a3bcb454c6ba272dbbbc6d7e00bdcd53633b7c943d3caac71dbc13dea1bb83488c3c8d07123c33d7f93cf68fc63cbb3bcd3d47087c3cbef160bdc367923b2d28ac3b557deb3c3cc34a3d52726abd27ad513d306d1cbc641d9c3d7f3870bd43ab443dfa6564bd530f4dbcc82638bd6eba563cee54a13cd7bf943bbd6f2c3d6e5957bdec4b9bbc385528bc60db983cc8077b3d60af653dd1ff4ebc553a79bdbbd76ebd28dc37bb9076003d118d763d76cd1abdc29f013c8352953c8990263ce3d024bda0de043cbe8e6cbd062728bc9454f5bc1e63b03d5063033dcb1523bd9647bdbab8db1f3d225734bd9a837abd3b5e89bd7684fbbbea36873ca7bb70bd231082bdced03c3df3f58f3dfcc3203df18315bd641527bdb3c285bc047c2d3d8113823c52361cbd626725bd3c85fb3c64d2c7bbd9c6103d85f6913da67fb5bd6e9ab2bd8ab852bd2efe8e3dc864cd3d06788b3d7fd5fabc515bee3c54ac05bcb87a68bd2fc967bca01125bdc8f8fc3d1533643b1ec041bdaeffa4bb8323873cc0f79ebb0b60ad3ccdc292bdba2f563d8b7c3c3ddbffb0bc6ede843d874e69bd58b380bda2a1a33ca0d2acbb57657b3bff2ba83d6777053df2be453d121f94bd7edcfd3c294db4bc97f351bd2f56b83cdcbe0e3d9f1d8abd6c72f43b4b515cbd86854a3ba369833d0399a93a6482febd	faces/f1bc0ec3-587d-4c4b-949a-ec502aafbf44/f74c57ca-88b0-4d18-9989-957760add85a/left.jpg	2025-09-26 22:39:45.825784	2025-09-26 22:39:45.825784	f1bc0ec3-587d-4c4b-949a-ec502aafbf44
a6fa7d21-d84b-4531-8ce7-715b78112b7a	\\x71654fbdcedd053defd32abdc04f9abd8dd30ebe3612b03caac7563cc9fd0cbca043133de9568d3b6971c23b932bb9bc6177ce3c681392bb19554abc1149c93cd0d699bb24013c3d2245643b4b1393bd6c7b653dd509923bcc739c3cb7ad1fbd37e9913b4d9f0fbd1b9cbf3d77cb463cb9bb93bd24ecad3dab38a83d5ffe82bb1249083dc46bb73da10b223da751a7bc35bd373acf7d85bcaf2015bdec7c413d9434f73b44f178bdb9119ebbc2e9813c04f164bd464c263d6edc78bd8a8f263d67b543bd03c600bd608a6a3cfc700bbd99e459bda26b3d3c6f10803ccfbf263d4dbf873d9f9a963d1ac715bd2a7626bdcc83a1bc16bd02bcf5d1eebceea1ebbc19e3473a91190ebb6cbb763c1700abbbab55083de61fa93c9739b8bc6b394fbdc9b0b43da2c17bbc35051fbdd79bb0bcfbcd943d304435bd95f720bdc93140bd3e491cbcfec6b93cfa97d23c7c6e0c3d7fdcddbceeb8823daa918ebd861a6e3dd4f3343d621da8bb98a237bd082b6c3cb6ade43cdaa95b3de2d2edbb23d792bdc96c873d2fa3ffbc3adb7f3cdfcff2bb6c56083d1a06063d8ad0bcbdbb0d0fbc1d149fbca8ea263c66f3f7bc4467f23da8cd193da17a5b3d49f5a7bc6565edba5eef1bbdedf3c63ca3a21bbd1e8032bdf78108bbcefd04bd7b64a33b58296bbcfb71043d236986bca74681bd8db76f3c6b12543b6981853c3dc205bddb9edfbdb92c7a3da7064cbc019ba3bb302412bd80f00cbddc400b3cbb3662bdea3b04bda13da93a0fa993bd25947a3dc2a730bcff9644bdcad4823c06a9373ce59e593d2a1581bd3edab23d30155c3d6689ef3ce87601bdcf7631bbd9921d3d932134bc1b3ce2bc5eaffabcf88a08bd0ee6c33afca611bd4c520f3daabc1b3c27a9a93d793a85bd6362a83df39a193d5fce03bd019232bd4d6100bd7a44843d7725893d77365b3d2c197c3c1081f3bbd889053e0eb46a3cbf1c853bc5f05a3db4c35dbd09fdb5bdcdee86bd6340823df05f11bd24f276bd3a2129bdb02f21bdee67a83c0d5c69bde84c24bcb4944abc9724203d7af89cbae87980bc81e723bd3cbe7c3d2a5b673c140dcf3c516f12bde41c39bd25b341bc87cec43ddbe2833cb0c9fbbd1be3343d671e92bc0dfd053b78009dbc4fb3563c20192dbdf3c4cdbc8df8093c4d70e1bca0578cbd5ae2043c7cea81bc3d40a1bc310334bcf1a2c63c2432713dffc7883dcdaad33b8578b9bc23df24bdffee41bd45f1153d34ceb23c84ad7bbdd6e61fbd03fb92bd31b1f03b384e043d8be8edbcf9921a3df625e03ccdc211bc85e6143d114a593c126c123ce9f22abb22ac943d1f9eabbce436823df0684bbc080b02bb131addbcb9f724bd99a570bd715439bd96ffadbb4183b5bc3bd5653c99a7933b0b89703de8eeba3c8af785bd60cca8bda3e662bdec7ee03c1cab76bd2578d2bb420a8b3cace2e83c149ffd3c00ff2bbd10be683d8403383a9a3a923d916dcebc242d18bc4bda293d3a5d84bcae16b13cd4c6aa3c306ef4bcad29f03cd67e23bd32b9973db896c2bbc61b37bc9931063d44e8303dbf3c56bd6578efbc459f6c3c84a9cdbd3d9e163dbcca9b3ce02c68bc2e7449bdae54d4bcc243fcbd3636083ed73b6b3a99621c3acddb95bd3d8da03dd6d54f3d436b52bc0abab13c52b999bc8710453c2fd485bddf13593df34237bca6c78dbd3f31273df2a2afbcc28688bd11a4bb3d20e7c23c31b719bc9c717fbd68edae3c40a83dbdf7138bbc15bd9ebcc71d18bd7bdce93b164d9bbda492df3c9872333d21e1c23cfaef70bd67359f3d333717bd60bb10bd092198bd671c1c3be26962bbcaace0bc333c07bd2c5865bb183f1fbd6f8b00bd7936683d07e180bdf6fe373d961667bc9b46373d8a0663bd85d344bd43aa0cbe56e8053d3c7a193d1b3b7dbd50b5b6bc0a121e3c244d92bce9b91fbd8c9e14bdb66d31bddcfc47bc458bae3d43b647bcc1abfd3c6c6d60bc20c894bbbe63583ddada8ebcaaf0873d6e8ccbbb0ebf84bb5eac85bdd56797bdb3eb1cbd7e95fc3c29ac703b09adf33c2493393d1496453ca3bd283d8f0c323c48d686bcbc3200bb7d3b09bd4c832fbc2cdc473deb841abd7d45593dfe6592bdae8988bd9d5295bdb054da3d5132793b725217bd08470d3d9aa3563c20a483bd2b8583bd35c3933d1c2eecbcbd76b33ba013edbce05993bc62ca04bdcc40b8bc67692f3dbaba453d8b1999bcdd265c3d29cc18bdcd121a3d7aeb613da9e5883c57c62ebd262a5abca486bd3cbc66593b8db6013bf4d3373d711604bd6af68b3d5221c2bc98e15a3bcdb26b3ca4cde83c5dd4b63d1cfbd9bc4023c7bbd7e20fbdd17c4a3d69e20ebd842cac3d024c253da00ef4bcc37039bdd785113c0468f7bb842e0a3de45b60bcaee9793d94d18d3d380076bd5250cb3c40f6143b1d8cbdbc414a74bd40604d3d367c94bcb61102bd19a8c53cb58639bcbe30f9bc44e0f33cd1f87fbcb848323ce45cef3c6f4e033c24d951bc58fa0f3d4a575dbcc73cb03beb3031bdfd55b6bb4b7ba5bd5e7ab2bcfb6f4f3dfce5c4bc40f62f3d8baf603db60d0e3d6b9496bc57788bbc45b2363d4b94eebcdcbb8fbc3c9a323dcf1761bdfb7a9c3dbf5f6d3d7636a83bb09e75bd9c9589bd1b8ed93c001f6d3d52a4ec3d0bdb8abc8298f43c7953afbc3655053d7dc1ac3dfb3c363d3d10693d7a13213dedda443d0533b8bc266453bd6993303d497346bd19f67dbb7276683c1327903b3108143dd8fdc43d87f0323dc9aca6bc0de2a33d1497263d79869e3ccf6a2d3ce906eabbe648ab3cabf894bdeb290f3d936cbfb955141abcae45293c8c797fbc461d64bdf109823c4c7b51bdc8198e3cadd7033dfaa815bcbaf76ebc	faces/f1bc0ec3-587d-4c4b-949a-ec502aafbf44/f74c57ca-88b0-4d18-9989-957760add85a/right.jpg	2025-09-26 22:39:46.200932	2025-09-26 22:39:46.200932	f1bc0ec3-587d-4c4b-949a-ec502aafbf44
6b50a75f-0b72-4922-a38f-ef5d4663a676	\\xf79b22bda4c5ad3dbbcd14bdff698c3c3ee41cbd8594a03c8564a5bc65bf013dff8a013df275a6bc58ea4dbdac93ad3c530007bd81e002bc4be728bd8bee1f3da9872abcff99663c51f8943b53c340bd91354e3ccc42db3ce6206abc85ca98bd169cd5bcbe4b553dae037d3c67cc8f3c5f3a9cbd080d4b3d7bd06cbc4e37203de9559d3d532ead3d43951a3d6117f5bda4e127bd1a4c6b3c6f2056bd0275a43da18a293ace60b13df74c83bdc1f7b8bc1e948ebd349fa03d7299803c9813a33ce136873c814944bd622fc23b824e373c5a3ff4bcaa68d43bb3ae173d817104bb0071c43ce0c679bc330d8a3c048596bdd6d587bc50ea77bdea90723c57ba92bdeb7a393ccf4e163d4fdc2f3b8ace80bd0b09323d113f1ebc355484bdfd828e3be42d8e3d430e3c3cef1f68bdd87be13c7a28eb3dd0f57bbc7ea91dbcbefe8fbd09cba13c876bff3bc89ff33c935f2f3c32aea2bb3dbb663dd58c1d3d2752e0bc53bf43bc8db78e3c267c3cbda3a4683d006b8f3c23e579bd989f03bde775183cae0e023ccdf7d9397f3e11bda0591abd3194173c023c87bbbda260bc4493953b8012c5bbc24e253d3806993dff78af3c7c751b3d5351fc3bc50b88bd6cc38f3c9e3108bdfd735f3b1ffbabba5dadebbce076b13b6a7ce5bca41ece3b2aad99bbc3115d3d7388aabdfa9083bd195e183da0174f3c7b3eca3c6e81a7bc354e7dbda9a0023d1a63a8bce987ef3d114a2abd3a0334bdabeb313dfed72ebd1c319ebd8fe03b3c61ec41bd788fdc3c14d12dbcc4d035bb09e607bc98bfe3bc39c6903df555bb3b18e6a63dcd85b3bbb2894abc9f7f763c1fb2423d8d17633c948fcd39cfe9193cb2bdba3befb87ebc3847cbbcee63533dd7bef73c67b53a3d1fbb8b3d72f380bd9dcf1b3d45afce3b966ebbbc70203f3cf33641bd76e4ef3c875d3c3d75e6443a137795bc7180233da4d91d3c794b343df5d14a38257d6dbde2301bbcba876cbd22f184bb2049d93c1f438cbd81ac56bdab801abcd22f51bd53ce0d3da001203d665de03b9c07d1bc23a87f3dc4084abdcaeaecbcb5e92bbde4ee8a3b156cb8bca374823da69c88bd39f30dbb4c4388bc62c780bc98af153d92519cbde13276bc5826033df7bc473d26fc76bd0240bfbcea2002bec4cf6b3c9d639abd3ba1e2b9bfddcfbc56f5a8bc329d363c501240bd9b97c33d01efbd3cf3f8c23afe3e8b3dc66cd23bd6d72dbc2427953c730d1bbb8032ce3cf5c4023e431855bb2dc00a3dba6b15bcf43015bd43aab5bb79d6eabc108ad23cf95c95bc3245ffbdf6fd9ebc541d25bb209bcf3c43b51b3da88c0c3c9f0265bdaf3d0f3df479b13a6ca80cbdfc98483dc4f310bda3ac7f3a36c6433cb59c653d200b423d7cd7993d449db63d7b02393c5b078b3dc1da85bd716618bd03c306bd220613bc77a8edbcd3c5a33ce4b6aa3c6e22ca3ca0528cbdd16486bb4dd858bc9d5f85ba1613653d2da2793d2f278cbd886d9ebd4e03833c644b043df1c10cbc29f8b4bcc808c83ce28d933dea6078bd356793bcdd14c73ce8c453bd4f37933db97a40bde1330ebc5fe0643c997390bdee4cc53c92d209bd2a30efbcbb91fc3c01ae803d8c72833c655c293e03f4ab3c7a60a6bc63b643bdce1b0e3dfb092e3dc117973d0267bf3a7a7d03bd456c7fbdeb590bbcb33dd23dad73d63ccb3be9bc1041cc3cb0af323d7478e1bc7cc6fa3bcc4f4c3c3c13813de860fcbcdb6e33bcf1ef27bd5d84cd3cfbebe9bc5ac491bbef67abbbd0ccf7bcff1063bc14ccb73d926f51bd723814bdc313503ca133303dd7069fbc437482bdaf3994bd66c2073d0e0547bdac6dd0bb5b0341bda7ecd7bc281e1abd647d0b3d313628bdc84926bc8e207abd82187f3d51abf33c29178ebd129693bd47f3cdbc3b4785bd1fe025bd97ff8fbd50cbc3bc406827bdaec7a4bd85add4bc899692bc0016be3d3e52c03df80ab23bc7983d3c14794fbd9ebb9cbc75bfda3cc9373cbd694ba03d7e022abd9fe6bfbc6a25d6bc7693f83c48e33c3c9861233cc01702bca7e1a93d3139883d198f563d46e8053dc36e103d739f63bd2b740e3c33c786bd81c8a1bc7c1a9fbba1eb34bd7183663ce3680ebd9b84dcbad09d4bbd1efc9d3d5122263c7bdf39bd2d5f8eba7fb2553db05aaebb9a8f77bd40ef59bb8596263bd27c8dbc1344c3bcda0be3bce12107bdabd17e3bec40c03d2e02413b7769bb3a6bf5fe3c83ebc5bc2f13903baf42d73cfd01583d17945cbd7271cabc1a1b89bbdaaf033ed761033ddb6b8a3c7a2169bd07a6ed3c62aebabda5744f3c481a2b3dabbdb03cc2c4a4bc99b18abd8d6a7139d191c83c61b8f63c42f347bc1e11a43da4cb14bdd87bb2bcd95c5f3c85ad48bd8e70733c7885bb3cedbac43cf2f7cf3d4635f8b95f666dbcd22099bd1697c43bfe643bbd176b513dd81b113d566805bda739e6bb578d4a3d4b1b9f3d68b690bd26d7f63ba6f1e7bcbd44e73c1bba9c3daaae16bc03f793bc458d643ab63881b8a80d91bc2f1a1e3dde66b7bcadce163c606df0bc44ed9c3c41d6873c0346533dd601df3d625a053dbc2e23bc3e92f7bc6401d93c5e9ab1bc160b89bc3c7d4e3d4081fb3b2525b13def4e21bcf43dadbb3e14abbde05d16be211e5c3d04be083d5b911a3d8a2b093d78de0f3d44d230bcb529a6bb41fbf5bb0a6ced3cd57121bdba60d53bc28af5bcf73e883b0990923cceaf573cc27438bcf66b023dbec6213de6e3b1bca664203b569da83d3e17aebc955887bdd0b6de3ce6e452bc3e4b9f3da3769ebd7da0173d1ccbdbbce58070bd4197853de8abb93bd2f74ebda59632bc210a59bcb527a1bd697a32bcda039dbc42c8f3bbfb4c593ddcf38fbc478096bd	faces/e9b485e8-e0f7-449f-8911-a299a1eedb9f/05fa97e0-6b0b-4b06-aaa0-2a8f08b1a6b3/front.jpg	2025-09-26 22:37:58.481954	2025-09-26 22:37:58.481954	e9b485e8-e0f7-449f-8911-a299a1eedb9f
da575350-2668-46d7-a82f-935e7ef64f3c	\\x6de006bd1a3a643d0c4994bca5cf67bb3be018bdc2c5473c918e46bb2612afbbd265b83d79742abcb69c7a393f9d4d3dc555963aaf10ccbb0b2a9fbce121263d474f1abb6274233d7401a03ccb3e43bddab41f3d1ab5893b26440ebdd32f84bd087451bc5157f33b86b1ae3b399a003d9a729ebdf4c98c3d32c4073dd88ca23df1eea73d0cf19a3d24dc403c40c784bd7ae0fdbc56f3023d8b9832bde591ca3c4242c63cc6b0e93b24865fbdd002c2bc35729ebd6169bb3da2c0b9bcb2fcd33c989f1f3da015b1bcf73ef0bc80de23bd71580fbcfc93303dbe9b8c3c25c1ad3bc185233dbf07383d7dacacbcdd239ebccec31abd79eb76bd61d53d3da5bbacbc66f4e13ce24d813d17e640bb2550e4bd96329a3ddfbd40bc4d5081bd26df183cc3a2863d21af46bb0c9981bca5451f3c2787c33d01add13c90bd33bc932334bd3938863ccbc7843c1255043d26efc6bb150700bd0c92ac3d0b89be3b1b424b3d7ea6da3c7fc4ed3c177eb1bdfa58683d7849d63b5a2ba3bcac67dcbccdb1363c1e60a33c668fd73c1ad202bc4a8b63bdd17556bc8014653d0d36713ca01931bd08cd013c465855bd9958023e4981243dfa241a3d65769e3c4455a1bdba35853ca90ce3bac26cec3b4817123c499e6fbd68dab4bcd5210ebde2b51ebcac47a13ae997393d02b232bd4f8224bda09c6ebcce67df3ca657e83ca8b42fbd466474bd140c3e3d3c3550bc7f97113edb5b46bd5fec803cf1bc943db303b2bc3f6ceebd6ed3233d06cecebd1f134d3dd71839bba93b87bda1b194bc1bd255bbd2dd3d3d33809cbb7bc3943d984636bd6b02203c059d903c562d89bcf151bcbcd6500fbcc68ec13cfaf72bbb95386dbd4ff8c5bcdab5103d28c7d63c695b6f3df978913d5103c6bd3c4b513dc756463cf5d34cbd4ceb123d279ba7bd661245bb8ca4773da319cc3de1fb80bcc7b9ca3cc2952e3d93ccf43c9eac863c145bbabcc9a167bc98c6c9bde41318bdac32033db69d7ebd86cf03bd476c3e3c369b11bd49e6403d93062439e5c5df3c04cf263cce41593d00e117bc6db2d03bde4a66bdb05823bc6ac01ebd5ea1aa3deb8509bd2460eebc24fd80ba3f0e34bcd853273db45addbce8159ebc2eb6dd3c1a2eddbb27c111bd81381dbd23a2a5bdae5940bd91fa9fbc02c059bbea60b1bb9fa30b3d3803533c6c0cf9bcef679a3df90f443d9334293af64b333dc776783cd86ee3bb676f74bceef4abbcae18c13be852163d67869eba656c6a3ddb4176bd715f3fbdace4cd3c1e8af7bca2d5a9bba5fda1bcd363afbd62880ebd125d19bc208fbd3db2142e3da2f6453bd3d325bd5758033d5cc155bd2053f0bc979b833d9b3a35bdaa50253d0d3a40bdf91b653b37963b3ccae7a03d14046a3d66e7193df761a63d9a3554bd0777e43b1b792bbdacff303d5d6cb539ec85b93c8c279cbbdadbca3b8a005f3ae4354e3b956fa9bc7a5bb4bce318e73ce52cab3c5dcda1bcad3d94bd677dcb3a60bf7b3d2e4a223de22829bc4334853ce991693d1b561e3d56fab5bc2d25ec3c8419083c0ad98e3d7d986abd1f941ebc68a193b9a61eddbda4d0763c2ecdd9bc13359cbd5b49fb3bf811c03ca6228bbdadc1a03de02a653d8007babdb6429abd6028393d01ccf93c2a2bef3d7ff7743c099431bb44dedcba2250233db0b33e3d976a37bd1a399cbdb6fb55bd0a8edb3c479fb6bcf32d583c26dc503d0183743d7a5f41bdd4be153b88a265bd9e58c83b043318bdf42a02ba3191e8bc8306febca407d2bc5b5e193e31b8eabc83b248bded3be43c180fdd3c3b8814bdcdd60cbd3a1084bd80a02e3d9597a8bca38b983c1a853ebdcdc840bd0e4a16bde85df63c1eb67d3b4108fdbc608ff8bdef29813d4024b93c82fa2abd88faf9bccc92bfbcf88672bdda896dbd85931cbdf6b61d3bd85d05bd29b497bdab981d3cef7ef7bcb562a63da49eaa3d7ec1e63ba8ab643d20ee0bbd408cbfbc9e97893d0f8b36bd6124773dfd9cfbbc3b73853a835e6ebd35c225bdcf1517bcc4a33bbd96df95bc16f2603d7bfe943dd1974f3d89cd073d71cd80bbfe1693bc60090dbc98fa83bdc23b13bc53b7e23c395a77bd68e3f93cd08474bc9b6200bd4f8ca2bd5eaa333d4e853e3cdc7f90bd2a72393c7269473c93114dbce45640bd2ee4f83c82c1843cdc12e73b21e806bd4b86e2bbcb0014bd2a6eddbc602de93c0ab3bbbcdb2339bb675c0f3dc0192bbc4daf483dac78753b6c0b213d35f18bbdde8f09bd33c9d93ba2ba3a3d6513cc3afbb44f3dd1fb3bbd36a0f93cb4a962bdbdf268bb1ef9653ce78a493c800988bd0cc8b3bc3303a6bca942533d501b663c7e89823c31ea923d3a1406bc9c0b8dbb872dccbc44e912bdfc467cbc10229bbc7e53d23c7a02ab3d1c9db43b2abcd73a1e0969bdd6c1a13b5e7901bdff93fe3b8692dc3d7902433bae8d453cdd11d13c0499743d68259fbcda1d0fbd1522d23c7d28b13c662c313d96f6d93cff24353cb64924bde00efa3b3876fe3c5fa7123d2efd39bcd5a24d3c36fcc1bbd4702a3d1c98e0bca63e423df9cec53def424c3c0c2f83bc92fedf3bc394673cc2aebcbc8cf9c53bd287c93d9edb563c3b2eab3de665dd3b7f5f5dbc957280bd4a7c91bd6e3abe3c314abd3da4c1643db8b78d3c8d5a393d0c9b5cbc6f2d5abc48b52f3d4892b13c3d862cbd4c97203c861157bbc95fef3b2eab8a3ca5b7063d389b6abc294906ba04cc453d91f456bcf8b61cbced1f103ea639903c7c9cbfbd102e193dafbb073dae25b93d95202ebc45d0423d35972cbd2feb3abd6f82ce3daffeeb3b4a50533be23249bc8d5b23bdf60a22bd98da8dbc92c31abdd692fbbb9a7a303d3b0c91bd9857d4bc	faces/e9b485e8-e0f7-449f-8911-a299a1eedb9f/05fa97e0-6b0b-4b06-aaa0-2a8f08b1a6b3/left.jpg	2025-09-26 22:37:58.908803	2025-09-26 22:37:58.908803	e9b485e8-e0f7-449f-8911-a299a1eedb9f
58db8dc0-3179-40c1-8813-b9afb1a37897	\\x31dd79bd3d06dd3c67e66dbd191b46bb1305b43a3593083d61e96cbb44702e3dd6d8593d1159eebce725fb3c841a8f3ca1d205bc424ae43b6b3419bd0b14ddbcd6b7e1bbe0532fbb75355abc1d0e8cbd48a1f73aeaafa03bbf81bc3c77a1acbdd3a8903bf56c373c15f2efb9896a073de32e43bd073a553bba951dbd51bf963dd2fdd3ba1facf83c162aa53c19e8f7bdafbf09bdb0b3f6bce9f12fbdf68a153d40ea5c3b75f3d03c922e02be6b35fd3ce50879bc19154b3d5e321bbdf5959f3c58ac263b2f1f21bdb37e56bbad3753bd8eb04d3dbd60353ddb152c3db1bc053d0309c6bbf669d9bb027fd8bcf0cf68bdfd08873c370bc13a8c8f553dc5a12ebdb712e9bbbb54edbc2325e6bcff1515bec726c73dc99fcc3c3854e5bd4f068b3b7bb3b33db01527bd91a54cbd87d9e1bce0592f3d607064bd752516bdb29f86bd922f253dbbe4d2bc8338883d78373dbdfbc71cba231ab73decbe51bcdd039fbd513ccc3a377f9bbcb10bafbc69d5b63b1441ad3c869a86bcb09d32bd4bd18a3db645acbb4275573ded14163dda990e3d5f65c8bc34791fbc1d159abc89932abce713b1bca2fb24bd75e2883d2436ff3b0f551e3d58ea503c3c96f8bc127a0bbd4fca833c90efbd3c8afc31bd7be8b4bdbbcd943a9ff840bd3ac916bd1a3291bc1be02cbcc1d155bde0addb3cde24bcbc6ecf753de9a3b53d36f52cbdce29bfbde618813d89a1e93c2ff61b3de10d26bd4dd2023da3d6213d705523bb8e6494bd780ddcbca6b574bcf941583cbdf4cd38a789bdbba5648a3da3742bbdd698243d0bfc01bdb367ba3c4a9697bdab5c37bd1dbfab3ca131fe3c1bb9333bde7b923bf0dd81ba8d1e9dbc1ae8a7bc9c60a5bc305ca33d519db4bcb0ae72bca44b1f3dd4a9cdbdbe756d3c487104bd9aab4ebd0c29843dd7c321bd8cbeb63dba0b213d632aabbc2e1e59bc0d2dd13a6da6983c10780a3d6e5aa03d1d281bbd90b8aabcdd47aebdb2a68b3ce390dfbb43a902bd394e16bd47d523bda47f68bde744803df3da8b3c8050413cdfc37d3d56d93c3df65c3fbdc61b19bd0a1cc43b4d3a5a3c29a208bdef6c973c791c353ca2c643bcedc60dbd01247dbdf14952bc632b01bdceba533df01efa3c44ab953cbe84153bce450abc3024afbdff1691bd80e1d13c63f34cbd428bdebb96b984bbbc60083d3b5da1bb3b7c00bd942b8c3c83ede13c921e7b3dac33343d926ae23c73d3783c127e16bdb0fe9c3c32bfe43d29c59cbdb3299d3c17d242bd46fee3bc9aead73c8145a73b5cafa33cb362153b82f992bd860fd9bc1e451abdb085313de119883b4c01ebbcf53598bca5f334bbd3a7463c26b24dbdb377b0bc38751a3b3deb203abd7540393e55ee3cdb480ebd5ddfe13c3d318a3dc92f8bbd2e81133d4dfa81bd04771dbd72aa043cec3ab83a9a600a3d16a45fbaca5f903b558b6abc583814bdc93440bd2ebbaabc19a1b3b616ed96bd727a27bcf90188bd789a04bd156beeba92bc13bc2688d3bb651b213cb8b767bdabcc5f3dbef740bd9551bf3c00c29c3d49a66cbc9ec8403dfc4bdebc12e1a3bcea8c31bb49900dbd444295bad07b3ebce484bcbd5c53d8bcf6b05b3d41bca2bc86b84eb9162351bc795ca0bd4d3aa1bd4011bf3cdf42873bf3fa123c45613dbd01bc73bb0cf50e3d1093d03b2bde813d91f886bc100210bdf9c42f3c5c27ba3b9c570f3b48bec1bbc70cb0bb9435243db2ef15be781a75bcba1ce7bcd9abaa3c226f6d3d2efec6bce938e4bc4d35d9bb7dc6063d4b04413d234b2bbd6c700abc31f3023db35c943d2f9b04bd4c48efbcf02d7ebd2ee36cbd23753e3d42406abd9c0045bd06baa7bdd4e1d5bcb9bc4dbd0723fe3c9f1fe03c55e35bbdfbf1cf3c68033ebd134088baf899f5bd588c933c37bd04bd628c0bbdc58378bd577860bd578e49bdbeac7dbd3ac9293dea443dbc75f7c43d81e4ef3d348d95bb93b5963db6ed3abdacae353cbc502b3d209c27bb919a593d358541bd9c67efbc61d5a1bd24af813b944fecbbf5f16a3d4d67a2bb39bac83d89907a38fcd8f9398b291ebdb300c2bcecb3ebbcb5cd623cd606e2bc4220863c752b35bd4bd954bdc7690bbc17c9a8bdb4aea7bc082df0bcfa4fa03c3df8573cc49851bdc7c8613d220d7c3d8a02153d1e89debbca8d633d68c993bb089d0d3c9d9150bb55ffbc3cbab0d13c708c93bdadeb55bc95026ebcab97973ad66f353dda640abd7d3dda3b8009913d84029b3d2ea2ec3b2548b9bc200368bc31fc643d3e14283c5b7db4351ceb5dbd3e4f0e3df6eae8bd7062043d7abb603c85e334bb4da228bd260941bdc49583bddbfbc73c00de003d0810103c70eb093d3bbd70bd08f1abbcfeaec53c15b3c2bccd227c3d356f803d903b79bb2751743db71081bd944b7c3c6f6d813b5e7f213d7863d1bc8437ee3cfb64953dd6ca11bd3f6544bde453183d286a803c07cdbbbcd968b6bd42acaa3c81af033d0e298dbd29ee0abc70d37abd498e50bdbbb62439aab054bd5a759cbce53eb7bbeb61e6bcfebe03bcda81963d61e1613d6cc8f13c757e233d9bb07cbabc3200bdcffafebb7d8ac03c2bd409bdb6e57fbca7e2d33d83161d3ca8cb863c3d02333d22fc30bdecc6d4bdfd8b0dbef798413d8163c13d3712aa3df78809bba51a973d7b13f9bc369e77bced5c0b3c7c5abbbb0350aeba3879ed3cb8a906bd76d6b7bc04611f3d7f64013d7d9589ba48835abda2908c3df0df063c1123c7bc4589af3d7db036bd038031bdaa4b4c3d1ea29bbc96fef93db42517bdafbab13cd110efbc96a41fbd77fe033d3d0f95bcc385bc3c71f069bdacf5313d15c110bd9a0dca3b5c072abd09ddda3ce7cf8f3d3b81643c76059bbd	faces/e9b485e8-e0f7-449f-8911-a299a1eedb9f/05fa97e0-6b0b-4b06-aaa0-2a8f08b1a6b3/right.jpg	2025-09-26 22:37:59.331021	2025-09-26 22:37:59.331021	e9b485e8-e0f7-449f-8911-a299a1eedb9f
b1003476-4ae2-455c-bc63-43286dddb22a	\\x193027bb12a590bd59aa41bd10abbf3cc7b4b3bd214fc93c2c90643cf250cb3c1e8fa83d09e5a03c2c1f3e3c8de3953b245744bdeefafa3b34a09fbd7b25773dc09c3dbdb01b78bc436cc93cd72f443b199895bdd6854ebcfd68943b6ee6523cd224df3c94a1bdbc4879393d38181c3d3c500bbd6a51843c74a0feb98c149abc963c213d47ee953dff1c373d332e02bc71c1cebcffc0553d3deddabc19868d3d25ce38bdac95ddbc5a9fc1bc3f26ce3c51120bbd0955793b7c0d3fbcf9cad23cb44e8fbc14b8773c34e4afbc58a3583d22015fbd66f5f5bcac6e30bd2e094ebdd5b14a3dbcda0a3d7aa5373ce9f214be9e876dbcc5a810bd77e1083dad01bcbd15e3963db2bc563caddcbf3c4cf3083c20451d3dda2af3bb4e7ea8bda9daac3c77b7f73c7c49383df7fbd3bd4d6d27bd01ebab3dae74a53dfa3d9cbcc5735abc70fb433df2ea20bd316cb33d5df924bc274eca3d58b8693dd0f5253dfe39fabc1a7f28bd19be083db8f55abde98fc2bcbde2a43c8ec29bbc44e3afbc415031bbc7d10f3d38b8a8371c8cf13bd8692cbd38b88cbdec3404bc3c3fb4bd7cb3df3cba122f3d52b11f3d4e12843dd07f0b3d5b081b3d4d6a25bd97c105bd9842e93c20dc3abdf43b763d79c6f73c6fb4bbbc8939363db65c3dbda19dbf3cb13e41bde017303cbc011fbda7b510bd3346d63b2e95563cc8cafe3b356c96bd67f437bd35508d3dc5d846bde163db3c868d29bce6bf053d21af8e3a16ef4fbc4d60453c06233dbdfd74ecbcfc95443c4eb0d4bc050ab9bceec3493db6f530bde640873d905306bd5b18a63dcf88943d0c9414bdbc4bbcbc00dbad3d08ff813c476e92bc7e0e4a3cd272a9bc31fd243c24d1edbbc6aeaa3d8f0cd23cc823b43cf3d5183c839501bd47bbe03d72cee93cf6e3d2bcdd62cf3c86e043bd173405bdf319283c5ab31f3de37d68bb8e507a3cfebdc7bd09e4513d7c685fbd555238bccece6fbd27e451bd6a044a3c8e0f19bd42ca62bd64bb90ba01a112bcac1175bd628a193d7fbe723ddeb286bce7af163d5bbacb3cf3c268bd687384bcc62eadbddd0cec3be1eaefbc7b03be3d88e74a3cc5a8363d03d4c8bcd787d03da7d724bbddda54bdcca2bfbc24c5a83d1b1d3abd94ca36bceaa4b43c990528bda4e0a6bdd6cdb7bc4da5f4bbfd9ea3bdc7d8383cc6442fbc723b473dbb97193d5724b93b6ca4e53c5d010a3d34afedbc2571dbbc654188bd8a0434bdc6db47bb780aef3a640ce6bc5e81323d5aaa16be599525bc887410bd286054bdc760953d3fc5efb9589c3bbcae196bbd0bc12a3da185df3c7dd2f23c55c209bc931e41bd2f990c3d7def573bf1fa5f3c326b513dd14dc0bcc0e615bc8d0a9f3c52d4d73c26764b3b8dd3383d4ea8843cda98183ddde3323d3eef7abd0e1b26bd69b85fbcc9524f3d2555053d7bab6b3c8e8755bca530f9bb2411953d1595973becfc033d1e6caf3c9136b23d5bea213c481384bd5595f1bce0b649bd3413993cfe12c73ce951c5bd76be4b3d40d901bce2eea2bc4f84a03cca9578bdb33474bc62cbe83a887d46bc4d154abd7d8424bd3c9e1cbdc47e943c605017bd24f7c83c8f1bfbbc9d9f40bd0f3c38bcf08e013d0b9d713db048af3ce0034dbdff528f3cced0cabce4ebf93cc29f0cbd976af73bc8ae30bd924905bdd489d53c7cf2363d7b5c8abc621d82bc45a3f33bb7e56b3a982c67bc8b8d373d52bc633d10028bbd0b74c7bdd123d63ccba1c0bb4b3ecebcc53727bd00787ebd9e872cbdccd72dbc96e18a3c6c8c733cb44058bc290d383c3e11363d3795f5bb9adfaabd57a5413cc719b93c24dba03cbe6e5b3ca199ccbc1a5c7bbd8c0269bd21639e3c5178b23b3031f3bc7c09143d9fbc033d2117bd3a98c000beab6386bbdba0c93c5b5059bc43c7dcbc50eaf2bb46f0b0bdd10763bd9ebb85bddf63323d37238cbcba899abc44c2a43d50a8f63a0f820c3d4e98c2babfa78abc6432ce3c5183dabb2419b3bbc251093db6e183bcca5b99bdbd9f71bc67b525bd3f59433d60418a3a7703bf3d930c253abd98323c91c90c3d2eb40a3dabd859bc2acd8fbd2b00853c94c2923dca3e45bd6cb9813d59edbe3c898505bd1d1072bd487ec0bd24a4b4bc96a5733d15e31cbcc8c08c3c7f81b63d8b6fbbbc4d59c9bdecbac0bc3a8a57bc40e881bc854733bd3b4a0bbd32889dbc0bb9b73d15d2833d51798c3d7f2a2b3d5fa0293d73748ebdcdca35bced25273d65e186bc23f26ebc6de88c3c069556bc9784103da633e0bcbb4bd33c7bd3383dd352973ccb67cabc00f9dbbcf4c63d3caf35303cf33ec838a88accba648c16bda155723c69b3aeb98f43f43cb77bfebb488a07bc2e527cbc10664a3be4e8c83ac36fd4bca251373d066ec3bc2cf3053e3342143d6d26ecbc755d833d896f99bc7602f4bcdbbc8ebd00bef83d49f2c2bc9a958c3c94920e3d030b953c73f98d3c0bf673bce944c0bd2a85cdbbf435443dacea91bcaeca06bd771c463cc49aa0bcae03f2bcdbd5ec3c142f8c3bafc2873dc5c2b6bd91c9dcbccca618bcf7fdf23c7ce82f3d87aaa53c970d8abbb04609bd900a103d7a8fc3bc6c39d2bc10cbd63dd0a142bd50014b3dc9608c3c8c470ebde9b89cbda92bb9bd8ded9b3d03717b3a4e68d4bc9f13bd3c0ebbdc3d7aed04bcefda2cbda36cf33c62e5853d3968c53cd8ca983d7b5e523ca0d139bd290d213d47439abd24d71ebccf40843d51a1353cf3547ebc7a0c123d647a133df43851bb0a5b58bda09d4b3d904743bd596b3d3d20b173bc6ffbbe3de7b0fabca0cc1abc6988f93c39312ebc4e9cf9bdd0864b3d55d2baba34cc97bd0f38afbcf67773bcc0ad99bcbaef853d187951bc934c153d	faces/7eb0d73a-ec1e-4da6-886c-922a3a695651/67864434-0348-44a0-960f-5851b12998ac/front.jpg	2025-09-26 22:38:14.366241	2025-09-26 22:38:14.366241	7eb0d73a-ec1e-4da6-886c-922a3a695651
56b4de17-80a4-48d0-bd2a-d07130ea906f	\\x624c8fbcce5d26bdea5ccf3b258f2cbdfc4192bdf111943cddc3133da165a53cf06f203d7ca07c3c7670b939e09a18bdbaa058bd41a1383dd7a7923a2308c93ddfa9c6bc9da5b6bcaf6ffe3c89a83ebd02db2cbd5272f13b52e5d73adc75b2bc3646803c6ccb33bc86362e3ddd34aa3d97edf5bcec06153dd8befd3c56c8663cd1e8143df1779b3d1651613d7de5c6bc93b288bc52ad173cb27823bbe52c883d94e70cbc5a0b64bddf71d5bca0233a3c7a3804bd8570303d5dafa8bc79b610bbfb7d543c61d4cf3bdd3f71bc70d6a73ccab3e8bccf8052bc10c0363cb16dea3aeeb1ba3d20ff3b3dc22e193c2c69e1bd03acb8bdf7ec63bd4a66143d61da9abd30ce4d3c54833b3a27cc03bddbefaebce0fd243da96eddbcbce421bdd88515bd612a8c3d81b56e3c33cfa2bd93b975bc68a2cc3d25b4a53d78cf8bbd618f0abdb45a2b3bab2546bd0c73993df36d4fbc0343f73dee1d3c3d5f49453dc4ee773dfede9dbce18bd43cf7e69ebd7359b0bc4ab1723cdb20973c11dbdcbc90e1f4bc17566cbccace023cd5c8bdbc758316bd75ff58bd7150943c0a9bc3bd20f7babcd314843c6242453c30c8f33dd46dd33de109343d1dbe043c889ba2bc09aefb3dfbd951bd4ad8a63ca5f6363db6a30abcc3bd833cc25782bdfe3a68bdadfe4abda3c4babb944a80bdc8dd15ba8368093c0d36793d1841253d55cad2bde8c44fbd5b3ec73c94dc76bd9b66a13db8b923bdf1e18cbafb3e243c2d51893cfab88cbc338ab7bbb1e593bcd0edc3bae9671dbcf274eabc0976d83c0c04e5bb1cfb703d349aa7bd3523a43d9905023d2925653cd46213bdf310933dcaa6223da7f69e3bc70f383d34daf6bcd1cb5cbd980d90bae4fe5a3da78a683cf9cf8a3cb8c25e3c547ac1bda6ae203d15dafa3c5a5e20bd63ba16bdb50dc03a47c000bd49d0f73b06d4cb3ce480ac3bdef64ebdb3b85cbd923361bd85416a3bdfcb4abc19bad9bcf28a9cbdfa3f35bc04eb1abc72ffbcbd2cdab9bb26c80bbd1ffa13bd164ca23d15f0bb3b8b4a39bdad04123aaf43383dc3dd2e3cc7afdcbc4d4f013c410109bc90be36bd82ce9e3d2ef553bc8537e93c72fdb1bc3b51ec3dce08f73b59b431bdbc61f43c6605503daf90493db96bd3bc485ca5bccc1eaebdc6e459bd2252ecbab3577ebcff5739bd837ea33c5bdfc6396b6fdd3cd0a5373d9227323d9a3905bd70cc8f3df56611bd780534bd957e24bde2ff13bd2644ddbbacbae0bc6b2692bd97a976ba0290c6bd1470a0bc8d7d27bc48b68fbd0351b03ba5741e3c12003bbd038321bd7436033d87793cbc5f786f3dd2aa013dc69f1dbdd5b7623b4ae4a4bce5a5aebbf2bde03ca648253ce90f53bc0317a33c5989563c4c55093d1e55063dd7d222bbb0ffb43be663fc3c38b257bdf13440bdef3f983c7de3663d102a51bbb1cb133d283dd43c1a37e7bc6d719f3d6097dfbbc8f27f3d1bd28c3ba6dac03ddbebaa3c6517153d2b2bb73d2fe945bd1cb2dd3c9f8d033d57619abdbb71133d96211b3db55e3bbc0092493caca129bd8a1d7e3c0a81013de94ab1bc26d14bbd4c7341bde6577fbd721e373a2cd064bd839a7c3de91872bcc3f45fbd73256abdf081ef3cb2ee523d20227cbc29bedcbcd4f7923d93c3ad3b65c7a33daf5520bd9230253c65c0f6ba296fa2bc41f96e3d9776583ddbe791bc4438a9bce60069bc4902ab3cdca4263c9a2dd63d6a4d883dfd5cafbd7f509dbd4da851bd9a37c6bc90b82dbbfb4756bd190384bddb4089bca9f11dbc2ce3b2bbaefba33ca3c6e7bc82b3b9bca844323daa94923c63bbed3b3d1cea3ccf290c3b28b9c13c76fafebcd49d24bcb65d2ebd47f870bdc86522bde29812bc748dfcbb720d43bc7169c03cfa41a43cb7c39dbdf906e3bc58d00a3cb77a35bdaee1b3bd7dde0e3c13482d3bccbe53bd2e9f4bbd30a2803d81a3d2bc302a02bced14f03d4618babc3eec733d4b72debb4f09603c2e3aff3c3c3c273da978edbb9d59423d6bc963bc71bd48bd250c1cbc9c552dbd12884b3bb7fd8e3c2297773d9bfa81bc0fc8963b46a7643db447643d21a80bbc760736bdadf9f03cc256983d7bb5cb3cb977223d1362d7bb355eacbd793c97bdf6d4bebdc73a0f3dab63173d5ff6a3bd58aad93bee2cf6bbf23dbfbcdc90e5bd4dfe58bbc24c2c3b07e15dbc4f3349bd7675b7bb0ea293bdf763923dfee4823d70f88c3da7ee3d3dd29cce3cb71b1cbd106c183cb2249e3c668008bb006297bd509e9e3cc6febdbca5f8cd3cd10a0b3d246c0b3d9870fbbc41a6d4bbe53a53bdc1d91ebc8c65d73c861d3bbd275402bd562aa4bc07e94cbc61732e3ceeacb73ceb86873cb4eefb3c1b6d00bdf736233906afc8bcbfd6dfbc2dbf9bbd7999c13c0e860d3b9fbda13de526ab3c6e70003d9785133eebcaeebbdce3c73c3fc5b8bdbf77d63d7a7cafbc20f3123c05129f3b9cf05c3d604b6dbd860332bc54a07cbd6aa14a3c35c8683ceba29739cd3675bc84a3973decb5a0bbe9293f3d02b8753cd0bdb2bc9ac24f3d6177b1bcd14090bc34daa3bc9e1aa6baee4f203cb87d89bcf3cd1d3c3e90323c4d115f3dc671dbbca05f823c8287ef3d7ab181bd8d3c983c912be83b1d988a3a7c0c8fbd2b7c06bd35883a3d85fb023d2501c33c5633803b0816653d803e5ebcc902c0bc1be48b3dff7d993d61ddeabca860a93d879874bc5c3741bd5dc6e93b27db84bdc9685cbcf02a8d3dd486de3c0761253c4ae4deba068903bb19c41bbd672ae8bcf3e5cfbc30b9b4bc8b7ab43dc2f757bd5e37433d4c1babbc44101ebd9e0b813d36e9dcbc1e3c4fbd71780b3d2c34fa3bc89894bc45a6213dfe7babbc2e54c0bc0a61a53d4bb48abc38ba823d	faces/7eb0d73a-ec1e-4da6-886c-922a3a695651/67864434-0348-44a0-960f-5851b12998ac/left.jpg	2025-09-26 22:38:14.833653	2025-09-26 22:38:14.833653	7eb0d73a-ec1e-4da6-886c-922a3a695651
d094d2bc-a8a1-4e99-85fa-13fb45a72643	\\x581c82bc559467bbf23d5cbd634209bdcdb9adbdbca5143d11a6cb3cc70a073d7bb5a13dafd4e6bb76a4343d4ec2263c7f1051bd44c3eb3ceb194bbddd6f303dd7ceffbb23afd5b92f716cbbf23700bd74484dbded741ebc9cebeb3babe82e3c08dfc93bc6c35ebd92f01d3d44ba843d9872d5bdf6e66e3b17a5a1bc3dc316bd27bdf1babebc993d6969e03c97c103bc4e2ed6bcf14f893c90cbd73cd5ff0a3d9c0bfe3c8dac1b3c5895a4bd0343833db853bcbc17b0263de1c4cbbbaa560e3d370398bddcb42dbd3cbb8d3c7081bd3c901872bd910f1b3d20ee113dfe4e653cabd9ae3dfe8f1dbde602a63c072ecdbdd799dcbcf5a79f3ca889863c075c4cbdcf1e2a3d029e82bdb4db453c3d71cbbda2fccd3c04b0753daa1ba1bdc3f2abbcacb8943d704e933cf1b9e3bd22ebd6bccd6ed33c9e96fb3c9f520ebc5bb2ffbc8a1f4d3c434373bdbef6e43d1b15a23c97028d3d6b77ad3d6726f6bcf9f2babd760f27bd356a183d3e82c4bc5d53da3cc293ae3cf46dcb3cadbc39bd729c5f3c13b1d53c8f25303dc840bb3d6ddd3dbce30c82bd635b04bd9cb138bdfb539a3c92872e3d09b8a53c0946553d69f7813d8950e33c8a01e2bcf295b4bc6ed3d83cbddc29bcdb6831bcc37c52bcfe3b01bd4233bfbb1e44b3baf99dd03cc8e39bbc692801bd201c63bddb7912bd77e7133c0f3032bcc595183d455cc7bd44235ebd8102e63d02405dbdecafb73c5b1e30bba775803caf78463d324a1c3cd6238dbbad1bbebb17eeb13c4a579fbc4e0cf2bbaf154cbd6dc4a73d0af705bd43b0393dfa293bbcb2ca2e3cf59699bc3d821a3d05ce5bbda1cf0c3e34abfd3c0b57ec3c605e70bd40140cbc71560fbd47a407bda5b5003e545d29bc1a1788bcb34f5e3cfdf91dbe14e01f3db377673c0adfb6bc5bdc9ebcac16073dcffc043be265bc3c6489963bee92cf3c014a85bd04c287bd59fdbab85a65b53c7da24ebdb5593bbdd5e086bd1116283dee077ebd7c1fc3bd805d31bd86bdf1bcaf9ad0bcdc44a63c0d0ddd3ca9e3423c335c033dc462093c61cc3ebd3dc75abd453db93cbfe1513b2bdf53bc5bfd653dde81783bb1da4f3db747a0b9a884453dc12513bb79ad09bd8470e43cc0988f3c9f7481bb5ed79abc6d7b873cd4534d3db05a9ebd5978353ccaa51ebce31d6cbd9b5837bdf280393dadedc23d5c2a773c097f4dbcb392eb3c31945d3d35e8f73c29c86cbce2a72fbb30b9a4bcda6b8bbc2098003efff6babd46035bbca2ea06bde97dfdbcd7c05abc69b745bd9c318a3b8c51c6bc80872cbccd95903b70ac14bdb3333f3dd87dadbc939fcd3cf2c6e1bb4a6dc8bcf507ed3c38c6373ca588c6bcf193fa3c59397bbdfc8a283dd0e17a3dc3cd8abcd3710d3c1b73273c00e208bc83d3143d563a9fbd01c27fbd97b2e93cb220fdbc5dd0c23d55f7983bfec0103d2a5708bd867197bdf3158ebc19effd3c1811ad3ca9c4063d66044abd957ad23c71359e3d9aa5e9bb4e21633c8a8dfd3b98e454bd85b63db8f2b49fbc97185abc20b7773d2b5e32bb8858933903b7b83c6919d33b753fbfbb4f8b3e3b1e979b3c38da17ba9852efbc1ece60bdd287e6bc7843afbde9f55dbbed1c7ebd70da10bc2f517bbb94ab79bdff94c03c632150bde02c86bd012e4dbd36bb123d194d6e3df447313c454ff43c5b2b943cf7ccc43c3af03b3d8746483bd8bcc6bb840d023d9f07823ccbea413daf62e5bd13953ebdce419b3c434827bd7b5a863c841217bd8e2b703c652b183d7f0c443d76af813c8c8f6b3c96d791bd36dee3b9890e9e3de39ba83b8092043a72a2fc3c3bc68bbcb92f903d24c37abd593955bdb8a6a4bdff2133bbf22e813bb2d2ca3abd5d1e3d7057e53bb7a28c3d81b245bdc08589bd6490a8bbea3a9d3bee6968bc26c9993c831d8abd3136c5bdb5de023c19e25bbd0fa7953d3c56cebafded2e3cdec6ce3dcd61debcccc62d3d27ad52bc09e4243cd1b3b4bc70ca863d15aa60bc6810843d048d34bd4ada6dbdacd71bbcad970dbd27002f3d9b57443d46c0993d360067bdefc52bbd7f74dbbc886b763d5957bcbcc8cb85bd69d0ae3cd7719e3d3797b8bcc383253d3d628bbca3d382bd49df10bd310e54bda2bfafbac09ae13d0e15413d60016f3dfe93303d10815bbcdcc285bdda209d3ccb52b1bb2c78abbc045233bc025c923c0ecc1f3d3b3ba1bc40a7dbba6739a53c59a9283d8dc8d63c78fc91bd06d9bdbcb331313db7290dbdc0e9483c772b843d3ab96ebc9206c73c4588173d7b274abcf5075dbc512b70bcdaea5cbdd60a04bb1b80d4bc695dfcbca1410bbd24b27fbdc7a90cbe02e111bac0af5a3c47a5ac3c17be653d923d6fbc8b6693bb2d585abdbc26debadd4f113d5126a73d1fd7cebcafc0b43b6f6731bc61dc21bc6050cd3d1a59763d913fa1bcc3c0a2bd250b0cbb179713bd2b15c9bb9cb7eb3cf2f4d93a6e7ac23cb84982bd362dbb3a27bc7b3caf6f353cd7895b3cbbb19f3c0afd4ebde0e0d5bc0db324bdaca2c63c77cd6c3c35e567bc39625dbdda0b5abb5f871c3d273929bc467780bce4a344bd910626bb35d8dcbb19e56abdab0784bd8df064bde71a893d548a49bd334becba8179413dca81eabd6218b2bdd28171bd091f8b3d9ee7fd3c6e13bb3c74ed1ebd10c9a83ded4380bcb92c003c63302f3df91c3f3d2e56803da6f29a3dde3343bc7930d0bc85b920ba4eeb8bbdfd8f3e3d50cf2cbdb77ad93ca75c0f3dddd8c1bb4fd090bd437343bd50b7733b77d00f3d5eb842bc00378e3df9e09cbad226663d276e0abb04d8f73c58d28c3c9d867ab888f514bdb45f7dbc9245da3b3ae16abd2cf0ae3c1e98b3bc59c93d3cb681913df54931bd7ba4bd3b	faces/7eb0d73a-ec1e-4da6-886c-922a3a695651/67864434-0348-44a0-960f-5851b12998ac/right.jpg	2025-09-26 22:38:15.562656	2025-09-26 22:38:15.562656	7eb0d73a-ec1e-4da6-886c-922a3a695651
73620bbf-d649-468f-a92c-6278429211de	\\x68aeebbcb8c97b3d95bf1ebcfc76103c13d0bebd0f98d4bb2992a4bbd661ff3bc7491a3d31adb5bcf3b1f53cbaaa813c15ec7d3d8de657bc0f7242bd58e9f03c9ee0c43c2894d93c1519643c68509fbdc25276bd2f0844bc40bfcdbb366335bd3066443cd726033c1621ee3ccf835bbc2915073c11bc103d2ab54abd894f153defaac53d297aaf3d1d72743de0b596bc0bc03dbd1d6d103d1b8e133d900d1b3d0353b03c7b6f9b3c580cfb383f4408bdca899fbd7c92ad3d7799153c3a667c3da81a513c7464c93c0f682e3dff48313dece653bd461d06bda24dbe3ce9343c3c660c823d18c8573d30396dbcde73e8bdbcf180bde92c59bd4ea3703d538a8ebca2d22a3c98f10c3d8bac0d3a96fd6db91d8eb43d966686bde6a4ecbdd52caf3da828803d4d71cc3c2ab3b5bcfade06bc0918233da05d80bd252b25bdb0726fbd7caad33c2084123a3d91373da896313c0a8ba83c713e963dd546ebbceec670bdf2b58d3dbf0909bc665203bd1301863dfe1e483db428633901c4f9bc7cef53bd6d3bad3ceb721a3cd20e00bc2d392abd22dea8bc36240c3d6fa223bc684f13bd0ddc243d53e3e0bab65f1b3eda4133bd8e97f43c8a57c1bcc9bf00bdc4d3053b4601c3bcfeb0863ca6ac5b3c50264ebdb57803bc912b8ebc1ffa4fbd2b489439e3bc2a3c70cb34bd303f193db2bf663d71094ebc6da74f3d828a42bd4ba220bd8dc2a1bb4db074bdb9300b3ddaac5ebd85f4dbbcd92a6dbd9e2f0cbd8a5d4ebdb34f20bc31019abd40ba83bb3e709ebc928f4cbdb9808f3df43f61bb3073823cf7cf6abd74c7d83ddcc689bb363da0b7cac85ebc6342853d40b0a53d1620823ba4d3553c3ef897bca029703d4b68b3bc3436bd3d7131d2ba7de29e3cec13ca3d584a7f3c13418b3c18a94fbcc4159ebd036ab43d004a8cbdea871e3d0e4015bd644dd9bbfd75a53cf6aa3b3d2b3782bcd42747bcee162e3db8994a3dcaea373c78a6aebc23ca19bc7e8d7cbd42cea4bd094ed9bc6f2699bde67d723c6626103c459e9c3ce541463ce9044c3cc9e1573dd29eefbb7b13edbaf238fcbc4f0ce8bb9b46303cbf28a7bcd0815bbd7722f2bc7168693c5a07803d744a173d296e5dbc9c8188bbd88456bc896e493d097c37bd7bbb35bccfdce8bce7be9bbd5870ab3d7bf4fabcc94e7abd61dea23c6d48573bb4edaebcdd38bb3c4ba0e83c56d9ce3c106e843dfa66d4bc553facbc4b700cbda6558dbdfaaa9c3c38de8b3d6ac93fbd0b0be13c6f788fbdcad968bdab7d953c18029abdcf9d233d2b0cc03c37712fbcb4bbcd3c3d8936bc379aae3de8c7333d99773bbd826468bd8300f73c29c021bd27c8afbcb071cebbd523b73ce46821bafb88febc57e2b23c1b9fd7bc8e4d353df749b83d413b103d33871e3dcd0481bd9ff2d2bc6724073c7110973d24ebb6bc1317b73c8207cbbbf99848bba51148bb72e08a3c6bccdd3c63a8cfbc3e68683de0087f3d7a97443d10f3e3bd8217eebcad6b373d3dc6a4bafa162abcf9d52c3dfc9c413d16dcd6bc52a343bd6c7489bdca8dd43cc7c4663d0643cbbd1ee684bb7845e93b49fa5abdc077533916dbbfbd121086bdfda53abc4046a93c831e90bdeec7ba3d38f239bc526b553ce82b20bdef2cfb3ce1bb4d3c18ef993d0b7564bd7b28e8bc593997396d0e08bd326cd03b462e0b3c547a5fbc9a19adbc17512bbb7498a4bcacfba73c76255d3b5c0a373da9f9443ca89b2abdb51b2fbd80100c3df2f24a3c882e22bc042808bd4a3c44bdfb8585bc8cfba83cbf5f57bdc75c61bd00e0643cdc003bbcd4c842bde610bbb9f0e993bb07adeebb4026373d24cc93bdf0be483c12ef57bd43059b3cda3ddcbce2242ebd528d38bd8220eebdd152893d4238fa3b0bdaaebde1df24bd611d673cfc2c123bb371edbc02190ebbc3a9babd405c61bd06732ebdbd87423bb5f9973c78071cbc1979903d6f43c5bd878c2e3df8215cbd54a7ad3c2f7cd7bb621ebfbbac1dfe3ca457d13c91b728bd748e9fbdcfff11bdfd3449bb1acd5bbdcd1dba3b11cf093da15a15bdd093243c529d2e3dc0b7fa3bf215363ccc0611bd9d3201bd7cdf043d9bdf48bdb7e2473cb8ea89bc381de7bca76a27bdeebd99bd534fb23c2460d03db76505bc936ae9bbdcf2b93cdac613bd661aa2bc5f7a603c537c0a3bc6e7ba3b65698dbdc41aa23da4f0abbd4170423c51c59bbc59878abb78d0ee3b6868263d238e3bbd2ebfdebccf18023e00a2583d4053a2bd09e99a3d894592bb15d556bc5f33a03c36960d3d4c99f4bc7aa1e73c34ee0ebd9b864d3d3fe24c3d92c8603c729f2abcfc956c3bbf62aa3d163f3bbc4c3d593c41bfddbbc8620c3d528d50bd31ec873c96603bbd28769abccc29a3bbb208883d758d58bdf00eeb3da0ebb13ddfe51f3bced1ba3db7bea03b5150953bf5db10becd10d63da1f237bcfa65513cd43afa3ce0bf173dc94e09bd8ea6a33cf05c2139c0c277bcfd8ba13d46dbdc3b8b0f943bf544243d4ad403bce296193d0a57213c61f187bb7f56f1bc2e189a3b8a22063d9e5b24bd04947abbdd8433bd2921e93b8b8ca23c55f4123d833effbaf20f34bcb2d5353df132e83d9d53313cb1ba183daaa3463de8b661bc9f6988bc6716d8bd938cad3cabefc23d3caad33c230a21bd1f1ee13d75a3a93c25bdd9bc5377db3c67d3323da58a91bb15b62a3deffc0e3df94073bcf00b873d18fb003da7aadf3ae2327bbc59e4273d9185653bb974d43a8f756a3d2264163d0384fd3afcdad73b26d962bbc177f23cfc5a30bc3b5a343d6e2385bc906855bc8169143df70931bc1f2ef2ba0f0fa63d8a7440bc63d35abc7b08533cb9afe1bcc627f93aaadc6b3d29a7583c37fb073b	faces/620e637d-2c7c-4af7-b247-a3aebd5480c1/b7a8a3c4-8919-4e72-8e8d-5a40936e84bc/front.jpg	2025-09-26 22:39:34.652378	2025-09-26 22:39:34.652378	3eb01d13-b269-429e-87ba-0d6471f11118
25bc9e1b-b001-4691-a91e-b4b26d74644a	\\xab166bbdf7ed163d116982bdd1bd913bf60787ba7c36ed3ba04decbcb7ecdb3cfcbcc93d2b76e23cbe38373c53a3633d26dfbfbdf2a679bc36d28c3adca5d33ca893383c5c47813dd908e5bc52b3a0bd94ca2bbd17562b3cb73f8abd354eabbd03b529bcb2153c3c35e59f3cefdd87bdecd083bb2f57513dcb01063d6a63023d12a6bc3c157dc23de423053c3463eebd2b7c1ebd2e44e2bc60e20ebdfa6e743ddcdae5bbba570e3d3c5b39bdf2759cbcd4bc8fbdb89dd33d8df48f3c59e8973d5a812e3dc1f08d3c953c773b29b21a3d30a51bbd4ea7d23bdb9ae13c792a553d8d121fbdd4e2e33d1d47753ce37661bd03f5983b8c186ebd51f1e03cd11a8cbd1e95473c90c91ebcae44233c84e120bcc4766c3dd2c222bdace35dbd37ad903d6f84193c50345dbad755843ba86da13c412f733d3508b2bd514188bc57e90dbdeb1da13db49877bc4e0cb33c8311113de3c722bd8db50a3d15bd3a3c585237bdde0a4abca62579bb69561ebd75aa6f3d8f34d5bbb420543c95b650bc433ea1bd3d550ebd1624633c9b5936bc5a6d393c1d4b1abded3a093c49ee88bd7244053ba887babcf60796bd900fa63d27254fbc02361b3d24c49f3bd6a34bbdaa93093d1302dabc9c1eb63c105d423a64b2f93cd5ec0a3a5a8cbabc4d42adbcd1e2d3bbdc47493d83ac23bdc82201bdaf9a473d9e707b3c773c863d0fea0b3b5fd5aabd213149bca356acbbdd4b843de0bc06bd5a11a93c22e9483d3ea1a7bb68c73dbd1b6a89bc8017bfbcb117a53df79c9abce884d53cbfe73bbb4614f2bc4517423d0a23a5bc95a47f3c8632593bb9fea5bc93c36a3c6752973d2c319ebcc2d1af3b560469bce97e00bdf756463dc7651fbd7aee7f3d013899bb395a6a3dedc1e23dce5313bcda368d3cfcd8cebc807142bdfb1b853cbefe1bbd933d8e3d7ebb3bbd865f81ba9b87933b9c65db3cb7b9dcbc22a5313d4647e83b6f8c95bb5410febac6ae06bd76b2b43c6fe3733c9b63cbbd866a80bd89cda4bc94ec02bcc553d1bbd1159a3d95b2a43c4314283c6d1bee3d923ac2bcf18c3d3b66177dbdc46a8a3c381167bdf793c53d93341dbcbf050ebd384897bc42080dbd9302073cc375ccba61bd5a3c5e56953c0375963dea22663c43010bbde22d0fbce75664bd4e7be43b39bbae3948af7ebcd414c03c41657abd3fbbdbbce264d73cfdb6263d5e0005bd1ce7b03d87e2083b62c9373c2fb719bd1e5cf3bcbeb2a53cc56704bbb74339bd4e0d9e3dc10504be186f2f3c6016b03b538a943c7dde113c7358193dfed1b3bd41b98dbdc57c9f394fa02e3d199197bcd3d73f3d6da52cbdb98f5f3d6a9d8abbaff4c73bcf5049bc94eca83c6129aeba96de10bd62f0b0bba74b8abcf3de833dca07883d8089f1bc89fdb73dc48b4ebd560682b8da7764bd62da903cc7493aba167f07bc1dce5f3d52bea13a44d97ebdf99cc7bc6500fbbbe1fa663c3a920e3d8ebd1e3d4643e6bde6d8e1bc6500d33c90ba463d075dee3c5781fa3b52c0ac3bc7a9913d1f0b17bd3cab683b9883d9bcc9a480bd52d4e33c6b3639bd70d9773c889313bd3be2c0bdfa90b0bcfd1a6cbdc37190bc5c1247bd6682823d8cf296bcac00b23dce921e3de83e92bbea3282bd76254fbde7102a3cfe54853d0f05c2bce5e601bc2672e8bc727e38bd23cbaf3b8dd62f3d7b9178bc6ffdba391cac34bc2c53bdbb1edc4f3d01ea26bc5c583b3d11068ebd35d1583d0e9532bd1fec5a3d8578b1ba862fddbc858f02bd8899173d2487243d7203713d3b6212bd1d7d77bd6901333b0c3d063c8fc9dc3bda3507bd4fec91bcbe6bba3d8e4aefbcbb8f82bde853acbd5fb069bd9c0749bbad0d243dab55083db0c2f2bc582e93bda360b03c5fbee63b56ad473beabc08beec9816bd6b40373c21d5a9bda11544bd920a97bdfc4889bc12185cbd41d3043d26e7d1bc09b7f43de5b7533d2737e03cda44ef3c6b2103be7b33173db596d53cb6a30cbdc73b853d562412bd51ad093da5ad28bd93e4203d7c16e7bbb34f3bbd322ca33cf157b53c47e8e43b5c1bfa3cae3e8cbd10a2d03b7b565d3cf85f483df20a81bc639c51bd69cb983ccd4328bc326293bc4de249bacde7343d3489dfbc527cf2bc1ac6fe3c6650d3bcf430a4bb804d223d10e53d3d6d1dffbbf221d53c16b5ac3cc5abbcbb76b116bd99cc893d15fe6cbd2c371abd6d2e473db1a2b0bcc6939e3c3aea6cbce3968bbd9e6ec5bb8c260d3d4c07a73dd461c9bc5ffa89bc00614ebc49f05f3d9415f03ca4a309bccfb61abd5a960abae8d987bb48e01bbb78105bbc3b31fd3c9db640bd9957723ceb0e583d01559dbc51b7f33a19156d3d9fee853d0e0d97bd0136dbbcc42377bcb2cd14bdae1351bc2fc4833b5a2d0e3da3b9e13d24e05bbd2b11ffbcf296e8bc47c5743b509b98bc8f88e43c724e263dc0fde2bcd451003c79342d3d23c89f3deae9c7bd1f564b3df38a363c167b4a3a5abd8f3dae8b9fbcb13f01bd555565bcdfe1ea3c5c787b3b1224c2bc014ce9bcf0c92cba6e4163bc87ca453dce50753b15aab13c6b93dd3ce86f8f3c6b06abbcb5f2183ced8d4d3b1e88c0bc219b443d6db9bf3d769a89bcf8efac3dcc25683d6be50bbc9b4c09bd44cde3bda2e4143de0206a3d0e8ae43ddb4e27bdbee3753d8556453daa38323b2f4f2abacbcc0b3b709558bd443228bdf425b0b8e77375bd6382fdbc9ee8713c588583bd2c8061bd469d513d0c588cbc23eff43c4879d43dd9c71abdb28149bd68aab53c01424a3ca437bb3df21f5bbdca0c8e3d8b4f7bbd29f629bdce81913d420f363c28923bba8ef87bbd2f52553d03ddf3bba0529e3cbeacb1bd705b483caf2b09bc6e03713c7136633d	faces/3a7130a4-4459-4a38-ba0e-5a6fa0f1e4b1/778d93e3-2994-4d81-b4c9-df4c558cf91c/front.jpg	2025-09-26 23:07:21.60931	2025-09-26 23:07:21.60931	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
daaf63e0-dbeb-4038-b23f-779a72bef2d4	\\x4fe81cbd2021c13dd2bfdabbcfdc35bda2d02e3da828253d4ce6c5bcec69a63c977b6f3d19140dbdd685523deae820bc715d26bdabeb193c212ad4bbb97011bd5cc3673ca400183c750288bd74134ebd7f5ef6ba1a79043d9c4f9c3d8aaf3abde1da8bb93f8a0abdd7a9dbbc9253623db19d82bdcb5f20bb52a29bbdb205323d701d82bd58aa773d0f0132bd5264d9bca648203c6fefad3c337f353cf15f27bd7a20873d548421bd076e1dbe02c4dd3c3b0fa5bddb1da63dd068d7bc1c2e5d3daa59fb3c0ec4a5bc91488dbc1608e3bc785a183d46ada2bd9a62713c9c2aaa3c1b23d3bcdc8e713cb1e1ff3c00d7babc210d883db4e6663d634b163d4b3f9abc4de7a63b822fcdbd3a20893d9f62d5bd3ecdab3d61320e3d2e752ebe8c1f92bd3c48633d9a7ad0bb3faa5dbdb997b1bbd3cb1bbcfbbc0a3cdcc3dfbb5ba6c63b9e00ff3c4d921dbd19a3a13bc613313cbbd083bdef80803df0339fbcb9cc7ebc91f577bc0c487ebc28f428bb55f2493c62a7043cf3c6ab3ca40f45bc00d9e83cf9dffcbc4b83a13d6bfed53d76c0713d1ab1eabb4ad7913c6b0bbcbcba0790bb154ef9bb748ad9bc2d2f5fbda61df53b4050903c90fc35bc308121bded5dc03cd9f8543d8df9643cbadcd03c7d2eaabc3bf831bc05a1ee3cecb2443dc732a33c31199abbdebccd3bd08d6a3cc23eb7bcc88d4fbd19451c3d6a5cefbce13eb13dcfa0573daed41c3c893d50bd9d06123bc36d8abc8381b1bbbff3183da2fc97bcd63dbe3b22fcb03bd2db093d5ad6923bcb5f25bc4c57353d8dff1ebc23d083bd18c6c9ba9a11aebcd13dafbd17120cbd893852bbf29e16bddf4f173d85b5253d3332f7bc18a3993ccc21e2bc4c508abc101a6b3d24f5e8bc99b674bd03fc443cf02005bc61626fba6bc433bc5bdc53bd8247433d6e44d6bb9e8d973d5b742c3d22e7353c6e84653c3780febc9a9f423c5d460e3dcfcdb33d5c640cbd81b7a33c6f05f0bc76e0913cfaa91cbd16b929bd56c771bde2e3023df3b33a3b42e6233bbfe39c3c12a5063e842c8b3d5b4aeb39e94c53bc1c1f4fbdd6bc023ddea27a3ce77f53bd685d3d3d69ff3f3ded4c103c43aef3bc73f6f8bbc55407bc59ab6fbcadfe543d12149e3d2e21363c6c802d3b7505da38cefb3fbc039692bd956a813c6a7d3dbc8a28f8bcc7ca01bc33a5173ca813b2bc52274e3c0692b6bb0835853dcad5e23c8dbeb93d3141173df92db1bcc4f857bdd21b303d18ce943d7c232cbd4c53b73b796a1a3ddf7918bd3ce51a3c641f223d2daa7abcb848213d06f495bb4a25ae3da681bfbcc38accba17ad88bd3880d3bcf9d202bdc423283dd32f533ab2fff6bce85d94bdd6bcf73b96985b3d3a4e87bd94a5aa3b64fc08bd942bd0bc790e493c8cbfe0bad342583dfcfadbbc305700bd13266abbf9e792bdca33903d54c76dbc4e9f393dd55abdbdf4f381bd131d26bd27c31b3d6eb894bc8f8192bd182451bdd2449ebceb2fdc3da3d18dbbd228db3ca5534c3d9aae2b3d0c9b21bdb531623dc021a2bdc169a43bc2820a3db694a5bb26cce23c8b70823b554f153caf42243de16b8b3c254656bd862cab3b3ec2a1bd39c717bdaa49b23c1834a63d3befe8bdba60263dd22997bd9f8e913c5c0d27bdb6ff7ebd77ccbebc8ddddeba4c84613c8faf913dc932413c4bf3b73ab525273c3df2a13d626cd3bc377564bdb40cd0bb2ee87e3ddcc9123c6735503c88ce57bd45243dbbbb3605bc4026523d83cc823d3f3f0ebd92a1d43d0a5ad2bbbb23813cc46359bd4f0f02bb9c1491bd9f18e83c69bee13dc598c9bc34c03bbc6e4d063d7db242bd23e6473d6f2983bdde6f59bdadbfedbc6eac813c18d672bda002be3b49137fbd8556f3bcaedc283ddd3c97bcc28570bb840eedbd20edcc3c4260393db1a8523d2c4bcabc68e0abbd5b061fbd6da941bd1fd8063d86500abcfb42433d70da453cc448fdbcaa46973d0bd138bd4d8584bc636da9bc3b26aebc18bd0e3d9c5ac73d981138bd696305bdec5dd73cdbadc8bc3e27923dd4c9873d666b7a3d55929ebcb14178bd9ed9d7bd3caae03af8f5cbbc97be8c3bd29917bd76a60f3d5775683cbef5923cee56d9bc03dda93a0e2780bca8cd55bce4e64ebd005e823c96980e3dd1cdbf3c65c7d73cc0a21a3c777685bc5c63903d986fc4bc589be1bcfdf4033cc136cabc76dc81bd701757bd27da4f3c100980bb5e91a93c51740fbc764e05bd73ae25bdd467a93b5c04183daf72af3cdb1e773b1491d5bca7cb85bb7b2c3dbb81b5a9bb89972ebdbeb39c3ce5df613bc257433d72ed3fbdafe5523de85856bd82ac003d4145ffbc8180043decf8f43c573e7a3cf135873df2e97bbd28ef22bcb83ed3bbdf5b65bd541f223d35c22b3d90d0033c583ea9bdaa06b1bd1cdc533dc85ba43b6479ca3c92bc9fbc3d7d373c1228813d8f4d82bc88671fbde372ca3bb37fddbca86f3abd3a1d12bdfb20943d7b0b1d3d485e44bda777f7bb7072e63b9a8706bdf9ee3abd26d281bd2f2d72bc5f001a3d8c85ecbc53a988bd287add3c0951503df84e243c725a42bde84bdd3cd45affbcf5394b3d17a993bbb8f686bde5306fbd377cd53c2c25ed3cf436b53cd764d33d9628f6bdc8e181bc150081bcb9470f3d76b7b83c206c873c514c1abdec57823dc40b3e3b177aeabcd61a6ebcfb735cbc8d96ce3dbfb3383cb8b12dbd609f18bd4230113d4af7923c3de576bb6aaa5abd562c273dcea2783ceca3213c5fac803d4b2beebc49f08abd46640c3d237a93bc5bd3fc3cf49dc83d9cfeb23c278f99bc6dacafbc0339da3ccedd88bd68ad5ebd72b6e6bb4fdb473dc9fb8bbdaca21abc9e866cbd3d676a3be2196f3c4c9002bd813fffbd	faces/3a7130a4-4459-4a38-ba0e-5a6fa0f1e4b1/778d93e3-2994-4d81-b4c9-df4c558cf91c/left.jpg	2025-09-26 23:07:21.973798	2025-09-26 23:07:21.973798	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
52962186-8818-4a0a-b8b2-25030094be2c	\\xb21014bd8b8ab6bc4bdaff3c135864bcadc2503ddb6d6c3d6acc82bbc71e843da301ae3de5f995bce63cc43d7eb987bb3d2f97bd638710bd7b0598bc5183c83ba207fb3b3654023d5559acbc389c04bdf6c53c3d5136ec3cae0adf3d3a056ebdd323d9bcb5a625bc8933e63cf53a0c3c8b14d4bd26cd0e3d536a62bc704c253c68d217bd9f42103db0b703bd06b305bdbc1b44bc1a93a83c40c4c33cb50544bc35aac03cb71aa63cf99bf1bd1b9e0c3d85f0bebc523da73d55b629bd1a5d113db30ed7bc834fc1bcdd2415bdcc4afd3c475edfbb165418bd5154083d9050c03d931481bc6ea9843b8f5efa3c8a68a8bdef897c3c652bac3dcebd433dc79d3bbb4067c73c502d07bdbe420b3d315ab83cac705e3deb639f3b2c0e33bdc407483b603fee3ce20314bd0f9bc3bd38226e3d05e5073d818a2e3cc7e4353cc12c32bc4db49b3dc1b2bfbc54bb243d379b21bc82c767bd99608f3d0a0d9b3ce461aabd25b4013d7b26bcbcd55dcbbb00f20a3db359013d5724663dc00f34bde457913cdbeefa3cf7f3633d7ac2e43de5e46e3d595583bdf921703c45731cbd5b14903cbb43873cd5f818bd98bbd1bc604988bcd54fb53cab71153cfeb7bcbceb506ebc809e863c02582a3d85438c3c4efaccbae74eb73c6e9ea93daf6c8fbb4b55bdbc3850fd3ce74be7bcb4d2423bcf9714bca31309be21753f3d526e5a3bbb4b79bd9fd8523d16af8a3de18bb8bd2e2aa03c2d7f8fbd665d043d56844c3bd355513bd849babc06e90ebde1e1153d70297d3cddafafbac0aca53deebdc53c543c63bce64183bcd9b45b3bc40916bde3e839bdf4828d3c8289a43dffe68bbc8fda2e3d571839bd5f3d31bd1f53143d764238bdbab0143d28a9ebbc998c01bdfe218c3d333d39bde825d03c92eee1bcc61833bd8dec0a3dfa9166bcb882923c222fcd3b620bbb3d25f0d93caab7c53c1472a23d11173f3dd562593dd33ac33b11d231bdfe8239bd7d04cb3c657c84bc5a145cbc3b6066bdd1e21e3c5b8e10bd0747bfbc50b4e2bc22e8043d022d083d38c9dc3ceb49f83c28d29dbcc01e0ebd3e34363ce8e506bd9f8d6d3df13a3a3cdd9aa43ca0bf913cbf72173dc3ccc13b0ff640bb4679bdbc798ade3c9362203b359bc73c468fd1bbad16eb3bd4696fbdd150b53c562cfd3c28fe59bd582817bc3aa550bc78e940bddef0713d07d3cdb9c981ebbcf07b193d58e3953df3d8953d65fa4c3ceb0c17bdbd02983c0623d33cd12fb4bd0cdcfbbb932801bd827d523d7dec423d3908933d928b0dbdb558673b474bcf3c615aeebc0400f7bcb1d1e93ca7fb9cbd320afab99843c8bcddd02e3a0978f9bb6087b93c2a5cd6bde4813b3cb608443d17d126bd140d633d5cfa79bc275b49bdb17c13bc652109bcb55d913d172895bd4e6b06bdc3e800bd5d9dc9bad410a03d6cfadcbc76ac993d21744cbdaa1664bc4cecf8bb9383973c36b085bc6125393cd7a3b1bdb9191abdcb5aa03d9a202d3a96c3003dca63dfbc3d2f21bc78d6fcba337f68b8e846e9bce1cfa23c701c123d16e7183deb12683dfd87ecbca4df14bbd8a4f7bc5cdbc03c4d954bbd9bb7aabc5e6a82bd340aa6bda6aa3c3d2534193c01b387bd3ec765bc41c00bbc2bf9b5bdc0ca65bc1ad80fbe8ac2823d5ac7dfbab2a3f93a09c6a2bcd490a2bd86fc6cbb13c5103df083983cdd31453ded2da1bc6ffe9cbcab706d3d53bf97bd9531953c940c02be47c745bb6899013cddd22c3d766f903d740554bd6bea613d529d09bb2005ea3b81da583ded1fcebce073bfbd7596713d2bdc483c28f2c6bc526bd33cb89691bc9266bd3c31feaf3d09d8b6bb2acf323d54f9c9bd7b62b3bc333728bd6ca5683d0b0ce53b33c3dcbd3fe0193db006a7bd569e5e3b1035a73b34ff0cbb978ce53c215d083d795a8fbc126d52bdf7f5743b4aba7abd9bc6de3ca22b4bbd8e608e3b68423f3da48059bdb953543cb6d5d63bd28f233db2ab023b43b897bcd1ea663ddc49cf3cf13744bd12b92fbdee56f4bcdf08223bc2fa793d979a823da7a4423d5a1300bd61d021bd1f0b5abd7908d7bcecd58dbac4b2083d67b0c5bccc84b7bab547cd3b04b50e3c0619a3bc8dbb1fbd7b3cbf3cc935bdbdab61623c5e59ff3c76f8263c077a103dc228f53c6feb04bddd565cbd4ed76e3d5377c5bce447013b67a73fbc1e408d3df66f30bd96068abd288ca7bd26fb9bbca2e9b7bc501ff6bc8ee66b3c2b37d93b3fc9a13db4771dbd82bdca3b0522853c8d5f873a825f923bbbee2d3c23ddd4bcb3ec543cc8cfdc3bf98adabbb7863d3c5950c53d2458b03c1d770abd494717bc120fd9bc2a55cc3af2df87bce282b13b629f5b3d8f47c0bd51d61d3b850478bd70c085bdcb3e1d3db518503db91e403b9d9a9d3b4761fcbdb066a5bc9be16abc9372cebb989bdb3cf9feefbc4941a73dc4457bba61d355bd4891323d8abf49bcd95eda3c14dfa1bc43e1d8bcb9ddfb3c6efe58bbe00a0cbc1387803c81070bbda6ec9f3cacbe8ebdb650c63c6a029cbcc317223b8254d9bce126bf3d7c87403d7768bc3c025084bda7ae143df867d1bdcb4e843cf4a14ebcbb38a2bd612900bdfb188b3d5a8b123defd97dbca4987d3d2e2f67bd512ad4bc677126bd37693b3d9582433d0e91083df9721abdf7bcff3d7cf5ce3c0a9ff53c6c89b73ca9bdd03c44f7c13d24500c3cec473f3b80ef9fbdf2ee2b3de677013d37829cbd68e8b3bd641d9a3ca6602cbd4adfa5bc8b56e53c2221afbc2e88d0bc62c2233d870ca6bd26f6393d7878a53d1467f2bc4fd102bd578cfd3c2ba63f3df19ce63bf99ca53d49c69dbc0815313d3b85f83b1b920ebcd594c8bd22c2b23cd34d2e3dadae3cbdf99bb63a	faces/3a7130a4-4459-4a38-ba0e-5a6fa0f1e4b1/778d93e3-2994-4d81-b4c9-df4c558cf91c/right.jpg	2025-09-26 23:07:22.374421	2025-09-26 23:07:22.374421	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
f70a1c5a-145b-4e2b-9682-84b8905df535	\\x660207bda1002dbdf55156bdf28f08bc1633b1bd660a6dbba31b4fbcd270123d225551bbccef0bbb7298ab3d80553dbd3c9b763d8976973ccb3f6e3cee75433dcd6336bcd091093c396a73bd8c005a3c341f1a3dd85175bc8fbfe3bc53b265bdcf3ee13c0e10a33d0fe6833db08affbcfae8a93cfb2d633c03e32fbdaa16ccbc655dad3c9f1a553d37983d3ca920ffbc175a66bd2f6c12bd2c5ea6bdf7506b3db2a51ebd6b6104bc7be618bdcd5313bd7e8014bde92b3b3d8cdd2abcd907923c1ab93cbcaadce6bc8084ce3bc82f283da73b4a3d2d1d403d51ffc83c74cff23d4d30573c2cd3c73c62ace1bb7e10abbd7ed1303c10b976bceab08bbb8c00bfbcc894813d02700e3cf33b85bc5bb9f53caccc693c76c480bc52df08bc36b7893c72495f3d1036cf3c7775fbba5ee4f63c5571363d37ebf13a252e5cbc9a50d9bdce7f7f3db01d1f3c7d1c543d20e8c03c58a7b5bc8e87823d22e086bd80f058bd3446573d38c0a03b4c5510bdf04a0c3d3c10853df11c643dc585d5bcdc0ee4bc7c52af3c8b8e45bc0d4a9cbb99b422bdad860a3ddcb716bcef858bbdf0a92f3d73a8d73ae4d7773c65b5f4bcca88d03c999b7c3d7ed0913c4d8fedbcc3b25c3d2098e0bd02c2723c00781cbc8410c5bc1c38853cc68114bddeef8bbc4aa2e0bcc3b8073dfbbf0cbdf9b934bc574f923d38e182bba28c7cbcdd067bbd3bf0b3bdf337b53d7c95f4bca898b5bd47095bbd9667a8bd9fc686bdf1736abd201d5cbd2aca64bdaab836bd3465093eb2e209bd171aa53d3a51ff3b2d9595bc0c29883de6293ebdaa4c053e246e403d2b12d43c15aa01bdf727003dd4e3773d001e81bcbbe82e3ddbb7f13bbc9ec43d0e39e0bc39267e3d20ee63bdc67bd0bbae63aa3c4c8876bd9febfb3c466c38bd52ec54bd987781bce824cfbcde880e3dbf0facbc261d42bd6d3a21bcc14af23c59e9893cf472863d6c0b5f3cbbc6bd3c253090bdfcec1abd5374e03c363dfcbc03f4053d511b783b05cca6bdf879e1bc5c492b3c456577bcae2703bd860352bbddeb0c3d4274cdbc171445bd29ee69bb0dc8a53c725f5e3cba3c7c3d89fe50bd98ad083d2fd28bbc2edb3a3d640ae1bc0a5016be40810e3d6ee716bcbc9eb7bb29b0a23caddbc1bcb46833bd1ea49dbddba83dbdaf45823c128a2fbdb3b35e3bd8dc27bddf117d3b02c96d3c194b933c85049ebceb2fc5ba4b2b40bc97ab30bd76218abdfb331abdd273b23bc50ba43da09d2f3c112065bc4f0b3abd408b15bc005e8cbcff5a0bbdacfcd13cb308673d94a8973baa73483b463bfe3c66c356bd9c9a713cf739233d62543bbd12d54b3dc432663c64da7bb96b15eebdefb1b03c8077083ca228083ddcedf73ce4ec9abcb6290b3dd6aa963ce71bf43b8f0dea3cccdd64bd63436bbd78d5b6bcb12ccfbca35955bc8470d73cbffaa43d4cdaa43ca66887bd430c6cbdb19c6d3da87c623ca351b73c44a917bdf816683c4b8ea1bb56ef593bf4999c3c2c70b0bb4b72043d3e5d473c06261fbdd5ac3abcbea0b83bd97608bc811ed5bae11f6cbb1cecfdbcfb9cdbbc81d598bda153953b9f5a643db2fd47bc8691163cd87cf6bc7833b83d6e4583bb3122813d45b93e3de62aaa3db42281bc12652b3d709d853cd42818bc8ebcc5bc37f2f2bcad17bdbbc51b2abddd82013ce27cf93c9c2a79bd274b2cbc3f640cbd31f225bd173b9e3df41898bb0077ca3c850075bc0c26c13c34ce813c6753bebc4888433c071cf8bc8c4393bb9ee3f43bf1c49436c435b73b616f88bd8d3256bd20ed5c3ccd2091baa3240f3b47dd3bbd2a3d053d6790a63b42bd8b3df9f408bda286613d84c8e3bc65e71c3d7953223dec45263cc65981bc2db112bd8a22343dd0e060bba271afbd26aa35be8de2d73cd114843deaf177bd69fb40bd255c43bdc14e25bd8a2d8abd581659394f04bfbc0a92f43c3d92933d4dd57cbd8637193c9337963cf715ff3c8cb2293c67db21bdf7f7e03a7708e13ce61047bd25de46bda44dc2bc6727ecbc9201c13d0faa003da415653d31334cbaaf7926ba1c8a61bc59c841bddaeb4bbde131b73c7321e03c5600943cd016acbce9bcb6bcbbe19f3ce67b79bdca7b22bd6dd083bc4913383d1302b83d6e54f53cf2f3423cb57a603d918229bcf2d35fbcf687963c5d6d50bd21d8423dd73837bd311aacbc0a440e3dd69bbebd1570c3bb1c52063c310fc23c2e414c3d39266ebdade496bd9054043d4293973de2c722bdfad6423d9d8d76bdb70f693c33cf663d6824c23c226931bd2b30013d278667bdf6ecaabad900a0bc976d65bb001ce73d125e01bd062b3fbd6f1c14bd141e3fbb3471a5bc6c64863d3864b4bcb32417bb5d463cbdea22413dbebb44baab08573da5a5853c6e38d73d3787a03d4163cebdba87fc3c36d5a13b8f6a6bbd3dceebbccfc6833b0992adbc002140bdc751d9bc7c21803dd915b0bdeec15a3d5132bcbd115e923c8d0e553d03c995bc2ed815bda4b44bbd1a14873c15563c3c20d3bc3cfeb60dbd8a280abd40112b3dc5f0da3c512d5a3b2f613c3d2b55e1ba0f64253d0e5605bde11466bde4f2ff3c1dfd683c808aad3d3d411a3c0906eb3b3aff653d8a519bbb0fcf0fbd47e58ebde7680abe183a7c3dc2c5653d6e4e6b3cebce223c13cbf6b97fee16bc1783be3ce13fb53d83563cbda75b6fbdacf8503d00e2d13dba723dbcd69e3c3d3727763ddf5e36bc512815bdd8f3683de36840bd82c7b2bcdfd0b43cdfbb35bd6bdbb5bc52e1e83bf1f888bd22706e3cb0a3eabcaaf321bcd3d4263dba6f81bd8ccab4bca374833d69c45b3d211be5bb0986b23c7e5c6dbd052f81bd813ce438c5fdb63c2ce8d43c1669143d94b730bd	faces/679c022e-7b6e-4445-be95-529becda488a/88747bde-591e-484e-afbd-58d5140937b8/front.jpg	2025-09-26 23:32:11.593764	2025-09-26 23:32:11.593764	6ca69fc1-f198-41e5-b789-4734d0995606
f4d2fa84-ded4-4486-bd25-c217ddc83bad	\\x199641bd3ab2193d21b412bd75ecd0bd14493dbd903886bc1d7e0bbcabf43f3a2526833a6e5ceeba38568f3d90d0173bb335a6bc4e2a883b51829abc27f6113d152cfbbc9e29b83a8a54a4bd176015be4217b93d7db09e3ce53d8b3b640dbebd08cf30bcf9055c3dbccbdd3df8c7bbbc8059b2bb4cfbedbc28c52fbb7f4db0bba963773c82284b3dcf2852bbcf1782bdc9fb92bd19ab28bd6e0cc3bd2e6a223d6af402bc2ece0ebd3c7e1fbd69514f3c48487dbc8af3bf3d3965f4bcdfb7923cddd7b5bdc7b2ccbcbd16d23a72e7a3bb69f2a03dc261f53c29ba863da697ae3dcbfe3b3dfab6e43b1cc3e7ba265280bdbc745b3c7e0e723cb6415abc351790bda81d173def17073bc309163c036971bdb485453d539bc2bb737842bd7fa7813c2bbc913d619bbe3a969245bcb5a71b3beb55bb3b8c6710bd516361bdcdacaebd2e0e503d5c38763b8a42c23d43ede73b89a99d3c7fd0233da62699bde24438bd1a085a3c04abb2bc2341183b3da0e43cd385053d5d4c483dc81f25bd5c2cc6bc5b3b7f3dedf9cdbcb9ebc63c0e8b563db2cb093d01c5d7bcfb44d4bd0914a1bbbb3e38bd3375463cd59cedbceb913d3d5f98ab3c546e573d6fb291bcf9abab3c72cf68bcc220fa3cd91767bdcc1d78baa09600bcd6fe143cc928d53c173a5abdad1d863c62c9683be335493d08b6323dda0b8b3aab50e13d0910b3bc9d3794bdf339a73d75f24e3b2f5d18bdc13d81bd3ee5b7bc8c0ec73b6f1e2abce9b04dbcfa3947bd1a0d72bd6d5ba23d03ef88bc029ff03c120c80ba58894ebd3a1fe43d43f1d9bd8ec8ea3d42c14dbd10abe43c4cdd193dc149ac3dfb02e1bc8a75c03bc79a78bceef6ad3b5328dc3c8ea6f3bccf7f54bd3a87f7bbfe8098bb7c1a713dd89b7abdadc9f13c067fca3d97b834bd96ee4e3dbe59cdbc4b530c3dd64a9fbce00244bc463dfebb2cb1e13ca767313d404b163e05b5a63d1f4a133c89f226bdcec360bdf82d17bcd31f283b7c7583bd4926f93c36ca50bdf31a1cbdd84a263d3704b7bc86110d3c2256893c697d933c30486e3cabcd5dbd8a28433d29d2803de3ab1ebda6aba43cb4f015bca61e3bbd9bbb603b634302bded4953bcf1763dbda92b893d6d7d8f3d83c820bca4d9ba3c7654de3b17ead3bd528372bc56ebb13c10b427bd57a330bdfac077bb82baa0bca6c414bbd840e6bc8833ae3c27561abc219ecb3c40a8bb3c9a025dbd4c8d19bd6932c6bc29e0973bb17db13d3f62a6bb078be83cb318a9bd612c953c4d5ad03c1b7c02bc96d7d83ce36b21bc5a8a0bbdb25c21bdc8e5703ccdca8a3bdcadb73c8bd9ad3d769dfbbbbec5163d226aab3b4b717dbd0ac52bbe765082bc63149dbb62f12f3c2878f0bcd8c8b1bcad31ef3be79308bcd06bcbbbb543dd3c7df4033a8dc350bd84f0dfba900b123d0c62833b355bdc3c2976463df60227bdce2550bd57519cbdfea80b3dbec6923cf0df0e3c0a0215bd7c4de1bc4e6b013d3202023cd7be04bd56489a3c499ba6bce670fdbca39bc73ca98e363d6626fd3c38c53e3d8fb3f43c1f6714bc17e6e7bc82e025bde8fe41bdb3ecffbc9116273c1733a0bc06c4ffbcd2fe40bd021e7e3dac07bcbd88c9463d9db716bdff593fbd28045cbdb0ebb8bc1b8a173d3b906abae96499bb31fd3d3baa8a883cbe0c4a3c2fb88a3d16ee6c3df12902bd26670a3c370becbc00c63abd6503963d5c82c23c157c60bcb8439fbb08f5bc3c5d89b9bc731248bd93e87c3d976907bdb07081bc53f8f6bc223ad7bb9bc25c3c25870dbd479e23bd9959933c2fcf853defab88bd009693bd3b87b23caf688cbc1a01913d58c67cbdf4499f3d95437cbd8ad069bc6ef3913c2d89263c82ec883ca793603c977fd13b33d5cabc829b9ebd15ce33beb070213d1e1e893cebab98bd6ae62cbcb6ad90bc64419cbccf9bd7bcbb18723dda3f12bd66897a3da530b13dc6664bbdf6d38b3d41fb9bbc59c13c3bb4b32c3d18fb8aba7af0283c496a74bd7df764bd4e89c6bcd26265bdc64949bdc50c983dc2ba103c1473143bd6d08c3b97165ebc5b19b33ce43628bc3d4d7ebdb798de3cb90446ba477c603deb4528bd28c671bd37c2bbbbe94742bdff466ebda80f01bdf820733def5c883c0afa87bc63ebbc3ccc0c863d5fcc9b3b84724cbb3280473dadcd49bca876943c6f1bed3bfd55dbbc0d81a83d1e9e8fbd6ee7d13b2f1d683d8eae33bcd048763dc85fecbdbae3d1bb4d9a663d1df4e73c104177bd6868393c987636bd8842633dba6346bc1761743ca9705fbdc0b5b43ce41159bd4553073db40f85bc0de5a1bcd6c2803d01c868bda3614bbd8e9808bd8f084f3c8e2c0abd1f378f3d114479bc5d67713cec14afbd427785ba240e773ce0a2ad3c0023e9bce6821e3dc0f6343d85d09dbc3c6c99bda408b3bbcf60debc3414cdbcdb21093d069d8b3b21647cbdc4b9af3c2023a23cfd1900bd64e3debc1ca8423d9817a43ca981c93c24f14bbbf15653bdb477c0bc4d37bbbc6a8293bb6524d53c77a71ebd1e9cbfbc65ab96bcb0d899bb8734f6bbf1706e3da33ba93c8e3a873deed192bddb37b9bc5b4e5fbbb3acc7bc0dde143d0d48c53d074611bde3ebb23caf3a9a3c3e8580bdd7af09bd826f64bd7650353c6cc6573def8fb63df7e31f3d2a40e63c254405bd85d6c4bc988db33dfd8ebdbbf0f37d3ca939e83b74bd343dc7a6fa3b51e6cf3c7432033dcb7ce7bcc2d774bdccd15a3d6b8869bc7cb3a33b8b3fe73cf90affbb8e5542bc689c2b3ce77f003cb549923d9fe30ebc1b3914bdebe9d2bcdd2fccbcbbca98bc360bdfbcade1d73cc9d5403cfdbe81bbf09f7abd8cd31cbc4b56bdbcb8e5983dcf87633dfadec4bcf3aae33a	faces/679c022e-7b6e-4445-be95-529becda488a/88747bde-591e-484e-afbd-58d5140937b8/left.jpg	2025-09-26 23:32:12.082565	2025-09-26 23:32:12.082565	6ca69fc1-f198-41e5-b789-4734d0995606
b4426f04-0cad-443f-a653-ff856647d71a	\\x8d891fbd23e0c13dfba5adbd03206cbd925c21bc656daa3c1e4b09bcdaf2803bd4db0b3c4b7509bc237a013d59ff20bc2538513affceb43c60b4abbcfa05103d8e350abc2aaf873c5ba790bd2ae799bd0518843d66d3f6bb40ddb939022e54bd3798843c3a0c90bbe60a3dbc07a313bca82166bc4c2284bdb5064c3c923a5a3bf1ab8d3cefa2b73b4dba8b3c9817f2bd59bf6a3c1cb428bdb98cd23b68a2b9b9c3eeb83c3fd6a4bcc527e5bd44a38f3d9fe1cabd0d42b93d325a2dbc2a73533de75c93bc437784bc97dae9bc1c1f22bd86e3d03db91fa1bc0dc6de3c89b1af3d28a31cbbf99b4a3cf978d93c8db055bda9258f3d27b6bf3c696ea5bca58875bd7f68c83cc92397bc879132bc6327c7bd22fedd3db9e4e23cf8f2bbbd64b30a3c5e722b3ce6c176bc80b53bbd37476bbc5e1a47bdb64880bd8e9372bd3300ecbc0bc19e3d4e9a65bd3c769d3c0b9c34bde373f23bd7845f3dc95fc9bc84c782bdfa1757bcf57f07bd6937f93c122cfa3a8fcf3fbcda9d3dbce80f24bdf3eead3bdf33aa3a6dd1863ced8fa43d9b2c0a3dbf77b0bc698c3a3cdacf8ebdc60b1d3dd33cb7bcfac401bcd83f063d0752a03ce6d2893d2448833c7e2299bcc66db33bb5849bbdd8dc2a3d5c553fbdf44a46bdf440eebcc31ef83ce124383c1657ccbd856c0d3c7e0e36bd1a13823d8ba62e3c5a71cbbcb83ba93da0844b3dc82ecfbd5ce1f63c2af15ebc5917cbbc660795ba196c37bdab92c53d3950e63ce389a4bd0a6390bd5ea8763cc923da3daa198b3c58f6523c34f3cdbcc19d05bcd7cd873d23d085bd5a0b823d5f828a3cb8e41ebd622183bc5c34db3b33223cbdf0fb2abcad982b3c76c400bd1cbf613c1d11c1bca2ed3abd2c8c90bc10abbfbddaef8b3d3ec0f9bc845a033d95c5afbc040a93bd51fdf23de4ac06bd94dda63deff705bc268bdabb3f1c0abbd50391bdfa9e31bccf4201bdcd15d13d54ab07bdb859c0bb69373ebca4aa733b516c843dff6734bdd2ba06bd8ca5813ced61c2bc38a3bc3cd0e6ccbcefd495bc0046123d28efe33cce15f3bcf729c5bd314eea3c2c764f3d2b5f87bd728c493da504013a1b2406bdafc5fabc50fe56bd7c06123c46843cbcda0c6f3d8b50633d6ad92f3c8b542abd650c3d3cdc1b8cbd350192bd2da7b13d5c67efbba936b5bca8b126bca3791fbcde4497bd925a713b0aad40bcdb8683bbfb35833c273a553ded6b10bc710436bc65303bbdb59a0c3d8e5ee53b7f89d7bd323d32bcdf6768bdc62858bd3b8ad83c5fcf833bcf6730bd130d01bde74b2d3d2c80ab3ce583ddbcce1033bd25cb813c5c11583dca770d3bb7e8e53a4612063d33f3263cc66a0ebeb5a1773deb5f1bbd465ca03ce802cdbc782c11bcefbc8e3acfe7e13b9e9a1fbd22f43e3c490b9ebd802a30bd366c813a5efa56bdfa95953d7c2dd6bc93289e3c643a51bd154d0fbc3adf9dbc414a763b71a1343b69a97ebdf8a4c1bd26b4eebc4e59e73bfeeb6bbcb02ca5bb46b13cbd339c103df167cebc2a32f93c9dd401bd1fe3453c46b6cc3bfc3b1f3d17bce9bad82555bcbf45dfbceae18fbd009b82bc813731bc3605debb527acbbcd55e28bd2f0010bc4593c5bc33e81b3cdfc425bd51b8b7bb18845dbd94b69ebd77ea94bdfaaa3abdd90004bdc4e2573b7e33153c138e16bc2ff8f0bc8f4f323d3719213d0653f03c19d3e4bb9f3d5abc69440d3daf7c7bbd7d080cbcca3140bc0782233d85c214bdb94d633bde86ad3d64c57cbccc2a3cbbb71a4e3b659adfbbb14336bd75990a3d7e6ba43cae79f0bcf4c1d83d9cc817bd3d495b3cf1aa3fb8fdaa8dbdf756f63c92065ebdf33bd43b9dc3903b980f053dcc608dbc0956ad3d7b6a863c5d10f2ba12f59bbc75ee47bdd14cdabcce23fabd3b76f43b324dfc3c21e8ccbc4fbe0dbd49c03dbd829240bda8f17fbd49d6f83da4b540bcfa17a33c3a66983d7cc2ecbbdc4b6f3d87f028bd60cc0cbcb71ed8bc93c68c3c280bc53a5992493c2e6e0fbd8a6af0bc9a6e013d96e9c43bd5dc913d3194943cf847833d375634bd69e448bdfea61ebd0d06d4bcc0718d3ae3382b3ce6ecd93b0fdaa83c31e8ec3c49c005bdc4e51ebb693194bdd22e4a3d9ccbdeba7c336d3c6f81983df100da3d506f573d5e224a3dcd64033ded97afbc70c95f3d80779ebc0df9963cab0ad73cc5d835bbd895c33df4e28dbc948fddbcf3633dbdacc461bcca40ae3c7cd95bbd692922bd4aa8a53cda4c7abd271189bb091109bd698e703bc926533c20f9743c13699dba90f826bd6d5a82bc2007adbcc9ac2ebdb86580bb560af5bb7ad243bcfdb094bd725fbfbc17e7043cacde6f3d35f3dabb5a228d3bea5a9cba653966bce64524bcc8839a384db96b3d86666e3da5c87c3b6050e73cc5adfebc2af2d3bcf42303bd5ee0343d41edb7bc001b1f3c51609a3d41960bbd161a61bd29b828bc3998a0bce8695bbd363c3c3b62f39b3da375143dd45198bd7330bc3994c75dbda20788bddcf960bc2d97693c47976fbb8f4855bda5e891bd3b57dfbd08b7823deddd243d236e013c55b6563c64c24b3d037410bd48ef49bc65977d3b8812d1bc4eed79bd51fce13c3eba5dbd772ac6bcf942243d6fcc3abdb1908bbdad7999bdfd3bb63b0ec9ba3dfff2833d464a4d3c1b2fa03daf23d43c055e2c3dae5cc83c0d6592bc63b17d3d578a853d8a33883cb8d4afbcf66c50bc50312c3d2a7317bdb3876cbca164143de0191a3dbedf83bce371543d0b0b50bd20d0eebc0b1fb33d660aa03c28b93b3c1e7ecabd4985ad3c7edb273d41a968bdef7c21bc05ec443d306c973deacdebbca54b5a3c8e52acbd1b7ebabca20a1cbd73ef783c6333913d92f1933c62e75fbd	faces/679c022e-7b6e-4445-be95-529becda488a/88747bde-591e-484e-afbd-58d5140937b8/right.jpg	2025-09-26 23:32:12.628524	2025-09-26 23:32:12.628524	6ca69fc1-f198-41e5-b789-4734d0995606
\.


--
-- TOC entry 3573 (class 0 OID 16957)
-- Dependencies: 220
-- Data for Name: fcm_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fcm_tokens (uuid, fcm_token, created_at, updated_at, user_uuid) FROM stdin;
e4adec33-6704-4ab2-b48f-43bf0514b51a	\N	2025-09-29 01:07:49.68043	2025-09-29 01:07:49.68043	2286c205-04a2-4e4c-b19f-7b40d7dbe277
4d2b114e-9e94-4010-854e-a12a49fcbe03	\N	2025-09-29 01:18:05.570727	2025-09-29 01:18:05.570727	2286c205-04a2-4e4c-b19f-7b40d7dbe277
317d6604-a239-4bff-9a36-382c2ca71e83	\N	2025-09-29 01:03:23.198713	2025-09-29 01:03:23.198713	2286c205-04a2-4e4c-b19f-7b40d7dbe277
b3372186-b63e-4f00-ba3c-c179478ef86c	\N	2025-09-29 01:17:30.272029	2025-09-29 01:17:30.272029	2286c205-04a2-4e4c-b19f-7b40d7dbe277
82c5a33b-4370-4a71-8ad4-fb797d2dc8f6	dKR8e2rqVM1ZG3LqCDp2_Y:APA91bGm2owkkamRTfgV-JnizpZyZ3FKCukzX_D2rM31CrELwwH35ZcHQXJjSSIPeAbkbY3vMRVSYtV-gjfBqKQHZEWDQ2NQT_TSaCf0q-Zj_lAd3VdvhqQ	2025-09-29 01:33:11.305903	2025-09-29 01:33:11.305903	2286c205-04a2-4e4c-b19f-7b40d7dbe277
\.


--
-- TOC entry 3574 (class 0 OID 16960)
-- Dependencies: 221
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification (uuid, type, related_uuid, content, created_at, updated_at, user_uuid) FROM stdin;
550e8400-e29b-41d4-a716-446655440701	SOS	550e8400-e29b-41d4-a716-446655440401	A구역에서 자동 SOS 신고가 발생했습니다.	2025-09-06 11:10:00	2025-09-06 11:10:00	550e8400-e29b-41d4-a716-446655440202
550e8400-e29b-41d4-a716-446655440702	SOS	550e8400-e29b-41d4-a716-446655440403	C구역에서 수동 SOS 신고가 발생했습니다.	2025-09-06 09:15:45	2025-09-06 09:15:45	550e8400-e29b-41d4-a716-446655440202
550e8400-e29b-41d4-a716-446655440703	VIOLATION	550e8400-e29b-41d4-a716-446655440601	A구역에서 안전모 미착용 위반이 감지되었습니다.	2025-09-06 12:00:00	2025-09-06 12:00:00	550e8400-e29b-41d4-a716-446655440202
\.


--
-- TOC entry 3572 (class 0 OID 16954)
-- Dependencies: 219
-- Data for Name: rental_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rental_history (uuid, created_at, returned_at, updated_at, watch_uuid, user_uuid) FROM stdin;
fb8c41e0-9ddf-4f52-91ce-c5cefeaf6879	2025-09-27 21:19:02.308169	2025-09-27 22:22:46.852944	2025-09-27 22:22:46.853205	60fe04f2-0d27-4cfa-8ebe-fbfcdaad43c5	3eb01d13-b269-429e-87ba-0d6471f11118
3f84f9e6-03eb-430a-b9c6-59cd035b251f	2025-09-27 22:25:33.13474	\N	2025-09-27 22:25:33.13474	faf8dc5c-e560-45d0-9de8-84ebbd53dfd0	2286c205-04a2-4e4c-b19f-7b40d7dbe277
1b040ac1-b9b6-4d30-b85c-1d4e0982f12b	2025-09-27 19:05:18.828025	2025-09-27 22:25:37.334623	2025-09-27 22:25:37.334891	44176f69-28b9-4fb0-b8b2-22ca13522085	679931c9-9ddc-4e80-bf1c-ecd46c84fa57
a3a0a613-dc2a-4760-9462-af712b849e63	2025-09-27 22:26:26.749698	\N	2025-09-27 22:26:26.749698	a24c5fbe-0a42-4e47-8651-adbf72d78831	4e92a8f0-62fc-480e-afb5-33901134b8fd
1d96f734-cc08-431c-bf9d-9b80519ab9cf	2025-09-27 22:28:15.32172	\N	2025-09-27 22:28:15.32172	60fe04f2-0d27-4cfa-8ebe-fbfcdaad43c5	3eb01d13-b269-429e-87ba-0d6471f11118
5d97bb80-e41c-4143-add6-a0fe973ac6e3	2025-09-27 18:59:33.942271	\N	2025-09-27 18:59:33.942271	550e8400-e29b-41d4-a716-446655440902	91da42ff-d33f-448e-8663-1f5702100b97
b53a7682-8982-46e6-b20e-4741d4e53bcb	2025-09-27 19:00:15.11416	\N	2025-09-27 19:00:15.11416	94fb909f-ac4a-443b-94de-f438ef110394	6667a4d8-7206-422e-9789-1846747a4ee8
10a21a53-3bb9-480e-8b56-1a6bc206f223	2025-09-27 19:01:53.757551	\N	2025-09-27 19:01:53.757551	1644579e-3902-4e4d-bb2a-a602c6472ae2	f1bc0ec3-587d-4c4b-949a-ec502aafbf44
eb6397c4-ee8d-47f5-9a14-c6cc6798663a	2025-09-27 19:03:30.817636	\N	2025-09-27 19:03:30.817636	8b9c317d-7c31-41f1-8ab1-38106a8d31ee	489bf069-0197-4de2-8b7f-95c3d3c5c393
a2e8d5c2-c930-46c6-8198-8a2ee9a7fb4a	2025-09-27 18:59:10.494618	2025-09-27 19:04:12.754554	2025-09-27 19:04:12.755103	44176f69-28b9-4fb0-b8b2-22ca13522085	679931c9-9ddc-4e80-bf1c-ecd46c84fa57
df1baa3c-1de2-4f87-a63f-4d402a6201c7	2025-09-27 19:04:48.688676	2025-09-27 19:05:02.574531	2025-09-27 19:05:02.574805	44176f69-28b9-4fb0-b8b2-22ca13522085	8887f2c5-c65b-4aa5-9f28-2c3621ad1d1a
64168b27-3630-4c77-9a3b-ffe387465839	2025-09-27 19:00:29.271082	2025-09-27 21:16:53.348885	2025-09-27 21:16:53.349167	60fe04f2-0d27-4cfa-8ebe-fbfcdaad43c5	621a29cf-d9f4-4fb4-8e9b-5ee73b585d53
d0fa335a-1d9a-497e-9807-1e73a5829ca4	2025-09-27 18:59:52.450167	2025-09-27 21:17:04.466296	2025-09-27 21:17:04.466581	550e8400-e29b-41d4-a716-446655440903	3eb01d13-b269-429e-87ba-0d6471f11118
30891ce1-8102-4004-b3eb-af84d3e7f8b9	2025-09-27 21:17:18.497916	\N	2025-09-27 21:17:18.497916	faf8dc5c-e560-45d0-9de8-84ebbd53dfd0	2286c205-04a2-4e4c-b19f-7b40d7dbe277
\.


--
-- TOC entry 3575 (class 0 OID 16965)
-- Dependencies: 222
-- Data for Name: report; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report (uuid, file_path, created_at, updated_at, deleted_at) FROM stdin;
550e8400-e29b-41d4-a716-446655441301	/reports/safety_report_2025_09_06.pdf	2025-09-06 18:00:00	2025-09-06 18:00:00	\N
550e8400-e29b-41d4-a716-446655441302	/reports/accident_report_2025_09_05.pdf	2025-09-05 18:00:00	2025-09-05 18:00:00	\N
550e8400-e29b-41d4-a716-446655441303	/reports/violation_report_2025_09_04.pdf	2025-09-04 18:00:00	2025-09-04 18:00:00	2025-09-10 18:00:00
\.


--
-- TOC entry 3582 (class 0 OID 18401)
-- Dependencies: 229
-- Data for Name: safety_violation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.safety_violation (uuid, created_at, updated_at, image_key, area_uuid, cctv_uuid) FROM stdin;
7b91b1e8-361b-4779-a3ce-ffe0809b1ea5	2025-09-19 00:52:20.442411	2025-09-19 00:52:20.442411	violation/20250919T005220Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b124938a-1ab0-4ebf-b935-0db672f4ee82	2025-09-19 00:53:20.460119	2025-09-19 00:53:20.460119	violation/20250919T005320Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
79d4ef5b-930a-4cfd-96fe-bdb990db025f	2025-09-19 00:54:20.456326	2025-09-19 00:54:20.456326	violation/20250919T005420Z_Belt off_ELB_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
3e7d3d0b-5c48-425e-a23c-66984a992fc0	2025-09-19 00:55:34.738742	2025-09-19 00:55:34.738742	violation/20250919T005534Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
969ceea3-e1ba-40c5-9eba-956cb14743cc	2025-09-19 00:56:35.361792	2025-09-19 00:56:35.361792	violation/20250919T005635Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
34ac27c1-ecc0-48e5-8854-ebfd884ce034	2025-09-19 01:06:28.713318	2025-09-19 01:06:28.713318	violation/20250919T010628Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e75a466e-dcf2-4ca6-9df1-dea39ff50f1b	2025-09-19 04:46:16.633944	2025-09-19 04:46:16.633944	violation/20250919T044615Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
7e5ef44d-264c-4870-a143-c0434c62a389	2025-09-19 04:58:41.16897	2025-09-19 04:58:41.16897	violation/20250919T045840Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
6cb7a096-7e35-4cca-8f70-47123784da2a	2025-09-19 05:02:50.884912	2025-09-19 05:02:50.884912	violation/20250919T050250Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
6e59c087-20a7-49a0-ae7b-2dba8c35fe1c	2025-09-19 05:52:43.027758	2025-09-19 05:52:43.027758	violation/20250919T055242Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
9a35cdc1-f6c0-4903-831d-21b862959815	2025-09-19 05:53:43.070049	2025-09-19 05:53:43.070049	violation/20250919T055342Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
ea0aa975-b62a-481b-9ac4-e27fe387fb11	2025-09-19 05:55:05.193104	2025-09-19 05:55:05.193104	violation/20250919T055504Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
1813dc07-2540-4fcb-bc37-c6497be2a179	2025-09-19 05:56:07.001138	2025-09-19 05:56:07.001138	violation/20250919T055606Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
77540547-df9d-4d19-9f87-0a092832c1de	2025-09-19 06:02:37.473027	2025-09-19 06:02:37.473027	violation/20250919T060235Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
ef613fa4-5b42-4b72-925c-7359d0a21ea0	2025-09-19 06:04:11.018675	2025-09-19 06:04:11.018675	violation/20250919T060410Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
879ea758-2e04-4cca-adf8-077104a4c96c	2025-09-19 06:15:40.362119	2025-09-19 06:15:40.362119	violation/20250919T061540Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
bffb0cca-8183-4983-8b2f-00c21559aff7	2025-09-19 06:16:40.653077	2025-09-19 06:16:40.653077	violation/20250919T061640Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
3cdd883d-ef02-4761-bf73-01e1c994277f	2025-09-19 06:17:52.778138	2025-09-19 06:17:52.778138	violation/20250919T061752Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
49ea1edd-7670-4651-9a6b-6d189dfb9286	2025-09-19 06:18:52.82079	2025-09-19 06:18:52.82079	violation/20250919T061852Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5d37b456-7225-440f-9311-01af009cf85f	2025-09-19 06:19:52.828906	2025-09-19 06:19:52.828906	violation/20250919T061952Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
ad97abd0-5e72-4170-aae7-96aa4ea6af12	2025-09-19 06:20:53.374071	2025-09-19 06:20:53.374071	violation/20250919T062053Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
81286bd1-beea-415d-b952-b65eb3b25fe0	2025-09-19 06:21:53.392336	2025-09-19 06:21:53.392336	violation/20250919T062153Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b8c80863-12f5-4331-9bf3-d3f78156767a	2025-09-19 06:22:54.05439	2025-09-19 06:22:54.05439	violation/20250919T062253Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
326426a4-816b-4d8e-b200-b586395de8c6	2025-09-19 06:23:54.046024	2025-09-19 06:23:54.046024	violation/20250919T062353Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c22c4c06-d6e0-4139-9a31-4fd918a63819	2025-09-19 06:24:54.273775	2025-09-19 06:24:54.273775	violation/20250919T062454Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5f3d9efb-62cc-4765-b77d-cb776bf1d158	2025-09-19 06:25:54.292789	2025-09-19 06:25:54.292789	violation/20250919T062554Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
86a87cb2-f3ff-4413-83d2-a59669e35eba	2025-09-19 06:41:30.81607	2025-09-19 06:41:30.81607	violation/20250919T064130Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d2a0c0a2-b346-4fe5-8738-168fc838a71d	2025-09-19 06:42:30.774452	2025-09-19 06:42:30.774452	violation/20250919T064230Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b3b52b9f-3849-4d20-a72c-959ec6b80255	2025-09-19 06:43:30.773489	2025-09-19 06:43:30.773489	violation/20250919T064330Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d31890c7-e77c-4c57-954e-9fda73c2bb5e	2025-09-19 06:44:30.796158	2025-09-19 06:44:30.796158	violation/20250919T064430Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5eb225fc-7358-48c6-88f3-7cd3e2039146	2025-09-19 06:45:30.822363	2025-09-19 06:45:30.822363	violation/20250919T064530Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b18dc197-7e30-4cbf-8936-fba819528695	2025-09-19 06:46:30.83504	2025-09-19 06:46:30.83504	violation/20250919T064630Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
15f57458-87c9-40d6-a706-b8e169833f94	2025-09-19 06:47:30.884896	2025-09-19 06:47:30.884896	violation/20250919T064730Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
2e7db5bf-5329-4009-b6cd-f25aac5a220c	2025-09-19 06:50:31.266076	2025-09-19 06:50:31.266076	violation/20250919T065031Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
4f89bc7e-f45e-4cfd-903d-c44af8d39761	2025-09-19 06:53:31.33864	2025-09-19 06:53:31.33864	violation/20250919T065331Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
42babc46-44f0-4798-9a3b-e48748e19b34	2025-09-19 06:54:32.451907	2025-09-19 06:54:32.451907	violation/20250919T065432Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
24de9e39-7515-4989-a401-b502bc563a35	2025-09-19 06:55:32.484026	2025-09-19 06:55:32.484026	violation/20250919T065532Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
2e741a31-f9e6-47e6-8641-9edc11742b88	2025-09-19 07:04:33.168149	2025-09-19 07:04:33.168149	violation/20250919T070432Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
6c9fbe9c-c3cf-4dbc-85b0-83b03c4b9f7a	2025-09-19 07:05:33.221266	2025-09-19 07:05:33.221266	violation/20250919T070532Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
1519f2d6-0072-4f3e-b7bc-19c6a57e45f0	2025-09-19 07:15:33.636033	2025-09-19 07:15:33.636033	violation/20250919T071533Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
533babbf-c212-443e-91f7-048f6dfcb890	2025-09-18 15:12:38.738758	2025-09-18 15:12:38.738758	violation/20250918T151237Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
9fc5c5f8-10cd-44c0-a1ac-17b46db03949	2025-09-19 00:57:35.543362	2025-09-19 00:57:35.543362	violation/20250919T005735Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
2c2289c9-1bba-4597-939a-13f0326e69fc	2025-09-19 00:58:35.55284	2025-09-19 00:58:35.55284	violation/20250919T005835Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
19796459-54b1-47a2-b5cc-c892da622f04	2025-09-19 01:00:03.712537	2025-09-19 01:00:03.712537	violation/20250919T010003Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
04d9f213-390d-486e-96b2-d5856ff5ed78	2025-09-19 01:01:03.87353	2025-09-19 01:01:03.87353	violation/20250919T010103Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
cf6e9ec2-2dbc-4bc3-a574-1a863fd28d7f	2025-09-19 01:04:20.332571	2025-09-19 01:04:20.332571	violation/20250919T010419Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
a78b1238-000c-42ce-95b5-b2275f11a5ab	2025-09-19 01:08:25.081645	2025-09-19 01:08:25.081645	violation/20250919T010745Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
eece92cc-d7f7-434d-8260-560d48faa1ad	2025-09-19 01:08:45.929967	2025-09-19 01:08:45.929967	violation/20250919T010845Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
bbadd6a9-983a-4892-b4f3-c36eac0f44e0	2025-09-19 01:09:45.949277	2025-09-19 01:09:45.949277	violation/20250919T010945Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
150af6ef-2f12-4318-bd89-82c107a05828	2025-09-19 01:10:45.933584	2025-09-19 01:10:45.933584	violation/20250919T011045Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5c9b93fa-3ef5-4764-bf9b-7cf818bfa92d	2025-09-19 01:11:46.00105	2025-09-19 01:11:46.00105	violation/20250919T011145Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
6db92a27-7554-4be7-be46-146283ba18b9	2025-09-19 01:12:46.052722	2025-09-19 01:12:46.052722	violation/20250919T011245Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d873d1a2-234e-4f22-a986-3c80d988db2d	2025-09-19 01:13:46.014558	2025-09-19 01:13:46.014558	violation/20250919T011345Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b73d2ef2-94c4-4c45-9b58-266ba1223ef0	2025-09-19 01:14:46.077103	2025-09-19 01:14:46.077103	violation/20250919T011445Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
8535a1a0-7ff0-46ac-83cd-2bb2c58387c2	2025-09-19 01:15:46.104153	2025-09-19 01:15:46.104153	violation/20250919T011545Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
925c8de5-afd0-4a72-a1ba-d30d9f11a03f	2025-09-19 01:16:46.147751	2025-09-19 01:16:46.147751	violation/20250919T011645Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e518bd88-da08-4655-b0c6-74a7a4d8c04d	2025-09-19 01:17:46.125326	2025-09-19 01:17:46.125326	violation/20250919T011745Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5e52af12-b770-4d90-966a-717d2486bd0d	2025-09-19 01:18:46.167461	2025-09-19 01:18:46.167461	violation/20250919T011845Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
a62d32d5-cb3a-44da-8845-cc00755024a4	2025-09-19 01:19:46.236014	2025-09-19 01:19:46.236014	violation/20250919T011946Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
248afd9b-ef9d-4aa7-b059-6b3a2091446d	2025-09-19 01:20:46.210873	2025-09-19 01:20:46.210873	violation/20250919T012046Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
ffe290a4-3d7a-4a67-98be-df8c81052c8d	2025-09-19 01:21:46.2376	2025-09-19 01:21:46.2376	violation/20250919T012146Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
6b32d976-c3e5-4c38-af9b-c4cb37923a99	2025-09-19 01:22:46.22476	2025-09-19 01:22:46.22476	violation/20250919T012246Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
778646a7-a096-4231-9cb0-5d0e705e395a	2025-09-19 01:23:46.295836	2025-09-19 01:23:46.295836	violation/20250919T012346Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
642d396a-7641-45c9-8e38-79c9be58ce6b	2025-09-19 01:24:46.373012	2025-09-19 01:24:46.373012	violation/20250919T012446Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
aaf6e729-126d-4d8c-8ed9-29d3e929deaf	2025-09-19 04:52:57.090879	2025-09-19 04:52:57.090879	violation/20250919T045256Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
97f21d3a-7278-492a-9a02-965725cef1d0	2025-09-19 14:14:58.632521	2025-09-19 14:14:58.632521	violation/20250919T051458Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e788b632-7ff1-45be-91e0-bacb00d49e93	2025-09-19 06:05:11.150479	2025-09-19 06:05:11.150479	violation/20250919T060510Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
49f95873-6b12-4317-bdad-e22bab6537b1	2025-09-19 06:08:37.854697	2025-09-19 06:08:37.854697	violation/20250919T060836Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b45d6111-dba9-489d-a7ec-45de0d31c488	2025-09-19 06:27:56.863074	2025-09-19 06:27:56.863074	violation/20250919T062719Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
570350a3-6e84-4bb4-a1f0-e4d13e75e8f3	2025-09-19 06:28:20.005323	2025-09-19 06:28:20.005323	violation/20250919T062819Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b08f77c9-80ae-4bf6-9f42-36d56eb44381	2025-09-19 06:29:19.998603	2025-09-19 06:29:19.998603	violation/20250919T062919Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
1aaacb1d-a649-40f9-85e1-8278e51b3f4f	2025-09-19 15:48:31.584397	2025-09-19 15:48:31.584397	violation/20250919T064831Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
bebc1402-f2c8-458c-9c5d-597535ad491e	2025-09-19 06:51:31.327925	2025-09-19 06:51:31.327925	violation/20250919T065131Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
368f56ce-0412-4cfd-8b22-eeb1d959d27b	2025-09-19 06:56:32.473254	2025-09-19 06:56:32.473254	violation/20250919T065632Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
39a1854c-0cd0-4436-977e-69196a34d269	2025-09-19 06:57:32.547738	2025-09-19 06:57:32.547738	violation/20250919T065732Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
1b0fa7f0-3c1e-4622-9187-bfe0273bc3b8	2025-09-19 06:58:32.549147	2025-09-19 06:58:32.549147	violation/20250919T065832Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
bb311940-fcaf-4f07-84c4-375f5158e864	2025-09-19 06:59:33.042175	2025-09-19 06:59:33.042175	violation/20250919T065932Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
cda3c81c-f712-4c1f-9972-a8bc604d27e5	2025-09-19 07:00:33.073373	2025-09-19 07:00:33.073373	violation/20250919T070032Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e97ae374-d7db-42af-971a-3f3e8f1065de	2025-09-19 07:01:33.126437	2025-09-19 07:01:33.126437	violation/20250919T070132Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
6a68fdb8-d66d-47e0-8c89-09dbb6671b4a	2025-09-19 07:03:33.148459	2025-09-19 07:03:33.148459	violation/20250919T070332Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
fe8ee1de-23f5-4dac-9a63-58b1c7322e39	2025-09-18 23:58:07.180783	2025-09-18 23:58:07.180783	violation/20250918T235805Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c35be8c9-49c1-4de5-8f50-5c2bf2edd038	2025-09-19 01:05:22.290459	2025-09-19 01:05:22.290459	violation/20250919T010522Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e440b04e-71a9-4b29-9bdd-1476eff7dea8	2025-09-19 01:25:46.34083	2025-09-19 01:25:46.34083	violation/20250919T012546Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e228ef1d-1838-4d42-a13d-d704428cb28a	2025-09-19 01:26:46.396151	2025-09-19 01:26:46.396151	violation/20250919T012646Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
16863cb8-0d8c-45ea-a7b6-5ac00c21251b	2025-09-19 04:54:27.651113	2025-09-19 04:54:27.651113	violation/20250919T045427Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
593d181c-9bfc-46ce-aa48-7be1db5487a8	2025-09-19 04:56:23.301743	2025-09-19 04:56:23.301743	violation/20250919T045623Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
0d629761-8fb9-4dbe-abcb-42a3a9c3f5cc	2025-09-19 14:23:11.360696	2025-09-19 14:23:11.360696	violation/20250919T052311Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
1650d718-601a-4bf1-9a73-f6a78f45add5	2025-09-19 14:24:28.226807	2025-09-19 14:24:28.226807	violation/20250919T052428Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
20e0ff9e-0cdf-4731-bb7c-32d8df0978de	2025-09-19 14:30:41.067124	2025-09-19 14:30:41.067124	violation/20250919T053041Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
0b1fd67d-d08d-44ba-9b7e-776265ddccf0	2025-09-19 14:32:33.243054	2025-09-19 14:32:33.243054	violation/20250919T053233Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
9e4e28df-3001-46b9-8055-833002cf80fd	2025-09-19 06:09:36.815643	2025-09-19 06:09:36.815643	violation/20250919T060936Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
7d394fd9-2b0a-44f2-be84-6a9452184014	2025-09-19 06:10:36.849167	2025-09-19 06:10:36.849167	violation/20250919T061036Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
8bf6a539-c43e-430c-ada6-0c338a4e4bba	2025-09-19 06:11:36.910894	2025-09-19 06:11:36.910894	violation/20250919T061136Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
1004c0c6-23fb-4140-a9f9-d84cf4277ce0	2025-09-19 06:12:36.909423	2025-09-19 06:12:36.909423	violation/20250919T061236Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
7729b0d1-9834-4773-a01f-da6c0e86c837	2025-09-19 06:13:36.958812	2025-09-19 06:13:36.958812	violation/20250919T061336Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
bb1e890e-fb86-42ec-adea-1b25886702e1	2025-09-19 06:14:37.848873	2025-09-19 06:14:37.848873	violation/20250919T061437Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
4d1e007f-ef65-424d-afd8-b27905a9ac00	2025-09-19 06:30:19.983421	2025-09-19 06:30:19.983421	violation/20250919T063019Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
7fcca8b9-bd81-4cc5-a0ee-17c02391cb7c	2025-09-19 06:31:30.346758	2025-09-19 06:31:30.346758	violation/20250919T063130Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
919c8096-1543-430a-ac1f-4acd1d29681a	2025-09-19 06:32:30.301799	2025-09-19 06:32:30.301799	violation/20250919T063230Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
783625de-f01b-42b3-8079-6f16e398c11f	2025-09-19 06:33:30.320974	2025-09-19 06:33:30.320974	violation/20250919T063330Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
fb277440-d59f-43fb-b20e-f16cb677b1f4	2025-09-19 06:34:30.335953	2025-09-19 06:34:30.335953	violation/20250919T063430Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
2ac6c914-f155-4bb8-952e-171b53d79232	2025-09-19 06:35:30.373369	2025-09-19 06:35:30.373369	violation/20250919T063530Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
0cde6e12-bfaf-40d4-81e3-c251e8281d35	2025-09-19 06:36:30.607293	2025-09-19 06:36:30.607293	violation/20250919T063630Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
103fd187-bdc6-481f-a1bc-0767c8f64aaf	2025-09-19 06:37:30.614735	2025-09-19 06:37:30.614735	violation/20250919T063730Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
60fc5162-33ca-458d-b994-f020c2b73427	2025-09-19 06:38:30.66609	2025-09-19 06:38:30.66609	violation/20250919T063830Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
75302bac-c61c-47ad-ab96-31eaa519b2f3	2025-09-19 06:39:30.679124	2025-09-19 06:39:30.679124	violation/20250919T063930Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
bb78c7bd-9646-4bf9-8dfb-67a631605cc8	2025-09-19 06:40:30.68308	2025-09-19 06:40:30.68308	violation/20250919T064030Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
67cb4905-2ff5-4d13-bbaf-4c871c67871e	2025-09-19 15:49:31.092438	2025-09-19 15:49:31.092438	violation/20250919T064931Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
6e87fa01-acce-4ef3-9360-e0a5e29767e3	2025-09-19 06:52:31.347327	2025-09-19 06:52:31.347327	violation/20250919T065231Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
ab837db2-c305-42f6-91e8-5265e7463869	2025-09-19 16:02:33.325168	2025-09-19 16:02:33.325168	violation/20250919T070232Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
878b07a2-b58d-4554-9257-cb74d3f270a1	2025-09-19 07:06:33.33907	2025-09-19 07:06:33.33907	violation/20250919T070633Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
a3c4f749-b4f1-4648-9ad8-0c7ba908ca66	2025-09-19 07:07:33.384643	2025-09-19 07:07:33.384643	violation/20250919T070733Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
9845456d-b6e8-4ac8-b0ca-2f641c1ac951	2025-09-19 07:08:33.425804	2025-09-19 07:08:33.425804	violation/20250919T070833Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
25982d29-8b0f-48c5-b511-6aa95cfb39d0	2025-09-19 07:09:33.405835	2025-09-19 07:09:33.405835	violation/20250919T070933Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
87421f7a-8faf-409d-bf92-4dbd5fa168c2	2025-09-19 07:10:33.460323	2025-09-19 07:10:33.460323	violation/20250919T071033Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
071dcb9b-a81a-4566-91e3-abb739628a98	2025-09-19 07:11:33.473288	2025-09-19 07:11:33.473288	violation/20250919T071133Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d70291dd-e8aa-4a09-b264-7b758471de7f	2025-09-19 07:12:33.546112	2025-09-19 07:12:33.546112	violation/20250919T071233Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
66ca028c-3daa-443e-aaeb-f25d1ca8a647	2025-09-19 07:13:33.593677	2025-09-19 07:13:33.593677	violation/20250919T071333Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
948afc34-29fd-46a2-982f-678ce9a0c976	2025-09-19 07:14:33.608749	2025-09-19 07:14:33.608749	violation/20250919T071433Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5b8fb1a5-0549-4401-8692-b38c45c80cb3	2025-09-19 07:16:33.6751	2025-09-19 07:16:33.6751	violation/20250919T071633Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
40866a1c-b7b1-481e-93ec-c47a543a2003	2025-09-19 07:17:33.645656	2025-09-19 07:17:33.645656	violation/20250919T071733Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
48b3b653-2fad-44bb-9553-2f8c51001bb5	2025-09-19 07:18:33.681479	2025-09-19 07:18:33.681479	violation/20250919T071833Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
08cca163-7809-45ef-9b73-fb654a7c7177	2025-09-19 07:19:33.683419	2025-09-19 07:19:33.683419	violation/20250919T071933Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
6d948ae0-530d-4040-929e-e253ed570230	2025-09-19 07:20:33.735866	2025-09-19 07:20:33.735866	violation/20250919T072033Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
8012a18b-d947-4a6b-8446-8506da3f2f95	2025-09-19 07:21:33.757521	2025-09-19 07:21:33.757521	violation/20250919T072133Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
050e9347-5e09-430a-8191-207577dc1382	2025-09-19 07:22:33.78035	2025-09-19 07:22:33.78035	violation/20250919T072233Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
aaec15f3-dd9b-4eb1-bda8-071c2a8482c4	2025-09-19 07:23:34.043624	2025-09-19 07:23:34.043624	violation/20250919T072333Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
eeeb8278-2f24-487e-8469-b9e7191f49f7	2025-09-19 07:24:34.066349	2025-09-19 07:24:34.066349	violation/20250919T072433Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
1ad14360-72ce-4434-8601-938ba0696e19	2025-09-19 07:25:34.144183	2025-09-19 07:25:34.144183	violation/20250919T072533Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
a846261a-5134-4234-b4ef-6c6959498029	2025-09-19 07:26:34.188908	2025-09-19 07:26:34.188908	violation/20250919T072634Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
463a52fb-c62b-42e6-a7ad-b1725b8d5a78	2025-09-19 07:27:34.345882	2025-09-19 07:27:34.345882	violation/20250919T072734Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e380cdbb-4608-45b8-b58c-73984cfd5c6c	2025-09-19 07:28:34.354199	2025-09-19 07:28:34.354199	violation/20250919T072834Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5487e6c0-ba4d-4a6a-8abd-af3609cdb21e	2025-09-19 07:29:34.395429	2025-09-19 07:29:34.395429	violation/20250919T072934Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
34734ad7-d826-429e-8de0-13b6933dd946	2025-09-19 07:30:34.439536	2025-09-19 07:30:34.439536	violation/20250919T073034Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c6e90656-fa3b-4508-86c7-599b41e01af2	2025-09-19 07:31:34.478262	2025-09-19 07:31:34.478262	violation/20250919T073134Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
0c273459-85d0-4fb2-9f05-57a27e889834	2025-09-19 07:32:34.476136	2025-09-19 07:32:34.476136	violation/20250919T073234Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
229632cc-f054-423b-8103-30ec3122c992	2025-09-19 07:41:41.030643	2025-09-19 07:41:41.030643	violation/20250919T074139Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
36396dc8-34f0-4e83-8650-27455d7a003d	2025-09-19 07:42:39.962276	2025-09-19 07:42:39.962276	violation/20250919T074239Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
2a3d9be7-5191-446e-a541-09e530eaa8f1	2025-09-19 07:43:40.012866	2025-09-19 07:43:40.012866	violation/20250919T074339Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
056f338d-7bf6-4534-9ee1-6aab38b61424	2025-09-19 07:44:40.045251	2025-09-19 07:44:40.045251	violation/20250919T074439Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b23e93eb-a09f-46e0-bda5-6d9d9d5528f8	2025-09-19 07:45:40.06568	2025-09-19 07:45:40.06568	violation/20250919T074539Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
19025f51-b1bc-4fab-8c16-8c353076113a	2025-09-19 07:46:40.134799	2025-09-19 07:46:40.134799	violation/20250919T074639Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5cf0f5d4-4574-46fe-9b94-7ac334e0c21b	2025-09-19 07:48:15.875166	2025-09-19 07:48:15.875166	violation/20250919T074739Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
9c535bd9-5230-457d-9c03-041917636b08	2025-09-19 07:48:40.173875	2025-09-19 07:48:40.173875	violation/20250919T074840Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
60a9136d-8d69-4b40-80cb-59bad77f265f	2025-09-19 07:49:40.220816	2025-09-19 07:49:40.220816	violation/20250919T074940Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d7f898f5-d38f-48d7-844b-138db9f6fe66	2025-09-19 07:50:40.256432	2025-09-19 07:50:40.256432	violation/20250919T075040Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
abb7a6ae-2b34-4348-86b9-6538dd0251a3	2025-09-19 16:51:40.486023	2025-09-19 16:51:40.486023	violation/20250919T075140Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
9e2881d5-9f29-44a9-bbfa-66c975ed5afd	2025-09-19 16:52:40.079933	2025-09-19 16:52:40.079933	violation/20250919T075240Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5f06b647-a80b-463c-9067-7aa5460b9bf9	2025-09-19 07:53:40.326104	2025-09-19 07:53:40.326104	violation/20250919T075340Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
164b9e97-3318-4754-a1de-ad4208f323d7	2025-09-19 07:54:40.344641	2025-09-19 07:54:40.344641	violation/20250919T075440Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c119aacf-0fbb-4fc9-8a2a-4b572483f1d7	2025-09-19 07:55:40.395557	2025-09-19 07:55:40.395557	violation/20250919T075540Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
35023bfc-b174-4544-b91f-1cc7435bd13b	2025-09-19 16:56:40.619884	2025-09-19 16:56:40.619884	violation/20250919T075640Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
40baacb2-0d7c-45df-8331-1ee97f8f678d	2025-09-19 16:57:40.219602	2025-09-19 16:57:40.219602	violation/20250919T075740Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
4b6f5d83-361e-461b-b09b-98b37844148f	2025-09-19 07:58:40.467697	2025-09-19 07:58:40.467697	violation/20250919T075840Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
fad46228-f245-413f-a5c0-7632e3b69c05	2025-09-19 07:59:40.476797	2025-09-19 07:59:40.476797	violation/20250919T075940Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c42dc519-3c8f-4887-a560-8310f3161194	2025-09-19 08:00:40.552352	2025-09-19 08:00:40.552352	violation/20250919T080040Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
ad01e50a-5e9e-4a07-991a-06360234cc3b	2025-09-19 08:01:40.575962	2025-09-19 08:01:40.575962	violation/20250919T080140Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d4a4a11a-34b8-4da1-b921-ca05b4d269b9	2025-09-19 08:02:40.658547	2025-09-19 08:02:40.658547	violation/20250919T080240Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
bb0c3f1c-a589-475b-a344-40cadf8eae6d	2025-09-19 08:03:40.685747	2025-09-19 08:03:40.685747	violation/20250919T080340Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
9df2c105-6311-4b37-8dae-68900878766c	2025-09-19 08:04:40.790708	2025-09-19 08:04:40.790708	violation/20250919T080440Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
65782892-ad26-4fa1-bc45-8efb4bea7d57	2025-09-19 08:05:40.768189	2025-09-19 08:05:40.768189	violation/20250919T080540Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e7e43458-324f-4029-8292-0ae8c8b92cd5	2025-09-19 08:06:40.797126	2025-09-19 08:06:40.797126	violation/20250919T080640Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
fa5683da-0196-4b37-bbb7-c49cb931d7a1	2025-09-19 08:07:40.813844	2025-09-19 08:07:40.813844	violation/20250919T080740Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c5e79946-441b-4254-bbd2-184ff0cb40a0	2025-09-19 08:35:42.952245	2025-09-19 08:35:42.952245	violation/20250919T083540Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
372b1bc5-d049-4a7f-9c1f-6806f6f6afe4	2025-09-19 08:36:41.109362	2025-09-19 08:36:41.109362	violation/20250919T083640Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f05637d5-bcc6-448b-8fc7-01c3342aa0e6	2025-09-19 08:37:41.100898	2025-09-19 08:37:41.100898	violation/20250919T083740Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
48bd3e58-c6e3-48bb-9e28-be89ef0896b5	2025-09-19 08:38:41.117603	2025-09-19 08:38:41.117603	violation/20250919T083840Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
8207016a-c3cf-431b-84c4-f84ba5ef7365	2025-09-19 08:39:41.095261	2025-09-19 08:39:41.095261	violation/20250919T083940Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
39b1d96c-c381-4891-aca6-09aa6d0818a6	2025-09-19 08:40:41.176835	2025-09-19 08:40:41.176835	violation/20250919T084040Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
ce497e9f-02af-4418-9a2e-3f322defd97e	2025-09-19 08:41:41.150355	2025-09-19 08:41:41.150355	violation/20250919T084140Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
430ca129-d965-4ea7-a08e-27a3ed3491c1	2025-09-19 08:42:41.237548	2025-09-19 08:42:41.237548	violation/20250919T084241Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
30c0dc5b-c8c9-4071-8a84-7e80b29b4bcc	2025-09-19 08:43:41.28287	2025-09-19 08:43:41.28287	violation/20250919T084341Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
521fc1ee-49b1-45e9-8c15-1838fdf38af3	2025-09-19 08:44:41.271952	2025-09-19 08:44:41.271952	violation/20250919T084441Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
088c79aa-2f90-4f17-97ec-6abf6fe68d95	2025-09-19 08:45:41.346446	2025-09-19 08:45:41.346446	violation/20250919T084541Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
96ecd251-5b80-43ee-9bf6-18144a8a4012	2025-09-19 08:46:41.528879	2025-09-19 08:46:41.528879	violation/20250919T084641Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
eae8825c-200f-4df3-a065-55edd5ae6ff3	2025-09-19 08:47:41.376615	2025-09-19 08:47:41.376615	violation/20250919T084741Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c07f7152-c245-4e32-b7fd-4e19e020709b	2025-09-19 08:48:41.449833	2025-09-19 08:48:41.449833	violation/20250919T084841Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5a63bf62-cc65-4c74-a2b6-0b4b92f3f0ce	2025-09-19 08:49:41.478649	2025-09-19 08:49:41.478649	violation/20250919T084941Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
61a599a8-d36b-40d0-b8ed-5d4eb4a44ffc	2025-09-19 08:50:41.492808	2025-09-19 08:50:41.492808	violation/20250919T085041Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f6744bd7-6b3c-453d-84a6-15653a784f6a	2025-09-19 08:51:41.542141	2025-09-19 08:51:41.542141	violation/20250919T085141Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c98b3122-882f-4ee8-81e7-3656e57c8b7c	2025-09-19 08:52:41.570914	2025-09-19 08:52:41.570914	violation/20250919T085241Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
a194b115-2214-41f1-9941-8b342ac84746	2025-09-19 08:53:41.591732	2025-09-19 08:53:41.591732	violation/20250919T085341Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
a2ebee4d-61bf-4eac-9fc9-414bed05c820	2025-09-19 08:54:41.63914	2025-09-19 08:54:41.63914	violation/20250919T085441Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c870370f-0878-4499-8254-f6d48767a668	2025-09-22 00:52:40.582925	2025-09-22 00:52:40.582925	violation/20250922T005236Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
554c7d89-c64d-4617-b151-28c2d707b3f6	2025-09-22 00:53:38.961761	2025-09-22 00:53:38.961761	violation/20250922T005336Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
95ac5cbc-bad1-439f-956a-df393959d7f4	2025-09-22 00:54:39.01241	2025-09-22 00:54:39.01241	violation/20250922T005436Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
867d0d87-ef13-4267-aa16-5cf07f259258	2025-09-22 00:55:39.032344	2025-09-22 00:55:39.032344	violation/20250922T005536Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
70e3f6f2-8530-42b2-a503-3db0dbb6036a	2025-09-22 00:56:39.105346	2025-09-22 00:56:39.105346	violation/20250922T005636Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
50d97800-b2a4-4047-a559-3d37decce951	2025-09-22 00:57:39.457476	2025-09-22 00:57:39.457476	violation/20250922T005736Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
49eb5068-86da-4ebe-a31e-799b93316f3d	2025-09-22 01:09:00.178021	2025-09-22 01:09:00.178021	violation/20250922T010856Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
cf733e6f-0d13-4d4b-a2b4-3e98a7315522	2025-09-22 01:09:58.982658	2025-09-22 01:09:58.982658	violation/20250922T010956Z_Fork lane_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
28c92930-ad2d-4e07-b3a5-e62621638161	2025-09-22 01:10:59.024694	2025-09-22 01:10:59.024694	violation/20250922T011056Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d4dcc4e4-1fb0-45ff-88a3-a055a04f5107	2025-09-22 01:11:59.022288	2025-09-22 01:11:59.022288	violation/20250922T011156Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
6433e358-f4b0-49da-8116-4dba7aad7045	2025-09-22 01:12:59.053726	2025-09-22 01:12:59.053726	violation/20250922T011256Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
58cdbb93-5666-49ca-ada6-c38feadf90e5	2025-09-22 01:13:59.079817	2025-09-22 01:13:59.079817	violation/20250922T011356Z_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
47c2dea1-a0f0-44ac-9359-f66f99c7cc22	2025-09-22 01:49:53.316368	2025-09-22 01:49:53.316368	violation/20250922T014949Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
97882fe1-5830-4d29-bb20-773bfae00f4b	2025-09-22 01:50:52.220236	2025-09-22 01:50:52.220236	violation/20250922T015049Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
4fcf342e-0d3c-40e2-9757-fa4097719a8d	2025-09-22 01:51:52.20755	2025-09-22 01:51:52.20755	violation/20250922T015149Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d092f762-6e92-4ddd-9862-baa4470612e3	2025-09-22 01:52:52.255969	2025-09-22 01:52:52.255969	violation/20250922T015249Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
98a322eb-410f-41c3-b4f2-32b4ec667ffa	2025-09-22 01:53:52.265961	2025-09-22 01:53:52.265961	violation/20250922T015349Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
8656e611-2448-42fb-be59-18b6366f7de4	2025-09-22 03:13:59.591391	2025-09-22 03:13:59.591391	violation/20250922T031354Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
ff58d925-ee03-4571-b639-355e85a8cc4d	2025-09-22 03:14:57.788417	2025-09-22 03:14:57.788417	violation/20250922T031455Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
0ad2bffc-aa43-490e-a2bc-8c1cad296ad1	2025-09-22 03:15:57.832826	2025-09-22 03:15:57.832826	violation/20250922T031555Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
50ac2570-473a-4139-82fb-ab2b7af6134e	2025-09-22 03:16:57.877808	2025-09-22 03:16:57.877808	violation/20250922T031655Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
8e3893cb-801e-463b-920a-e6b769467570	2025-09-22 03:18:05.612182	2025-09-22 03:18:05.612182	violation/20250922T031803Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
06296b8e-4c24-4d01-b083-90f88c15db05	2025-09-22 03:25:52.718625	2025-09-22 03:25:52.718625	violation/20250922T032549Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5f81cff7-c6dc-482d-b198-1741c3ad401e	2025-09-22 03:26:51.488208	2025-09-22 03:26:51.488208	violation/20250922T032649Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
49a905fc-5427-4cab-9fd9-b22d58c748f5	2025-09-22 03:27:51.519479	2025-09-22 03:27:51.519479	violation/20250922T032749Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f2327df6-4a57-4d1b-8350-298843f45a4a	2025-09-22 03:29:11.340371	2025-09-22 03:29:11.340371	violation/20250922T032908Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
70019eb1-0521-4f97-aa06-18d54b386b6c	2025-09-22 03:30:11.318264	2025-09-22 03:30:11.318264	violation/20250922T033008Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
4e82e807-cf67-4aa7-8b46-eac7dad80700	2025-09-22 03:31:21.607422	2025-09-22 03:31:21.607422	violation/20250922T033119Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
df2d264f-133f-49a8-970c-bb12100caf29	2025-09-22 03:32:21.573354	2025-09-22 03:32:21.573354	violation/20250922T033219Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b2f35777-b807-4e85-b3fc-48d32ce4ac3b	2025-09-22 03:33:21.602149	2025-09-22 03:33:21.602149	violation/20250922T033319Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d442986d-ec9b-4309-bb6d-69383554a75d	2025-09-22 04:44:20.904112	2025-09-22 04:44:20.904112	violation/20250922T044417Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
384d0587-2adf-4b24-a8e5-66162a7e1c2c	2025-09-22 04:45:19.470221	2025-09-22 04:45:19.470221	violation/20250922T044517Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b0def5ed-6261-49df-b8c9-387380442ac8	2025-09-22 04:46:19.576798	2025-09-22 04:46:19.576798	violation/20250922T044617Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e301a94d-8c0f-4724-a06a-21dd7f89c689	2025-09-22 04:47:19.602611	2025-09-22 04:47:19.602611	violation/20250922T044717Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
ded461bb-f9ca-4dd1-ae08-3e786c2de1c9	2025-09-22 04:48:19.640888	2025-09-22 04:48:19.640888	violation/20250922T044817Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
7a440028-45f6-4929-897c-9fdf5a45fa1a	2025-09-22 04:49:19.707002	2025-09-22 04:49:19.707002	violation/20250922T044917Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5c2ac72f-5cee-44e7-8aa5-50420229c817	2025-09-22 04:50:20.134681	2025-09-22 04:50:20.134681	violation/20250922T045017Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
452fe577-8aad-4b98-ae47-c9602fc92b5f	2025-09-22 04:51:20.182073	2025-09-22 04:51:20.182073	violation/20250922T045117Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
69bff940-5093-44a8-8417-b2697253ebba	2025-09-22 04:52:20.205413	2025-09-22 04:52:20.205413	violation/20250922T045217Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5b76e770-9f8d-400b-81d4-403336e35f20	2025-09-22 04:53:20.279469	2025-09-22 04:53:20.279469	violation/20250922T045317Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
a4854abc-262e-4397-81c6-834363a7ae00	2025-09-22 04:54:20.318136	2025-09-22 04:54:20.318136	violation/20250922T045417Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5adb643e-5c27-4882-b2b9-51ef2d84b2df	2025-09-22 04:55:20.474539	2025-09-22 04:55:20.474539	violation/20250922T045518Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d58dd46c-be3b-4703-93d3-fd39380444fc	2025-09-22 04:56:20.524967	2025-09-22 04:56:20.524967	violation/20250922T045618Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c27b28fa-cb98-419c-b085-8919c25e3a22	2025-09-22 04:57:20.594394	2025-09-22 04:57:20.594394	violation/20250922T045718Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
20c0103c-de83-4e4f-b7ba-87631f3c0310	2025-09-22 04:58:20.579829	2025-09-22 04:58:20.579829	violation/20250922T045818Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
35a0777b-61e3-4535-b947-d2f4dad5f9cd	2025-09-22 04:59:20.657106	2025-09-22 04:59:20.657106	violation/20250922T045918Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
9c922d4c-f6bd-4278-ac28-0bd27f38fa4a	2025-09-22 05:00:20.654218	2025-09-22 05:00:20.654218	violation/20250922T050018Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
8ea88c81-c092-4b26-bf95-dc518961c68c	2025-09-22 05:01:20.688232	2025-09-22 05:01:20.688232	violation/20250922T050118Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
db758efc-6800-4f5a-8069-4c851743c222	2025-09-22 05:02:20.68213	2025-09-22 05:02:20.68213	violation/20250922T050218Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
7bccca57-0119-4811-9ef8-d52457a3e18c	2025-09-22 05:03:20.760198	2025-09-22 05:03:20.760198	violation/20250922T050318Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
a9d8a1d8-0454-4997-add9-809d8ad0b355	2025-09-22 05:04:20.804923	2025-09-22 05:04:20.804923	violation/20250922T050418Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
398aa5f5-6818-4afe-8899-d9af92c2c171	2025-09-22 05:05:20.854564	2025-09-22 05:05:20.854564	violation/20250922T050518Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
73590643-4334-44db-8c34-e14d9aca67be	2025-09-22 05:06:20.881908	2025-09-22 05:06:20.881908	violation/20250922T050618Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
66eb0966-726c-444e-9ea4-1c26e84fdf94	2025-09-22 05:07:20.941013	2025-09-22 05:07:20.941013	violation/20250922T050718Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
637f0013-7fd6-44a0-80fb-062571e14e11	2025-09-22 05:08:20.960316	2025-09-22 05:08:20.960316	violation/20250922T050818Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
aa15bbe8-d9b3-4d83-8945-b9845aef6bac	2025-09-22 05:10:21.035146	2025-09-22 05:10:21.035146	violation/20250922T051018Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
662c9e88-9464-4c6f-b9d3-ffcf0b4362ab	2025-09-22 05:11:21.092341	2025-09-22 05:11:21.092341	violation/20250922T051118Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
37ef894b-0b5b-4249-a7b4-7d7dd6efd21e	2025-09-22 05:12:21.093004	2025-09-22 05:12:21.093004	violation/20250922T051218Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c252a717-6731-47d3-9595-035c1f77e2e2	2025-09-22 05:13:21.159929	2025-09-22 05:13:21.159929	violation/20250922T051318Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d097587e-d24f-494d-9327-7cffcd294f4c	2025-09-22 05:14:21.12315	2025-09-22 05:14:21.12315	violation/20250922T051418Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
cecc75c3-e36f-4cc1-9fc0-edd497e29e10	2025-09-22 05:15:21.20933	2025-09-22 05:15:21.20933	violation/20250922T051518Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e423ddf5-fac1-45db-b25b-babadfbc1108	2025-09-22 05:16:21.181642	2025-09-22 05:16:21.181642	violation/20250922T051618Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
81e62d68-ad23-4dc0-9657-13168f8358a3	2025-09-22 05:18:21.341007	2025-09-22 05:18:21.341007	violation/20250922T051818Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
2214f1a5-cc73-499d-b4cc-4695a6575a2e	2025-09-22 05:19:21.367485	2025-09-22 05:19:21.367485	violation/20250922T051918Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
622315c0-4c64-4bd0-8d1f-96f09f60f285	2025-09-22 05:20:21.353208	2025-09-22 05:20:21.353208	violation/20250922T052018Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5cca5b28-e703-4116-abc3-e37f0faef7b9	2025-09-22 05:21:58.510888	2025-09-22 05:21:58.510888	violation/20250922T052118Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
7c46c1c2-26de-49ed-8ec5-3fd9beb2e8ab	2025-09-22 05:23:21.454801	2025-09-22 05:23:21.454801	violation/20250922T052319Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
4778e66e-f5b6-448e-9d39-047da2b4451f	2025-09-22 05:25:21.496252	2025-09-22 05:25:21.496252	violation/20250922T052519Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
4a9bbf81-d49e-472a-86e0-a2327bb99ffc	2025-09-22 05:26:21.460153	2025-09-22 05:26:21.460153	violation/20250922T052619Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
997358c9-b24f-4dfb-bad2-aae319753d97	2025-09-22 05:27:21.628962	2025-09-22 05:27:21.628962	violation/20250922T052719Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
2920017e-c8c3-4151-9148-b1324b8cc655	2025-09-22 05:28:21.840014	2025-09-22 05:28:21.840014	violation/20250922T052819Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
71f9e72c-4061-464a-ad64-0ac467d5599b	2025-09-22 05:29:21.901891	2025-09-22 05:29:21.901891	violation/20250922T052919Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
92cb7724-4a89-49a7-a6a3-70c3deeb8492	2025-09-22 05:30:21.915077	2025-09-22 05:30:21.915077	violation/20250922T053019Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
eff59245-c2ab-4631-889e-5bab9a8bd0e5	2025-09-22 05:31:21.9296	2025-09-22 05:31:21.9296	violation/20250922T053119Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
13937994-6a5d-4828-949e-06f127b51595	2025-09-22 05:32:21.983809	2025-09-22 05:32:21.983809	violation/20250922T053219Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e67469df-6fe1-4d37-9ef3-26230759f1b3	2025-09-22 05:35:20.92037	2025-09-22 05:35:20.92037	violation/20250922T053319Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
3f90141b-d6ed-4145-b6ad-ae7d85613022	2025-09-22 05:35:21.248138	2025-09-22 05:35:21.248138	violation/20250922T053419Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
8724f007-c2ca-457b-8b89-641a825d97ec	2025-09-22 05:35:22.076231	2025-09-22 05:35:22.076231	violation/20250922T053519Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
cf6c3084-208a-4aa9-bbfc-84996e5940d8	2025-09-22 05:36:22.027426	2025-09-22 05:36:22.027426	violation/20250922T053619Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
52c98134-ee9c-4d34-9328-e0d64471c563	2025-09-22 05:37:22.036127	2025-09-22 05:37:22.036127	violation/20250922T053719Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f5a899cd-e58a-4f9e-b31f-608f8a08aec4	2025-09-22 05:38:22.059938	2025-09-22 05:38:22.059938	violation/20250922T053819Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
af4b2b3a-a53b-480f-a694-64e6a4a497bb	2025-09-22 05:39:22.036949	2025-09-22 05:39:22.036949	violation/20250922T053919Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5aa3b7ae-9ca5-403f-a127-74c832689980	2025-09-22 16:38:14.514352	2025-09-22 16:38:14.514352	violation/20250922T073810Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e764dd8f-203e-4138-86c1-eb524980a0b9	2025-09-22 16:39:12.997818	2025-09-22 16:39:12.997818	violation/20250922T073910Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
020da609-641f-4838-8ee1-48d73e3220d4	2025-09-22 16:41:13.858047	2025-09-22 16:41:13.858047	violation/20250922T074111Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
4b984a93-f890-4c6e-90a4-266b369e9d87	2025-09-22 16:42:13.918957	2025-09-22 16:42:13.918957	violation/20250922T074211Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
da3e3aa8-6767-4b16-bc02-872e86ffaa8e	2025-09-22 16:43:13.963586	2025-09-22 16:43:13.963586	violation/20250922T074311Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
a7c198c1-bc79-4029-8cb2-2af49e6d00b8	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250922T051718Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
9d785fdf-2cd2-4e92-afe9-d93b5b6cbff0	2025-09-22 16:44:13.930189	2025-09-22 16:44:13.930189	violation/20250922T074411Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b5f52082-053d-4f55-9daf-d7d9fc35e781	2025-09-22 16:45:13.971664	2025-09-22 16:45:13.971664	violation/20250922T074511Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f22f51e0-49ba-4cd1-b139-9edd43389143	2025-09-22 16:46:14.637859	2025-09-22 16:46:14.637859	violation/20250922T074612Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
3de52d2e-5573-4027-913d-4f64b7b3f670	2025-09-23 14:00:08.628199	2025-09-23 14:00:08.628199	violation/20250923T140006Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_ipad_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440502
169749fe-404b-456c-a601-213bf3d6fc62	2025-09-23 14:00:27.746766	2025-09-23 14:00:27.746766	violation/20250923T140026Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
75ed4f40-8654-4d01-8e92-53c71f7c446c	2025-09-25 01:27:05.906079	2025-09-25 01:27:05.906079	violation/20250925T012704Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
0e1a6002-a55a-4e38-aed8-96158768f140	2025-09-25 01:30:58.437344	2025-09-25 01:30:58.437344	violation/20250925T013056Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
dde79c93-2887-4d1b-b2d0-e657bbb03709	2025-09-25 01:32:12.860319	2025-09-25 01:32:12.860319	violation/20250925T013211Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
8c6d390e-8dd1-4081-b400-e53803148dd2	2025-09-25 01:35:55.233839	2025-09-25 01:35:55.233839	violation/20250925T013554Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440504
8c70955e-3245-4c4f-97b7-174d11383313	2025-09-25 01:36:18.658057	2025-09-25 01:36:18.658057	violation/20250925T013617Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
94c05d7b-5bcf-463e-a25b-222c34454392	2025-09-25 01:41:39.946674	2025-09-25 01:41:39.946674	violation/20250925T014138Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440504
c25e8c3b-eca9-4568-9f05-176be8f3e9e8	2025-09-25 01:41:41.761891	2025-09-25 01:41:41.761891	violation/20250925T014140Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
2a7dcd32-29ed-4498-a217-d416db3f6faa	2025-09-25 01:45:23.281158	2025-09-25 01:45:23.281158	violation/20250925T014520Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
57831817-e266-48b1-8ac3-5c799fe67985	2025-09-25 01:45:33.209016	2025-09-25 01:45:33.209016	violation/20250925T014532Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440504
6dc7ed8f-6e4f-44b1-8b00-2c7b21f9b778	2025-09-25 01:57:05.7611	2025-09-25 01:57:05.7611	violation/20250925T015703Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e2c73475-eeef-4a0d-b53d-1f7e4fda4dfa	2025-09-25 01:57:07.386609	2025-09-25 01:57:07.386609	violation/20250925T015706Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440504
9db3a689-ee97-4617-a01a-443c6d95220e	2025-09-25 01:58:07.015928	2025-09-25 01:58:07.015928	violation/20250925T015805Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c5f52dc3-cac2-4260-9b36-c3190de73dee	2025-09-25 01:58:21.64832	2025-09-25 01:58:21.64832	violation/20250925T015820Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440504
16ff7fc7-48dc-4b02-a69c-5abadb530f73	2025-09-25 01:59:07.894512	2025-09-25 01:59:07.894512	violation/20250925T015906Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f4b6a6c8-6fc3-4b72-8591-8c9eb110f3f2	2025-09-25 01:59:28.883484	2025-09-25 01:59:28.883484	violation/20250925T015927Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440504
294214ca-01a8-49d6-a7ee-936c4fe67260	2025-09-25 02:14:39.482304	2025-09-25 02:14:39.482304	violation/20250925T021438Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440504
b067dbf5-384b-4c10-94f0-74687fb8c8f1	2025-09-25 02:15:34.557846	2025-09-25 02:15:34.557846	violation/20250925T021532Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone4_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	45138089-4943-48fe-80e0-968e6d7515f8
563eef9b-fd6d-4ab1-8865-f9e685b916a9	2025-09-25 02:15:41.759778	2025-09-25 02:15:41.759778	violation/20250925T021540Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
fce646c6-6112-4b41-a4e4-b459ac4f0ad3	2025-09-25 02:16:33.522916	2025-09-25 02:16:33.522916	violation/20250925T021632Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone4_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	45138089-4943-48fe-80e0-968e6d7515f8
12b1097d-998c-4488-ad9d-06f5a284e4e2	2025-09-25 02:16:41.927894	2025-09-25 02:16:41.927894	violation/20250925T021640Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f5140299-a86e-464a-8506-cf8053565b5a	2025-09-25 02:16:46.283733	2025-09-25 02:16:46.283733	violation/20250925T021645Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440504
3d280d67-0cd9-47e9-babd-3f9cba61028c	2025-09-25 02:17:34.517899	2025-09-25 02:17:34.517899	violation/20250925T021733Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone4_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	45138089-4943-48fe-80e0-968e6d7515f8
98e3b989-a576-4752-b521-9f764342504f	2025-09-25 02:17:41.974521	2025-09-25 02:17:41.974521	violation/20250925T021740Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
de14fcf3-1f02-40d2-8078-fc0b359dbaec	2025-09-25 02:17:46.357695	2025-09-25 02:17:46.357695	violation/20250925T021745Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440504
b8838982-9001-47c7-9c12-f5157cc86ce9	2025-09-25 05:46:19.841348	2025-09-25 05:46:19.841348	violation/20250925T054617Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
afe57308-6c71-41d9-9b6e-37e8c8d23185	2025-09-25 05:49:56.83944	2025-09-25 05:49:56.83944	violation/20250925T054954Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
3b89d379-9bbe-463c-a730-1d2a30c9fdb7	2025-09-25 05:51:12.222611	2025-09-25 05:51:12.222611	violation/20250925T055111Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5272d497-50e1-41cd-af10-477dc7c320f7	2025-09-26 02:33:15.530166	2025-09-26 02:33:15.530166	violation/20250926T023313Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b2181b04-be93-428f-b6fd-80f77c84fd80	2025-09-26 02:34:16.423945	2025-09-26 02:34:16.423945	violation/20250926T023414Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
41b41ec3-2110-488a-8b79-8d2cc19bbb6e	2025-09-26 02:35:15.347753	2025-09-26 02:35:15.347753	violation/20250926T023514Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
256a9656-e5c6-4177-a7d7-a3d2f7bf1ca3	2025-09-26 02:36:15.367773	2025-09-26 02:36:15.367773	violation/20250926T023614Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
ddfb8758-f540-4772-a86a-968363dce1e0	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250925T013443Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
cbe34228-e65e-444c-bd52-907eba7a7104	2025-09-26 02:37:15.624759	2025-09-26 02:37:15.624759	violation/20250926T023714Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
cd7a1df6-bafc-4512-ac8a-22f3ee5b0c64	2025-09-26 02:38:15.803702	2025-09-26 02:38:15.803702	violation/20250926T023814Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f9a2c0af-c87f-4ee5-9afa-866df25a1a2a	2025-09-26 02:39:41.619582	2025-09-26 02:39:41.619582	violation/20250926T023940Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5976ecff-8f7f-4a5b-af42-d27c0b9af358	2025-09-26 02:40:41.740328	2025-09-26 02:40:41.740328	violation/20250926T024040Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
fe7296fc-d7a5-4fb9-8be2-e9034d8ddf28	2025-09-26 02:41:44.138794	2025-09-26 02:41:44.138794	violation/20250926T024142Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
1a3eb31e-81ea-40a5-8e72-cc48779f9f9a	2025-09-26 02:42:47.264621	2025-09-26 02:42:47.264621	violation/20250926T024246Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f06a6805-bec2-4e77-b9c4-4183fa221a22	2025-09-26 02:44:36.150574	2025-09-26 02:44:36.150574	violation/20250926T024435Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
365e4199-31d0-4041-933f-4ec1f0ecf7c4	2025-09-26 02:45:50.412218	2025-09-26 02:45:50.412218	violation/20250926T024549Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
bedc669e-3045-40fd-9a6d-80679399023a	2025-09-26 02:46:50.494734	2025-09-26 02:46:50.494734	violation/20250926T024649Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
343df5d4-217a-4770-a9e4-dfeb0230b738	2025-09-26 02:47:50.519708	2025-09-26 02:47:50.519708	violation/20250926T024749Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5554a050-7e74-4ac5-9567-ba7a08de9387	2025-09-26 02:48:50.538995	2025-09-26 02:48:50.538995	violation/20250926T024849Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
4fd90038-90a8-4e9f-b433-2b1029137a17	2025-09-26 02:50:03.917155	2025-09-26 02:50:03.917155	violation/20250926T025002Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
a88dbe71-7379-409e-9c0f-896cda4c65a3	2025-09-26 02:51:03.874016	2025-09-26 02:51:03.874016	violation/20250926T025102Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
4f4e0902-bf5b-4228-9644-9cc0d5dddac4	2025-09-26 02:52:03.884333	2025-09-26 02:52:03.884333	violation/20250926T025202Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
73727a0b-5ca0-4538-a475-d2a1eca13671	2025-09-26 02:53:03.915853	2025-09-26 02:53:03.915853	violation/20250926T025302Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f77bb4b6-0413-4d8e-99f4-a169520f8885	2025-09-26 02:54:03.906079	2025-09-26 02:54:03.906079	violation/20250926T025402Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
74dd6163-c4ed-4fc6-8989-9a1a60eeb477	2025-09-26 02:55:03.931629	2025-09-26 02:55:03.931629	violation/20250926T025502Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
a2394b75-4e86-47bb-b51b-6c938c21164b	2025-09-26 02:56:04.121538	2025-09-26 02:56:04.121538	violation/20250926T025602Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
86b31572-3d70-4723-ba0a-0586ce06e175	2025-09-26 02:57:23.506669	2025-09-26 02:57:23.506669	violation/20250926T025722Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
92872975-4214-4c6c-afaf-e4eeda6821bc	2025-09-26 02:58:48.719518	2025-09-26 02:58:48.719518	violation/20250926T025847Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f7c891cd-2999-403b-b510-e83d3de90960	2025-09-26 03:08:00.120797	2025-09-26 03:08:00.120797	violation/20250926T030758Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d7d80c9f-d875-4a3a-89d1-b9cdf1d70f24	2025-09-26 03:09:00.13608	2025-09-26 03:09:00.13608	violation/20250926T030858Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
8cd27f13-1eac-4278-a33f-f27f7be95c6c	2025-09-26 03:10:00.155738	2025-09-26 03:10:00.155738	violation/20250926T030958Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
fa2564e6-bbcf-4395-b9df-167cb0e4e87a	2025-09-26 03:11:00.14054	2025-09-26 03:11:00.14054	violation/20250926T031058Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
7aefcc02-b714-42f0-8486-9f0a67e16d0f	2025-09-26 03:12:00.271847	2025-09-26 03:12:00.271847	violation/20250926T031159Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
e6d0895f-0b8b-44ae-b480-5425e80602fc	2025-09-26 03:13:02.387895	2025-09-26 03:13:02.387895	violation/20250926T031301Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b414dcaf-2ecd-4125-8efd-9e8e2127dc7c	2025-09-26 03:14:02.345529	2025-09-26 03:14:02.345529	violation/20250926T031401Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
31456c8d-c40e-4312-a6a3-6135ff452282	2025-09-26 03:15:03.807029	2025-09-26 03:15:03.807029	violation/20250926T031502Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f2da4017-4f08-4716-b1a8-447233d77728	2025-09-26 03:16:07.739452	2025-09-26 03:16:07.739452	violation/20250926T031606Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f6f30f1a-888f-4813-aed6-d1849fbd8c44	2025-09-26 03:17:15.009955	2025-09-26 03:17:15.009955	violation/20250926T031713Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
347b61f3-51e9-47fc-90d6-307fa72a44a4	2025-09-26 03:18:15.309376	2025-09-26 03:18:15.309376	violation/20250926T031814Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
54126edd-6925-4c17-ad2c-a77affb0f1c4	2025-09-26 03:22:15.677132	2025-09-26 03:22:15.677132	violation/20250926T032214Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
234914f3-69a1-442d-997b-14eec096fd82	2025-09-26 08:07:38.830041	2025-09-26 08:07:38.830041	violation/20250926T080737Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
7de3228c-b51a-482a-bbae-f9e6ac976899	2025-09-26 08:08:38.941593	2025-09-26 08:08:38.941593	violation/20250926T080837Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
02055e1a-79d3-4c6a-90b0-c140758d6336	2025-09-26 08:13:42.804624	2025-09-26 08:13:42.804624	violation/20250926T081341Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
2bf1eaaf-39b0-428f-b545-f178c8265b42	2025-09-26 21:18:43.259976	2025-09-26 21:18:43.259976	violation/20250919T005220Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b9648e88-ba53-4bd4-b80d-c210aac6d8a4	2025-09-26 21:19:45.170026	2025-09-26 21:19:45.170026	violation/20250919T005220Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
7eb46609-20b0-4cad-8e41-5c140838eb3e	2025-09-26 21:21:33.889952	2025-09-26 21:21:33.889952	violation/20250919T005220Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c0c951d8-7260-4109-958c-9b4ea92e58d0	2025-09-26 21:23:27.313357	2025-09-26 21:23:27.313357	violation/20250919T005220Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
70c5f07d-d4d6-400d-b902-ea5d852a371f	2025-09-26 21:23:58.031296	2025-09-26 21:23:58.031296	violation/20250919T005220Z_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
3f1fb6c1-200c-48a6-b7ad-04fdf3e9821f	2025-09-27 02:01:06.047839	2025-09-27 02:01:06.047839	violation/20250927T020102Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
f21af24d-174e-406a-969e-be7e92279b6c	2025-09-27 02:02:04.424794	2025-09-27 02:02:04.424794	violation/20250927T020202Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
e9f6fd9e-0211-4527-b9f9-bc9774a9146f	2025-09-27 02:08:53.858845	2025-09-27 02:08:53.858845	violation/20250927T020852Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
d81355b5-b0c0-4f86-8d95-bbf077074e53	2025-09-27 02:09:53.894672	2025-09-27 02:09:53.894672	violation/20250927T020952Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
26e312a3-a449-4930-8b1a-74d485358deb	2025-09-27 02:10:53.903193	2025-09-27 02:10:53.903193	violation/20250927T021052Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
3ed9ec07-d9ce-4217-b00b-3b86dc955379	2025-09-27 02:19:46.253954	2025-09-27 02:19:46.253954	violation/20250927T021944Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
f8548514-675b-4b4a-8937-555b257742dc	2025-09-27 02:20:46.279917	2025-09-27 02:20:46.279917	violation/20250927T022044Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
79c83cc7-1b10-444b-83dc-e890f2f7dffc	2025-09-27 02:21:46.606424	2025-09-27 02:21:46.606424	violation/20250927T022144Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
bfafd819-27be-490b-bf44-c627a27c638c	2025-09-27 02:22:46.46356	2025-09-27 02:22:46.46356	violation/20250927T022244Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
aa1be742-179c-40c6-969d-34afed640f74	2025-09-27 02:23:46.444592	2025-09-27 02:23:46.444592	violation/20250927T022344Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
62d8663e-9a2f-4858-be17-a8259f98e110	2025-09-27 02:29:28.908407	2025-09-27 02:29:28.908407	violation/20250927T022444Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
261364f5-d584-401d-be2f-be4faefd962b	2025-09-27 02:29:29.195671	2025-09-27 02:29:29.195671	violation/20250927T022545Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
67dc6e5f-8f20-49e4-807b-3b920b26a693	2025-09-27 02:29:29.401839	2025-09-27 02:29:29.401839	violation/20250927T022645Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
d2d4b465-f778-436d-b713-45a568d6a86f	2025-09-27 02:29:29.518784	2025-09-27 02:29:29.518784	violation/20250927T022800Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
b44aba8b-2cd7-432d-9110-752223059855	2025-09-27 02:29:29.542337	2025-09-27 02:29:29.542337	violation/20250927T022901Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
d9e0d385-d9dd-421d-872f-fe9901636b98	2025-09-27 02:30:02.798021	2025-09-27 02:30:02.798021	violation/20250927T023001Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
56a99fdf-0461-4ded-9391-4e30267dd075	2025-09-27 02:31:02.855752	2025-09-27 02:31:02.855752	violation/20250927T023101Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
cf16d6f1-ef3d-4db5-8c9c-99dbc82dbf1b	2025-09-27 02:34:43.493221	2025-09-27 02:34:43.493221	violation/20250927T023204Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
2b8fc1c5-6d5b-4e64-a751-783fbaf3bcab	2025-09-27 02:34:43.968145	2025-09-27 02:34:43.968145	violation/20250927T023404Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
9077fa4e-8e8d-4a26-a617-aacd1735efc7	2025-09-27 02:35:05.777113	2025-09-27 02:35:05.777113	violation/20250927T023504Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
943f4693-8e0b-4e7d-a088-be820efd3fd8	2025-09-27 02:37:06.019972	2025-09-27 02:37:06.019972	violation/20250927T023704Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
13a37f1f-fc42-4f54-92c0-42e91a0874e2	2025-09-27 02:38:06.002854	2025-09-27 02:38:06.002854	violation/20250927T023804Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
e5ed0e3d-217f-4026-a6e8-3380440e4ebc	2025-09-27 02:39:06.047979	2025-09-27 02:39:06.047979	violation/20250927T023904Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
5d2eb1b6-d0d3-41b7-96b4-b844d00e0195	2025-09-27 02:40:06.197267	2025-09-27 02:40:06.197267	violation/20250927T024004Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
43eb01ca-edcc-4c63-9007-6b15c99f5a26	2025-09-27 02:41:06.230952	2025-09-27 02:41:06.230952	violation/20250927T024104Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
3342ff81-b460-4b9f-ab00-94bae3e71c08	2025-09-27 02:42:06.383093	2025-09-27 02:42:06.383093	violation/20250927T024204Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
1e24725e-2633-4c4c-9bad-23109374643e	2025-09-27 02:51:31.74478	2025-09-27 02:51:31.74478	violation/20250927T025130Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
b898636d-2491-4faa-9e83-fa371315c9f7	2025-09-27 03:02:33.033398	2025-09-27 03:02:33.033398	violation/20250927T030231Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
a22738c7-852d-41af-9e13-56146afada47	2025-09-27 03:03:33.065755	2025-09-27 03:03:33.065755	violation/20250927T030331Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
0138adeb-de78-4d6b-808f-461cc693539d	2025-09-27 03:04:34.32997	2025-09-27 03:04:34.32997	violation/20250927T030432Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
93c3536b-7aae-4fd7-97ce-1d382648211d	2025-09-28 12:55:58.83307	2025-09-28 12:55:58.83307	violation/20250928T125557Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440103	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
eaa2a869-32cd-43bd-9986-0c409ac810a3	2025-09-28 12:56:07.456343	2025-09-28 12:56:07.456343	violation/20250928T125607Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440103	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
f980ed81-165e-45cf-b143-19e370de015c	2025-09-28 12:56:17.57024	2025-09-28 12:56:17.57024	violation/20250928T125617Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440103	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
112aaebf-cea5-4c05-b53a-8ce2af8ebb33	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250927T023304Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
20346c3f-8217-4bac-b53b-8e73b89ad303	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250927T023604Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
f9023d4b-5f0c-4b83-86b8-2fa37f340906	2025-09-28 12:56:43.967205	2025-09-28 12:56:43.967205	violation/20250928T125643Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440103	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
20811262-f1d5-49c8-a515-31f762b20a1a	2025-09-28 12:57:39.218283	2025-09-28 12:57:39.218283	violation/20250928T125738Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440103	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
d0cc4c07-f93b-497e-9471-7907922ddf03	2025-09-28 23:49:59.513776	2025-09-28 23:49:59.513776	violation/20250928T234958Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440103	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c94f0024-d7ff-43af-9899-7a198e08afd0	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250928T235023Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440103	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
5881bad4-38c1-425e-8727-ecb42115c413	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250928T235033Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440103	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
3ee130fb-14f0-4353-b24f-85e77e1075fc	2025-09-29 07:50:34.117	2025-09-25 02:15:46.261	violation/20250925T021545Z_EQUIPMENT_Belt off_src-https:__media-test.hssu.dev_live_iphone_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440504
5c9fa070-6df9-4308-9be8-6f9f232a9f58	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250926T023215Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
578e7057-78a7-4a20-89c5-3e78308639b9	2025-09-22 16:40:13.774	2025-09-29 07:50:34.117	violation/20250922T074011Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
2a1eff6d-6e53-4c5f-be7e-d393f871efe3	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250922T052218Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
043edfa0-52c3-42fa-b9cf-a7875879b483	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250922T052419Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
30c34ff0-a693-4764-850b-4cdc5adaf107	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250922T050918Z_EQUIPMENT_Belt off_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440104	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
b7d9bb47-1ed5-44b0-b040-b328fb951f74	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250928T125627Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone3_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440103	ca80d34b-0d3f-47a7-a978-4df3d7f893b3
c029c337-ed96-43fa-8dd9-e6efea0ac4f7	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250927T030131Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
4e99135a-97c5-4a11-bff7-bd768720ff5c	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250927T025005Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
1c4ed66f-fd66-49c7-8173-444323d291da	2025-09-29 07:50:34.117	2025-09-29 07:50:34.117	violation/20250927T030031Z_EQUIPMENT_Helmet off_src-https:__media-test.hssu.dev_live_iphone2_index.m3u8.jpg	550e8400-e29b-41d4-a716-446655440101	f329d15e-f860-4f38-9d44-f63d46184e48
\.


--
-- TOC entry 3583 (class 0 OID 18408)
-- Dependencies: 230
-- Data for Name: safety_violation_detail; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.safety_violation_detail (uuid, created_at, updated_at, violation_type, safety_violation_uuid) FROM stdin;
5e6eab64-d12c-472a-857e-0dd67799d70e	2025-09-19 00:52:20.443581	2025-09-19 00:52:20.443581	HELMET_OFF	7b91b1e8-361b-4779-a3ce-ffe0809b1ea5
d2d6ba2a-5339-40a8-920e-4d0eb5818926	2025-09-19 00:52:20.444722	2025-09-19 00:52:20.444722	BELT_OFF	7b91b1e8-361b-4779-a3ce-ffe0809b1ea5
c44727db-c0d3-4603-8e9c-5ff2823656ab	2025-09-19 00:53:20.461287	2025-09-19 00:53:20.461287	HELMET_OFF	b124938a-1ab0-4ebf-b935-0db672f4ee82
0c2161b9-4024-402e-ab1a-0cdf8c63e70d	2025-09-19 00:54:20.457685	2025-09-19 00:54:20.457685	HELMET_OFF	79d4ef5b-930a-4cfd-96fe-bdb990db025f
f12157d0-e268-4708-8967-077a45858e29	2025-09-19 00:54:20.458701	2025-09-19 00:54:20.458701	BELT_OFF	79d4ef5b-930a-4cfd-96fe-bdb990db025f
57dde423-e336-47e2-a8b2-9bdde3b41cf0	2025-09-19 00:55:34.739819	2025-09-19 00:55:34.739819	HELMET_OFF	3e7d3d0b-5c48-425e-a23c-66984a992fc0
c086d9a5-a015-4c9e-9bfe-921f690f6de0	2025-09-19 00:56:35.362943	2025-09-19 00:56:35.362943	HELMET_OFF	969ceea3-e1ba-40c5-9eba-956cb14743cc
20f8943a-afe2-4e28-ba7b-f746671bc0c7	2025-09-19 01:06:28.715194	2025-09-19 01:06:28.715194	HELMET_OFF	34ac27c1-ecc0-48e5-8854-ebfd884ce034
2e9935d3-61c0-4fd6-bf28-80e192f6d9ed	2025-09-19 01:25:46.34196	2025-09-19 01:25:46.34196	HELMET_OFF	e440b04e-71a9-4b29-9bdd-1476eff7dea8
d008a93b-dee1-407c-bc7c-4c5b5e078f74	2025-09-19 01:25:46.342899	2025-09-19 01:25:46.342899	BELT_OFF	e440b04e-71a9-4b29-9bdd-1476eff7dea8
52753546-d77c-4945-875b-b5f973289a00	2025-09-19 01:26:46.3974	2025-09-19 01:26:46.3974	HELMET_OFF	e228ef1d-1838-4d42-a13d-d704428cb28a
6693bf4b-fe2a-4043-bbae-29357bce915b	2025-09-19 01:26:46.398838	2025-09-19 01:26:46.398838	BELT_OFF	e228ef1d-1838-4d42-a13d-d704428cb28a
e64d3d81-8ae9-45b7-8b3a-e7fa01709280	2025-09-19 04:54:27.653844	2025-09-19 04:54:27.653844	HELMET_OFF	16863cb8-0d8c-45ea-a7b6-5ac00c21251b
bbecc64f-5b98-4345-9657-eb37dd5ca12a	2025-09-19 04:56:23.303151	2025-09-19 04:56:23.303151	HELMET_OFF	593d181c-9bfc-46ce-aa48-7be1db5487a8
48741d97-8ced-4310-83d6-5f303b1e6b52	2025-09-19 04:58:41.170477	2025-09-19 04:58:41.170477	HELMET_OFF	7e5ef44d-264c-4870-a143-c0434c62a389
d7a0ae4d-0d6f-4317-98b7-b250986458c4	2025-09-19 05:02:50.886376	2025-09-19 05:02:50.886376	HELMET_OFF	6cb7a096-7e35-4cca-8f70-47123784da2a
266388d2-1511-40ee-95d0-f72a51929d84	2025-09-19 05:52:43.029127	2025-09-19 05:52:43.029127	HELMET_OFF	6e59c087-20a7-49a0-ae7b-2dba8c35fe1c
229ca968-2db5-4753-96ed-b219ed9cc5c1	2025-09-19 05:53:43.071264	2025-09-19 05:53:43.071264	HELMET_OFF	9a35cdc1-f6c0-4903-831d-21b862959815
21a06496-8b16-4e1b-9249-b617912fb975	2025-09-19 05:55:05.194474	2025-09-19 05:55:05.194474	HELMET_OFF	ea0aa975-b62a-481b-9ac4-e27fe387fb11
8c9054c2-aec5-4abf-b1b9-a309b29d09c8	2025-09-19 05:56:07.002401	2025-09-19 05:56:07.002401	BELT_OFF	1813dc07-2540-4fcb-bc37-c6497be2a179
1bb4bf50-a083-43f9-9d7e-1791dc176ad7	2025-09-19 06:02:37.4742	2025-09-19 06:02:37.4742	HELMET_OFF	77540547-df9d-4d19-9f87-0a092832c1de
51d79a9a-fe92-47b3-815a-7d46769e4ae8	2025-09-19 06:04:11.019754	2025-09-19 06:04:11.019754	HELMET_OFF	ef613fa4-5b42-4b72-925c-7359d0a21ea0
9bcc9d25-551b-45d5-82ab-842ae9de0443	2025-09-19 06:15:40.363296	2025-09-19 06:15:40.363296	BELT_OFF	879ea758-2e04-4cca-adf8-077104a4c96c
87f751cd-6790-4372-b221-6bee58da670d	2025-09-19 06:16:40.654194	2025-09-19 06:16:40.654194	BELT_OFF	bffb0cca-8183-4983-8b2f-00c21559aff7
bebfa832-a0ae-443b-8277-223d238f7aee	2025-09-19 06:17:52.77922	2025-09-19 06:17:52.77922	HELMET_OFF	3cdd883d-ef02-4761-bf73-01e1c994277f
810934ca-92bb-45fb-b865-08c668b6feba	2025-09-19 06:18:52.821903	2025-09-19 06:18:52.821903	BELT_OFF	49ea1edd-7670-4651-9a6b-6d189dfb9286
941fe6e1-693b-4d7f-9dc7-40721a60a2b5	2025-09-19 06:18:52.82291	2025-09-19 06:18:52.82291	HELMET_OFF	49ea1edd-7670-4651-9a6b-6d189dfb9286
913a855d-9280-4988-997f-527346e805b3	2025-09-19 06:19:52.829979	2025-09-19 06:19:52.829979	BELT_OFF	5d37b456-7225-440f-9311-01af009cf85f
fc559086-ee91-4806-93e9-793ff36e76a5	2025-09-19 06:19:52.830927	2025-09-19 06:19:52.830927	HELMET_OFF	5d37b456-7225-440f-9311-01af009cf85f
df2bf9a0-449a-4729-bea6-581302043051	2025-09-19 06:20:53.375106	2025-09-19 06:20:53.375106	HELMET_OFF	ad97abd0-5e72-4170-aae7-96aa4ea6af12
d1297ab4-e5f7-41f6-9ce3-659cbf5a2266	2025-09-19 06:21:53.393656	2025-09-19 06:21:53.393656	HELMET_OFF	81286bd1-beea-415d-b952-b65eb3b25fe0
d23cd9f5-b415-47a9-a658-c3e995ed68e8	2025-09-19 06:22:54.055528	2025-09-19 06:22:54.055528	HELMET_OFF	b8c80863-12f5-4331-9bf3-d3f78156767a
feadbddd-0332-47cd-83bc-2f13e0c8e7f1	2025-09-19 06:23:54.047175	2025-09-19 06:23:54.047175	HELMET_OFF	326426a4-816b-4d8e-b200-b586395de8c6
6dc0d0f5-7ec0-4559-aafa-c58b29599b26	2025-09-19 06:24:54.274746	2025-09-19 06:24:54.274746	HELMET_OFF	c22c4c06-d6e0-4139-9a31-4fd918a63819
0c2d780a-44ff-451f-800b-dc612ed81ed3	2025-09-19 06:25:54.293837	2025-09-19 06:25:54.293837	HELMET_OFF	5f3d9efb-62cc-4765-b77d-cb776bf1d158
30ee9c33-561e-468d-a4c2-84590c901f81	2025-09-19 06:41:30.817423	2025-09-19 06:41:30.817423	HELMET_OFF	86a87cb2-f3ff-4413-83d2-a59669e35eba
60b1beb7-c300-433f-8530-cc1459546861	2025-09-19 06:42:30.776574	2025-09-19 06:42:30.776574	HELMET_OFF	d2a0c0a2-b346-4fe5-8738-168fc838a71d
fd558e45-3698-4fd9-bfb9-93ebf6a0c1b2	2025-09-19 06:43:30.774787	2025-09-19 06:43:30.774787	HELMET_OFF	b3b52b9f-3849-4d20-a72c-959ec6b80255
e4dd05ae-ac3d-43a9-917f-2c4fe78db6dc	2025-09-19 06:44:30.797269	2025-09-19 06:44:30.797269	HELMET_OFF	d31890c7-e77c-4c57-954e-9fda73c2bb5e
404eb66c-c6e2-40b0-88f7-8dee93ffc781	2025-09-19 06:45:30.823654	2025-09-19 06:45:30.823654	HELMET_OFF	5eb225fc-7358-48c6-88f3-7cd3e2039146
6f8b495f-85fe-4302-b06c-3d77160c3efc	2025-09-19 06:46:30.836073	2025-09-19 06:46:30.836073	HELMET_OFF	b18dc197-7e30-4cbf-8936-fba819528695
06178608-5e88-458a-95e0-70bdb6d31dde	2025-09-19 06:47:30.885997	2025-09-19 06:47:30.885997	HELMET_OFF	15f57458-87c9-40d6-a706-b8e169833f94
b96adc79-e5af-41c2-9513-f07c24ee0caa	2025-09-19 06:52:31.348534	2025-09-19 06:52:31.348534	HELMET_OFF	6e87fa01-acce-4ef3-9360-e0a5e29767e3
831fb864-d04d-4a4e-82f6-e0d00d8fad39	2025-09-19 16:02:33.351227	2025-09-19 16:02:33.351227	HELMET_OFF	ab837db2-c305-42f6-91e8-5265e7463869
c1ff8779-bcc9-402c-93d6-8b6681477217	2025-09-19 07:17:33.646741	2025-09-19 07:17:33.646741	HELMET_OFF	40866a1c-b7b1-481e-93ec-c47a543a2003
4f022ae8-755f-428c-9501-c71d48d34b49	2025-09-19 07:17:33.647623	2025-09-19 07:17:33.647623	BELT_OFF	40866a1c-b7b1-481e-93ec-c47a543a2003
0e477bcf-3b56-43ad-8c62-ed5454188846	2025-09-19 07:25:34.145307	2025-09-19 07:25:34.145307	HELMET_OFF	1ad14360-72ce-4434-8601-938ba0696e19
54524be8-845e-4c0d-9164-764d2c15182a	2025-09-19 07:26:34.189887	2025-09-19 07:26:34.189887	HELMET_OFF	a846261a-5134-4234-b4ef-6c6959498029
8fd04f26-b859-4371-826b-9abb17b109c4	2025-09-19 07:27:34.346885	2025-09-19 07:27:34.346885	HELMET_OFF	463a52fb-c62b-42e6-a7ad-b1725b8d5a78
3389777a-ee93-4b52-8c16-8433f27ab270	2025-09-19 07:28:34.35533	2025-09-19 07:28:34.35533	HELMET_OFF	e380cdbb-4608-45b8-b58c-73984cfd5c6c
b4b178f8-0489-448c-8817-37d3b87145ef	2025-09-19 07:29:34.396624	2025-09-19 07:29:34.396624	HELMET_OFF	5487e6c0-ba4d-4a6a-8abd-af3609cdb21e
eaf41eea-ebd1-4d1f-b740-cbb066a2c419	2025-09-19 07:30:34.440605	2025-09-19 07:30:34.440605	HELMET_OFF	34734ad7-d826-429e-8de0-13b6933dd946
5b0630e0-2b04-4feb-9e27-470c8e003785	2025-09-19 07:31:34.479288	2025-09-19 07:31:34.479288	HELMET_OFF	c6e90656-fa3b-4508-86c7-599b41e01af2
3a87ec6b-f7af-4d6b-b3b6-93e5b5943a64	2025-09-19 07:32:34.477077	2025-09-19 07:32:34.477077	HELMET_OFF	0c273459-85d0-4fb2-9f05-57a27e889834
f960e3bb-e79c-45b1-bee6-c7d2105c82b7	2025-09-19 07:32:34.477903	2025-09-19 07:32:34.477903	BELT_OFF	0c273459-85d0-4fb2-9f05-57a27e889834
599b2591-4c51-4c1a-8249-5631b6a3a618	2025-09-19 07:41:41.031616	2025-09-19 07:41:41.031616	HELMET_OFF	229632cc-f054-423b-8103-30ec3122c992
05a3f1ca-dbf7-480d-bab0-6ab9ee41e698	2025-09-19 07:41:41.032463	2025-09-19 07:41:41.032463	BELT_OFF	229632cc-f054-423b-8103-30ec3122c992
7cc3ed46-f12b-498c-8366-137f97e432c7	2025-09-19 07:48:15.896259	2025-09-19 07:48:15.896259	HELMET_OFF	5cf0f5d4-4574-46fe-9b94-7ac334e0c21b
10bdb5ea-f8b2-4401-b516-c7c33c121b8a	2025-09-19 07:48:15.899867	2025-09-19 07:48:15.899867	BELT_OFF	5cf0f5d4-4574-46fe-9b94-7ac334e0c21b
2a927307-8caa-489b-8de9-53120bada029	2025-09-19 07:48:40.175612	2025-09-19 07:48:40.175612	HELMET_OFF	9c535bd9-5230-457d-9c03-041917636b08
7c703f36-ef33-4894-ada5-806732ce0210	2025-09-19 07:48:40.176867	2025-09-19 07:48:40.176867	BELT_OFF	9c535bd9-5230-457d-9c03-041917636b08
31452ade-03b7-4536-8285-62525dd44ae9	2025-09-19 07:49:40.222439	2025-09-19 07:49:40.222439	BELT_OFF	60a9136d-8d69-4b40-80cb-59bad77f265f
68307c07-b95b-4b14-bcd1-28e9d6621e0a	2025-09-19 07:50:40.257862	2025-09-19 07:50:40.257862	BELT_OFF	d7f898f5-d38f-48d7-844b-138db9f6fe66
01f011f6-9482-4a7a-8c49-190d596bf77b	2025-09-19 07:53:40.327727	2025-09-19 07:53:40.327727	HELMET_OFF	5f06b647-a80b-463c-9067-7aa5460b9bf9
21ffaaa9-2262-44a7-a2b7-44ae9be1246b	2025-09-19 07:53:40.328904	2025-09-19 07:53:40.328904	BELT_OFF	5f06b647-a80b-463c-9067-7aa5460b9bf9
bd0e5668-11a6-4e92-8060-e4f2b18f0a5d	2025-09-19 07:54:40.346341	2025-09-19 07:54:40.346341	HELMET_OFF	164b9e97-3318-4754-a1de-ad4208f323d7
70ee63bc-e701-45e9-acd2-a759218f7039	2025-09-19 07:54:40.3477	2025-09-19 07:54:40.3477	BELT_OFF	164b9e97-3318-4754-a1de-ad4208f323d7
d41a3df7-16f3-4905-b2c7-a7823aabdf47	2025-09-19 07:55:40.397636	2025-09-19 07:55:40.397636	HELMET_OFF	c119aacf-0fbb-4fc9-8a2a-4b572483f1d7
7feaafd8-3ecd-4b90-bd16-4904e96f65b2	2025-09-19 07:55:40.398935	2025-09-19 07:55:40.398935	BELT_OFF	c119aacf-0fbb-4fc9-8a2a-4b572483f1d7
40bb44ad-3b55-4281-a100-2ed62b84474e	2025-09-19 07:58:40.469299	2025-09-19 07:58:40.469299	HELMET_OFF	4b6f5d83-361e-461b-b09b-98b37844148f
5864eb24-ef49-439d-a6f4-776fb842c3f9	2025-09-19 07:58:40.470933	2025-09-19 07:58:40.470933	BELT_OFF	4b6f5d83-361e-461b-b09b-98b37844148f
f3d2b395-71dd-4c03-a940-299f0806deae	2025-09-19 07:59:40.478073	2025-09-19 07:59:40.478073	HELMET_OFF	fad46228-f245-413f-a5c0-7632e3b69c05
0697744b-10fe-4835-a058-e3d369fc5358	2025-09-19 07:59:40.479105	2025-09-19 07:59:40.479105	BELT_OFF	fad46228-f245-413f-a5c0-7632e3b69c05
f90bb4c8-9ba0-4094-96ba-d04c4f022c05	2025-09-19 08:00:40.553836	2025-09-19 08:00:40.553836	HELMET_OFF	c42dc519-3c8f-4887-a560-8310f3161194
caba9dc6-85fa-46d4-a151-78011e5bde3b	2025-09-19 08:01:40.577235	2025-09-19 08:01:40.577235	HELMET_OFF	ad01e50a-5e9e-4a07-991a-06360234cc3b
0e01401d-403a-401e-a9d1-06664be43410	2025-09-19 08:01:40.578337	2025-09-19 08:01:40.578337	BELT_OFF	ad01e50a-5e9e-4a07-991a-06360234cc3b
2c66027d-3636-4d89-90ed-a2de172a78cb	2025-09-19 08:02:40.659713	2025-09-19 08:02:40.659713	HELMET_OFF	d4a4a11a-34b8-4da1-b921-ca05b4d269b9
21ba9902-4e8c-4ec4-b95a-793759a984a6	2025-09-19 08:02:40.660724	2025-09-19 08:02:40.660724	BELT_OFF	d4a4a11a-34b8-4da1-b921-ca05b4d269b9
5539d74c-4cef-4e65-9302-bebc88926b0a	2025-09-19 08:03:40.687021	2025-09-19 08:03:40.687021	HELMET_OFF	bb0c3f1c-a589-475b-a344-40cadf8eae6d
f7c010bf-0e30-4cb0-969e-321fb14b9cb4	2025-09-19 08:03:40.688113	2025-09-19 08:03:40.688113	BELT_OFF	bb0c3f1c-a589-475b-a344-40cadf8eae6d
80f6561f-d973-4216-bf4d-1eeff4398a7f	2025-09-19 08:04:40.791842	2025-09-19 08:04:40.791842	HELMET_OFF	9df2c105-6311-4b37-8dae-68900878766c
f17a268e-3038-4249-b018-24039d3e1456	2025-09-19 08:04:40.792798	2025-09-19 08:04:40.792798	BELT_OFF	9df2c105-6311-4b37-8dae-68900878766c
6b91585b-a180-41d3-9c3c-b08a4b8cbf79	2025-09-19 08:05:40.769418	2025-09-19 08:05:40.769418	HELMET_OFF	65782892-ad26-4fa1-bc45-8efb4bea7d57
da6656d4-3a99-40dd-ade6-750f97832383	2025-09-19 08:05:40.770407	2025-09-19 08:05:40.770407	BELT_OFF	65782892-ad26-4fa1-bc45-8efb4bea7d57
94754a32-c699-4251-b64b-a7c22255d023	2025-09-19 08:06:40.798534	2025-09-19 08:06:40.798534	HELMET_OFF	e7e43458-324f-4029-8292-0ae8c8b92cd5
ae4cc9e9-b166-4c50-bdc5-5811e2a967e0	2025-09-19 08:06:40.799481	2025-09-19 08:06:40.799481	BELT_OFF	e7e43458-324f-4029-8292-0ae8c8b92cd5
c59d3119-4d92-4b48-bc95-9cacb1ff8490	2025-09-19 08:07:40.815029	2025-09-19 08:07:40.815029	HELMET_OFF	fa5683da-0196-4b37-bbb7-c49cb931d7a1
43836c4c-1706-4838-b2e6-193dc4a69aea	2025-09-19 08:07:40.816175	2025-09-19 08:07:40.816175	BELT_OFF	fa5683da-0196-4b37-bbb7-c49cb931d7a1
eddaee28-2f71-4535-be02-be10258e8629	2025-09-18 15:12:38.740172	2025-09-18 15:12:38.740172	HELMET_OFF	533babbf-c212-443e-91f7-048f6dfcb890
dec9c574-5fea-45e0-81b8-d9af454cfbe9	2025-09-19 00:57:35.544455	2025-09-19 00:57:35.544455	HELMET_OFF	9fc5c5f8-10cd-44c0-a1ac-17b46db03949
a09d3702-00c9-48d4-95d8-f9580b58db0c	2025-09-19 00:58:35.554016	2025-09-19 00:58:35.554016	HELMET_OFF	2c2289c9-1bba-4597-939a-13f0326e69fc
792328fd-6a85-4644-9cc9-135d3a191279	2025-09-19 01:00:03.714331	2025-09-19 01:00:03.714331	HELMET_OFF	19796459-54b1-47a2-b5cc-c892da622f04
0c016574-15c0-4052-8830-ebb6bfc17a66	2025-09-19 01:01:03.874712	2025-09-19 01:01:03.874712	HELMET_OFF	04d9f213-390d-486e-96b2-d5856ff5ed78
ab3bf1a7-1d88-4ce4-bd41-19ae06a963fa	2025-09-19 01:04:20.333748	2025-09-19 01:04:20.333748	HELMET_OFF	cf6e9ec2-2dbc-4bc3-a574-1a863fd28d7f
af23b1a1-dc47-4910-8a49-c4c30a38d6da	2025-09-19 01:08:25.082985	2025-09-19 01:08:25.082985	HELMET_OFF	a78b1238-000c-42ce-95b5-b2275f11a5ab
7062df46-3877-49fb-88a4-4f0a2830be20	2025-09-19 01:08:25.084755	2025-09-19 01:08:25.084755	BELT_OFF	a78b1238-000c-42ce-95b5-b2275f11a5ab
08ba09f0-2319-41cf-bdcb-efd43c8bb132	2025-09-19 01:08:45.931081	2025-09-19 01:08:45.931081	HELMET_OFF	eece92cc-d7f7-434d-8260-560d48faa1ad
9934a3d8-a9af-4db2-8ab1-3a99d9a82957	2025-09-19 01:08:45.932142	2025-09-19 01:08:45.932142	BELT_OFF	eece92cc-d7f7-434d-8260-560d48faa1ad
5facff3c-43bc-49c1-94cc-5f9a11de4bb0	2025-09-19 01:09:45.95045	2025-09-19 01:09:45.95045	HELMET_OFF	bbadd6a9-983a-4892-b4f3-c36eac0f44e0
325b28a2-851d-4e83-94ce-77fb94c679f6	2025-09-19 01:10:45.934675	2025-09-19 01:10:45.934675	HELMET_OFF	150af6ef-2f12-4318-bd89-82c107a05828
3debc97b-cd11-4679-8a0e-e29ccb953a5d	2025-09-19 01:11:46.002085	2025-09-19 01:11:46.002085	HELMET_OFF	5c9b93fa-3ef5-4764-bf9b-7cf818bfa92d
454c58f4-da74-4106-aef3-a68fd4fc72fe	2025-09-19 01:11:46.00314	2025-09-19 01:11:46.00314	BELT_OFF	5c9b93fa-3ef5-4764-bf9b-7cf818bfa92d
22f969f5-fcce-4c6f-96cd-a7388d7c5093	2025-09-19 01:12:46.0537	2025-09-19 01:12:46.0537	HELMET_OFF	6db92a27-7554-4be7-be46-146283ba18b9
ead3f2ef-4635-49d9-9b96-fb2ee609a8ca	2025-09-19 01:12:46.054665	2025-09-19 01:12:46.054665	BELT_OFF	6db92a27-7554-4be7-be46-146283ba18b9
6a628816-ec75-4eef-a632-1d5c76289421	2025-09-19 01:13:46.015547	2025-09-19 01:13:46.015547	HELMET_OFF	d873d1a2-234e-4f22-a986-3c80d988db2d
67f2476f-d497-4ab7-ac77-4b146a01e5c0	2025-09-19 01:14:46.078038	2025-09-19 01:14:46.078038	HELMET_OFF	b73d2ef2-94c4-4c45-9b58-266ba1223ef0
b2c0cf56-6aeb-42d2-b39a-c818aa9b5439	2025-09-19 01:14:46.078868	2025-09-19 01:14:46.078868	BELT_OFF	b73d2ef2-94c4-4c45-9b58-266ba1223ef0
bd4a5f1b-4579-4592-9ba5-1a4f29e01a37	2025-09-19 01:15:46.10522	2025-09-19 01:15:46.10522	HELMET_OFF	8535a1a0-7ff0-46ac-83cd-2bb2c58387c2
522cabef-fcc3-474d-9c3c-45f905479661	2025-09-19 01:16:46.148845	2025-09-19 01:16:46.148845	HELMET_OFF	925c8de5-afd0-4a72-a1ba-d30d9f11a03f
c731f447-2451-408e-91eb-7889b4f75bcd	2025-09-19 01:16:46.149643	2025-09-19 01:16:46.149643	BELT_OFF	925c8de5-afd0-4a72-a1ba-d30d9f11a03f
171b81fb-a105-4c91-a4a3-055d1df04d12	2025-09-19 01:17:46.126356	2025-09-19 01:17:46.126356	HELMET_OFF	e518bd88-da08-4655-b0c6-74a7a4d8c04d
6c39cebe-1d1c-4ea2-9f9f-27c5bf210358	2025-09-19 01:17:46.127292	2025-09-19 01:17:46.127292	BELT_OFF	e518bd88-da08-4655-b0c6-74a7a4d8c04d
ce1da238-c8b1-4f03-a82c-c8c787a0ec85	2025-09-19 01:18:46.168649	2025-09-19 01:18:46.168649	HELMET_OFF	5e52af12-b770-4d90-966a-717d2486bd0d
7755a7e0-c9f2-4fc8-9933-4ec6f7bad54e	2025-09-19 01:18:46.169626	2025-09-19 01:18:46.169626	BELT_OFF	5e52af12-b770-4d90-966a-717d2486bd0d
0d7e967f-f046-41e5-a004-bf60bfc777be	2025-09-19 01:19:46.236969	2025-09-19 01:19:46.236969	HELMET_OFF	a62d32d5-cb3a-44da-8845-cc00755024a4
4c5affe2-ed76-4526-b9b0-83823dbe7a7e	2025-09-19 01:19:46.237755	2025-09-19 01:19:46.237755	BELT_OFF	a62d32d5-cb3a-44da-8845-cc00755024a4
627c06f6-a0da-40f7-a78a-6945638aa0d8	2025-09-19 04:46:16.640113	2025-09-19 04:46:16.640113	HELMET_OFF	e75a466e-dcf2-4ca6-9df1-dea39ff50f1b
01b70251-d249-4e19-be98-6da7e412c739	2025-09-19 14:14:58.649157	2025-09-19 14:14:58.649157	HELMET_OFF	97f21d3a-7278-492a-9a02-965725cef1d0
d06a2cad-f250-4283-8d01-20039828269d	2025-09-19 06:05:11.151729	2025-09-19 06:05:11.151729	HELMET_OFF	e788b632-7ff1-45be-91e0-bacb00d49e93
40dd5e69-7636-4b5a-aa95-9ed75b872876	2025-09-19 06:08:37.856067	2025-09-19 06:08:37.856067	HELMET_OFF	49f95873-6b12-4317-bdad-e22bab6537b1
2eef6b33-eb49-4c52-91ae-0ea931d2cc03	2025-09-19 06:27:56.88739	2025-09-19 06:27:56.88739	HELMET_OFF	b45d6111-dba9-489d-a7ec-45de0d31c488
789c7a39-292c-43bf-b674-c1ad25993856	2025-09-19 06:28:20.00809	2025-09-19 06:28:20.00809	HELMET_OFF	570350a3-6e84-4bb4-a1f0-e4d13e75e8f3
d5729688-3d5e-4cfc-b534-158baf541a2e	2025-09-19 06:29:20.00001	2025-09-19 06:29:20.00001	HELMET_OFF	b08f77c9-80ae-4bf6-9f42-36d56eb44381
e2971b78-5f10-44d2-a331-5b942603f260	2025-09-19 15:48:31.616683	2025-09-19 15:48:31.616683	HELMET_OFF	1aaacb1d-a649-40f9-85e1-8278e51b3f4f
9d3aea61-5fdc-4900-ac49-80023726f7ed	2025-09-19 15:49:31.112085	2025-09-19 15:49:31.112085	HELMET_OFF	67cb4905-2ff5-4d13-bbaf-4c871c67871e
2e73451b-d8cf-4dc3-a6bb-b20ada4677dc	2025-09-19 06:50:31.267192	2025-09-19 06:50:31.267192	HELMET_OFF	2e7db5bf-5329-4009-b6cd-f25aac5a220c
d105361f-ee10-4e97-bc41-94a2c6883ceb	2025-09-19 06:53:31.339891	2025-09-19 06:53:31.339891	HELMET_OFF	4f89bc7e-f45e-4cfd-903d-c44af8d39761
94f861bd-58fc-4548-ba6f-d088907f0207	2025-09-19 06:54:32.453075	2025-09-19 06:54:32.453075	HELMET_OFF	42babc46-44f0-4798-9a3b-e48748e19b34
97218a59-23f5-4a3a-87dd-900cf95313db	2025-09-19 06:55:32.485134	2025-09-19 06:55:32.485134	HELMET_OFF	24de9e39-7515-4989-a401-b502bc563a35
8bf49bed-d4f6-4ac8-a817-29dcd4daa86d	2025-09-19 07:04:33.169384	2025-09-19 07:04:33.169384	HELMET_OFF	2e741a31-f9e6-47e6-8641-9edc11742b88
d12bfde7-b7e9-410a-8b22-d60553009df8	2025-09-19 07:05:33.222341	2025-09-19 07:05:33.222341	HELMET_OFF	6c9fbe9c-c3cf-4dbc-85b0-83b03c4b9f7a
f641d021-ea8f-4278-9298-b5beca0f8fbc	2025-09-19 07:18:33.682671	2025-09-19 07:18:33.682671	HELMET_OFF	48b3b653-2fad-44bb-9553-2f8c51001bb5
5ac7d2b5-237c-4d81-a7b3-e00d1220aa31	2025-09-19 07:18:33.683586	2025-09-19 07:18:33.683586	BELT_OFF	48b3b653-2fad-44bb-9553-2f8c51001bb5
cb57e1b1-f0f3-49b7-9f86-1cb7c69f57ff	2025-09-19 07:19:33.684539	2025-09-19 07:19:33.684539	HELMET_OFF	08cca163-7809-45ef-9b73-fb654a7c7177
98aa3021-cf99-4646-8603-ca4efd1a4fa6	2025-09-19 07:20:33.736905	2025-09-19 07:20:33.736905	HELMET_OFF	6d948ae0-530d-4040-929e-e253ed570230
829963e1-ed0f-48d5-9bbb-e2f0797ef468	2025-09-19 07:20:33.737782	2025-09-19 07:20:33.737782	BELT_OFF	6d948ae0-530d-4040-929e-e253ed570230
6dd10638-f2cc-4a56-b564-9e853e946975	2025-09-19 07:21:33.758716	2025-09-19 07:21:33.758716	HELMET_OFF	8012a18b-d947-4a6b-8446-8506da3f2f95
8bb53d2a-c758-45ed-8478-1469c3db73c8	2025-09-19 07:44:40.046401	2025-09-19 07:44:40.046401	HELMET_OFF	056f338d-7bf6-4534-9ee1-6aab38b61424
b237fc33-922e-4e9f-849e-8ef4ddc8e769	2025-09-19 07:45:40.066734	2025-09-19 07:45:40.066734	HELMET_OFF	b23e93eb-a09f-46e0-bda5-6d9d9d5528f8
26dd67bf-7e30-435c-957a-7730a3043ea7	2025-09-19 07:45:40.067728	2025-09-19 07:45:40.067728	BELT_OFF	b23e93eb-a09f-46e0-bda5-6d9d9d5528f8
3f983b19-c49e-498b-8110-c3b9348f7867	2025-09-19 16:51:40.512045	2025-09-19 16:51:40.512045	HELMET_OFF	abb7a6ae-2b34-4348-86b9-6538dd0251a3
ce56dffa-4f4a-461e-b746-083330d133e3	2025-09-19 16:51:40.527602	2025-09-19 16:51:40.527602	BELT_OFF	abb7a6ae-2b34-4348-86b9-6538dd0251a3
40ce8d21-21ca-4e89-834e-2557e63b80ff	2025-09-19 16:52:40.09346	2025-09-19 16:52:40.09346	HELMET_OFF	9e2881d5-9f29-44a9-bbfa-66c975ed5afd
a807f96b-f762-4d24-a579-c7de2834e2fe	2025-09-19 16:52:40.108508	2025-09-19 16:52:40.108508	BELT_OFF	9e2881d5-9f29-44a9-bbfa-66c975ed5afd
500dda92-72f0-46d8-8e0c-12368f5dd9a2	2025-09-19 08:35:42.953667	2025-09-19 08:35:42.953667	HELMET_OFF	c5e79946-441b-4254-bbd2-184ff0cb40a0
d1e0df77-dd2d-4d0b-b22a-7d8fa3bd76a0	2025-09-19 08:36:41.110649	2025-09-19 08:36:41.110649	HELMET_OFF	372b1bc5-d049-4a7f-9c1f-6806f6f6afe4
1dc37230-42e3-4389-bdef-a7f41b7526ec	2025-09-19 08:37:41.102233	2025-09-19 08:37:41.102233	HELMET_OFF	f05637d5-bcc6-448b-8fc7-01c3342aa0e6
a2ad83ee-1db5-4821-bd20-4ecca4dcac89	2025-09-19 08:38:41.118846	2025-09-19 08:38:41.118846	HELMET_OFF	48bd3e58-c6e3-48bb-9e28-be89ef0896b5
ecc4389d-1635-438a-ae15-02c855b1ab6e	2025-09-19 08:39:41.096518	2025-09-19 08:39:41.096518	HELMET_OFF	8207016a-c3cf-431b-84c4-f84ba5ef7365
e8dc0170-a6f2-4b9f-96a3-1ff5b468b539	2025-09-19 08:43:41.284316	2025-09-19 08:43:41.284316	HELMET_OFF	30c0dc5b-c8c9-4071-8a84-7e80b29b4bcc
cbc4b01e-d5bf-433e-a60f-ce4fae8b09b6	2025-09-19 08:47:41.377852	2025-09-19 08:47:41.377852	HELMET_OFF	eae8825c-200f-4df3-a065-55edd5ae6ff3
362d58b8-931b-45aa-b552-362da3f822cb	2025-09-19 08:48:41.451149	2025-09-19 08:48:41.451149	HELMET_OFF	c07f7152-c245-4e32-b7fd-4e19e020709b
d95d3486-4619-445a-b2ef-74a10f9427cc	2025-09-19 08:48:41.452236	2025-09-19 08:48:41.452236	BELT_OFF	c07f7152-c245-4e32-b7fd-4e19e020709b
5a4ce98d-5089-4dd7-af8b-fa2411e5f033	2025-09-19 08:49:41.479887	2025-09-19 08:49:41.479887	HELMET_OFF	5a63bf62-cc65-4c74-a2b6-0b4b92f3f0ce
4cecd2b7-bf3e-4efc-8170-e1537de43598	2025-09-19 08:50:41.494106	2025-09-19 08:50:41.494106	HELMET_OFF	61a599a8-d36b-40d0-b8ed-5d4eb4a44ffc
89b90e65-3542-49d3-a2b0-4a5edcaea31a	2025-09-19 08:50:41.495027	2025-09-19 08:50:41.495027	BELT_OFF	61a599a8-d36b-40d0-b8ed-5d4eb4a44ffc
5536434f-5a1a-4fba-aba6-53e310188050	2025-09-19 08:51:41.543198	2025-09-19 08:51:41.543198	HELMET_OFF	f6744bd7-6b3c-453d-84a6-15653a784f6a
fcd78bcb-b785-4c33-aa65-a196665a532a	2025-09-19 08:52:41.572024	2025-09-19 08:52:41.572024	HELMET_OFF	c98b3122-882f-4ee8-81e7-3656e57c8b7c
7d550ee0-05e2-4356-9053-f7565227cb4e	2025-09-19 08:53:41.592749	2025-09-19 08:53:41.592749	HELMET_OFF	a194b115-2214-41f1-9941-8b342ac84746
f80a447a-d657-48f7-b931-d142747787d3	2025-09-19 08:53:41.593656	2025-09-19 08:53:41.593656	BELT_OFF	a194b115-2214-41f1-9941-8b342ac84746
9476fe58-6470-4bf4-8f0c-7298a349b670	2025-09-19 08:54:41.640163	2025-09-19 08:54:41.640163	HELMET_OFF	a2ebee4d-61bf-4eac-9fc9-414bed05c820
72750a2b-51b0-41a6-bab8-de0cb88cb0a8	2025-09-19 08:54:41.64105	2025-09-19 08:54:41.64105	BELT_OFF	a2ebee4d-61bf-4eac-9fc9-414bed05c820
0e70857e-7e8f-4cf8-97c5-19740066d726	2025-09-22 00:52:40.588895	2025-09-22 00:52:40.588895	HELMET_OFF	c870370f-0878-4499-8254-f6d48767a668
b2007809-ef57-4fe2-966f-631114ea1d47	2025-09-22 00:52:40.592005	2025-09-22 00:52:40.592005	BELT_OFF	c870370f-0878-4499-8254-f6d48767a668
60794a92-f04c-4296-8aad-4ccae5eeef48	2025-09-22 00:53:38.962886	2025-09-22 00:53:38.962886	HELMET_OFF	554c7d89-c64d-4617-b151-28c2d707b3f6
35c01801-d625-464b-a5fa-c3574be8f7b3	2025-09-22 00:54:39.013538	2025-09-22 00:54:39.013538	HELMET_OFF	95ac5cbc-bad1-439f-956a-df393959d7f4
5f7051fe-3eec-42ee-82bc-50b70acc2cc9	2025-09-22 00:55:39.033781	2025-09-22 00:55:39.033781	HELMET_OFF	867d0d87-ef13-4267-aa16-5cf07f259258
5bf6232e-6de7-4749-80e9-0baefe327490	2025-09-22 00:55:39.034793	2025-09-22 00:55:39.034793	BELT_OFF	867d0d87-ef13-4267-aa16-5cf07f259258
1d952166-fcc3-40a5-8786-28b52dc35fc6	2025-09-22 00:56:39.106909	2025-09-22 00:56:39.106909	HELMET_OFF	70e3f6f2-8530-42b2-a503-3db0dbb6036a
4ea7766a-9bee-4537-b8a0-18014c1ceb67	2025-09-22 00:57:39.458667	2025-09-22 00:57:39.458667	HELMET_OFF	50d97800-b2a4-4047-a559-3d37decce951
5911d957-78ab-4f9a-855c-f62b424101a2	2025-09-22 00:57:39.460314	2025-09-22 00:57:39.460314	BELT_OFF	50d97800-b2a4-4047-a559-3d37decce951
14445650-82f2-4bd1-b962-19b38ac14d12	2025-09-22 01:09:00.17915	2025-09-22 01:09:00.17915	HELMET_OFF	49eb5068-86da-4ebe-a31e-799b93316f3d
86eb9680-1255-4328-9b03-a2b199ace01d	2025-09-22 01:09:58.984116	2025-09-22 01:09:58.984116	HELMET_OFF	cf733e6f-0d13-4d4b-a2b4-3e98a7315522
c1864f12-df8b-45e3-a2a3-4d77966f0f2e	2025-09-22 01:10:59.025778	2025-09-22 01:10:59.025778	HELMET_OFF	28c92930-ad2d-4e07-b3a5-e62621638161
ab745081-527b-4f9e-8a39-d979737a018b	2025-09-22 01:11:59.023337	2025-09-22 01:11:59.023337	HELMET_OFF	d4dcc4e4-1fb0-45ff-88a3-a055a04f5107
0fe259e2-6643-416c-bea6-00409420f844	2025-09-22 01:11:59.024218	2025-09-22 01:11:59.024218	BELT_OFF	d4dcc4e4-1fb0-45ff-88a3-a055a04f5107
494ae554-d3ae-4fca-a701-82c3774a0d82	2025-09-18 23:58:07.182041	2025-09-18 23:58:07.182041	HELMET_OFF	fe8ee1de-23f5-4dac-9a63-58b1c7322e39
59670112-87a1-43be-b16f-490a04cd4d9c	2025-09-19 01:05:22.291862	2025-09-19 01:05:22.291862	HELMET_OFF	c35be8c9-49c1-4de5-8f50-5c2bf2edd038
ee94ff01-bdaa-4269-b87b-1dae2f6529e3	2025-09-19 01:20:46.211891	2025-09-19 01:20:46.211891	HELMET_OFF	248afd9b-ef9d-4aa7-b059-6b3a2091446d
efe7a1b3-703d-48dc-864a-993d55091fcb	2025-09-19 01:20:46.21268	2025-09-19 01:20:46.21268	BELT_OFF	248afd9b-ef9d-4aa7-b059-6b3a2091446d
fda49a3a-205c-48d4-8aee-c1d2bc1054eb	2025-09-19 01:21:46.238518	2025-09-19 01:21:46.238518	HELMET_OFF	ffe290a4-3d7a-4a67-98be-df8c81052c8d
527fef10-344b-4999-ac42-ba88f1b0a962	2025-09-19 01:21:46.239261	2025-09-19 01:21:46.239261	BELT_OFF	ffe290a4-3d7a-4a67-98be-df8c81052c8d
ac71a81a-5d08-4d09-8f52-d98f34cf2739	2025-09-19 01:22:46.225731	2025-09-19 01:22:46.225731	HELMET_OFF	6b32d976-c3e5-4c38-af9b-c4cb37923a99
30d8da3c-4fb5-4ae5-88bd-b9a09f99b40c	2025-09-19 01:22:46.226524	2025-09-19 01:22:46.226524	BELT_OFF	6b32d976-c3e5-4c38-af9b-c4cb37923a99
f4fa3bbb-15a0-4bb0-9bed-e8f0cb55ae0e	2025-09-19 01:23:46.296923	2025-09-19 01:23:46.296923	HELMET_OFF	778646a7-a096-4231-9cb0-5d0e705e395a
d19b02de-4eb7-4968-93cc-4a0e2c4e2eb8	2025-09-19 01:23:46.297735	2025-09-19 01:23:46.297735	BELT_OFF	778646a7-a096-4231-9cb0-5d0e705e395a
084e14b0-d02a-4c32-b3a1-dc4fa7c7f8f3	2025-09-19 01:24:46.373967	2025-09-19 01:24:46.373967	HELMET_OFF	642d396a-7641-45c9-8e38-79c9be58ce6b
d2b35075-3b6c-47db-908e-f29869f0739d	2025-09-19 01:24:46.374911	2025-09-19 01:24:46.374911	BELT_OFF	642d396a-7641-45c9-8e38-79c9be58ce6b
7e91ebf6-051e-4f6b-83fe-f6d902d5b3ad	2025-09-19 04:52:57.122766	2025-09-19 04:52:57.122766	HELMET_OFF	aaf6e729-126d-4d8c-8ed9-29d3e929deaf
c5e03541-92d1-4b48-9540-697dcf929d5c	2025-09-19 14:23:11.378314	2025-09-19 14:23:11.378314	HELMET_OFF	0d629761-8fb9-4dbe-abcb-42a3a9c3f5cc
746e0541-1699-4708-8f74-c0272955721d	2025-09-19 14:24:28.241178	2025-09-19 14:24:28.241178	BELT_OFF	1650d718-601a-4bf1-9a73-f6a78f45add5
78bb7935-412b-4247-9431-34e2062c94b1	2025-09-19 14:24:28.254689	2025-09-19 14:24:28.254689	HELMET_OFF	1650d718-601a-4bf1-9a73-f6a78f45add5
c36637ab-31a8-4171-8c9b-972ceb39475d	2025-09-19 14:30:41.081619	2025-09-19 14:30:41.081619	HELMET_OFF	20e0ff9e-0cdf-4731-bb7c-32d8df0978de
c695c481-4079-464d-bebf-1787fac5d851	2025-09-19 14:32:33.2581	2025-09-19 14:32:33.2581	HELMET_OFF	0b1fd67d-d08d-44ba-9b7e-776265ddccf0
9833fd31-1f57-4add-8a67-3002f46c821a	2025-09-19 06:09:36.816829	2025-09-19 06:09:36.816829	BELT_OFF	9e4e28df-3001-46b9-8055-833002cf80fd
887c436b-6eef-4129-9a67-cf7d3d9194cb	2025-09-19 06:09:36.8178	2025-09-19 06:09:36.8178	HELMET_OFF	9e4e28df-3001-46b9-8055-833002cf80fd
e6b45abe-9991-4120-acf5-eabc97e3e5ea	2025-09-19 06:10:36.85076	2025-09-19 06:10:36.85076	HELMET_OFF	7d394fd9-2b0a-44f2-be84-6a9452184014
d9d845b5-1703-407d-b84b-a7300a6b5653	2025-09-19 06:11:36.91221	2025-09-19 06:11:36.91221	HELMET_OFF	8bf6a539-c43e-430c-ada6-0c338a4e4bba
1be1b7c2-676b-4229-94b4-0f62d1f2dc7d	2025-09-19 06:12:36.910576	2025-09-19 06:12:36.910576	HELMET_OFF	1004c0c6-23fb-4140-a9f9-d84cf4277ce0
da86d8dc-5ac8-4403-bc07-eacafd5a8b9e	2025-09-19 06:13:36.959857	2025-09-19 06:13:36.959857	HELMET_OFF	7729b0d1-9834-4773-a01f-da6c0e86c837
9fe8ffaf-e40b-4c2d-806c-6eb68ccf523c	2025-09-19 06:14:37.850112	2025-09-19 06:14:37.850112	BELT_OFF	bb1e890e-fb86-42ec-adea-1b25886702e1
06cf62b8-0aff-43e1-8952-9ce17c2236ec	2025-09-19 06:30:19.984896	2025-09-19 06:30:19.984896	HELMET_OFF	4d1e007f-ef65-424d-afd8-b27905a9ac00
740214e1-8ae9-4f9c-8dd9-eca7c0b2dd86	2025-09-19 06:31:30.348392	2025-09-19 06:31:30.348392	HELMET_OFF	7fcca8b9-bd81-4cc5-a0ee-17c02391cb7c
a2a012c6-e1ed-4f11-8eca-d66ce6d3eb0a	2025-09-19 06:32:30.303245	2025-09-19 06:32:30.303245	HELMET_OFF	919c8096-1543-430a-ac1f-4acd1d29681a
270fc8d9-8c34-45f6-bdfe-a25e07bc2c0b	2025-09-19 06:33:30.322395	2025-09-19 06:33:30.322395	HELMET_OFF	783625de-f01b-42b3-8079-6f16e398c11f
efd4ce71-b6bb-4ef2-a006-5e55c6112c88	2025-09-19 06:33:30.323586	2025-09-19 06:33:30.323586	BELT_OFF	783625de-f01b-42b3-8079-6f16e398c11f
1c2d2f24-a4ed-4278-8738-f16737765e27	2025-09-19 06:34:30.338132	2025-09-19 06:34:30.338132	HELMET_OFF	fb277440-d59f-43fb-b20e-f16cb677b1f4
15907c7b-4489-4190-b6c6-407acc9e80f2	2025-09-19 06:35:30.374541	2025-09-19 06:35:30.374541	HELMET_OFF	2ac6c914-f155-4bb8-952e-171b53d79232
94371ca3-4b2b-4aa2-9a2b-12572cda2b80	2025-09-19 06:36:30.608572	2025-09-19 06:36:30.608572	HELMET_OFF	0cde6e12-bfaf-40d4-81e3-c251e8281d35
b55b7587-3be9-4b3f-b646-edd1629fa3e0	2025-09-19 06:37:30.616739	2025-09-19 06:37:30.616739	HELMET_OFF	103fd187-bdc6-481f-a1bc-0767c8f64aaf
6cad6a28-8715-4a23-bf25-f0abfdb238f4	2025-09-19 06:38:30.667269	2025-09-19 06:38:30.667269	HELMET_OFF	60fc5162-33ca-458d-b994-f020c2b73427
e00dd758-6504-4f95-922c-d010db3d1e9a	2025-09-19 06:39:30.680264	2025-09-19 06:39:30.680264	HELMET_OFF	75302bac-c61c-47ad-ab96-31eaa519b2f3
0ad13dde-f8dd-4c17-9cbd-5265987fb3ad	2025-09-19 06:40:30.684408	2025-09-19 06:40:30.684408	HELMET_OFF	bb78c7bd-9646-4bf9-8dfb-67a631605cc8
0742bc7b-9e1d-4e11-ba0d-bf51473b8e13	2025-09-19 06:51:31.329153	2025-09-19 06:51:31.329153	HELMET_OFF	bebc1402-f2c8-458c-9c5d-597535ad491e
8777f922-b5f4-422a-994c-6ee7022fbc2d	2025-09-19 06:56:32.474477	2025-09-19 06:56:32.474477	HELMET_OFF	368f56ce-0412-4cfd-8b22-eeb1d959d27b
2b9176a5-1ebf-4729-8f4e-23a881b84ec6	2025-09-19 06:57:32.548877	2025-09-19 06:57:32.548877	HELMET_OFF	39a1854c-0cd0-4436-977e-69196a34d269
8b0e1cc5-a55a-4465-bf77-d7d67549087e	2025-09-19 06:58:32.550347	2025-09-19 06:58:32.550347	HELMET_OFF	1b0fa7f0-3c1e-4622-9187-bfe0273bc3b8
71b14e9c-fa3f-45c4-85e5-045bc861bf56	2025-09-19 06:59:33.043246	2025-09-19 06:59:33.043246	HELMET_OFF	bb311940-fcaf-4f07-84c4-375f5158e864
5f58feaa-92c6-400d-a56a-7dfcde6fdfdd	2025-09-19 06:59:33.044254	2025-09-19 06:59:33.044254	BELT_OFF	bb311940-fcaf-4f07-84c4-375f5158e864
1fa3f616-6bd1-4cb7-926c-e37942cd3341	2025-09-19 07:00:33.074406	2025-09-19 07:00:33.074406	HELMET_OFF	cda3c81c-f712-4c1f-9972-a8bc604d27e5
4e716360-45dd-476b-a6b7-e72919082890	2025-09-19 07:01:33.127631	2025-09-19 07:01:33.127631	HELMET_OFF	e97ae374-d7db-42af-971a-3f3e8f1065de
d0fe7a67-c415-42b6-876c-164827a13a43	2025-09-19 07:03:33.14965	2025-09-19 07:03:33.14965	HELMET_OFF	6a68fdb8-d66d-47e0-8c89-09dbb6671b4a
05ee2452-a9a3-48b4-912d-99822e30393a	2025-09-19 07:06:33.340333	2025-09-19 07:06:33.340333	HELMET_OFF	878b07a2-b58d-4554-9257-cb74d3f270a1
6afaf2c4-f046-4c0f-b625-a53abf83fc42	2025-09-19 07:06:33.341353	2025-09-19 07:06:33.341353	BELT_OFF	878b07a2-b58d-4554-9257-cb74d3f270a1
8a2e26a4-7275-466d-a97c-bfa625321f38	2025-09-19 07:07:33.385578	2025-09-19 07:07:33.385578	HELMET_OFF	a3c4f749-b4f1-4648-9ad8-0c7ba908ca66
21c52840-3552-495d-85ef-e5f3837abf8c	2025-09-19 07:07:33.386462	2025-09-19 07:07:33.386462	BELT_OFF	a3c4f749-b4f1-4648-9ad8-0c7ba908ca66
180cc5ab-f648-4f12-9386-b30bdef0601c	2025-09-19 07:08:33.426904	2025-09-19 07:08:33.426904	HELMET_OFF	9845456d-b6e8-4ac8-b0ca-2f641c1ac951
36cd2f4f-3dc5-4736-bf61-23713a93cdf4	2025-09-19 07:08:33.427722	2025-09-19 07:08:33.427722	BELT_OFF	9845456d-b6e8-4ac8-b0ca-2f641c1ac951
b08ca801-8d6a-4b5b-ab91-cd0df252ca04	2025-09-19 07:09:33.406781	2025-09-19 07:09:33.406781	HELMET_OFF	25982d29-8b0f-48c5-b511-6aa95cfb39d0
b51800de-a134-464e-bf9f-0ae4eac8e137	2025-09-19 07:10:33.46133	2025-09-19 07:10:33.46133	HELMET_OFF	87421f7a-8faf-409d-bf92-4dbd5fa168c2
31ae3a0a-cbc8-4c81-8691-fc5c9a2cb6d6	2025-09-19 07:11:33.474349	2025-09-19 07:11:33.474349	HELMET_OFF	071dcb9b-a81a-4566-91e3-abb739628a98
d8a50074-23e8-4581-9ba8-63aec4d7b072	2025-09-19 07:11:33.475165	2025-09-19 07:11:33.475165	BELT_OFF	071dcb9b-a81a-4566-91e3-abb739628a98
76d82b5a-230c-4da8-aaf9-01d892807327	2025-09-19 07:12:33.547154	2025-09-19 07:12:33.547154	HELMET_OFF	d70291dd-e8aa-4a09-b264-7b758471de7f
88d670eb-e966-4756-9013-44b56122f7a3	2025-09-19 07:13:33.594676	2025-09-19 07:13:33.594676	HELMET_OFF	66ca028c-3daa-443e-aaeb-f25d1ca8a647
146f374f-c938-417e-b050-b610a3e6d8c4	2025-09-19 07:13:33.595527	2025-09-19 07:13:33.595527	BELT_OFF	66ca028c-3daa-443e-aaeb-f25d1ca8a647
38fce654-8a62-482d-8c7e-3dadc4544249	2025-09-19 07:14:33.609715	2025-09-19 07:14:33.609715	HELMET_OFF	948afc34-29fd-46a2-982f-678ce9a0c976
5ee35802-66d6-4b4c-bc35-bd5c75cb7b37	2025-09-19 07:14:33.610577	2025-09-19 07:14:33.610577	BELT_OFF	948afc34-29fd-46a2-982f-678ce9a0c976
28415779-28f3-4259-87d4-543b202c04f8	2025-09-19 07:15:33.636937	2025-09-19 07:15:33.636937	HELMET_OFF	1519f2d6-0072-4f3e-b7bc-19c6a57e45f0
2b91a3b4-fa1a-45d0-ad2d-6791464317b1	2025-09-19 07:15:33.637741	2025-09-19 07:15:33.637741	BELT_OFF	1519f2d6-0072-4f3e-b7bc-19c6a57e45f0
3df1c6cb-7a2a-49a4-b287-1ababec702bc	2025-09-19 07:16:33.676107	2025-09-19 07:16:33.676107	HELMET_OFF	5b8fb1a5-0549-4401-8692-b38c45c80cb3
5ff76ad8-0a0a-4550-9dc7-a787afe41885	2025-09-19 07:16:33.677124	2025-09-19 07:16:33.677124	BELT_OFF	5b8fb1a5-0549-4401-8692-b38c45c80cb3
7bc908f7-1773-48aa-999e-7045a77b462c	2025-09-19 07:22:33.781432	2025-09-19 07:22:33.781432	HELMET_OFF	050e9347-5e09-430a-8191-207577dc1382
af3a16b9-bd32-4cd6-99a1-7d3d689825e2	2025-09-19 07:23:34.044663	2025-09-19 07:23:34.044663	HELMET_OFF	aaec15f3-dd9b-4eb1-bda8-071c2a8482c4
f26ebe7e-2912-40b6-8e44-f6a6ee773bd0	2025-09-19 07:23:34.045531	2025-09-19 07:23:34.045531	BELT_OFF	aaec15f3-dd9b-4eb1-bda8-071c2a8482c4
9c0e1ab5-2f04-41ad-aa09-a80659ae7a29	2025-09-19 07:24:34.067583	2025-09-19 07:24:34.067583	HELMET_OFF	eeeb8278-2f24-487e-8469-b9e7191f49f7
8f60d3ee-be9a-4180-9d14-c65e866afaa2	2025-09-19 07:42:39.963397	2025-09-19 07:42:39.963397	HELMET_OFF	36396dc8-34f0-4e83-8650-27455d7a003d
4bb05082-839a-4424-b215-23b1a5911a37	2025-09-19 07:42:39.964314	2025-09-19 07:42:39.964314	BELT_OFF	36396dc8-34f0-4e83-8650-27455d7a003d
8a862081-1432-48ac-8dfe-f1d6b660c230	2025-09-19 07:43:40.014061	2025-09-19 07:43:40.014061	BELT_OFF	2a3d9be7-5191-446e-a541-09e530eaa8f1
0aa6a6bf-7bf1-47c3-acea-ab9e78de361d	2025-09-19 07:46:40.135993	2025-09-19 07:46:40.135993	HELMET_OFF	19025f51-b1bc-4fab-8c16-8c353076113a
2e8e9bfc-5278-43e6-a82b-e5c114d82c92	2025-09-19 07:46:40.136992	2025-09-19 07:46:40.136992	BELT_OFF	19025f51-b1bc-4fab-8c16-8c353076113a
9facfd7e-ce56-46a1-9559-d58416e37be7	2025-09-19 16:56:40.645935	2025-09-19 16:56:40.645935	HELMET_OFF	35023bfc-b174-4544-b91f-1cc7435bd13b
1fa50139-31ee-49b7-a934-82dcf76d0896	2025-09-19 16:56:40.66054	2025-09-19 16:56:40.66054	BELT_OFF	35023bfc-b174-4544-b91f-1cc7435bd13b
3ee6d2e6-217c-408a-b709-6b5898731c22	2025-09-19 16:57:40.235013	2025-09-19 16:57:40.235013	HELMET_OFF	40baacb2-0d7c-45df-8331-1ee97f8f678d
88a78969-e35d-45de-9aa3-103e9a4d5e75	2025-09-19 16:57:40.249119	2025-09-19 16:57:40.249119	BELT_OFF	40baacb2-0d7c-45df-8331-1ee97f8f678d
58eee7bb-c5d5-4a49-9230-5e50482509a5	2025-09-19 08:40:41.178382	2025-09-19 08:40:41.178382	HELMET_OFF	39b1d96c-c381-4891-aca6-09aa6d0818a6
387cb0a0-b79b-4c4d-b919-d64f3a5ac37a	2025-09-19 08:40:41.179747	2025-09-19 08:40:41.179747	BELT_OFF	39b1d96c-c381-4891-aca6-09aa6d0818a6
235b4d2e-cfe8-48c8-83e0-3066ffe0c655	2025-09-19 08:41:41.151729	2025-09-19 08:41:41.151729	HELMET_OFF	ce497e9f-02af-4418-9a2e-3f322defd97e
eaf306e3-2d3b-4ff8-bc04-a845a4567ff7	2025-09-19 08:41:41.152776	2025-09-19 08:41:41.152776	BELT_OFF	ce497e9f-02af-4418-9a2e-3f322defd97e
9f0a05a2-6b56-4ce4-a8b1-326cf5e3026f	2025-09-19 08:42:41.238937	2025-09-19 08:42:41.238937	HELMET_OFF	430ca129-d965-4ea7-a08e-27a3ed3491c1
a2f69d80-0e58-40e0-8c6f-fdcf09eead24	2025-09-19 08:42:41.239976	2025-09-19 08:42:41.239976	BELT_OFF	430ca129-d965-4ea7-a08e-27a3ed3491c1
02550090-b466-4771-a30b-1d1ea363c313	2025-09-19 08:44:41.273244	2025-09-19 08:44:41.273244	HELMET_OFF	521fc1ee-49b1-45e9-8c15-1838fdf38af3
714ec53a-888b-490e-88f3-c8e5a45e01f5	2025-09-19 08:45:41.347873	2025-09-19 08:45:41.347873	HELMET_OFF	088c79aa-2f90-4f17-97ec-6abf6fe68d95
6a1fbbc2-a4dd-4f17-8d3a-9b1220453642	2025-09-19 08:45:41.349083	2025-09-19 08:45:41.349083	BELT_OFF	088c79aa-2f90-4f17-97ec-6abf6fe68d95
940758c2-73ab-45ee-8cd9-0a7a18abd2d1	2025-09-19 08:46:41.530117	2025-09-19 08:46:41.530117	HELMET_OFF	96ecd251-5b80-43ee-9bf6-18144a8a4012
5dc77899-0e8e-470e-a974-8c5beebb4d35	2025-09-22 01:12:59.054776	2025-09-22 01:12:59.054776	HELMET_OFF	6433e358-f4b0-49da-8116-4dba7aad7045
c4673efc-6c54-4618-ba5d-fb351b30a8b5	2025-09-22 01:13:59.080942	2025-09-22 01:13:59.080942	HELMET_OFF	58cdbb93-5666-49ca-ada6-c38feadf90e5
fb5e7b40-ef71-4288-aafc-4316a4d54052	2025-09-22 01:49:53.317542	2025-09-22 01:49:53.317542	HELMET_OFF	47c2dea1-a0f0-44ac-9359-f66f99c7cc22
c8659ccb-4a63-49bc-af63-ac5520f6cfab	2025-09-22 01:49:53.318529	2025-09-22 01:49:53.318529	BELT_OFF	47c2dea1-a0f0-44ac-9359-f66f99c7cc22
7fd17216-fc38-4ae1-9b31-24023f2e8de7	2025-09-22 01:50:52.221301	2025-09-22 01:50:52.221301	HELMET_OFF	97882fe1-5830-4d29-bb20-773bfae00f4b
92515c8c-6ab6-4963-a839-736ee1d3af4e	2025-09-22 01:51:52.208804	2025-09-22 01:51:52.208804	HELMET_OFF	4fcf342e-0d3c-40e2-9757-fa4097719a8d
d3e87b41-55a7-42ba-ac73-2f2e11d7f6f3	2025-09-22 01:52:52.257661	2025-09-22 01:52:52.257661	HELMET_OFF	d092f762-6e92-4ddd-9862-baa4470612e3
fae18767-6c86-44f6-a73a-ce19d1d50b58	2025-09-22 01:53:52.267472	2025-09-22 01:53:52.267472	HELMET_OFF	98a322eb-410f-41c3-b4f2-32b4ec667ffa
36d4662c-f09d-4702-909c-c756cfd0396e	2025-09-22 03:13:59.592535	2025-09-22 03:13:59.592535	HELMET_OFF	8656e611-2448-42fb-be59-18b6366f7de4
51e5450f-6017-4365-8a6b-d428ea0f7009	2025-09-22 03:14:57.789583	2025-09-22 03:14:57.789583	HELMET_OFF	ff58d925-ee03-4571-b639-355e85a8cc4d
4d65a19d-f335-487b-be57-60aeae051f6b	2025-09-22 03:15:57.833977	2025-09-22 03:15:57.833977	HELMET_OFF	0ad2bffc-aa43-490e-a2bc-8c1cad296ad1
bbf692d9-541c-4a46-90f1-c8049815fe5c	2025-09-22 03:16:57.879083	2025-09-22 03:16:57.879083	HELMET_OFF	50ac2570-473a-4139-82fb-ab2b7af6134e
6056cef5-b2f7-488c-8a47-8aa230fb5be9	2025-09-22 03:16:57.879986	2025-09-22 03:16:57.879986	BELT_OFF	50ac2570-473a-4139-82fb-ab2b7af6134e
4a23fa77-02a6-4d88-90cb-922dd8c00070	2025-09-22 03:18:05.613709	2025-09-22 03:18:05.613709	HELMET_OFF	8e3893cb-801e-463b-920a-e6b769467570
5ca5e362-a8c8-4952-b904-ab043b004bdb	2025-09-22 03:25:52.719746	2025-09-22 03:25:52.719746	HELMET_OFF	06296b8e-4c24-4d01-b083-90f88c15db05
562835df-2b3d-467c-a9cf-01df0670822d	2025-09-22 03:26:51.489318	2025-09-22 03:26:51.489318	HELMET_OFF	5f81cff7-c6dc-482d-b198-1741c3ad401e
8fc274be-070f-465f-a040-8a20da5ec4e4	2025-09-22 03:27:51.520636	2025-09-22 03:27:51.520636	HELMET_OFF	49a905fc-5427-4cab-9fd9-b22d58c748f5
c23aaf60-111e-431f-a989-4f9b655cd1df	2025-09-22 03:29:11.341526	2025-09-22 03:29:11.341526	HELMET_OFF	f2327df6-4a57-4d1b-8350-298843f45a4a
3ba4c80c-3beb-44eb-8f80-c785719770ac	2025-09-22 03:30:11.319484	2025-09-22 03:30:11.319484	HELMET_OFF	70019eb1-0521-4f97-aa06-18d54b386b6c
0037b559-151a-4216-b3bb-23a4227ae3ab	2025-09-22 03:31:21.608504	2025-09-22 03:31:21.608504	HELMET_OFF	4e82e807-cf67-4aa7-8b46-eac7dad80700
dba3e0b0-105d-4eba-b1a2-61840f17d28f	2025-09-22 03:32:21.574392	2025-09-22 03:32:21.574392	HELMET_OFF	df2d264f-133f-49a8-970c-bb12100caf29
79ebbe8d-bc0c-40e5-ba18-4279e4b205d6	2025-09-22 03:33:21.603254	2025-09-22 03:33:21.603254	HELMET_OFF	b2f35777-b807-4e85-b3fc-48d32ce4ac3b
ef090ccd-5d36-4372-a30d-7e18e77e3dbe	2025-09-22 04:44:20.905395	2025-09-22 04:44:20.905395	HELMET_OFF	d442986d-ec9b-4309-bb6d-69383554a75d
cccd57ed-9602-4ea1-a147-722a0112fd7c	2025-09-22 04:44:20.906355	2025-09-22 04:44:20.906355	BELT_OFF	d442986d-ec9b-4309-bb6d-69383554a75d
c0326405-0fd9-4cdc-9bd4-04c94602c6b8	2025-09-22 04:45:19.471378	2025-09-22 04:45:19.471378	HELMET_OFF	384d0587-2adf-4b24-a8e5-66162a7e1c2c
c95f9e22-b6bb-4b1c-8a6d-fe57b6e6b875	2025-09-22 04:46:19.577915	2025-09-22 04:46:19.577915	HELMET_OFF	b0def5ed-6261-49df-b8c9-387380442ac8
b36dbc38-67fb-4bff-85d1-02f24042761c	2025-09-22 04:46:19.578856	2025-09-22 04:46:19.578856	BELT_OFF	b0def5ed-6261-49df-b8c9-387380442ac8
ef8df5ea-f4e7-43d2-9d56-6fc7a34840d8	2025-09-22 04:47:19.60377	2025-09-22 04:47:19.60377	HELMET_OFF	e301a94d-8c0f-4724-a06a-21dd7f89c689
258d0235-3e61-41d0-ac03-fdb5bcecfd4d	2025-09-22 04:47:19.604667	2025-09-22 04:47:19.604667	BELT_OFF	e301a94d-8c0f-4724-a06a-21dd7f89c689
d42b8c1e-58ad-443e-8a1a-e2fce71f2c43	2025-09-22 04:48:19.641954	2025-09-22 04:48:19.641954	HELMET_OFF	ded461bb-f9ca-4dd1-ae08-3e786c2de1c9
c97286f6-e9a3-4a9b-a743-429f31dff8ea	2025-09-22 04:48:19.642833	2025-09-22 04:48:19.642833	BELT_OFF	ded461bb-f9ca-4dd1-ae08-3e786c2de1c9
5a257abe-d179-48f8-b0c1-727a520bdb9d	2025-09-22 04:49:19.70803	2025-09-22 04:49:19.70803	HELMET_OFF	7a440028-45f6-4929-897c-9fdf5a45fa1a
2621f38f-ac84-4560-8642-648e9af04c38	2025-09-22 04:49:19.708877	2025-09-22 04:49:19.708877	BELT_OFF	7a440028-45f6-4929-897c-9fdf5a45fa1a
75d39828-3c16-4044-aa23-e8368d3aad5e	2025-09-22 04:50:20.135789	2025-09-22 04:50:20.135789	HELMET_OFF	5c2ac72f-5cee-44e7-8aa5-50420229c817
5a9a323a-c0e6-458e-b4c4-772ebcb5568b	2025-09-22 04:50:20.136742	2025-09-22 04:50:20.136742	BELT_OFF	5c2ac72f-5cee-44e7-8aa5-50420229c817
b6943b1d-5b50-412e-989f-cbda947090c8	2025-09-22 04:51:20.18313	2025-09-22 04:51:20.18313	HELMET_OFF	452fe577-8aad-4b98-ae47-c9602fc92b5f
912faba2-2d8e-43d8-ab08-9423cfc0c820	2025-09-22 04:51:20.184056	2025-09-22 04:51:20.184056	BELT_OFF	452fe577-8aad-4b98-ae47-c9602fc92b5f
77380bb7-3dd5-4ea3-a97a-66ef932479ec	2025-09-22 04:52:20.206431	2025-09-22 04:52:20.206431	HELMET_OFF	69bff940-5093-44a8-8417-b2697253ebba
cc017c54-ff13-4ff4-9a3e-45e8e7d84130	2025-09-22 04:52:20.207354	2025-09-22 04:52:20.207354	BELT_OFF	69bff940-5093-44a8-8417-b2697253ebba
48509b20-5abb-42c7-8e79-244eba29e711	2025-09-22 04:53:20.28067	2025-09-22 04:53:20.28067	HELMET_OFF	5b76e770-9f8d-400b-81d4-403336e35f20
19c1d441-6461-49ae-88e3-b55da4bfb9ec	2025-09-22 04:53:20.281591	2025-09-22 04:53:20.281591	BELT_OFF	5b76e770-9f8d-400b-81d4-403336e35f20
9c384f19-bca9-4694-b93d-b5a87aca32c0	2025-09-22 04:54:20.319238	2025-09-22 04:54:20.319238	HELMET_OFF	a4854abc-262e-4397-81c6-834363a7ae00
3421d19c-57a1-494b-9253-af2a2467f5a8	2025-09-22 04:54:20.320031	2025-09-22 04:54:20.320031	BELT_OFF	a4854abc-262e-4397-81c6-834363a7ae00
a9c35979-b2ea-42c8-ab65-4fcff98fb740	2025-09-22 04:55:20.475483	2025-09-22 04:55:20.475483	HELMET_OFF	5adb643e-5c27-4882-b2b9-51ef2d84b2df
154e3519-fb8a-416d-af5c-e1d71c48e36e	2025-09-22 04:55:20.476291	2025-09-22 04:55:20.476291	BELT_OFF	5adb643e-5c27-4882-b2b9-51ef2d84b2df
545aab21-a331-4a1c-98a6-4950c7b61f3e	2025-09-22 04:56:20.525885	2025-09-22 04:56:20.525885	HELMET_OFF	d58dd46c-be3b-4703-93d3-fd39380444fc
0f8d9cfb-cec7-4452-8b5f-a26895c2366b	2025-09-22 04:56:20.526687	2025-09-22 04:56:20.526687	BELT_OFF	d58dd46c-be3b-4703-93d3-fd39380444fc
5ba1842a-1338-434a-9a61-77cb8f0835cf	2025-09-22 04:57:20.595463	2025-09-22 04:57:20.595463	HELMET_OFF	c27b28fa-cb98-419c-b085-8919c25e3a22
5f312bbb-0b80-4c47-947c-3e8e9d28f800	2025-09-22 04:57:20.596259	2025-09-22 04:57:20.596259	BELT_OFF	c27b28fa-cb98-419c-b085-8919c25e3a22
c7a4e5e6-86b3-4a30-a4aa-9f0c4c8c2c1d	2025-09-22 04:58:20.580793	2025-09-22 04:58:20.580793	HELMET_OFF	20c0103c-de83-4e4f-b7ba-87631f3c0310
2f04ba4f-7bd0-44f5-adb6-eee8443ec9ff	2025-09-22 04:58:20.581574	2025-09-22 04:58:20.581574	BELT_OFF	20c0103c-de83-4e4f-b7ba-87631f3c0310
7acb949a-b486-4f2f-9d51-51c0c7ef7d43	2025-09-22 04:59:20.65796	2025-09-22 04:59:20.65796	HELMET_OFF	35a0777b-61e3-4535-b947-d2f4dad5f9cd
9e87ef82-b673-4815-8062-dff773664cda	2025-09-22 04:59:20.658682	2025-09-22 04:59:20.658682	BELT_OFF	35a0777b-61e3-4535-b947-d2f4dad5f9cd
cea2a5f7-8935-46de-89c0-082ea62db55c	2025-09-22 05:00:20.655406	2025-09-22 05:00:20.655406	HELMET_OFF	9c922d4c-f6bd-4278-ac28-0bd27f38fa4a
c98c2f38-03bb-4dca-89ae-f9f254927d68	2025-09-22 05:00:20.656279	2025-09-22 05:00:20.656279	BELT_OFF	9c922d4c-f6bd-4278-ac28-0bd27f38fa4a
2959b60c-7a9f-466a-aaf1-f3977efb2b37	2025-09-22 05:01:20.6892	2025-09-22 05:01:20.6892	HELMET_OFF	8ea88c81-c092-4b26-bf95-dc518961c68c
6178410f-4012-474a-b239-d87d575afc45	2025-09-22 05:01:20.689919	2025-09-22 05:01:20.689919	BELT_OFF	8ea88c81-c092-4b26-bf95-dc518961c68c
fb36f900-1429-44c3-b905-7660b96da1fe	2025-09-22 05:02:20.683027	2025-09-22 05:02:20.683027	HELMET_OFF	db758efc-6800-4f5a-8069-4c851743c222
d260f390-7170-4a93-a93a-69c32c980435	2025-09-22 05:02:20.683751	2025-09-22 05:02:20.683751	BELT_OFF	db758efc-6800-4f5a-8069-4c851743c222
e1a43da7-b07e-4c22-ba80-df90b4eed657	2025-09-22 05:03:20.761103	2025-09-22 05:03:20.761103	HELMET_OFF	7bccca57-0119-4811-9ef8-d52457a3e18c
bcb67164-abfa-4acf-a075-b00f831de0f2	2025-09-22 05:03:20.761909	2025-09-22 05:03:20.761909	BELT_OFF	7bccca57-0119-4811-9ef8-d52457a3e18c
0c4f8081-06db-4112-a34f-ae326ca25fa8	2025-09-22 05:04:20.806462	2025-09-22 05:04:20.806462	HELMET_OFF	a9d8a1d8-0454-4997-add9-809d8ad0b355
04c00416-4fbe-476c-9e51-229712380881	2025-09-22 05:04:20.807317	2025-09-22 05:04:20.807317	BELT_OFF	a9d8a1d8-0454-4997-add9-809d8ad0b355
d04b67ce-448d-493a-b614-7c0276736d84	2025-09-22 05:05:20.855565	2025-09-22 05:05:20.855565	HELMET_OFF	398aa5f5-6818-4afe-8899-d9af92c2c171
c04027b1-7eb5-4636-8ec1-0a5d7c23e484	2025-09-22 05:05:20.856393	2025-09-22 05:05:20.856393	BELT_OFF	398aa5f5-6818-4afe-8899-d9af92c2c171
cfe3940c-eec0-4910-867d-7f4398d88427	2025-09-22 05:06:20.883039	2025-09-22 05:06:20.883039	HELMET_OFF	73590643-4334-44db-8c34-e14d9aca67be
0ac684b6-e10a-489d-a3b4-bbdd2a5f921f	2025-09-22 05:06:20.883928	2025-09-22 05:06:20.883928	BELT_OFF	73590643-4334-44db-8c34-e14d9aca67be
8e75d31a-88c3-4c4f-bb5c-48662a5a0675	2025-09-22 05:07:20.942031	2025-09-22 05:07:20.942031	HELMET_OFF	66eb0966-726c-444e-9ea4-1c26e84fdf94
b6ee575d-74cb-427c-822c-2b34c71911c0	2025-09-22 05:07:20.942835	2025-09-22 05:07:20.942835	BELT_OFF	66eb0966-726c-444e-9ea4-1c26e84fdf94
30c60d26-ed4c-4a53-af6c-18c97ce8d685	2025-09-22 05:08:20.961418	2025-09-22 05:08:20.961418	HELMET_OFF	637f0013-7fd6-44a0-80fb-062571e14e11
120e158d-7d0a-4f28-8088-b7eb5a88dd18	2025-09-22 05:09:20.980601	2025-09-22 05:09:20.980601	HELMET_OFF	30c34ff0-a693-4764-850b-4cdc5adaf107
55d0c21c-16f8-4473-82e7-b14b88a0a2e9	2025-09-22 05:09:20.981546	2025-09-22 05:09:20.981546	BELT_OFF	30c34ff0-a693-4764-850b-4cdc5adaf107
1ef29adf-8c87-4b85-9846-e37bdc0b977d	2025-09-22 05:10:21.036139	2025-09-22 05:10:21.036139	HELMET_OFF	aa15bbe8-d9b3-4d83-8945-b9845aef6bac
2acb7c72-bdb1-4eb4-a517-02d7eed0ce06	2025-09-22 05:10:21.036973	2025-09-22 05:10:21.036973	BELT_OFF	aa15bbe8-d9b3-4d83-8945-b9845aef6bac
eeda7b56-af1a-4e26-8bdd-3ec9554caca8	2025-09-22 05:11:21.093418	2025-09-22 05:11:21.093418	HELMET_OFF	662c9e88-9464-4c6f-b9d3-ffcf0b4362ab
0d0ff602-7ac4-4955-90b2-076337fa5c26	2025-09-22 05:12:21.093991	2025-09-22 05:12:21.093991	HELMET_OFF	37ef894b-0b5b-4249-a7b4-7d7dd6efd21e
69338d52-b567-4e86-9d43-f8aec2a35aa9	2025-09-22 05:13:21.16093	2025-09-22 05:13:21.16093	HELMET_OFF	c252a717-6731-47d3-9595-035c1f77e2e2
5adf0327-971e-44e0-9554-55df52a14598	2025-09-22 05:14:21.124147	2025-09-22 05:14:21.124147	HELMET_OFF	d097587e-d24f-494d-9327-7cffcd294f4c
36f9ce57-4e23-42d2-b41f-b45cd43a376b	2025-09-22 05:14:21.124991	2025-09-22 05:14:21.124991	BELT_OFF	d097587e-d24f-494d-9327-7cffcd294f4c
5cd6bbef-6064-42c5-a27d-21c2049af397	2025-09-22 05:15:21.211209	2025-09-22 05:15:21.211209	HELMET_OFF	cecc75c3-e36f-4cc1-9fc0-edd497e29e10
c1dd6c00-4012-4d54-9f06-e6ee87c9bef7	2025-09-22 05:16:21.182924	2025-09-22 05:16:21.182924	HELMET_OFF	e423ddf5-fac1-45db-b25b-babadfbc1108
7227de58-36c5-4e39-a15f-3ac4f23fad16	2025-09-22 05:17:21.212657	2025-09-22 05:17:21.212657	HELMET_OFF	a7c198c1-bc79-4029-8cb2-2af49e6d00b8
cb41ed30-0ddc-45bd-a65c-7758db5c6395	2025-09-22 05:18:21.342058	2025-09-22 05:18:21.342058	HELMET_OFF	81e62d68-ad23-4dc0-9657-13168f8358a3
280c1d2e-d5ce-480a-a9a4-7fac41189586	2025-09-22 05:18:21.342926	2025-09-22 05:18:21.342926	BELT_OFF	81e62d68-ad23-4dc0-9657-13168f8358a3
f2d9940d-7e92-46c2-b2cf-a370af94c6aa	2025-09-22 05:19:21.368636	2025-09-22 05:19:21.368636	HELMET_OFF	2214f1a5-cc73-499d-b4cc-4695a6575a2e
c43538c7-596b-44a5-beca-20272a49c9e0	2025-09-22 05:20:21.354137	2025-09-22 05:20:21.354137	HELMET_OFF	622315c0-4c64-4bd0-8d1f-96f09f60f285
a1c453ab-26a3-4e67-8689-232010abed1b	2025-09-22 05:21:58.512354	2025-09-22 05:21:58.512354	HELMET_OFF	5cca5b28-e703-4116-abc3-e37f0faef7b9
b2b568b7-ecd5-4edd-b2ec-bffabc8874e6	2025-09-22 05:21:58.515031	2025-09-22 05:21:58.515031	BELT_OFF	5cca5b28-e703-4116-abc3-e37f0faef7b9
f82d2584-4109-4b22-8957-6ecab98c5d7b	2025-09-22 05:22:21.443674	2025-09-22 05:22:21.443674	HELMET_OFF	2a1eff6d-6e53-4c5f-be7e-d393f871efe3
8bdef8cf-f949-45eb-99de-f26dabdbb770	2025-09-22 05:22:21.444477	2025-09-22 05:22:21.444477	BELT_OFF	2a1eff6d-6e53-4c5f-be7e-d393f871efe3
12c8f6f6-e657-4644-9b58-daa64e84f705	2025-09-22 05:23:21.455805	2025-09-22 05:23:21.455805	HELMET_OFF	7c46c1c2-26de-49ed-8ec5-3fd9beb2e8ab
07ff3041-1d9e-4e3b-8c5f-fdf90f847d07	2025-09-22 05:24:21.478501	2025-09-22 05:24:21.478501	HELMET_OFF	043edfa0-52c3-42fa-b9cf-a7875879b483
bb17b0af-96b7-4347-a1c1-89e323cc9265	2025-09-22 05:25:21.497713	2025-09-22 05:25:21.497713	HELMET_OFF	4778e66e-f5b6-448e-9d39-047da2b4451f
e5a27b02-0c61-426b-ac6d-798c62aa48ae	2025-09-22 05:26:21.461155	2025-09-22 05:26:21.461155	HELMET_OFF	4a9bbf81-d49e-472a-86e0-a2327bb99ffc
6a49a36e-1c6e-4443-8652-fe52faf0f355	2025-09-22 05:27:21.62982	2025-09-22 05:27:21.62982	HELMET_OFF	997358c9-b24f-4dfb-bad2-aae319753d97
9d31bcc1-e5a8-4218-9c12-7de1f18f843f	2025-09-22 05:28:21.840945	2025-09-22 05:28:21.840945	HELMET_OFF	2920017e-c8c3-4151-9148-b1324b8cc655
dd9114e2-6ed8-498a-b075-1ed645d55421	2025-09-22 05:29:21.902871	2025-09-22 05:29:21.902871	HELMET_OFF	71f9e72c-4061-464a-ad64-0ac467d5599b
337dafc6-d676-48b6-8b6b-74bc2518dab6	2025-09-22 05:30:21.915951	2025-09-22 05:30:21.915951	HELMET_OFF	92cb7724-4a89-49a7-a6a3-70c3deeb8492
9e19c300-e2a7-452f-9025-91065bff50a1	2025-09-22 05:31:21.930517	2025-09-22 05:31:21.930517	HELMET_OFF	eff59245-c2ab-4631-889e-5bab9a8bd0e5
a97c4daa-7aaf-4c3b-82cf-f7f10d0ca89c	2025-09-22 05:32:21.984693	2025-09-22 05:32:21.984693	HELMET_OFF	13937994-6a5d-4828-949e-06f127b51595
f548eea9-069e-49a1-afc6-f8cc7f1e5abc	2025-09-22 05:35:20.922038	2025-09-22 05:35:20.922038	HELMET_OFF	e67469df-6fe1-4d37-9ef3-26230759f1b3
f52b9884-0cba-4714-8e67-426b86278863	2025-09-22 05:35:21.249089	2025-09-22 05:35:21.249089	HELMET_OFF	3f90141b-d6ed-4145-b6ad-ae7d85613022
26950cf7-122d-42db-ac34-0a7f1832893d	2025-09-22 05:35:22.077236	2025-09-22 05:35:22.077236	HELMET_OFF	8724f007-c2ca-457b-8b89-641a825d97ec
ac13cf6d-2bd5-42e5-9a19-15c4b269100c	2025-09-22 05:36:22.028467	2025-09-22 05:36:22.028467	HELMET_OFF	cf6c3084-208a-4aa9-bbfc-84996e5940d8
ed139c33-3fe3-4f7a-b2f1-9abc1d7f4d34	2025-09-22 05:37:22.037111	2025-09-22 05:37:22.037111	HELMET_OFF	52c98134-ee9c-4d34-9328-e0d64471c563
6f28ff95-e6ab-49f7-b882-26e7c90cea31	2025-09-22 05:37:22.037928	2025-09-22 05:37:22.037928	BELT_OFF	52c98134-ee9c-4d34-9328-e0d64471c563
18c44cc8-d620-4483-9bff-a6c006e98b69	2025-09-22 05:38:22.06088	2025-09-22 05:38:22.06088	HELMET_OFF	f5a899cd-e58a-4f9e-b31f-608f8a08aec4
e48e30dd-f283-4dc5-bcc5-631539d5ed44	2025-09-22 05:38:22.061692	2025-09-22 05:38:22.061692	BELT_OFF	f5a899cd-e58a-4f9e-b31f-608f8a08aec4
ec0ad3b1-e86a-4d50-94d9-571bbc6d0a1b	2025-09-22 05:39:22.037922	2025-09-22 05:39:22.037922	HELMET_OFF	af4b2b3a-a53b-480f-a694-64e6a4a497bb
f6fb7fbd-c6b4-4b4f-ae32-a3aa2ed8fe39	2025-09-22 16:38:14.545936	2025-09-22 16:38:14.545936	HELMET_OFF	5aa3b7ae-9ca5-403f-a127-74c832689980
737f70ee-e63a-479b-bcd8-a118b8954960	2025-09-22 16:39:13.013611	2025-09-22 16:39:13.013611	HELMET_OFF	e764dd8f-203e-4138-86c1-eb524980a0b9
0a7b9766-c449-4658-81b0-aaa45159d4a5	2025-09-22 16:39:13.029406	2025-09-22 16:39:13.029406	BELT_OFF	e764dd8f-203e-4138-86c1-eb524980a0b9
c111dd83-4c5b-4bc6-8aeb-6ba6e13e48f1	2025-09-22 16:40:13.794763	2025-09-22 16:40:13.794763	HELMET_OFF	578e7057-78a7-4a20-89c5-3e78308639b9
c97dc556-5f64-4111-8c38-fc8e3e482613	2025-09-22 16:41:13.873852	2025-09-22 16:41:13.873852	HELMET_OFF	020da609-641f-4838-8ee1-48d73e3220d4
717a6a19-f56e-471b-9118-56f8555fbbe0	2025-09-22 16:42:13.934833	2025-09-22 16:42:13.934833	HELMET_OFF	4b984a93-f890-4c6e-90a4-266b369e9d87
d1b435eb-4d68-41ab-8283-82822c2655eb	2025-09-22 16:43:13.981943	2025-09-22 16:43:13.981943	HELMET_OFF	da3e3aa8-6767-4b16-bc02-872e86ffaa8e
e539fa80-145c-493f-8aa1-cc2418675d3f	2025-09-22 16:44:13.946228	2025-09-22 16:44:13.946228	HELMET_OFF	9d785fdf-2cd2-4e92-afe9-d93b5b6cbff0
57bdd1f4-79b4-4c65-8798-f59cd00ac28f	2025-09-22 16:45:13.985737	2025-09-22 16:45:13.985737	HELMET_OFF	b5f52082-053d-4f55-9daf-d7d9fc35e781
7103897c-a98e-4877-b10b-2a58e900a5ff	2025-09-22 16:46:14.651876	2025-09-22 16:46:14.651876	HELMET_OFF	f22f51e0-49ba-4cd1-b139-9edd43389143
7dff8751-ed01-45de-b0c8-f9120c30454c	2025-09-23 14:00:08.632626	2025-09-23 14:00:08.632626	HELMET_OFF	3de52d2e-5573-4027-913d-4f64b7b3f670
e80e9a5d-e32f-4cfe-8e73-3e16e97f436a	2025-09-23 14:00:27.747971	2025-09-23 14:00:27.747971	HELMET_OFF	169749fe-404b-456c-a601-213bf3d6fc62
5126e510-a444-4d3f-87f8-5bca281dc427	2025-09-25 01:27:05.910278	2025-09-25 01:27:05.910278	BELT_OFF	75ed4f40-8654-4d01-8e92-53c71f7c446c
08b83e12-5d0a-47f8-af3b-dc50936709be	2025-09-25 01:30:58.438263	2025-09-25 01:30:58.438263	BELT_OFF	0e1a6002-a55a-4e38-aed8-96158768f140
abbb16cc-32bb-4865-ae97-1fb84e2be264	2025-09-25 01:32:12.861248	2025-09-25 01:32:12.861248	BELT_OFF	dde79c93-2887-4d1b-b2d0-e657bbb03709
5c636365-d9da-40fe-975d-da9533c96994	2025-09-25 01:34:45.609719	2025-09-25 01:34:45.609719	BELT_OFF	ddfb8758-f540-4772-a86a-968363dce1e0
c67bc210-ed9b-4587-8a77-b59a63b304e8	2025-09-25 01:35:55.23482	2025-09-25 01:35:55.23482	BELT_OFF	8c6d390e-8dd1-4081-b400-e53803148dd2
bf05437b-e911-4032-a41d-413c746650b9	2025-09-25 01:35:55.235637	2025-09-25 01:35:55.235637	HELMET_OFF	8c6d390e-8dd1-4081-b400-e53803148dd2
e208a360-7234-4171-b7b4-dcbed61a69b9	2025-09-25 01:36:18.659014	2025-09-25 01:36:18.659014	HELMET_OFF	8c70955e-3245-4c4f-97b7-174d11383313
489e4c0e-01b3-4d7d-a53b-12206968dbd3	2025-09-25 01:41:39.947585	2025-09-25 01:41:39.947585	BELT_OFF	94c05d7b-5bcf-463e-a25b-222c34454392
e9c4a0dd-9af2-46d4-a5d7-185489467147	2025-09-25 01:41:41.762939	2025-09-25 01:41:41.762939	BELT_OFF	c25e8c3b-eca9-4568-9f05-176be8f3e9e8
8ea5420a-4e0e-43b6-9f51-bb95eaeacedf	2025-09-25 01:45:23.282113	2025-09-25 01:45:23.282113	BELT_OFF	2a7dcd32-29ed-4498-a217-d416db3f6faa
d4a15c53-db7d-422b-8e55-8fdb69388c4a	2025-09-25 01:45:33.209922	2025-09-25 01:45:33.209922	BELT_OFF	57831817-e266-48b1-8ac3-5c799fe67985
89f29099-cd1d-4901-a675-9f0bb3a03a47	2025-09-25 01:57:05.762109	2025-09-25 01:57:05.762109	BELT_OFF	6dc7ed8f-6e4f-44b1-8b00-2c7b21f9b778
1d9298b8-a937-4352-9ed3-a0c0a745800f	2025-09-25 01:57:07.387517	2025-09-25 01:57:07.387517	BELT_OFF	e2c73475-eeef-4a0d-b53d-1f7e4fda4dfa
cf2a7b9f-352b-4e59-9512-4157a57c37a5	2025-09-25 01:58:07.016954	2025-09-25 01:58:07.016954	BELT_OFF	9db3a689-ee97-4617-a01a-443c6d95220e
32af8774-fb7c-4598-ad27-15e4b3757f12	2025-09-25 01:58:21.649396	2025-09-25 01:58:21.649396	HELMET_OFF	c5f52dc3-cac2-4260-9b36-c3190de73dee
c81a2402-fc73-4e86-b891-bed08d2f90ec	2025-09-25 01:59:07.895747	2025-09-25 01:59:07.895747	BELT_OFF	16ff7fc7-48dc-4b02-a69c-5abadb530f73
c2ef8836-9f1b-45e1-82b3-33ac186c30b6	2025-09-25 01:59:28.884571	2025-09-25 01:59:28.884571	BELT_OFF	f4b6a6c8-6fc3-4b72-8591-8c9eb110f3f2
f9a4e4a8-bc51-4bc0-8033-26a6dd4ed462	2025-09-25 01:59:28.885485	2025-09-25 01:59:28.885485	HELMET_OFF	f4b6a6c8-6fc3-4b72-8591-8c9eb110f3f2
09e3b56a-942c-4ad9-bd62-8f262341e0aa	2025-09-25 02:14:39.483333	2025-09-25 02:14:39.483333	BELT_OFF	294214ca-01a8-49d6-a7ee-936c4fe67260
2195d68f-bf9f-48aa-8531-0798bc34afc7	2025-09-25 02:15:34.559154	2025-09-25 02:15:34.559154	HELMET_OFF	b067dbf5-384b-4c10-94f0-74687fb8c8f1
03a8f146-7dae-491e-bc3f-7262162f81e5	2025-09-25 02:15:41.760688	2025-09-25 02:15:41.760688	BELT_OFF	563eef9b-fd6d-4ab1-8865-f9e685b916a9
a52225cf-5739-4546-8d7f-04667d54e523	2025-09-25 02:15:46.262304	2025-09-25 02:15:46.262304	BELT_OFF	3ee130fb-14f0-4353-b24f-85e77e1075fc
83981bcc-2ab6-43ce-939d-80827d0321d8	2025-09-25 02:16:33.524125	2025-09-25 02:16:33.524125	BELT_OFF	fce646c6-6112-4b41-a4e4-b459ac4f0ad3
4f66bf22-4366-441d-a322-7071326da211	2025-09-25 02:16:41.928928	2025-09-25 02:16:41.928928	BELT_OFF	12b1097d-998c-4488-ad9d-06f5a284e4e2
e7c63919-4a28-4190-a999-7c8da97508ea	2025-09-25 02:16:46.284712	2025-09-25 02:16:46.284712	BELT_OFF	f5140299-a86e-464a-8506-cf8053565b5a
ad32a978-fae9-407a-990d-29b3c17db4f1	2025-09-25 02:17:34.51881	2025-09-25 02:17:34.51881	BELT_OFF	3d280d67-0cd9-47e9-babd-3f9cba61028c
160d96f5-afe6-4103-856e-cf12c357fb7e	2025-09-25 02:17:41.975385	2025-09-25 02:17:41.975385	BELT_OFF	98e3b989-a576-4752-b521-9f764342504f
cf2353b8-df2b-4771-ba4b-a5892d64a4f3	2025-09-25 02:17:46.3585	2025-09-25 02:17:46.3585	BELT_OFF	de14fcf3-1f02-40d2-8078-fc0b359dbaec
3b700873-aaf8-4ce0-a55c-d1ed5e7de59c	2025-09-25 05:46:19.842588	2025-09-25 05:46:19.842588	HELMET_OFF	b8838982-9001-47c7-9c12-f5157cc86ce9
a16a0df0-5ab8-436b-9744-1f5b74139f8a	2025-09-25 05:49:56.840331	2025-09-25 05:49:56.840331	BELT_OFF	afe57308-6c71-41d9-9b6e-37e8c8d23185
4c82437a-3de4-40e1-a28a-e16b69daa840	2025-09-25 05:51:12.223559	2025-09-25 05:51:12.223559	BELT_OFF	3b89d379-9bbe-463c-a730-1d2a30c9fdb7
2658913f-3e3b-481a-a1c5-c8bbcc01ad35	2025-09-26 02:32:18.073252	2025-09-26 02:32:18.073252	BELT_OFF	5c9fa070-6df9-4308-9be8-6f9f232a9f58
e406ff34-6d8a-41b7-bc95-9906b506919c	2025-09-26 02:32:18.07396	2025-09-26 02:32:18.07396	HELMET_OFF	5c9fa070-6df9-4308-9be8-6f9f232a9f58
5c61f77a-0e64-48d9-a7b5-54d8470c5576	2025-09-26 02:33:15.531161	2025-09-26 02:33:15.531161	BELT_OFF	5272d497-50e1-41cd-af10-477dc7c320f7
bc70e0f7-1b2e-475d-a1d9-c4153ad00117	2025-09-26 02:34:16.424949	2025-09-26 02:34:16.424949	BELT_OFF	b2181b04-be93-428f-b6fd-80f77c84fd80
a7ca9c5b-e720-40ac-a5f7-7d11ae59e8bd	2025-09-26 02:34:16.425747	2025-09-26 02:34:16.425747	HELMET_OFF	b2181b04-be93-428f-b6fd-80f77c84fd80
67024795-2947-4372-a94f-fd2b06b9ea54	2025-09-26 02:35:15.348685	2025-09-26 02:35:15.348685	HELMET_OFF	41b41ec3-2110-488a-8b79-8d2cc19bbb6e
26e69bf5-dc60-4718-a437-249b7413bd80	2025-09-26 02:36:15.368712	2025-09-26 02:36:15.368712	BELT_OFF	256a9656-e5c6-4177-a7d7-a3d2f7bf1ca3
3f12b61b-e8fc-46d7-b88e-4052df17e011	2025-09-26 02:36:15.369521	2025-09-26 02:36:15.369521	HELMET_OFF	256a9656-e5c6-4177-a7d7-a3d2f7bf1ca3
37ce9c54-90c0-4236-a08d-93fe4761075d	2025-09-26 02:37:15.62559	2025-09-26 02:37:15.62559	BELT_OFF	cbe34228-e65e-444c-bd52-907eba7a7104
a373459f-43a3-4116-b120-4b2b46c9467b	2025-09-26 02:37:15.62628	2025-09-26 02:37:15.62628	HELMET_OFF	cbe34228-e65e-444c-bd52-907eba7a7104
b5e46dfc-7c5e-456d-aa3a-5166cdbd493e	2025-09-26 02:38:15.804738	2025-09-26 02:38:15.804738	BELT_OFF	cd7a1df6-bafc-4512-ac8a-22f3ee5b0c64
ffae4301-0614-4f53-848a-8ce8ecdae4d4	2025-09-26 02:38:15.805474	2025-09-26 02:38:15.805474	HELMET_OFF	cd7a1df6-bafc-4512-ac8a-22f3ee5b0c64
6efff334-019e-4e35-b138-66c4b91ab81e	2025-09-26 02:39:41.620428	2025-09-26 02:39:41.620428	HELMET_OFF	f9a2c0af-c87f-4ee5-9afa-866df25a1a2a
fd7a8bab-f02e-4d7b-8a5d-7ba6a1498741	2025-09-26 02:40:41.741231	2025-09-26 02:40:41.741231	BELT_OFF	5976ecff-8f7f-4a5b-af42-d27c0b9af358
e318fa62-d35f-43e1-a26f-52831c7b6237	2025-09-26 02:41:44.139678	2025-09-26 02:41:44.139678	BELT_OFF	fe7296fc-d7a5-4fb9-8be2-e9034d8ddf28
93306b89-7723-4802-9fbb-11a617f83e6a	2025-09-26 02:42:47.26562	2025-09-26 02:42:47.26562	BELT_OFF	1a3eb31e-81ea-40a5-8e72-cc48779f9f9a
0342a8a0-a1c5-45db-91a5-59fa507dc582	2025-09-26 02:44:36.151479	2025-09-26 02:44:36.151479	BELT_OFF	f06a6805-bec2-4e77-b9c4-4183fa221a22
fa8fb8cc-0892-47c0-b8d4-ab6fc163bf60	2025-09-26 02:45:50.413367	2025-09-26 02:45:50.413367	BELT_OFF	365e4199-31d0-4041-933f-4ec1f0ecf7c4
1a1df8d2-1940-4bd3-bcf0-262d33ed1377	2025-09-26 02:46:50.495612	2025-09-26 02:46:50.495612	BELT_OFF	bedc669e-3045-40fd-9a6d-80679399023a
b864b68b-1b26-485a-a60a-fced4da00e94	2025-09-26 02:47:50.520543	2025-09-26 02:47:50.520543	BELT_OFF	343df5d4-217a-4770-a9e4-dfeb0230b738
2ee12ddf-1f3a-4f02-bf7a-6e09a06e5428	2025-09-26 02:47:50.521546	2025-09-26 02:47:50.521546	HELMET_OFF	343df5d4-217a-4770-a9e4-dfeb0230b738
4fdfdf22-2021-4bd6-8987-2fc50d886d9d	2025-09-26 02:48:50.539907	2025-09-26 02:48:50.539907	BELT_OFF	5554a050-7e74-4ac5-9567-ba7a08de9387
38b9ad41-2b0e-4481-837c-6d3d2b7ab4cb	2025-09-26 02:50:03.91803	2025-09-26 02:50:03.91803	BELT_OFF	4fd90038-90a8-4e9f-b433-2b1029137a17
64d5f8a3-dcfa-414f-9a97-6c524d72bb01	2025-09-26 02:51:03.87506	2025-09-26 02:51:03.87506	BELT_OFF	a88dbe71-7379-409e-9c0f-896cda4c65a3
b5710f61-a03e-47a5-8e40-31cd27330989	2025-09-26 02:51:03.875786	2025-09-26 02:51:03.875786	HELMET_OFF	a88dbe71-7379-409e-9c0f-896cda4c65a3
98f99998-f0f9-4bd7-a248-2344b7c56386	2025-09-26 02:52:03.885375	2025-09-26 02:52:03.885375	BELT_OFF	4f4e0902-bf5b-4228-9644-9cc0d5dddac4
7e97b90b-a824-45cf-bdbd-6cbafce5dbad	2025-09-26 02:53:03.916743	2025-09-26 02:53:03.916743	BELT_OFF	73727a0b-5ca0-4538-a475-d2a1eca13671
048a959a-9f99-4d59-8c23-02270dab34ce	2025-09-26 02:53:03.91757	2025-09-26 02:53:03.91757	HELMET_OFF	73727a0b-5ca0-4538-a475-d2a1eca13671
51070c75-7d1d-4a3e-98de-394523ebbe4e	2025-09-26 02:54:03.907	2025-09-26 02:54:03.907	HELMET_OFF	f77bb4b6-0413-4d8e-99f4-a169520f8885
21f0a59d-ab5c-4217-a340-848dc1b938d8	2025-09-26 02:55:03.93256	2025-09-26 02:55:03.93256	BELT_OFF	74dd6163-c4ed-4fc6-8989-9a1a60eeb477
c737dae5-ec18-4d7c-8f9d-a34cea58faf8	2025-09-26 02:55:03.933301	2025-09-26 02:55:03.933301	HELMET_OFF	74dd6163-c4ed-4fc6-8989-9a1a60eeb477
db8266d5-1e8e-4ab9-a3e7-bc3610cf2060	2025-09-26 02:56:04.122302	2025-09-26 02:56:04.122302	BELT_OFF	a2394b75-4e86-47bb-b51b-6c938c21164b
2eb3ce04-6b92-43b8-9c2d-abbdf4c8c41c	2025-09-26 02:56:04.122914	2025-09-26 02:56:04.122914	HELMET_OFF	a2394b75-4e86-47bb-b51b-6c938c21164b
ea8a8ad0-651b-4b1a-9322-75b48210a53f	2025-09-26 02:57:23.507567	2025-09-26 02:57:23.507567	BELT_OFF	86b31572-3d70-4723-ba0a-0586ce06e175
27bac721-bb06-4d1b-9786-0a088235db3f	2025-09-26 02:58:48.720392	2025-09-26 02:58:48.720392	HELMET_OFF	92872975-4214-4c6c-afaf-e4eeda6821bc
78002170-df2b-4f2f-a504-ff7bac28f524	2025-09-26 03:08:00.121674	2025-09-26 03:08:00.121674	HELMET_OFF	f7c891cd-2999-403b-b510-e83d3de90960
f762aa6c-d44c-4a3e-9959-9c8f040ff22e	2025-09-26 03:09:00.137005	2025-09-26 03:09:00.137005	BELT_OFF	d7d80c9f-d875-4a3a-89d1-b9cdf1d70f24
ea4d053e-3c55-413b-89c1-b93cfe5818d8	2025-09-26 03:09:00.137773	2025-09-26 03:09:00.137773	HELMET_OFF	d7d80c9f-d875-4a3a-89d1-b9cdf1d70f24
73bd069d-d678-4f55-98c9-d425d4185609	2025-09-26 03:10:00.156609	2025-09-26 03:10:00.156609	BELT_OFF	8cd27f13-1eac-4278-a33f-f27f7be95c6c
335b91e8-5bc7-472d-b062-908d4752bc42	2025-09-26 03:10:00.157263	2025-09-26 03:10:00.157263	HELMET_OFF	8cd27f13-1eac-4278-a33f-f27f7be95c6c
167517ae-afe0-482e-a0ca-1b4797eed914	2025-09-26 03:11:00.141587	2025-09-26 03:11:00.141587	BELT_OFF	fa2564e6-bbcf-4395-b9df-167cb0e4e87a
55a7dd04-1e71-475d-9ffa-8de113a08df1	2025-09-26 03:12:00.272614	2025-09-26 03:12:00.272614	BELT_OFF	7aefcc02-b714-42f0-8486-9f0a67e16d0f
d5a91657-1840-44b1-8609-ce0f1169f37a	2025-09-26 03:12:00.273254	2025-09-26 03:12:00.273254	HELMET_OFF	7aefcc02-b714-42f0-8486-9f0a67e16d0f
e2d738f0-e362-46fe-a706-d0e1bdd9b99c	2025-09-26 03:13:02.388663	2025-09-26 03:13:02.388663	BELT_OFF	e6d0895f-0b8b-44ae-b480-5425e80602fc
7602e375-269f-44b7-8750-d51705698712	2025-09-26 03:13:02.389332	2025-09-26 03:13:02.389332	HELMET_OFF	e6d0895f-0b8b-44ae-b480-5425e80602fc
076c33cc-9473-4a6d-8255-603be807098b	2025-09-26 03:14:02.346407	2025-09-26 03:14:02.346407	BELT_OFF	b414dcaf-2ecd-4125-8efd-9e8e2127dc7c
98f99b92-69b1-4366-81ef-d4fc64798718	2025-09-26 03:14:02.347201	2025-09-26 03:14:02.347201	HELMET_OFF	b414dcaf-2ecd-4125-8efd-9e8e2127dc7c
d05b52e2-858d-4cf9-b5ce-790282accb92	2025-09-26 03:15:03.80784	2025-09-26 03:15:03.80784	HELMET_OFF	31456c8d-c40e-4312-a6a3-6135ff452282
eb84eccc-1d2c-4f20-a5b6-408f516c4f6e	2025-09-26 03:16:07.740267	2025-09-26 03:16:07.740267	BELT_OFF	f2da4017-4f08-4716-b1a8-447233d77728
8d79d4ea-9ac8-4db3-9d49-be43024c32c1	2025-09-26 03:16:07.740977	2025-09-26 03:16:07.740977	HELMET_OFF	f2da4017-4f08-4716-b1a8-447233d77728
6011e801-b577-4b82-9b09-32603d4cf581	2025-09-26 03:17:15.010848	2025-09-26 03:17:15.010848	BELT_OFF	f6f30f1a-888f-4813-aed6-d1849fbd8c44
86d9c7e1-d772-4ef9-b764-3f4574ee57f0	2025-09-26 03:18:15.310229	2025-09-26 03:18:15.310229	BELT_OFF	347b61f3-51e9-47fc-90d6-307fa72a44a4
124a0df4-faa4-46b1-adb1-70e2007e7958	2025-09-26 03:22:15.677981	2025-09-26 03:22:15.677981	HELMET_OFF	54126edd-6925-4c17-ad2c-a77affb0f1c4
d5250fa9-bfda-491b-a4c9-622148d40e02	2025-09-26 08:07:38.831014	2025-09-26 08:07:38.831014	BELT_OFF	234914f3-69a1-442d-997b-14eec096fd82
b89d4543-1bef-4e93-887b-3f26e216f0a4	2025-09-26 08:08:38.942472	2025-09-26 08:08:38.942472	HELMET_OFF	7de3228c-b51a-482a-bbae-f9e6ac976899
f2e101fb-7458-4539-be96-b2756476621c	2025-09-26 08:13:42.805484	2025-09-26 08:13:42.805484	HELMET_OFF	02055e1a-79d3-4c6a-90b0-c140758d6336
9ada3b07-b659-4d33-8381-ab59af187196	2025-09-26 21:18:43.290619	2025-09-26 21:18:43.290619	HELMET_OFF	2bf1eaaf-39b0-428f-b545-f178c8265b42
11cd31a3-da93-4c83-aa18-eeb1ad623221	2025-09-26 21:18:43.312127	2025-09-26 21:18:43.312127	BELT_OFF	2bf1eaaf-39b0-428f-b545-f178c8265b42
f80ffbe3-ec43-4d8d-a8a9-d1b25ab3f94e	2025-09-26 21:19:45.202019	2025-09-26 21:19:45.202019	HELMET_OFF	b9648e88-ba53-4bd4-b80d-c210aac6d8a4
6ab5ae65-7594-4afb-a3a5-d4aecc08ad3e	2025-09-26 21:19:45.226463	2025-09-26 21:19:45.226463	BELT_OFF	b9648e88-ba53-4bd4-b80d-c210aac6d8a4
04dc8eff-dc5c-4386-9d82-e25727862901	2025-09-26 21:21:33.971562	2025-09-26 21:21:33.971562	HELMET_OFF	7eb46609-20b0-4cad-8e41-5c140838eb3e
48fb687a-3f1d-42d9-a57f-36a20a79b117	2025-09-26 21:21:34.008058	2025-09-26 21:21:34.008058	BELT_OFF	7eb46609-20b0-4cad-8e41-5c140838eb3e
ded7b86a-7e2c-49f7-aa13-58f2bd402f51	2025-09-26 21:23:27.339062	2025-09-26 21:23:27.339062	HELMET_OFF	c0c951d8-7260-4109-958c-9b4ea92e58d0
2382225b-8a77-4ff1-b3bf-57825891b302	2025-09-26 21:23:27.363172	2025-09-26 21:23:27.363172	BELT_OFF	c0c951d8-7260-4109-958c-9b4ea92e58d0
792839c4-1855-4978-b670-e8d5bb59d2eb	2025-09-26 21:23:58.05278	2025-09-26 21:23:58.05278	HELMET_OFF	70c5f07d-d4d6-400d-b902-ea5d852a371f
c7233f26-3403-4683-b5be-0df5ee9fc58d	2025-09-26 21:23:58.076406	2025-09-26 21:23:58.076406	BELT_OFF	70c5f07d-d4d6-400d-b902-ea5d852a371f
0f3b339c-b49c-4f00-835b-cb860c62a3b9	2025-09-27 02:01:06.052804	2025-09-27 02:01:06.052804	HELMET_OFF	3f1fb6c1-200c-48a6-b7ad-04fdf3e9821f
f7237ebe-3921-4adc-b3d7-fa1d834ecad5	2025-09-27 02:02:04.426037	2025-09-27 02:02:04.426037	HELMET_OFF	f21af24d-174e-406a-969e-be7e92279b6c
8abd7075-ab14-4902-b2f8-529fde7f4c3c	2025-09-27 02:08:53.860185	2025-09-27 02:08:53.860185	HELMET_OFF	e9f6fd9e-0211-4527-b9f9-bc9774a9146f
a9d4cc88-6a91-45f6-a385-f4816089be95	2025-09-27 02:09:53.895938	2025-09-27 02:09:53.895938	HELMET_OFF	d81355b5-b0c0-4f86-8d95-bbf077074e53
9244e06f-b27e-421e-a01e-60f47a9ecfad	2025-09-27 02:10:53.904529	2025-09-27 02:10:53.904529	HELMET_OFF	26e312a3-a449-4930-8b1a-74d485358deb
92a9dd63-7905-4b08-b100-35acf2cb524d	2025-09-27 02:19:46.255161	2025-09-27 02:19:46.255161	HELMET_OFF	3ed9ec07-d9ce-4217-b00b-3b86dc955379
7a484e7d-7911-4734-bebe-a14a1f23de9e	2025-09-27 02:20:46.281081	2025-09-27 02:20:46.281081	HELMET_OFF	f8548514-675b-4b4a-8937-555b257742dc
eed1345c-041b-48c4-9c86-7930d4deaa88	2025-09-27 02:21:46.607972	2025-09-27 02:21:46.607972	HELMET_OFF	79c83cc7-1b10-444b-83dc-e890f2f7dffc
abe61235-1bcb-4fa3-8daf-a6db3771d87c	2025-09-27 02:22:46.46481	2025-09-27 02:22:46.46481	HELMET_OFF	bfafd819-27be-490b-bf44-c627a27c638c
439019c6-96b3-4d18-95e3-9dc8c454d582	2025-09-27 02:23:46.446351	2025-09-27 02:23:46.446351	HELMET_OFF	aa1be742-179c-40c6-969d-34afed640f74
722041a9-f311-44df-946a-de5458b0e53a	2025-09-27 02:29:28.910356	2025-09-27 02:29:28.910356	HELMET_OFF	62d8663e-9a2f-4858-be17-a8259f98e110
d1db4134-4d78-4c46-be03-2078b5cd341a	2025-09-27 02:29:29.198204	2025-09-27 02:29:29.198204	HELMET_OFF	261364f5-d584-401d-be2f-be4faefd962b
241e6e36-9f11-49da-944b-c6c893e8857e	2025-09-27 02:29:29.403067	2025-09-27 02:29:29.403067	HELMET_OFF	67dc6e5f-8f20-49e4-807b-3b920b26a693
2d353a38-215c-48e5-a12c-4f866a3ef0e4	2025-09-27 02:29:29.519931	2025-09-27 02:29:29.519931	HELMET_OFF	d2d4b465-f778-436d-b713-45a568d6a86f
1140321c-ac28-4583-968f-fa3a865b89d5	2025-09-27 02:29:29.543692	2025-09-27 02:29:29.543692	HELMET_OFF	b44aba8b-2cd7-432d-9110-752223059855
3a7881db-6ac1-4551-893d-f4447e87388b	2025-09-27 02:30:02.799501	2025-09-27 02:30:02.799501	HELMET_OFF	d9e0d385-d9dd-421d-872f-fe9901636b98
06bab8f4-8baa-4ca2-b1c1-bbf1b6b011fc	2025-09-27 02:31:02.856891	2025-09-27 02:31:02.856891	HELMET_OFF	56a99fdf-0461-4ded-9391-4e30267dd075
bbeb1630-4690-4cdf-8e8f-5014e5902c57	2025-09-27 02:34:43.494476	2025-09-27 02:34:43.494476	HELMET_OFF	cf16d6f1-ef3d-4db5-8c9c-99dbc82dbf1b
e10769bc-f7f3-48af-bdf6-588b7c176881	2025-09-27 02:34:43.774267	2025-09-27 02:34:43.774267	HELMET_OFF	112aaebf-cea5-4c05-b53a-8ce2af8ebb33
9629c2dc-c924-4f0e-9ae2-7af043486c90	2025-09-27 02:34:43.96961	2025-09-27 02:34:43.96961	HELMET_OFF	2b8fc1c5-6d5b-4e64-a751-783fbaf3bcab
29a47068-89f6-4c67-ada7-696d63bf4774	2025-09-27 02:35:05.778322	2025-09-27 02:35:05.778322	HELMET_OFF	9077fa4e-8e8d-4a26-a617-aacd1735efc7
200df914-cbea-4dc9-adec-34431b9036a3	2025-09-27 02:36:05.832143	2025-09-27 02:36:05.832143	HELMET_OFF	20346c3f-8217-4bac-b53b-8e73b89ad303
e20b6f98-dd2e-42e7-9c15-c6968d787099	2025-09-27 02:37:06.020934	2025-09-27 02:37:06.020934	HELMET_OFF	943f4693-8e0b-4e7d-a088-be820efd3fd8
cf96aaba-31a9-4776-8b58-b86c6059fab5	2025-09-27 02:38:06.004076	2025-09-27 02:38:06.004076	HELMET_OFF	13a37f1f-fc42-4f54-92c0-42e91a0874e2
28aecaf9-734d-49d1-a3ff-1e4bfd1bca53	2025-09-27 02:39:06.048941	2025-09-27 02:39:06.048941	HELMET_OFF	e5ed0e3d-217f-4026-a6e8-3380440e4ebc
aab419bd-a152-425b-9175-c43693d20c8a	2025-09-27 02:40:06.200691	2025-09-27 02:40:06.200691	HELMET_OFF	5d2eb1b6-d0d3-41b7-96b4-b844d00e0195
55537d15-ce01-4f7b-a414-900ce13bd150	2025-09-27 02:41:06.231948	2025-09-27 02:41:06.231948	HELMET_OFF	43eb01ca-edcc-4c63-9007-6b15c99f5a26
17f4455e-1f88-4723-af55-345e21887699	2025-09-27 02:42:06.384148	2025-09-27 02:42:06.384148	HELMET_OFF	3342ff81-b460-4b9f-ab00-94bae3e71c08
c05203db-7930-4ca1-b583-d3503fdd160a	2025-09-27 02:50:06.792469	2025-09-27 02:50:06.792469	HELMET_OFF	4e99135a-97c5-4a11-bff7-bd768720ff5c
9d542921-6b89-4f78-9bc0-2aa7184697f4	2025-09-27 02:51:31.745964	2025-09-27 02:51:31.745964	HELMET_OFF	1e24725e-2633-4c4c-9bad-23109374643e
6fd56418-3809-4d81-8126-d98f10e2828c	2025-09-27 03:00:32.74572	2025-09-27 03:00:32.74572	HELMET_OFF	1c4ed66f-fd66-49c7-8173-444323d291da
a9ffb371-075b-4c6e-958c-c8404e0fb0ee	2025-09-27 03:01:32.99917	2025-09-27 03:01:32.99917	HELMET_OFF	c029c337-ed96-43fa-8dd9-e6efea0ac4f7
ed98c1c7-d610-48c2-80e5-31cb7d9fb29c	2025-09-27 03:02:33.034573	2025-09-27 03:02:33.034573	HELMET_OFF	b898636d-2491-4faa-9e83-fa371315c9f7
acdfe83b-1770-4184-8858-2b92e065df47	2025-09-27 03:03:33.066989	2025-09-27 03:03:33.066989	HELMET_OFF	a22738c7-852d-41af-9e13-56146afada47
661a27b8-f06b-41f2-a54b-1c4b3d199e53	2025-09-27 03:04:34.331027	2025-09-27 03:04:34.331027	HELMET_OFF	0138adeb-de78-4d6b-808f-461cc693539d
1504620b-b1d0-4d6c-8cc0-1189fe2e0f98	2025-09-28 12:55:58.837978	2025-09-28 12:55:58.837978	HELMET_OFF	93c3536b-7aae-4fd7-97ce-1d382648211d
903a9679-e814-4841-b0ec-cb5f0e283c27	2025-09-28 12:56:07.457616	2025-09-28 12:56:07.457616	HELMET_OFF	eaa2a869-32cd-43bd-9986-0c409ac810a3
8ccece73-51e9-4c75-9521-5e515cd335f7	2025-09-28 12:56:17.572371	2025-09-28 12:56:17.572371	HELMET_OFF	f980ed81-165e-45cf-b143-19e370de015c
915cf162-b0ca-4d14-b780-990df1da3603	2025-09-28 12:56:27.651546	2025-09-28 12:56:27.651546	HELMET_OFF	b7d9bb47-1ed5-44b0-b040-b328fb951f74
e2606b01-5af9-4f87-a3ee-fd0a3e17270d	2025-09-28 12:56:43.968948	2025-09-28 12:56:43.968948	HELMET_OFF	f9023d4b-5f0c-4b83-86b8-2fa37f340906
14f9a716-bc56-4148-a99d-84800494c38e	2025-09-28 12:57:39.219361	2025-09-28 12:57:39.219361	HELMET_OFF	20811262-f1d5-49c8-a515-31f762b20a1a
3a1a6ed5-d1c8-4358-9e17-94647a7e7e9d	2025-09-28 23:49:59.514938	2025-09-28 23:49:59.514938	HELMET_OFF	d0cc4c07-f93b-497e-9471-7907922ddf03
485adf6f-c63f-4444-be01-959e8cb52ac9	2025-09-28 23:50:24.050345	2025-09-28 23:50:24.050345	HELMET_OFF	c94f0024-d7ff-43af-9899-7a198e08afd0
e7152346-227e-4c71-8588-6dd3d261032a	2025-09-29 06:50:34.119	2025-09-28 23:50:34.119044	HELMET_OFF	5881bad4-38c1-425e-8727-ecb42115c413
\.


--
-- TOC entry 3581 (class 0 OID 18193)
-- Dependencies: 228
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (uuid, created_at, updated_at, deleted_at, assigned_at, assignment_date, avg_embedding, blood_type, contact, emergency_contact, gender, is_approved, password, photo_key, rh_factor, user_role, training_completed_at, training_status, user_id, user_name, area_uuid, company_uuid) FROM stdin;
2286c205-04a2-4e4c-b19f-7b40d7dbe277	2025-09-14 19:36:36.918642	2025-09-14 19:36:36.918642	\N	\N	\N	\N	A	01000000001	01000000002	MALE	t	$2a$10$S4/BsgmNW8Qhb1hYrS1MNeibULxBloNOW6isgxvgW1RBRikoL/ODq	profile/admin.jpg	PLUS	ADMIN	\N	NOT_COMPLETED	0000001	박정훈	550e8400-e29b-41d4-a716-446655440102	550e8400-e29b-41d4-a716-446655440201
bb35f095-cb3b-441b-975b-d76dc409f2d3	2025-09-14 16:30:52.244094	2025-09-16 11:05:06.095329	\N	\N	\N	\N	O	01000000000	01011111111	FEMALE	f	$2a$10$Ji5DJ.zpX3Mp9NDbo4LGr.LGC3s9efc.mgVrLnrVE8qO9dafammCu	photos/worker_005.jpg	MINUS	WORKER	\N	NOT_COMPLETED	wwwwwww	김동규	550e8400-e29b-41d4-a716-446655440103	550e8400-e29b-41d4-a716-446655440202
0a60e785-92cd-46e6-869e-7377405ca928	2025-09-15 21:52:05.075299	2025-09-15 21:52:05.075299	\N	\N	\N	\N	A	01009871234	01076549876	MALE	f	$2a$10$e9jIhmlGDPVvThvSnJ79Les6Pv/6drIlI6y8pki/mcWnOGgVVGUr.	\N	PLUS	WORKER	\N	NOT_COMPLETED	1231234	김잘돼	\N	550e8400-e29b-41d4-a716-446655440201
72212bc3-ef36-49da-a0b5-4120957158d6	2025-09-14 16:32:49.513752	2025-09-14 16:32:49.513752	\N	\N	\N	\N	AB	01011111111	01011111111	MALE	f	$2a$10$6t8nbpQuMe5uCPQDPkxEDue3XwLTfVdGd/JdAlH.trGG3UrjIVKiu	\N	MINUS	WORKER	\N	NOT_COMPLETED	zzzzzzz	김동규	550e8400-e29b-41d4-a716-446655440102	550e8400-e29b-41d4-a716-446655440202
a8f5f82d-9847-436e-aeb3-dc93f9cab16a	2025-09-14 19:37:05.106179	2025-09-14 19:37:05.106179	\N	\N	\N	\N	B	01012345679	01087654322	FEMALE	f	$2a$10$uBHgd22akV9Ws1zFUTVXReLwWKA4Wt272fQ99xj6obcB/bLBAsYKu	profile/worker_002.jpg	MINUS	WORKER	\N	NOT_COMPLETED	1234568	이영희	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440201
4d0f3cd2-2516-4752-bed4-bd0e7935bc7a	2025-09-14 16:31:33.868394	2025-09-27 21:11:22.290874	\N	\N	\N	\N	AB	01011111111	01011111111	MALE	t	$2a$10$jPM2vcmZ8Sa0iyKX/14q2O4sOrget5WtiYV2bFInh0cDEYijBC4.y	\N	MINUS	AREA_ADMIN	\N	NOT_COMPLETED	6777843	김동규	\N	550e8400-e29b-41d4-a716-446655440202
679931c9-9ddc-4e80-bf1c-ecd46c84fa57	2025-09-14 19:36:52.301236	2025-09-14 19:36:52.301236	\N	\N	\N	\N	O	01000000005	01000000006	MALE	f	$2a$10$qX5oni8rBg7HCpt4JTNpAe9fSCKlznHO0Bv5wk82SRff4R3AewHLC	photos/area_admin_b.jpg	PLUS	AREA_ADMIN	\N	NOT_COMPLETED	0000003	박정훈	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440202
754fe42d-1b12-4a3d-8614-9b76c5184d43	2025-09-14 19:37:16.538795	2025-09-14 19:37:16.538795	\N	\N	\N	\N	A	01034567890	01009876543	MALE	f	$2a$10$4q8cvGroppakbisJAr3qreXkaS6H2WbwxLm/5Lz5ubydgXqZBd7x2	photos/worker_004.jpg	PLUS	WORKER	\N	NOT_COMPLETED	3456789	이철수	550e8400-e29b-41d4-a716-446655440103	550e8400-e29b-41d4-a716-446655440203
b1293189-64fa-4845-9ea3-40a51cfb2f88	2025-09-16 14:27:14.003743	2025-09-17 11:34:18.670194	\N	\N	\N	\N	A	01035976658	01050946744	MALE	f	cC0CVvclFyD0	photos/0e63755b-9a5d-4a18-8d3a-012afa3c2e15.jpg	PLUS	AREA_ADMIN	\N	NOT_COMPLETED	3663946	박정훈	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440201
91da42ff-d33f-448e-8663-1f5702100b97	2025-09-14 19:36:59.225872	2025-09-14 19:36:59.225872	\N	\N	\N	\N	A	01012345678	01087654321	MALE	f	$2a$10$Q1COEoUrqniHBB4j6Q9bLuEpMh5OvLsD1Ni0VnFTP27AlKA8HYgDW	profile/worker_001.jpg	PLUS	WORKER	\N	NOT_COMPLETED	1234567	김민준	550e8400-e29b-41d4-a716-446655440102	550e8400-e29b-41d4-a716-446655440201
621a29cf-d9f4-4fb4-8e9b-5ee73b585d53	2025-09-16 14:48:56.224368	2025-09-26 23:07:22.386469	\N	\N	\N	\\x390534bda6a3143d9da655bc672793bc60e7fc3c1cbf0f3d57a29bbc4b78183d7929a53d481d09bc9b44583d8b42633c5f148ebd9c9d60bc40d702bc5f399bba479e343cb24b0e3d00921dbd70075cbd2b09463adb9bc33c62bc203dbbc57fbd2bc94abc003e31bc893ee33be5cb5cbaddf469bd3b14e43cf4e89bbc2528e93c80d1d3bc8526823d844ab8bc33b96fbd40415fbccffd9a3b55cdfe37e99d153b773ce13c5957aa3be161d8bdd906673c21b06dbd4da8b53da4f588bcf8735f3d396f803ce0c110bce83888bcb0c45f3c057826bb3d7316bd9851ce3c4da0633d4374dbbcd994313d45a1d13c28915abde93cec3c4cc3e03cf3d5183d180af6bcc147633ce81443bd7571173d5be0f9bc52c0853d2b9a5ab81821b7bd30fc4c3a0343003d5db56cbc35c746bd0dc4c53ce0c0e23cb329b9bcdbff86bba57f57bcebb67d3d9136d2bc3ff9b63cdd94463c9d655bbd8b7d633db7e96d3bc5ed43bd6080b73acff466bc9a8b81bc59080f3da326353ca80af63c89abbbbcc5da31bc65123fbc87964a3d91fc8b3de5aa2f3dfbc314bdd3035f3c2fc72ebda44ea63b987497bba9443bbd2bb1ad39631beebb0804d43c9b7b7c3a012b19bddc3d683cc05e643c786ed43cc5cc6c3cb0e0313b958d833bcc84f33cd4b5f53b40f352bb8cc8cd3ce711a9bcc2859bbb9be3bc3b0f0067bd63664d3d3fb601bccfa59dbcc4c8fa3c58b0c43c607ed0bcfbd172bbb41db5bc3b64cf3c7b0a413c9275a8bc541838bcd73890bcb1f94d3da01cb9395bcd9f3b70fb263d7d1da5bb737528bce1004ebcd95c48babf5022bd735308bdc8131b3ca05d203d2b43413988b1f13cafa1f4bc7d9c98bc75bb9b3ccc9a09bdc13d553d6ff9a8bcf78b3abc2481823d413caabccbeb633c9738aebc352243bd0496053ddc47a0bce9475c3dc53a5d3adb810a3dd862763c69d1d83bcd74af3c30562a3d74024a3d6b9333bc19890abc29bc12bdcd87b03cc0e957bccc8152bddffe72bd303aeb3b01d35cbc75bf14bce72cb63c3d477b3d5e2e183d0326443df39209bb40cab6bce050b0bce38e6c3c037d40bd2903893d00d6843c3b36fcba932426bcb5d8dcba95c5003b64fad0bb2f97663c855d273da8a5ed3cd03d603ce1b25bbc3c1491bb40a47dbd253c753cbde0d63b6b3f07bd0c9e093b2c6eb0bcf99a02bdb7b9053dc8b63d3c9008a73a04e74e3d509b623dd0a1253d6fbf7ebc95e622bd094fdf3c68a2033d48426fbd5806cd3c609c27bd8cd4073c6570aa3cabd1303da8a85fbc7b64db3c9028b7bcfce290bb935691bc8c18be3cad085dbd075fe03bbb8806bd407a033da51f71bbd5edf4b90f4c81bd7d68583cabba083d601942bdd1d7963ce015b3bc90655ebb594dbe3c731958bc38d4913d25f34cbdab57afbcff01f8bc73ca97bc07e0493d35df87bcc8ec6e3df3b340bd9d973ebd1106c6bced6d853cf08edebb65df0abc133a07bde44067bda80d583dac46f13bdab0113d82358d3c9dee583c9d3745bc616e2c3db15045bd26551b3c887c6a3cc3c626bc0d21193de572bfbce8f5ef3bb1d90ebc3b6b92bca5b628bd7c0bc8bc5ddb5abda9a463bd189c333da3d2c43cc02cfebc7b56b23cb507edbcf3da37bdd6e10fbd514f83bdf142103de9f413bcd117293b1108fa3b78c619bd99b7893ab398f13cb856e13cbdd9f73bcd24ecbc45e42abcfd66693d20afcdbc5554d13c2902aabd536c803c84506fbcbfa1483d10a4353d27f41abd048a2d3d439b1b3cc43bac3c7551a03c6fb7abbc036d99bde8e1f53cb56b323d053b66bcfbd5cbbb205774ba85e5b53c6a14103dc71936bdaf85ffbca02b7cbdac9247bb69aaa4bc24e9023d14e2e7bc0fed8ebdc0f9083dace2fdbc385d723aadb1a6bd7edb97bb70a4e63cabf61c3a4df0f5bcd7b58ebd51928dbc987e5dbd74b4fc3c8f77e4bcb4296a3d4dd0163df7b09abc3a6c1e3dab7e63bd19aba53c1652213bf961cabcd35f553d3579ed3c7bbda1bc60431fbd6c35433c3fcc1ebc5da6ec3c50ca4c3d0194323da5546ebced02bebcf4099bbdc171c6bb773588bbb571ec3c54fad1bc3430bfbb0190553c78e8b23bb8f0afbce81a52bcada18d3c883635bd6c08b5bc287fd53c57d1d13be191923c87ec023d2d06ff3bd9a3d4bc0065533d8e7613bc89132bbcc1d25cbcaf54183d536260bd981e57bd43dedfbb681573bc584fc03b876f91bc65acebbc839c59bc57f7213d2b12db3c3d01843a08e88a3abd874dbc2d57963cec444a3ce31258bcc80cb8bcfe610a3c9ff820bb48529b3cd83e453c75e30d3d8bd735bd73eb493cf077d6ba1a97a03bebc5a53b078ed63cd5a27c3ddd6d9cbd874c3bbc8823e0bcd03857bdcd10b23cd01b043d8d84793c8de2303c01c8b3bd2bba0a39dff54dbce0f1f13b704b77bbe315563b0d0b7d3d546e73bcf86ee3bcbd62fb3c632b533cb0061fbd8bf1fcbab5a29b3cd8c2be3c0dccce3b054a42bc88f440bb4b98dcbc755b5f3ab57830bd9be29bbb23cf58bbedc513bc6c4412bd2047663ddbb90a3dad68953c8020e8bc0bb3dc3cdbaa52bd0514cd3c58b798bb533666bd87a963bc7d10803d79e0823cf4adf83c056c973d3dd37cbd708ccdbc54d964bd87dc1f3dbbff2d3dbd735c3d61af1ebdebaca93dab76d03c2b40b23a14c41d3b07a79a3b65d7423dc8d8e7bb651c58bcc3506fbdadd27d3c779eaf3cd02945bd3cff85bd1a48173d4b8570bc132dd53bc3d3843d0bf4f0bcc98c42bd49a9033d15d9ecbcb4ef643d4d042b3d9043a83c24f818bdf0b22ebc1842453d74ed84bc01d30c3c55ccefbcd8c0443db141babc605acf39a081a5bdd77d4d3ceb30853c69a9acbc200db9bc	B	01079090311	01065199516	MALE	f	T6TPZd5w9sPf	photos/d513f109-9a35-4a8a-b346-01710d75ff86.jpg	MINUS	WORKER	\N	NOT_COMPLETED	9395709	최민석	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	550e8400-e29b-41d4-a716-446655440201
4e92a8f0-62fc-480e-afb5-33901134b8fd	2025-09-15 01:10:56.917414	2025-09-27 21:11:32.670452	\N	\N	\N	\N	A	01098765432	01023456789	MALE	t	$2a$10$jHX6dOpqpL4FQ9vomHS.HOIocGevdMqZKOtGlkdhlr7gvoWeMhwFe	\N	PLUS	AREA_ADMIN	\N	NOT_COMPLETED	1387654	최민석	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440202
6667a4d8-7206-422e-9789-1846747a4ee8	2025-09-14 19:37:11.418886	2025-09-14 19:37:11.418886	\N	\N	\N	\N	O	01023456789	01098765432	FEMALE	f	$2a$10$3/L6TrRVqsnBCmB0wpEGVuY7/0gvBYhpKX5IxWHnQWqzVvFojvvKq	profile/worker_003.jpg	PLUS	WORKER	\N	NOT_COMPLETED	2345678	김동규	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440202
3eb01d13-b269-429e-87ba-0d6471f11118	2025-09-15 03:22:08.406225	2025-09-27 21:13:09.516883	\N	\N	\N	\\x5d3efebca1551a3d3cae4abb3c86ccbc4ce655bd6bb640bbdb2b313b1aa29abc43841c3da7ff9dbc5cb2413db1c74d3c8c5e9a3cf9456abbf466eebcb83e31bb4b46303ce66c8d3cc3285fbb0fad9ebd102d0abd3029263cb0a7dd3ce8305abd025089bb00a68b392811673cb9a5143dad7838bdf692153c0a2c1abd95382c3dd48be13c2f3f9f3d53c8fa3c6876bfbcf90d49bccd2c8b3c135f563c94025f3c4f33ce3cf0d82bbc832e17bd094d5cbba79977bdcc91b43d8fc41abc13ce2b3d985f6b3c7de0c43bd589103d7145473c400983b943d21abb747c663c6dd7293cefbc103d5bea133da51f42ba7826adbd687ba2bcf3d1a7bcff67103dea9286bc894c243d3b7c2cbcb30a5bbb9bc725bd905cb23d693db8bc0bc5eabd60e9453d9fde433d9181a23cce0305bdf13d65bb4495873cb91773bdb16ca9bc6ca1e6bcabdadc3c51f911bcb19fa93cb0a7bebb658a40bb350f993dfd9fd7bc6387f7bccb5f413dc8dd66bca097e5bcc1ec053df9f08b3cd398773c8364d6bcd1eefebcefe3e33be1d1e63cdffa073d7b5708bc596e1abdedfdc73c660681bc5e0903bd11b3ef3b389056bbebd77b3d652baebc4c87843c2482253c50230dbcad429c3c0c53823ce7629a3cd1ff553bd98e1bbd999ee4bc89a450bc9bfa47bddf654a3cb715e73b98cbecbcf8b2253cf336623d19a987bb95c4243d12b894bde773ca3c895e273d6978f2bcddd2b23c38d5ebbcbd2836bdc1c9a8bcd5762a3b89f517bd2156613bf03c75bd185bd23cdc11273cc12f973b059bf43c0bff9bbb3bc852bb084b2abddf75813df70a06bd104ead3a3765bb3b1757053d6f128a3de75f463c886835bc631bd1bb6c0b2b3d424381bcf3c09c3d3340403c1c86b73bc129973d1d7464bb8082f83a89a5233c1f1a80bd7bae7f3d8fb219bdafb1363d902ec3bc6f64b13bfcbbb43c1952f13b00246637f9ca0f3c9d8b9c3dc3a3403b1445953c288a05bd850d20bcb37d1cbd5ff434bdcd6755bd8f3be4bc5765003c985fc33b40e0413c3fb3163da559363d1d50353d6bf1c23b3c6d83bc5b89fcbbfb446fbb8c932e3b1368603c2b1144bc0b36febce0a2e5bc67fa403de1dca33ca8dfcdbc4b93b53c1b708fbb7dc3adbb0d656fbc83f4e1bb90d84cbdcba9c6bdc402183d3b9585bc0c603cbd593adb3b9732053cd8bdb9bc6bef4f3af902863cfd3fc43c230a693d808c9e3c895c2b3cebeaebbc510028bdcc1cd13cf3128f3df3645cbd5acd803c1f3151bda71196bd05ae8c3c637d09bd8b659c3cacb1dd3b8bba58bceb8f0ebbc5f908bc6517623d4bfd323cadf65abc5ceb1cbd1c82ed3c85b0b4bce343bcbcf89a18bd8d59343c5959a53c64e130bded7e943cdb2928bddd5f613cd119f43c4769c23c485f643d92ab0dbdb88428bdc76489bb5ccd5c3d676419bc612ffd3b1074bfba08a6d8bc631fd5bcb545f43bc75fdc3cc5b488bce8c4b13c28b4c63c78f7183d3b261cbd7d9e6bbcdb5fa93cf90d1a3d046e9fbbd3dc923bdb7b4b3dcf0ba5bc4dd2b7bcd543a9bc00b2723b687b3c3d751782bd1bdc613af75fb23c89f00cbd3c41d4bb33e95cbdcf6148bd2dd6dfbcdb95ab3ce9d817bd9de38dbbb015423b852affbc6dcb31bce4d4fc3b398a18bc83b7643dfbbf15bd8be2113c8525fd3c483744bcf386d93cdf6aa63b0bd2913ca3349dbce704cebcb85439bc748bd93c0d8b873c9300c43c60f4503b708b36bd45d112bd639ec93cd83c2a3d4da1c1bc908bd1bb6ba445bd209dd0bcac5f1bbc98acebbcd092efbc2333943c0d1ddd3c439821bd85bd61bb9ff5df3a0500cabcab97203ded188cbd60f177bc693961bd787672bc758101bd65f65bbb2448fbbcc1ed8ebd7bee553d9cce7fbc106c9bbd603e5bbd29422b3cb48ea83c2f5a223b9dbcc9bc382f68bd08ed3bbd348c11bd2f42a83b403417bb202fad3c6894613d7fdd11bd2685193debe73abd8c97c73adc42c43cef35073cbbf1613d779a6d3db995aebcbde57dbd2dfb91bc3c4581bc3d790cbcece82f3c63c4d93c57332abc581933bc209c903b8f1be53b60c732bb3beab2bc8f143ebc8a1d1e3c919106bd75c6443ba533d9ba97ea803bd56c40bd75d554bd5a2786bc788f463d6bf1cbbcf3bb5d3ca57e863ccf9456bc40da16bc9ba0233d8f9e1bbcb4e006bc635e43bddfaa523df8c474bdc1b615bd0c3dcabc7b60a0bce31ddcba8bf4333c0371b8bcf98305bcb869a03ddc69bc3d156e63bdd376ff3ca8f6babb843d00bca83463ba7ba4ee3c18a60bbd8480073dfc2c9bbcfde61a3da18d1b3dad329b3cb70d08bd97cf6a3cbcb9523d967102bd93b2593c006002b7e969743d15b44fbd80ba673cf037f0bc0985ddbc6fa0b93cb103573d57cf95bcc3b3493d699d483d1872b63cf04a2c3d748c90bb2ddb99ba1451b0bd5d3fb83da06f6bbc084c54bcb3258b3cbb53583c485c9ebcd1e8103c5f17053ca0b7bbbaad15f03cf0c9053cc5348c3bf341a23cc80310bdf0194cbcd75fc43b8894063b75612dbd40c7e1b9b9d74e3d217398bc6d4b783c6fc00bbda3e1223b7cabbc3b631a803be87db13a337b58bc2bf2be3c6019b43d39fbb23cdfb59b3b6bad843de16207bdb081dbbc50d689bd75f0aa3c2da1683d3702223d09c81cbdcc09923d909d24bbcbbf4dbddc25073d4de1363ddab99a3cb951003d23b8433cdd5adabb7d06523d664a833c89f0bf3aed402fbc74f7473d2053343c708d333c3349a13d2d928a3c39cbcebcfdfb8f3c1165fcbbf801fd3c5b9a193dfc3aea3c9d8313bd33529dbb58b3ca3c40cdcabc13685fbb583d1e3d30b1d53b7b4c3ebc076d1c3c54cc0dbdb0cc783a4dc71d3dc08cefbab5be55bc	A	01000000000	01022222222	FEMALE	t	$2a$10$RCjxYoWsf15ZtujaenSwnOzCdMev8Bw3toIy.2JvzDqYQt1Eirbre	profile/5730f01a-d92a-41ca-ac21-0ab5034e52f7.jpg	PLUS	AREA_ADMIN	\N	NOT_COMPLETED	1353453	김예나	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	550e8400-e29b-41d4-a716-446655440201
6ca69fc1-f198-41e5-b789-4734d0995606	2025-09-16 14:46:27.691371	2025-09-26 23:32:12.641544	\N	\N	\N	\\x04b622bd40a1f53c591b6cbdf85e65bdccac42bd554b8c394a4c21bcabbe5c3c158f0a3b33d386bb281d7d3ddeba92bc595c5e3c6835743c330f0abcafd0213d412889bc73fc0f3c55908fbd17cd8dbd4b6a833d83f188bad760fdbb30ff88bdac9f333c2f0c303df50a5c3d6461acbc80d0da3980a4d9bc8c2735bcd04113bc643e923cd567123d34d60a3c855291bdf1351bbdcc4321bddf2b68bdf517043d8ee403bc7036acbc607380bd1cb47f3c9bdc4dbd84ee9c3db3d58abcaf8cee3c278421bd9157bdbc6475e1bb15d899baebfb9c3d77299c3c5572203de1b2c53d1dab9a3c44df6e3ce96cc33bf96887bd4b74003d2881fc3b55524ebc1cbd51bd28292a3d701728bb71aac4bb09492cbdb751693d7bee033b688749bdef7a603c75df393d33527f3b8b4ea3bca047c63b5524103a352303bd23562ebd7c5496bd582d823d7b9468bc3b74623d871b93bbdf50c33a7c21583d7c9461bd23ec5cbd7d01903c4b7e88bc20cb59baf4f2ae3cf076ea3c3b01fe3cdb5011bd532a7fbc2424e83c0795e2bb7c59083d6b597d3cabc87a3c28e703bc41dea4bd2362d03c956ab3bc6905d33b5c8c0ebce354f93c31af4c3d6ffceb3c13ccb2bcfb4edb3c976788bd7cbeed3c11d919bdc877c8bc8bc5e1bb0b8e883a7b64dc3b786876bdd2c19e3c4381cdbcddb90a3d1daa2b3df1a517bc8bfc713d58b836bc3572b2bdbfb8883dd71f5cbc64b34dbdacb920bd4c0f4cbd8da2483c95c457bc603448bd13ee6ebd7312f2bcdf6dda3d296736bc6dc0273d332ac8bb3fd2d1bc09b2a63d1df294bdbf79d23d8425953bbbefa33b359d5cbb01b6263d4daa8cbb1dfeddbbf08a4f3ca3d1ccbbcd953a3d3d50dcbc4bb441bc69c3dcbce8d10ebdad0e4a3dc1564fbd7123fc3c50e9303ca53d65bd7964513d2548e3bcc5874d3d84c784bc2c4ab4bc1540d7bb356f95bb0fa3863c08f0763dc08e863dd5e7a8b904ca1fbd376a0ebde518ef3bb0fa463c4d3fcebcab56e439d32f1fbdef05f4bcdd49ca3ce389aabc05bd63bc3b8b863cc416db3c50995bbcf38887bdd575c63c2caa363de836f9bc00b5323dc2f9a2bc371c76bcf1aa71bc5c3353bc13c82bbc07a48bbdcfa15a3d2ddb1e3d93a6ccba8064bd394857e9ba193e93bdd3a35ebdc7bca93c30a830bc3f9813bdf89b66bb5710c0bc9b58c5bcb88258bbbd1a163c34b632bcbd00573cf8acac3c649810bd71701ebd87d412bdf086723c943f6d3d4afd07bdc8ec993adc367cbd889c6ebc05af3d3c78554fbcb561453b1357a43ba9918c3b0339a8bb5c38cc3b91fcfabc1bc2903ccd54723db8f58bbc6431f13c27088e3ce5ca8dbcd76810be4c8cb43c74db3bbcbd8cad3c78b303bc531987bc195d673cc823b93b24064ebc1c99b73cd9f634bd25bb4ebda7a7fbbbdd0666bc88d6ae3cd3be133cfb7f4a3d23e0c3bccb982bbdd93451bd71e3023d2b663c3c25b629bcc05165bd6ff967bce830383c3b2589ba883ec8bb2b2432bc3c2b813c251c70bc5702ae3b953c013a0dc0843cb9fd723c8b48b73c67c49dbb0b77c5bc4b1b01bdf53c83bd88cc68bc438c963c7f7752bc0df97fbc5c8921bda181433d8dc023bdfd57253df4ae27bc5906283c33b328bd9ffe9ebc9df5d3bba03f98bc7eb2a6bc252400bcfd7dda3b78a551bc53717c3cb3fe333de37c91bc59eb143c2958bfbc88c207bdcb957c3d2bfe66bca087573ab8462cbcb55fec3c23806bbc315abbbc2048583d4d1bd7bc3b09fdbb1c50d5bb723a92bbc3e50abca3ddb7bc0d12c5bcc0ef383a1533683d10ba0abdfdbc0ebde935943c2dd0ddbcbce2663d4beb4bbd03363e3d430ae8bc3c579a3cb87b5b3c9d4a0f3d9f51bd3b08d102bcf01f2b3cbd44d2bcc88a81bd0c2e22bed4f5c73c18f5183d9b945abd8df7fbbcc37b18bdfc5511bd375e55bd77df763d484ac1bccd74173db40d9f3d77f121bd8dc0393d7d1865bca1da0a3c4fc10e3ce77fffbb3fcb933b4059d9bbdb7c3ebdb0720bbd5c6783bc3080c4bcb9a3a33d906c9f3c97f9263de13b5dbc4fadacbc1f5127bc10e6e3bc834417bd03cda33caf9d353c5146ff3cf82635bca1a11bbd8c36783b8bb776bda46284bcd29e86bc0b2b223dd411773db18f233da916ef3c3892673d9ba7103c7bb550bc342f263d5b68e1bc51b5e53c13ab75bb6d0e8abcf912913d207776bdd44b11bc087acb3b55deb8b9cc38333de11f9bbd146523bd5596143d4b1a613cb2630ebd64d50a3c6ffe09bdc58ae13c08a3a13c41544c3c1f463dbd70d24d3c895e32bd405a6ebba7c658bc8fe327bc59985f3d05d85bbd756923bd79a7a7bc9f74ba3c5f82a5bcccf33e3d49dd51bc70e60dba392b41bd435b7c3c9b46c43c8b15343d670b35bba5de6a3d88c9f93cf33747bd60d0cfbc404d6e3c873012bd4be370bc731e1a3dc3478bbc13355fbd1ff0a7bbf35aab3c883a69bd55c51e3ca88d2d3ca575ca3cd5a4433a88c8e5bb3c5242bd95aa3ebd2c80dbbb5d1de83b1303783cac372bbda1422fbd45f7e9bc3d72ea3c41f8443c380f193dfc002f3cdb33553df9793ebd6bc8f8bc04282d3cc8d542bcd403a43c310a363d0315e1bca0ea923c6af9933cffe143bded336abd1481b5bd798ed53c0c85883d7d48653d83f1a73c9185103d2425adbb139b613ce1f6883d4727bebc4087cf3b305c283d68de5e3d42980abc2b4fa03c542e373d3086d0bc550b17bd170e483d28ec00bc95d133bc087e0b3d6d8d0cbdc59cacbc1e6b0f3d9cbb57bce909053d54023abd2def07bc3dd2983c37e045bdeb1b8abc2035e83c352f523ddf1b03bc13282a3c97c58abdfe4502bdc6d7a6bcba2c193de320503d2d43253c352b03bd	AB	01035832257	01093502094	MALE	f	9wOqtU7YnCNa	profile/a02620f9-fe10-4934-80b2-f7319d0328c5.jpg	MINUS	WORKER	\N	NOT_COMPLETED	3196483	김환수	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440201
171f8950-e064-44c9-af5b-f73817104301	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-04-01 08:00:00	180	\N	AB	01034567890	01011112222	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/area003.jpg	PLUS	AREA_ADMIN	2024-03-20 14:00:00	EXPIRED	AREA003	최민준	550e8400-e29b-41d4-a716-446655440103	550e8400-e29b-41d4-a716-446655440203
6df61ff2-e7de-449d-af9c-a9938f01daed	2025-09-14 19:36:46.331898	2025-09-27 21:10:05.306796	\N	\N	\N	\N	B	01000000003	01000000004	MALE	t	$2a$10$FkZDwol/Ih6.GeNJ5Y21OectBgqK/MWnM1r8ZyTYdvP3TzmeFyRAa	photos/area_admin_a.jpg	PLUS	AREA_ADMIN	\N	NOT_COMPLETED	4877974	전원균	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440201
82e40482-57a0-49e3-b1ba-4cd1d1edace3	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-10 07:00:00	90	\N	A	01045678901	01022223333	FEMALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work001.jpg	MINUS	WORKER	2025-08-01 09:30:00	COMPLETED	WORK001	정수빈	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440201
70fb2a95-87c6-4da4-a4e8-b17bfd273595	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-10 07:00:00	90	\N	B	01056789012	01033334444	MALE	f	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work002.jpg	PLUS	WORKER	\N	NOT_COMPLETED	WORK002	박서준	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440201
d6ea166e-8d3c-4ead-9145-ba392f200691	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-10 07:00:00	90	\N	O	01067890123	01044445555	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work003.jpg	PLUS	WORKER	2025-08-02 10:00:00	COMPLETED	WORK003	강하늘	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440201
d603a39a-9f94-4543-ae86-979a7b6a3dd3	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-15 07:00:00	60	\N	A	01078901234	01055556666	FEMALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work004.jpg	PLUS	WORKER	2025-08-03 11:30:00	COMPLETED	WORK004	윤아	550e8400-e29b-41d4-a716-446655440102	550e8400-e29b-41d4-a716-446655440202
bd0fc3d3-f5f7-4116-b51c-fa8c71cd4294	2025-09-26 07:49:00.231327	2025-09-26 07:49:00.231327	\N	\N	\N	\N	O	01012345678	01012345678	MALE	f	$2a$10$yoTql4pT0gJNhMawtmNUJeqlurhnI9gNWjyFmaHZ6t4s1St6Fd3Di	\N	PLUS	WORKER	\N	NOT_COMPLETED	0000009	김동규	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	27fe1fe5-9ddb-4f9f-a65d-dea18e07813f
620e637d-2c7c-4af7-b247-a3aebd5480c1	2025-09-24 05:51:21.391124	2025-09-24 05:51:21.391124	\N	\N	\N	\N	A	01011112222	01011112222	MALE	f	$2a$10$es5dqibSY7GcZLAEBlkl7OCA0qLqX6eWeeikB8a5FLAd4shIHKxl6	profile/cc58969f-1945-42da-b1a3-f64636401b8c.png	PLUS	WORKER	\N	NOT_COMPLETED	1354299	김예나	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	550e8400-e29b-41d4-a716-446655440202
f5ac6168-0abb-42e9-bd7a-d630edb6baa6	2025-09-17 00:55:26.457218	2025-09-17 00:55:26.457218	\N	\N	\N	\N	AB	21212121212	12121212121	MALE	f	$2a$10$hc8zPVCq1MR5xz/BIbALsOkkxhxRSaWMZAbnOWHS2povkQUbkCAFy	profile/117659e7-1455-41cd-b577-2d0c534932fd.jpg	PLUS	WORKER	\N	NOT_COMPLETED	mobile2	mobile	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440204
d48c08ac-a56f-4f1d-97ab-ff66a8751291	2025-09-28 05:07:13.653919	2025-09-28 05:07:13.653919	\N	\N	\N	\N	A	01084252520	01043634312	MALE	f	$2a$10$FiRWfADs0BJnoOHwDKMzrOYRz3gZOvBJtASWRLXXzgZwYFuNzFgkC	\N	PLUS	WORKER	\N	NOT_COMPLETED	0104363	김동규	550e8400-e29b-41d4-a716-446655440102	27fe1fe5-9ddb-4f9f-a65d-dea18e07813f
7eb0d73a-ec1e-4da6-886c-922a3a695651	2025-09-23 07:51:30.572456	2025-09-26 22:38:15.576512	\N	\N	\N	\\x7d3444bcbdb51cbd3a5401bd00a88ebc3090a6bdd88ed73ca07ccc3cb5eed43c30d4883d1300193cc114993c9ccff5bb1f584fbdd596de3c07972cbd9a9b893d5cf2d5bc75b14ebcef198e3cff68ccbc8dc661bd67d6a2bbfa19923b05121a3a43f6853c9daff1bccb8a2c3dd3fc7d3d68b965bd6069993cfdfd6a3b3dcf62bc54bac93ca70b993d988b2d3dece85bbcc5e0b9bc888dd53c755d7bba4577673df505f8bb08f2c7bc199131bdaf60093d1ba3f3bcf323ef3c381a52bc7f209f3c8709d7bc73cbe4bb3361cebb18c5033d33d141bd9523dbba55faa13aab823cbc2c4c9a3dd3b7613c58f35e3c58d4f2bdf3ac33bdd72bc3bc6308eb3cb15894bdd7722e3ddc6988bcdb0b913a315f19bd70c00d3d1b6f0b3c72d988bd87c246bc9de0693db8bed33c09d7c8bd2d36e0bc09238f3d295a833d871b03bdab03d6bc54fbab3ca0c648bd5347bb3df0a280baebdbc43dda20803d531da03cc962a7bc052a0abd6bcf033d43ac53bda972cbbb619a993c2b88043c480900bd7ffccebb0d717f3c90498b3cc589ce3cc5edf6bc8dd87cbd6456f3bb07119cbd74c0fe3b3d8c0a3df493c23c81d4a03d610c893d8093153d077da3bc8d91cbbc08cd723d6f6412bdec33be3c767ca93cc3d4abbcac76953c1ee217bd5d462bbbc10f1ebd07a410bcac3b56bd50afc3bc07d1023ce334ac3c2420e93c9bdbbabddc9e4cbdc4608c3dc8515ebdb4c72e3d55bf90bc1c0d813c45a9a23cf9a8943b6d2f4ebb813a9dbcba9d09bc187343bb399a6abcb9f109bd442d573d2c5ee2bc6464683d7d1b2cbd99b86a3dd487e93cf393a83b93c719bd13d9c83d9b52ec3ce8ddac3bab29f7b90d1da2bcf941d7bc757e62bc2b33b33d7b17213cddd0f33b754d473c5b68bfbd3756803d7521c83c902aeebcd89e28bc201992bb6118a9bc49ef5e3c5bf4ba3c47c2133ce9fc08bdc99e94bda735a7baf46c1dbcb146cabc85ac32bd491f84bd9109673c699b14bdb0d6a5bd16bf88bcc534c6bc61c825bdff163b3db02cfb3c0bf287bc738dbd3c5da6d53c983afdbc47c803bdb99c93bcf19d323a311dedbce39a9a3d84878d3a680a293d0c377ebccd33b53d99c5723a3b1430bdf8743b3c5bc94d3d2b5579b8768d98bc6905c93b3d4acfbce8b990bd0fc98fbb0c7032bc499179bd15b393bba9fc3e3cd544693db702053dcfe5473c9d82043c24ba573df30d3bbc0da0e8bcf55315bd01cb08bde87a12bc7f7e083d813582bd33dd1f3c031ebdbde392a5bc6bada0bc608168bd4161e13c69c8a3bbb0b0b8bcf95bfcbc15644c3c1790aa3cccc1b63caf06843ccfa4fcbcbd7a913bcf2c843bcf9ed53b3c59943c44e3bb3bada4e3bc2dbddb3c1b7a093d770fd73bc058ec3cabaf023c6b003c3cc74d173d05d982bdabb04cbd8cb9363cf3c3cf3c6af6293d528e963c1fa9833c33bbbcbc0d6cd13c5d73d5bb6ba22b3dd3cb7f3c8426923db0dfcabb607d51ba30523b3d97f10ebd53c7a23c8b30af3c2fb798bd8100ea3c9b59643b05c773bc853efc3c1d1f0fbd23d19a39efc1983ce12c15bccb440fbdb8b4e6bc0dc7debcdd4bc73b9d9826bd9d0a2b3c48e5c8bcc5b37fbd380dc4bc2bd6ccb90bc70a3d17e53d3a2d5a3cbd8df6193de5e0bfbca58e753c7bb628bd74f8913cd0c08f3b8ce962bc45f71b3debd41d3d533e69bbd01c4c3baff9a2ba5798ab3bc7e4173c30a4613d506b673d9440b5bdb1af96bd481d05bb87a5c1bc059d79bb178631bd19d118bd684cedbb83cd163cd63a153c3983863ce3e019bddea581bba87b613d71c8a93ba9a3cebcc885c23c6597273b88381b3d7598d7bc15c9edbc15ad7bbda7b921bdedd0b2bb67b72aba2be9dd39bd962a3cedbc293d643612bc8d43b8bdfdd749bc2ce54e3cdcf0c3bc241603bdcb95b4bccfd275bd4f5a07bdd75266bdcbfc743dbd7272bc1b35b0bb5bdfcb3d2f0583bcb3113a3de4d0e6bb78d2143bd5253b3c3b80083dff5010bc6599463dd14acabcc56f78bd308138bc3b3620bd4561ff3c5770b53cc52f9c3d8c9bc3bc535e10bc6524ad3ccd774c3d80ba74bcc8bd75bd15eeb63cb983983d8b3f7abc71cf433d5578c4b813a376bd73cd65bd1d1ea3bdd5e37c3b750a8d3df31568bcb564e03cca452a3d57cfa2bcac39bcbdf54427bba015aebb507089bc1cc50dbd6d72edbbc4d28ebc2334413dfbda2c3dbc2a573d2b96303db48cfd3c845474bded5a08bc53230d3da0c190bcbb2ed0bcc4080a3df7e18abc2358e73c04f76d3c17b0813cf532a43990d969ba8cc831bd279a52bc3961823b347fb3bc7076b3bc6d72e5bc40cf7ebda6e3073cab86413c4025b83ca7eed73cb71494bcbba5d7bb3506ccbc691c16bc9599b5bc55ce4c3d773180bcabfa923d0da57c3c048a20bb0193d23df55f3a3c72e908bc9f6ba3bdcdf1983dfbdeddbc7f62da3b6de0ba3cd983c93c7d2eb8bbe30bf4bc407052bd5367ea3bf3d7c73c6d26b4ba5aff1abc256c423c60388abc481dfcbb2d1cba3cfde686ba8e6f0c3d7c3661bdf5c382bc6058423bf854c53b71564a3c506773bc671d7c3a345220bc0449303cfd2f1dbd4d3eb3bc7d24c53d08855abdd328b53c901fc33c20524abded499fbd1bc778bd3b70813d6593ae3c073be23b9bf880bb0b05a83d9ce64bbcc4e09dbc4f3a403de84b7f3d30a19e3c0d0a9f3df1f398bb130b21bd69597a3c94588ebd5b55ff3bcb5af93cbcf0b03c907f213cfb22193c637e48bc9ddcf2bc8578d3bc1452a23c80e1debc68228b3db7dcbbbc2d8e863dfd5d92bc703ec2bbdf16173d0faa4dbcb5918ebd8d6fba3c0d978c3b03424cbd7058573cb29a9dbcd76827bc2946943deb56c7bcdcd1103d	O	01011111111	01011111111	MALE	f	$2a$10$5thBpLrti0ll85x5dpaZkOl2ugrOOvnfCegeyAEB10bvT.Q3A44fC	profile/d31717e3-c997-4665-94cc-4ebd92be589d.jpg	PLUS	WORKER	\N	NOT_COMPLETED	1355437	김동규	550e8400-e29b-41d4-a716-446655440102	27fe1fe5-9ddb-4f9f-a65d-dea18e07813f
62a3fa8c-66e5-4ab9-8c29-bbdabcb49da1	2025-09-17 00:46:27.085908	2025-09-17 00:46:27.085908	\N	\N	\N	\N	B	02131313202	21321321231	MALE	f	$2a$10$KhGrfXv8/33lg9qfzcrwoeJBmQj3BNe8DqdPit0oN3LGL3n0z/mIG	profile/cd21bc76-2386-41a5-9830-faabd20ccf05.jpg	MINUS	WORKER	\N	NOT_COMPLETED	test112	test22	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440201
3a7130a4-4459-4a38-ba0e-5a6fa0f1e4b1	2025-09-24 06:02:16.283899	2025-09-24 06:02:16.283899	\N	\N	\N	\N	A	01011112222	01011112222	MALE	f	$2a$10$XBQN4TqDKa9hkf1w9hEO3.O4/298Z4fLl3.h4FdpQ3pVMnUmE4gvK	profile/5e37f120-3f66-4961-a581-e5f22091184a.png	PLUS	WORKER	\N	NOT_COMPLETED	3453453	최민석	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440204
5ad90be4-8621-4b3e-85a5-627a6a9c69d9	2025-09-17 01:44:43.762663	2025-09-17 01:44:43.762663	\N	\N	\N	\N	O	21231231321	12313212313	MALE	f	$2a$10$r3Yj4Iq3ck2EbYPG0OQ6eeGeZ20xZZOfMzxggJ3n4.a7gy6aCc4F.	profile/7598edfa-0fe8-4e41-b254-c256eb7433f5.jpg	PLUS	WORKER	\N	NOT_COMPLETED	1000000	mobile2	550e8400-e29b-41d4-a716-446655440101	27fe1fe5-9ddb-4f9f-a65d-dea18e07813f
8887f2c5-c65b-4aa5-9f28-2c3621ad1d1a	2025-09-16 20:21:12.808356	2025-09-16 20:21:12.808356	\N	\N	\N	\N	O	01043634312	01043634310	MALE	f	$2a$10$56wpjvsINeYs/8591rnqJecgRxKm5p1fFbTemR0ysYdWZxd5.7GIO	naver.com	PLUS	WORKER	\N	NOT_COMPLETED	1122234	김나경	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440202
679c022e-7b6e-4445-be95-529becda488a	2025-09-23 07:04:58.640079	2025-09-23 07:04:58.640079	\N	\N	\N	\N	O	01011111111	01011111111	MALE	f	$2a$10$U5FKkhx5x/qAS/kbTtp8fe6X0RQ6IFZK6HgqvLj1JCoiAgnkRlTcK	profile/81d6c3cc-e0db-4b27-b9c3-97b55febee1d.jpg	PLUS	WORKER	\N	NOT_COMPLETED	1358580	김환수	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440204
c6e78dd2-457f-434d-a9da-6156e958ac9a	2025-09-24 05:52:22.605172	2025-09-24 05:52:22.605172	\N	\N	\N	\N	A	01022221111	01022221111	MALE	f	$2a$10$H6pLaFjR0i/mFBohomk4c.dJZEG5uXut2yz4S7DeIQ4EjLMT2L93y	profile/3e00db23-0a57-4be3-87be-f1b980301109.png	PLUS	WORKER	\N	NOT_COMPLETED	1333333	김예나	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440204
eaf6ecb5-e9e7-4f76-89ee-a26e96cb88c7	2025-09-17 03:15:30.865176	2025-09-17 03:15:30.865176	\N	\N	\N	\N	B	21321536156	51563161616	FEMALE	f	$2a$10$7CZTnUVa5GcBHH88Un/5YOqlWsQclLbL/kTKTSggj3OcSQwHqsm7S	profile/df2955f9-097c-40a8-96a4-4840d2bd3024.jpg	PLUS	WORKER	\N	NOT_COMPLETED	2000000	mobile2	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440201
3cb4338c-e204-4ffd-b12e-f6a459c37784	2025-09-16 16:41:13.072424	2025-09-16 16:41:13.072424	\N	\N	\N	\N	O	01012121212	12121212121	MALE	f	$2a$10$CpLt5ugNJHkX0WfYkwFTRe.z9U19gf94QSqQKx9yH9gT73PQ2G9Q6	profile/157b62e5-07f9-4707-989c-943ea8999515.png	PLUS	WORKER	\N	NOT_COMPLETED	1111111	동규사진	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440202
ac5ce585-f3f8-4e6e-a406-85dfa5b57bfb	2025-09-14 16:20:55.781601	2025-09-14 16:20:55.781601	\N	\N	\N	\N	A	01000000000	01011111111	MALE	f	$2a$10$zzn9y2vtr0x/RIiXREg4rOeHm5ys7rYirfFrN.iqGxX/mzg6Z3Q9O	\N	PLUS	WORKER	\N	NOT_COMPLETED	qqqqqqq	김동규	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440203
3e7c766e-9288-403a-abb4-7707c55b7042	2025-09-17 00:46:12.719524	2025-09-17 00:46:12.719524	\N	\N	\N	\N	B	02131313202	21321321231	MALE	f	$2a$10$UVD0BFWMw0q5aUtJrh7uPuPxuEm/DJ6CFzrVVGKqJVu7Zc/Z.R1eK	profile/c650a6f1-b5a3-4657-8e84-5096d18fe190.jpg	MINUS	WORKER	\N	NOT_COMPLETED	test111	test22	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440201
489bf069-0197-4de2-8b7f-95c3d3c5c393	2025-09-16 19:44:07.72064	2025-09-16 19:44:07.72064	\N	\N	\N	\N	O	01043634312	01043634310	MALE	f	$2a$10$ZJT0aK121SvX8l5Ix5prm.iogHu1y1BQ9NvdnwFPTwiaKDdME4xDu	naver.com	PLUS	WORKER	\N	NOT_COMPLETED	1122233	이희산	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440202
2c82d7d4-4d77-4fc8-bf36-185eaf66494d	2025-09-26 05:58:57.687041	2025-09-26 05:58:57.687041	\N	\N	\N	\N	O	01043634312	01012341234	MALE	f	$2a$10$WvsHEs7wvRv5a0wNRUOiWuelBfxqsjTAKclJm3A54vLggDZDgYguK	\N	PLUS	WORKER	\N	NOT_COMPLETED	9905311	Park	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	550e8400-e29b-41d4-a716-446655440201
e9b485e8-e0f7-449f-8911-a299a1eedb9f	2025-09-26 06:08:33.014382	2025-09-26 22:37:59.34377	\N	\N	\N	\\x317336bdd5c2643d8d9d19bdbf21673be0c2cabc45dfb13c028d12bc9833bc3c7dba6e3d6b58a3bc14a2d3bbe4a2f23c67585abc495a1ebb94e505bdefae8f3cefa4d6bb18198c3ccf0c6b3bc8b45ebd85ff913c08e8433c560f0ebc458998bd441d3cbcef0bc13c95e8dd3bf8f1df3c236c89bd30fc253d130fd8bb9b22833d41a3563dcd18823de540be3c9397d0bd853010bd6021b13b4c8e3dbd4f3f413d3f1d1a3c7ad0223d0fcfa7bd87b1a7bba06f5dbdb5db953df30775bc6b37b23c896e9e3c80a614bda3ac11bcb381dbbcc58e7e3b452b003d795b033dfd3c443c15fe9d3c15c2fb3b886927bca34e4cbdf8e24ebc25ef22bdb8ad1a3d6cd138bd1f9e2d3c2480c13c93d91abc3b6edabda174933d5b5c9b3a3ea8a3bd88c2c33b0c2c983dc1a630bcac3027bd0863533b85c9ac3dc5c978bcd0549cbcd1ca75bd78cbd03ceb1518ba54872f3da0fc62bc4f1549bc44039d3d4fe82b3ccc4997bc230eb23be3fd153cb95452bd6e9d223d4cd4763c5ced04bdb5250cbd03f3f03c601df73b98a0d83c85a014bb60879fbcca8e1abc44be653c9c64c2bb110886bcaf42d7bb6f038ebca088b73db36dbd3c81fa1b3d4455593c10af6fbd55ffa8b84962cebb2ba6383cc1c843bcfbc16fbd1b95a9bbe3f215bd28995bbc3861e7bbc44bf23ce38674bd38ded3bc55a9e7b8bf6d083d4b86413d872310bdafab92bdd8f4403dfb40cfba00e6ca3def3b32bdc5e2a23a6569543dcbb4b6bc4dabb5bdc85b063c47e75ebd9147f63c96a791bb61aecbbc9f9e603c0b21c7bcb3ab563d6f2c28bc5582713df74b29bd535481bc5089923c83cda83c687d0bbbc5bba9ba8bee2e3c2be8afbbf44800bd0ce0bcbc639b633d75f03b3cc398f33cf13b733ddd8ab1bd6d7d0d3d240f98bb9e6728bdd501193d5d1066bdb9b41d3d9b04473d1f21d93caf0081bc28efb43cec94c13cf10d133df569013deff021bd44c172bc1bc6a4bd94d303bc6b438d3c13ef5dbdc09825bd80784ebc8fc343bdcd14453d6bb7993ca9037b3c6d9a7e3c6d965c3dfec90fbd3fa7a3bc61cbfbbc14cc253bdf3201bd28f6613d67a5f3bc3d016cbc53a08ebc2cb2f1bc4d4bb03c4b2938bd05b3bd3bf0b5f43ce49da43cab98ffbcf99bbfbc0d58c8bd3f310dbdd737bdbc19e392bc313b4dbc07b44d3be4859c3cc982e0bcf3803e3d2dbef03c7a44223c814d6c3da414b33c2d5d5c3b38ccc93b951ba4bcc927893c857bbc3d5c35ddbccf95163d4b7a1fbd2d8517bdcded7a3c68da92bc582d5d3cdb1e43bc838bc0bd6b5fdcbc7b4987bcd5255c3d7533e73c85a5babb24fb1cbd8884af3cc96453bc61811bbde062fa3cb304d3bc6319653cb80a3ebcb810f23c6f8a033c147a773d2ff0913d2394d0bb9bc67c3de89f76bdb889bbbcac0bb6bca4aa423c4ba2df3a6b34643c45b1df3bf8c4b43b32cb0dbdaebe82bca38795bc3da6fbbb951c643b5891c33c001353bda0a578bdefc5ab3bc067e73c3c36063c35a9f6bb8598adbb73d37a3d5dacbcbc4915b8bb010b313d11f09dbc8dd1803d676833bd618351bc78d56f3b777391bd13964f3cbd3ac4bc56d786bd4816843b51073f3d6ff1c3bcb45ba63d683daf3c085481bd11c889bdefee0c3d3b90d23c1936883d3ce022bcf96d52bc3b281fbc0c104e3c3d27913d61913fbc0d063fbd801ab5bb6bd2cf3ced0e82bc5d21a33bff9e9e3c594a5e3dc93799bd8a0801bcf10a2bbd74178e3cab3429bb13ab1fbc5ce1a7bc3860b9bc700810bb50aec33d990726bd60afffbcbb0ec63c307c423d386ff0bcd3cb2dbdf5ca87bd40ffc33b389ff7bb336075bc058341bd0f1154bdb51d09bd53d4973b3ddc06bb5c6795bb7130a1bd74cc4d3d5517023b9c2319bde4e497bd7da626bce1f055bdc8fc34bd7d0767bd0b57d0bc7b7127bd13c693bdd820093cf9e7a2bcb87ab83dccf1c83dd7d42c3b007f403d4d1c32bd5ba02bbc904a393d6728febca1e3823dbb1c23bd03fd8cbc53095fbd73b806bb2d46d6ba9311eb3bdb582abcf906a13dff393e3d345e0d3d07bb143c3d19273b4dac0bbdab25983b578257bd2b0887bb9ddde9bb0cb555bd7df5443cc15e34bd111492bc514458bd33ee3f3df4df3e3cfd2764bde576b23c00de2b3d7d87ca3be1e71bbdf395e13ca1829b3ba0bb09ba83b7a3bce87a7cbb69b86dbc49f601bd8934153db4623cbcc0cda6b851c2163db3c0babc97fba33ca1ae093d2506653d13f61cbd1cf3dcbc1b907fbbb4139d3dadb46f3c8b9db83c235856bd1fa6003dbba4b1bd9340623c49dabd3c1eef293c395d2ebd75c53abdd027e6bcd52d093dad80ce3c81ca883b5b4b7d3da4040dbded8f80bcda3f8c3b1b5014bd219ea63cbf0ab63cfc997a3cab0ba73d23549ebce0435f3a075f2ebdfd86893c5d850cbd903bf03ccf81933d0302b2bc60616abc6323193d8f01513dad4c1abde3061fbd977bc63bbfeedf3c00df8a3ccc15433b2159babc872ef6bc77ca283bd8a552bc9604973c1fce56bc70180bbbf3876cbc634e373d9b00723c4b782f3d5985a73d7ba0703cf6639cbc34362abcc11caf3c28fbd5bc5faa0fbc5d38ac3d40e6253cdcae7e3dfdce5d3c8052a9bc95c4aabdac1af3bd1b9c293d9159963dd027713d8ff4843c1b7a523d614395bc80f536bc24bc6f3ccd6f753c0c47e2bcb368773c7595b4bc10d26fbb6b54c93c6505d43c8e6b11bc3d81f0bb5891553d794911bc50a12bbcd1ccd23d86bf83bcb1918abd0b471c3d1591dd392b25c63d0b892abd091a113db90106bd38b043bda45d873d25c3e8ba8faa04bce341dbbc308253bbd1b351bdddc5f0bbf46e06bd08667d3b7522633d0f4ccbbc6d126fbd	AB	01045757557	01079799797	MALE	f	$2a$10$e7sskEjDXQHSrGXDhXvJ2.l7W3Zzkg5JxgRPL0ZIgC8kJjCjkpili	profile/894fd3b4-ebb3-4ada-8f04-e5e5dd088820.jpg	MINUS	WORKER	\N	NOT_COMPLETED	1353454	박정훈	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	550e8400-e29b-41d4-a716-446655440201
f40095b2-016b-4f1f-9039-8cfe97adabf0	2025-09-24 05:57:24.061034	2025-09-24 05:57:24.061034	\N	\N	\N	\N	A	01022221111	01011112222	MALE	f	$2a$10$1fXZ2hIFh7k8klWXSaq.jOr9aR81ynirFkli6f5GhvGAWWCvx61LO	profile/0f5bb245-3a52-48c5-b0b7-5593f491c060.png	PLUS	WORKER	\N	NOT_COMPLETED	1231231	김예나	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	550e8400-e29b-41d4-a716-446655440203
f1bc0ec3-587d-4c4b-949a-ec502aafbf44	2025-09-24 06:03:10.110462	2025-09-26 22:39:46.213733	\N	\N	\N	\\x44194ebdd828463dfd781abd598bfcbc9cf8b5bdd36d8a3c3dbaa7bbdc0f02bb6095bb3c207563bbd18b3c3ce448adbc9f20533c93e20bbce0b9d6bc69e99bbbb0864dbbcf239d3ca34b733ce3a532bdbc84c13ce9df90bcd56b553c55eb14bdc17d1b3c087f0bbdffb2813d31400e3d74679ebd9135413d3bfb593c40f8fe3c00802eb9450e6d3d0343433c7090eabc4d92ed3cf8f4833b5044fabc68019d3cbb67533b8f8d2bbdce2e19bdbf529c3c99cd82bd04e0bb3c3b9f5ebdb216083ddec1843c8db734bd457acebcfcf264bc4cc041bcd3d357bbaa5a063d6131063df133243d5d84673d8f1a3abc09906fbcf83020bc859d273b9d142e3c21d56dbd94bccbbc4b30a3bcebd58b3c235a36bd2317353d20b8f13ce3c5a0bd659c13bb10fb7e3d8533debc3f323fbdf30b3fbc4dff153d380a43bdef008dbc7da90fbd9866293b4bcf00bb55d2b13c815dbf3c5baababce777793dd05854bd22f3a43cc8bc2e3c43818e3a4ffbefbc2512293b8043a73a0055953a7185b0bc183747bca963203d0513fa3a68e6ad3cc30b67bc5c95f13bc3a3fe3cea0d10bdeff117bc70125e3c3b6891ba2f4ee4bb30518c3dd70e0d3db7949a3ccd54b7bcdd335a3a5029acbc8742353ddd78f7bcf5c39ebdcc9815bcff7d81bdd7045bbce47dd6bb00f0e73cc39a313c0d3d71bdb37183bccce1c2bc0f84c83c694ebbbb110426bdb37d573dfd14693c15065bbce836b5bcc07534bb139d10bcf198dcbc18b7a5bc9b61e9bc49db24bdfbfb1d3d2fe845bccd6e53bd4b0df93c952c14bc3d71043d61a326bd0935953d1baaf63b3606a2bc00aacfb82199723ad7dc223d8b1ac83b23f372bc0b8db5bc5363b9bcf7f2503cc91526bdc3e0373d95503fbc8dce763ddf2e0fbdc5be8f3d8d26d63cef044cbd85bb4bbc945d05bd9617a23d97aeb33d3cfa893ca8da5a3bd57ab1b9c8c7513dae92843ba8e71c3dfd9cd7bb7d5703bd1d069fbd03cd63bc34c2653d881df8bc315b7cbde1880dbd33b504bd4fef0d3dccaf6ebd68ffc33ccb11983c858bed3cfd414cbd0670a5bc5521fbbcafbdec3c0b2f3abcd3a9fe3c6b87883ba34f38bd5bec8ebcab7e4d3dcbe8143be7a376bd1d4ae93c234e3e3b05aaaa3c405da8bc772f0b3c90d1cebc7cff51bd49453bbc29fd2dbcffdc1bbddce61e3cbbd5cdbcb03f543ba01ce4bb1d06123cddd7073df3bd233dc006e43c481adc3c7dd097bc3801fabcc546263cd3bf483d0f9002bd3d9c233c2bebdebc3140a2bcbd23b5bbe30c673bb0c0893c0052dfba2567e9bbbf303f3df0cb0d3b1d5594bc92370dbd05f9e23ca7d317bdb739853d1b38f3bb8318afbc8bff0bbd19e9b9bc2ce3e3bc7b0e50bcc9bc923be5e2aebc10c49f3afb680e3ce048013db9bfee3c657183bdb4975abd555b10bd2be70cbafd9ce5bbe89b7cbc9da4843c2d679b3b65d1923caf880abdfbddaa3c2339a93b0d1a6b3c6cfef7bc3fd56bbb15c5383d5f3b84bbf2d0843c055c913c79c282bc68f0a23c6b7477bca0fb4d3c16f689bc7722c23ba5b9353c4bcb673d48242abd5add11bd67d21e3ce5a0c6bc3315af3c03d6ab3c091433bd072013bd2dc2ad3cd6fe83bd1dae3d3d1721b1bb9fd042bd9ca98cbd808a0a3d9fe683bccda529bdbb4ff83aab7603ba7b25873c05b77ebba7931b3ddba0903bf08711bd9bc1383bb4c105bca5d4d1bcb826923d957ed7ba6050643c6d888bbd0028363a9028cabc9337513c5f282a3cc1e83cbd3c1bbf3cb3f43cbd45509abbb5efcc3c9bf0eb3be81fb6bb786c3b3debcbcf3c05971ebdf0218bbd41302ebca5f09abb555db7bc70cfdebc9b35c5bc5bde28bd75b28fbc053a723bbc2b19bd8f83063df135d2bc9dc7f63c531250bd938254bdc503e3bd2c1bf93c65e9bf3c4870f7bc73a6a9bc2932e0bcc1cd45bcc5c187bd38aff2bc44275bbdab4e1f3a1599813df48a05bcf818f63c4cc430bd1d8a5bbc69c9123d5b50dcbc6f48793de95f583bfb2089bc434891bde04e10bd1fc2a8bcfd557b3dd7f2973ce1fe723d009a07bae1f60fbc900c2a3bf08c7f3c05fb2dbd6fd19ebceb5e14bd49a5273c93c4143ddf7784bca781233d08e982bd7be402bd4de137bdc2a1813dc70725bcd5826a3a830a033d3701d93c633c40bd4363dabc90336a3df17318bd2da8793be4a6b3bc265b93bc378823bdc56904bb044a023dd5a77a3cb79d22bc63521e3d1bb0983bc4c7a83cd830043d92bc203d134b10bdcf27ddbc405cdf3bc790a13cdf58cd3c68c7543d67782dbdd1b9873d6145a4bc59dc0e3d3578a1bcf9c4c23c5386133d870b91bc2529a8bb60f9d6bb3945043dc494f3bbb8015f3d9bcd2cbcbdb8c5bc7561f8bcafdc823c9bb50d3dad43273d15ee5f3b8050c93c688bc63c712430bd48aa073dd397813c8456eabc6caccebcf5f23c3d00902a3a2e040cbd7b9f923cdadf87bcd3d6debc4bdf383a10a2843c8857943ccb30ea3ba753b63b70e64fbb0551ebbbc98307bc91a811bdedb48bbc1521903b252284bd257fd6bca74f7f3d9f55473c1a45113d7910083db8cd253cc3ee5ebcff7e863bad99ed3cd5e903bd251dd2bb1395463d83a477bc18c88a3d245c733d47bbb4bcd47b92bd851685bdb16c2b3dbf0e933d372d883db3527fbcf753643cc8de94bc002cab396b8a4b3de5cc16bb3753593de380453ceb0aa33b3de056bc9bca62bb0c43ce3c3f45afbc86b804bd1d59133dbf6c8f3cb77aa03b9de8c23d172626bc010501bd2de5153d7b02643ce33fa93bb3df103d478afc3bcb57ff3c6b0ea8bd18411c3d4f3ab3bc42c506bd441d823c8be947bb176f4cbd2e298b3b133b88bd15996cba8020ed3cb88bc43b0f2087bd	A	01022221111	01022221111	MALE	f	$2a$10$OMsDLjnarZuT5mYH7AZuP.ZkAEVYvVu.O98k9eMWrj3nskrAvncUu	profile/17db32b5-fa0c-4fce-9537-4bef2588bab9.png	PLUS	WORKER	\N	NOT_COMPLETED	5435435	김현서	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	550e8400-e29b-41d4-a716-446655440201
b5cb6093-6afb-4bc4-ba30-cf9b17b8a8c7	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	\N	\N	\N	A	01011112222	01022223333	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/admin01.jpg	PLUS	ADMIN	2025-01-15 09:00:00	COMPLETED	ADMIN01	박정훈	\N	550e8400-e29b-41d4-a716-446655440201
cc5e3ee4-70ff-42aa-a50c-ee3c3667ea39	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-03-01 08:00:00	365	\N	O	01012345678	01087654321	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/area001.jpg	PLUS	AREA_ADMIN	2025-02-10 10:00:00	COMPLETED	AREA001	김철수	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440201
850192a6-a904-4ad1-81f4-603f33f032be	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-03-01 08:00:00	365	\N	B	01023456789	01098765432	FEMALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/area002.jpg	PLUS	AREA_ADMIN	2025-02-11 11:00:00	COMPLETED	AREA002	이영희	550e8400-e29b-41d4-a716-446655440102	550e8400-e29b-41d4-a716-446655440202
55f95230-bd6f-43b3-8d58-86cd6ebe2c36	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	\N	\N	\N	AB	01089012345	01066667777	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work005.jpg	PLUS	WORKER	2024-08-20 13:00:00	EXPIRED	WORK005	장동건	550e8400-e29b-41d4-a716-446655440102	550e8400-e29b-41d4-a716-446655440202
1958a930-c9bc-460c-82f8-771284ff9cca	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	\N	\N	\N	O	01090123456	01077778888	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	\N	PLUS	WORKER	\N	NOT_COMPLETED	WORK006	임시완	550e8400-e29b-41d4-a716-446655440102	550e8400-e29b-41d4-a716-446655440202
c273aead-f1cb-4335-8c61-ba346fbc7ca1	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-09-10 07:00:00	120	\N	A	01011223344	01088889999	FEMALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work007.jpg	PLUS	WORKER	2025-09-01 15:00:00	COMPLETED	WORK007	한소희	550e8400-e29b-41d4-a716-446655440103	550e8400-e29b-41d4-a716-446655440203
716cc26e-7655-4a49-91e6-2c2b2f05850e	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-09-10 07:00:00	120	\N	B	01022334455	01099990000	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work008.jpg	PLUS	WORKER	2025-09-02 16:00:00	COMPLETED	WORK008	조인성	550e8400-e29b-41d4-a716-446655440103	550e8400-e29b-41d4-a716-446655440203
3c2869fc-7edd-44ba-8b46-a804d1c2d95d	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	\N	\N	\N	O	01033445566	01012341234	FEMALE	f	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work009.jpg	MINUS	WORKER	\N	NOT_COMPLETED	WORK009	김태리	\N	550e8400-e29b-41d4-a716-446655440203
993637a8-e82b-44de-b871-c7d3bc78f65c	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-09-10 07:00:00	120	\N	AB	01044556677	01023452345	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	\N	PLUS	WORKER	2025-09-05 09:00:00	COMPLETED	WORK010	이병헌	550e8400-e29b-41d4-a716-446655440103	550e8400-e29b-41d4-a716-446655440203
84a18e0e-b5cf-4087-8637-944fc2a72b4f	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-10 07:00:00	90	\N	A	01055667788	01034563456	FEMALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work011.jpg	PLUS	WORKER	2025-08-05 10:30:00	COMPLETED	WORK011	김지원	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440204
2fc5d014-a76c-4a8c-a9d3-6ad368a03144	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	\N	\N	\N	A	01066778899	01045674567	MALE	f	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work012.jpg	PLUS	WORKER	\N	NOT_COMPLETED	WORK012	송중기	\N	27fe1fe5-9ddb-4f9f-a65d-dea18e07813f
52908fab-8b39-4dad-a5b3-2bd258583df0	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-15 07:00:00	60	\N	B	01077889900	01056785678	FEMALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work013.jpg	PLUS	WORKER	2024-09-01 14:00:00	EXPIRED	WORK013	박은빈	550e8400-e29b-41d4-a716-446655440102	550e8400-e29b-41d4-a716-446655440202
6969f757-7c5e-4a69-8b80-6a24bdcd31e4	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-15 07:00:00	60	\N	B	01088990011	01067896789	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work014.jpg	PLUS	WORKER	2025-08-10 09:00:00	COMPLETED	WORK014	현빈	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	550e8400-e29b-41d4-a716-446655440202
4d14433f-a83f-4a95-82df-e18620dd22d6	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-09-10 07:00:00	120	\N	O	01099001122	01078907890	FEMALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	\N	PLUS	WORKER	\N	NOT_COMPLETED	WORK015	손예진	550e8400-e29b-41d4-a716-446655440103	550e8400-e29b-41d4-a716-446655440203
a8b866f0-fa2f-4d8c-8c40-c244352302f9	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-09-10 07:00:00	120	\N	A	01012123434	01089018901	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work016.jpg	PLUS	WORKER	2025-09-06 11:00:00	COMPLETED	WORK016	공유	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	550e8400-e29b-41d4-a716-446655440203
a1063c2f-0b1b-44f1-b6ce-0f9812961231	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-10 07:00:00	90	\N	B	01023234545	01090129012	FEMALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work017.jpg	PLUS	WORKER	2025-08-08 13:00:00	COMPLETED	WORK017	김고은	550e8400-e29b-41d4-a716-446655440104	550e8400-e29b-41d4-a716-446655440204
19271cb2-8de7-432a-91ea-2db5525cc9d9	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	\N	\N	\N	B	01034345656	01010101010	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work018.jpg	MINUS	WORKER	\N	NOT_COMPLETED	WORK018	이동욱	\N	27fe1fe5-9ddb-4f9f-a65d-dea18e07813f
7e0778a0-5fcd-4ca4-9002-92d824e54d3c	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-15 07:00:00	60	\N	O	01045456767	01020202020	FEMALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	\N	PLUS	WORKER	2025-08-12 14:30:00	COMPLETED	WORK019	유인나	550e8400-e29b-41d4-a716-446655440102	550e8400-e29b-41d4-a716-446655440202
2fcd91c8-352f-4836-a647-d37e6bb4830c	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-15 07:00:00	60	\N	AB	01056567878	01030303030	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work020.jpg	PLUS	WORKER	2025-08-13 15:00:00	COMPLETED	WORK020	차은우	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	550e8400-e29b-41d4-a716-446655440202
0c363636-24c7-4be3-b8bb-4ed18c51b6ed	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-09-10 07:00:00	120	\N	A	01067678989	01040404040	FEMALE	f	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work021.jpg	PLUS	WORKER	2024-07-10 10:00:00	EXPIRED	WORK021	문가영	550e8400-e29b-41d4-a716-446655440103	550e8400-e29b-41d4-a716-446655440203
879d6a92-d1b6-44b6-a0d1-a1795a995a16	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	\N	\N	\N	A	01078789090	01050505050	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	\N	PLUS	WORKER	\N	NOT_COMPLETED	WORK022	황인엽	\N	550e8400-e29b-41d4-a716-446655440204
e306a8e2-dd01-4a4c-918b-4bd0ef8d2a3b	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-20 07:00:00	30	\N	AB	01089890101	01060606060	FEMALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work023.jpg	PLUS	WORKER	2025-08-15 09:00:00	COMPLETED	WORK023	배수지	550e8400-e29b-41d4-a716-446655440101	27fe1fe5-9ddb-4f9f-a65d-dea18e07813f
5c6862db-1935-450d-ad84-a9890a3b9a9c	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-20 07:00:00	30	\N	A	01090901212	01070707070	MALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work024.jpg	PLUS	WORKER	2025-08-16 10:00:00	COMPLETED	WORK024	남주혁	550e8400-e29b-41d4-a716-446655440101	550e8400-e29b-41d4-a716-446655440201
73166d85-0c09-4ff0-8d5b-87d43b103054	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	2025-08-25 07:00:00	45	\N	B	01013132424	01080808080	FEMALE	t	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	photos/work025.jpg	PLUS	WORKER	2025-08-20 11:00:00	COMPLETED	WORK025	이성경	ad8842ce-3e0b-428e-a4f0-ba1485b4aa33	550e8400-e29b-41d4-a716-446655440202
0ec69262-d6b0-45c9-90c1-9ffa0e936e3f	2025-09-29 01:42:30.15298	2025-09-29 01:42:30.15298	\N	\N	\N	\N	AB	01024243535	01090909090	MALE	f	$2a$10$abcdefghijklmnopqrstuv.abcdefghijklmnopqrstuv.abcde	\N	PLUS	WORKER	\N	NOT_COMPLETED	WORK026	안효섭	\N	27fe1fe5-9ddb-4f9f-a65d-dea18e07813f
\.


--
-- TOC entry 3571 (class 0 OID 16949)
-- Dependencies: 218
-- Data for Name: watch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.watch (uuid, watch_id, model_name, status, created_at, updated_at, note) FROM stdin;
94fb909f-ac4a-443b-94de-f438ef110394	10	갤럭시 워치7 울트라	IN_USE	2025-09-19 05:35:05.947437	2025-09-27 19:00:15.114515	
1644579e-3902-4e4d-bb2a-a602c6472ae2	6	갤럭시 워치6	IN_USE	2025-09-14 20:31:13.47264	2025-09-27 19:01:53.757848	
8b9c317d-7c31-41f1-8ab1-38106a8d31ee	5	갤럭시 워치7	IN_USE	2025-09-14 20:26:43.730489	2025-09-27 19:03:30.817936	
550e8400-e29b-41d4-a716-446655440903	3	갤럭시 워치7	AVAILABLE	2025-09-13 06:11:12.305273	2025-09-27 21:17:04.466428	박지영 배정
faf8dc5c-e560-45d0-9de8-84ebbd53dfd0	9	갤럭시 워치7	IN_USE	2025-09-15 15:24:23.946905	2025-09-27 22:25:33.135023	배터리 교체 필요
44176f69-28b9-4fb0-b8b2-22ca13522085	7	갤럭시 워치8 울트라	AVAILABLE	2025-09-14 23:21:43.938205	2025-09-27 22:25:37.334761	
a24c5fbe-0a42-4e47-8651-adbf72d78831	8	걘역시 워치4 골프에디션	IN_USE	2025-09-14 23:22:08.601739	2025-09-27 22:26:26.749972	흠집 발견
60fe04f2-0d27-4cfa-8ebe-fbfcdaad43c5	11	갤럭시 워치4 골프에디션	IN_USE	2025-09-23 08:42:43.395925	2025-09-27 22:28:15.321987	
550e8400-e29b-41d4-a716-446655440904	4	갤럭시 워치7	UNAVAILABLE	2025-09-13 06:11:12.305273	2025-09-19 06:57:59.966971	수리 중
550e8400-e29b-41d4-a716-446655440901	1	갤럭시 워치8	AVAILABLE	2025-09-13 06:11:12.305273	2025-09-13 06:11:12.305273	김민준 배정
550e8400-e29b-41d4-a716-446655440902	2	갤럭시 워치8	IN_USE	2025-09-13 06:11:12.305273	2025-09-27 18:59:33.942653	사용 가능
\.


--
-- TOC entry 3591 (class 0 OID 0)
-- Dependencies: 217
-- Name: watch_watch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.watch_watch_id_seq', 21, true);


--
-- TOC entry 3392 (class 2606 OID 18177)
-- Name: accident accident_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accident
    ADD CONSTRAINT accident_pkey PRIMARY KEY (uuid);


--
-- TOC entry 3408 (class 2606 OID 18436)
-- Name: announcement announcement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement
    ADD CONSTRAINT announcement_pkey PRIMARY KEY (uuid);


--
-- TOC entry 3396 (class 2606 OID 18187)
-- Name: area_manager area_manager_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.area_manager
    ADD CONSTRAINT area_manager_pkey PRIMARY KEY (uuid);


--
-- TOC entry 3394 (class 2606 OID 18182)
-- Name: area area_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.area
    ADD CONSTRAINT area_pkey PRIMARY KEY (uuid);


--
-- TOC entry 3398 (class 2606 OID 18192)
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (uuid);


--
-- TOC entry 3374 (class 2606 OID 16982)
-- Name: cctv pk_cctv; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cctv
    ADD CONSTRAINT pk_cctv PRIMARY KEY (uuid);


--
-- TOC entry 3376 (class 2606 OID 16990)
-- Name: entry_exit_history pk_entry_exit_history; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry_exit_history
    ADD CONSTRAINT pk_entry_exit_history PRIMARY KEY (uuid);


--
-- TOC entry 3390 (class 2606 OID 17002)
-- Name: face_embedding pk_face_embedding; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_embedding
    ADD CONSTRAINT pk_face_embedding PRIMARY KEY (uuid);


--
-- TOC entry 3384 (class 2606 OID 16996)
-- Name: fcm_tokens pk_fcm_tokens; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fcm_tokens
    ADD CONSTRAINT pk_fcm_tokens PRIMARY KEY (uuid);


--
-- TOC entry 3386 (class 2606 OID 16998)
-- Name: notification pk_notification; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT pk_notification PRIMARY KEY (uuid);


--
-- TOC entry 3382 (class 2606 OID 16994)
-- Name: rental_history pk_rental_history; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_history
    ADD CONSTRAINT pk_rental_history PRIMARY KEY (uuid);


--
-- TOC entry 3388 (class 2606 OID 17000)
-- Name: report pk_report; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT pk_report PRIMARY KEY (uuid);


--
-- TOC entry 3378 (class 2606 OID 16992)
-- Name: watch pk_watch; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch
    ADD CONSTRAINT pk_watch PRIMARY KEY (uuid);


--
-- TOC entry 3406 (class 2606 OID 18413)
-- Name: safety_violation_detail safety_violation_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safety_violation_detail
    ADD CONSTRAINT safety_violation_detail_pkey PRIMARY KEY (uuid);


--
-- TOC entry 3404 (class 2606 OID 18407)
-- Name: safety_violation safety_violation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safety_violation
    ADD CONSTRAINT safety_violation_pkey PRIMARY KEY (uuid);


--
-- TOC entry 3400 (class 2606 OID 18206)
-- Name: users uk6efs5vmce86ymf5q7lmvn2uuf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk6efs5vmce86ymf5q7lmvn2uuf UNIQUE (user_id);


--
-- TOC entry 3380 (class 2606 OID 18238)
-- Name: watch uk_watch_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch
    ADD CONSTRAINT uk_watch_id UNIQUE (watch_id);


--
-- TOC entry 3402 (class 2606 OID 18204)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uuid);


--
-- TOC entry 3418 (class 2606 OID 18227)
-- Name: users fk189oix26r4byalhve5051mnk4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk189oix26r4byalhve5051mnk4 FOREIGN KEY (area_uuid) REFERENCES public.area(uuid);


--
-- TOC entry 3416 (class 2606 OID 18217)
-- Name: area_manager fk1rj325d2l46g4kyjrjst1sgkp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.area_manager
    ADD CONSTRAINT fk1rj325d2l46g4kyjrjst1sgkp FOREIGN KEY (area_uuid) REFERENCES public.area(uuid);


--
-- TOC entry 3412 (class 2606 OID 18381)
-- Name: rental_history fk215rvdl0tgmspa37ft37sc954; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_history
    ADD CONSTRAINT fk215rvdl0tgmspa37ft37sc954 FOREIGN KEY (user_uuid) REFERENCES public.users(uuid);


--
-- TOC entry 3410 (class 2606 OID 18245)
-- Name: entry_exit_history fk81ympp8dvrcoi0jkprk9t3dwb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry_exit_history
    ADD CONSTRAINT fk81ympp8dvrcoi0jkprk9t3dwb FOREIGN KEY (user_uuid) REFERENCES public.users(uuid);


--
-- TOC entry 3413 (class 2606 OID 17068)
-- Name: rental_history fk_watch_to_rental_history; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rental_history
    ADD CONSTRAINT fk_watch_to_rental_history FOREIGN KEY (watch_uuid) REFERENCES public.watch(uuid);


--
-- TOC entry 3420 (class 2606 OID 18419)
-- Name: safety_violation fkb7gvtrpf6yj4a2arfhqesncyj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safety_violation
    ADD CONSTRAINT fkb7gvtrpf6yj4a2arfhqesncyj FOREIGN KEY (cctv_uuid) REFERENCES public.cctv(uuid);


--
-- TOC entry 3414 (class 2606 OID 18207)
-- Name: accident fkcq9c9d5krugq99m2t7ni1183l; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accident
    ADD CONSTRAINT fkcq9c9d5krugq99m2t7ni1183l FOREIGN KEY (area_uuid) REFERENCES public.area(uuid);


--
-- TOC entry 3422 (class 2606 OID 18424)
-- Name: safety_violation_detail fkcxvh3iaj82g83iyb4kiy8a70t; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safety_violation_detail
    ADD CONSTRAINT fkcxvh3iaj82g83iyb4kiy8a70t FOREIGN KEY (safety_violation_uuid) REFERENCES public.safety_violation(uuid);


--
-- TOC entry 3423 (class 2606 OID 18442)
-- Name: announcement fkd246b2x2l00m9pxl18lhaqtuq; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement
    ADD CONSTRAINT fkd246b2x2l00m9pxl18lhaqtuq FOREIGN KEY (sender_uuid) REFERENCES public.users(uuid);


--
-- TOC entry 3417 (class 2606 OID 18222)
-- Name: area_manager fkfgcntib018trtgbggjak4psjx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.area_manager
    ADD CONSTRAINT fkfgcntib018trtgbggjak4psjx FOREIGN KEY (user_uuid) REFERENCES public.users(uuid);


--
-- TOC entry 3415 (class 2606 OID 18212)
-- Name: accident fkfixjbroyhuba54dy3b4grpma9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accident
    ADD CONSTRAINT fkfixjbroyhuba54dy3b4grpma9 FOREIGN KEY (user_uuid) REFERENCES public.users(uuid);


--
-- TOC entry 3409 (class 2606 OID 18258)
-- Name: cctv fkjkl4d2owbmtx48he8emh2l4xe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cctv
    ADD CONSTRAINT fkjkl4d2owbmtx48he8emh2l4xe FOREIGN KEY (area_uuid) REFERENCES public.area(uuid);


--
-- TOC entry 3421 (class 2606 OID 18414)
-- Name: safety_violation fkpidh37628nrvw015kqroeo40x; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.safety_violation
    ADD CONSTRAINT fkpidh37628nrvw015kqroeo40x FOREIGN KEY (area_uuid) REFERENCES public.area(uuid);


--
-- TOC entry 3424 (class 2606 OID 18437)
-- Name: announcement fkpnge2oist964i21r3vqmvmccf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcement
    ADD CONSTRAINT fkpnge2oist964i21r3vqmvmccf FOREIGN KEY (receiver_uuid) REFERENCES public.users(uuid);


--
-- TOC entry 3419 (class 2606 OID 18232)
-- Name: users fkpq4djym3vc088cg219s7iw2uo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fkpq4djym3vc088cg219s7iw2uo FOREIGN KEY (company_uuid) REFERENCES public.company(uuid);


--
-- TOC entry 3411 (class 2606 OID 18240)
-- Name: entry_exit_history fksw57h2ov1cs4cptljvdfxul60; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entry_exit_history
    ADD CONSTRAINT fksw57h2ov1cs4cptljvdfxul60 FOREIGN KEY (area_uuid) REFERENCES public.area(uuid);


-- Completed on 2025-09-29 10:45:04

--
-- PostgreSQL database dump complete
--

\unrestrict fPSJgIHolQFwqs3NH7DTFfLQYqV90sGLvqJ2wgGY6uwQKSGVxrCI8wfR9gTtPga

