--
-- PostgreSQL database dump
--

\restrict JqYX6Dd9pZ5YqKG36vgE9FzgTeWr0YRvsN2DURrhoY7KLKnuMPdbzu5i2gGxPEp

-- Dumped from database version 17.6 (Debian 17.6-2.pgdg13+1)
-- Dumped by pg_dump version 17.6

-- Started on 2026-06-11 23:02:29 UTC

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 237 (class 1259 OID 73889)
-- Name: asignacion_docente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignacion_docente (
    id integer NOT NULL,
    id_catedratico integer NOT NULL,
    codigo_materia character varying(15) NOT NULL,
    id_ciclo_academico integer NOT NULL,
    id_pensum integer NOT NULL,
    horario_inicio time without time zone,
    horario_fin time without time zone,
    aula character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.asignacion_docente OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 73888)
-- Name: asignacion_docente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asignacion_docente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asignacion_docente_id_seq OWNER TO postgres;

--
-- TOC entry 3733 (class 0 OID 0)
-- Dependencies: 236
-- Name: asignacion_docente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asignacion_docente_id_seq OWNED BY public.asignacion_docente.id;


--
-- TOC entry 222 (class 1259 OID 73754)
-- Name: carrera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrera (
    id integer NOT NULL,
    codigo character varying(10) NOT NULL,
    nombre character varying(150) NOT NULL,
    id_facultad integer NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.carrera OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 73753)
-- Name: carrera_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrera_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrera_id_seq OWNER TO postgres;

--
-- TOC entry 3734 (class 0 OID 0)
-- Dependencies: 221
-- Name: carrera_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrera_id_seq OWNED BY public.carrera.id;


--
-- TOC entry 235 (class 1259 OID 73873)
-- Name: catedratico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.catedratico (
    id integer NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    email character varying(150),
    id_departamento integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.catedratico OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 73872)
-- Name: catedratico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.catedratico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.catedratico_id_seq OWNER TO postgres;

--
-- TOC entry 3735 (class 0 OID 0)
-- Dependencies: 234
-- Name: catedratico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.catedratico_id_seq OWNED BY public.catedratico.id;


--
-- TOC entry 233 (class 1259 OID 73864)
-- Name: ciclo_academico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ciclo_academico (
    id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    anio integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    activo boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ciclo_academico OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 73863)
-- Name: ciclo_academico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ciclo_academico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ciclo_academico_id_seq OWNER TO postgres;

--
-- TOC entry 3736 (class 0 OID 0)
-- Dependencies: 232
-- Name: ciclo_academico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ciclo_academico_id_seq OWNED BY public.ciclo_academico.id;


--
-- TOC entry 250 (class 1259 OID 74074)
-- Name: demanda_electiva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demanda_electiva (
    id integer NOT NULL,
    codigo_materia character varying(15) NOT NULL,
    id_ciclo_academico integer NOT NULL,
    cantidad_solicitudes integer DEFAULT 0 NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.demanda_electiva OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 74073)
-- Name: demanda_electiva_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demanda_electiva_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demanda_electiva_id_seq OWNER TO postgres;

--
-- TOC entry 3737 (class 0 OID 0)
-- Dependencies: 249
-- Name: demanda_electiva_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demanda_electiva_id_seq OWNED BY public.demanda_electiva.id;


--
-- TOC entry 220 (class 1259 OID 73742)
-- Name: departamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departamento (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    id_facultad integer NOT NULL
);


ALTER TABLE public.departamento OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 73741)
-- Name: departamento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departamento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departamento_id_seq OWNER TO postgres;

--
-- TOC entry 3738 (class 0 OID 0)
-- Dependencies: 219
-- Name: departamento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departamento_id_seq OWNED BY public.departamento.id;


--
-- TOC entry 246 (class 1259 OID 74018)
-- Name: detalle_horario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_horario (
    id integer NOT NULL,
    id_horario_estudiante integer NOT NULL,
    codigo_materia character varying(15) NOT NULL,
    id_asignacion_docente integer,
    dia character varying(15) NOT NULL,
    horario_inicio time without time zone,
    horario_fin time without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.detalle_horario OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 74017)
-- Name: detalle_horario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_horario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_horario_id_seq OWNER TO postgres;

--
-- TOC entry 3739 (class 0 OID 0)
-- Dependencies: 245
-- Name: detalle_horario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_horario_id_seq OWNED BY public.detalle_horario.id;


--
-- TOC entry 240 (class 1259 OID 73936)
-- Name: estudiante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estudiante (
    carnet character varying(15) NOT NULL,
    id_usuario integer NOT NULL,
    nombres character varying(100) NOT NULL,
    apellidos character varying(100) NOT NULL,
    dui character varying(15),
    id_carrera integer NOT NULL,
    id_pensum integer NOT NULL,
    foto_url character varying(255),
    anio_ingreso integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.estudiante OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 73731)
-- Name: facultad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facultad (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    codigo character varying(10) NOT NULL
);


ALTER TABLE public.facultad OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 73730)
-- Name: facultad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facultad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facultad_id_seq OWNER TO postgres;

--
-- TOC entry 3740 (class 0 OID 0)
-- Dependencies: 217
-- Name: facultad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facultad_id_seq OWNED BY public.facultad.id;


--
-- TOC entry 242 (class 1259 OID 73967)
-- Name: historial_materia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_materia (
    id integer NOT NULL,
    carnet character varying(15) NOT NULL,
    codigo_materia character varying(15) NOT NULL,
    id_ciclo_academico integer NOT NULL,
    nota numeric(3,1),
    estado character varying(15) NOT NULL,
    veces_reprobada integer DEFAULT 0 NOT NULL,
    fecha_aprobacion date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT historial_materia_estado_check CHECK (((estado)::text = ANY ((ARRAY['aprobada'::character varying, 'reprobada'::character varying, 'retirada'::character varying, 'cursando'::character varying])::text[])))
);


ALTER TABLE public.historial_materia OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 73966)
-- Name: historial_materia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_materia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_materia_id_seq OWNER TO postgres;

--
-- TOC entry 3741 (class 0 OID 0)
-- Dependencies: 241
-- Name: historial_materia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_materia_id_seq OWNED BY public.historial_materia.id;


--
-- TOC entry 244 (class 1259 OID 73997)
-- Name: horario_estudiante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horario_estudiante (
    id integer NOT NULL,
    carnet character varying(15) NOT NULL,
    id_ciclo_academico integer NOT NULL,
    nombre character varying(100),
    estado character varying(20) DEFAULT 'en_construccion'::character varying NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_modificacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT horario_estudiante_estado_check CHECK (((estado)::text = ANY ((ARRAY['en_construccion'::character varying, 'guardado'::character varying, 'confirmado'::character varying])::text[])))
);


ALTER TABLE public.horario_estudiante OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 73996)
-- Name: horario_estudiante_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horario_estudiante_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horario_estudiante_id_seq OWNER TO postgres;

--
-- TOC entry 3742 (class 0 OID 0)
-- Dependencies: 243
-- Name: horario_estudiante_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horario_estudiante_id_seq OWNED BY public.horario_estudiante.id;


--
-- TOC entry 252 (class 1259 OID 74098)
-- Name: log_auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.log_auditoria (
    id integer NOT NULL,
    id_usuario integer,
    accion character varying(50) NOT NULL,
    entidad character varying(50),
    entidad_id character varying(50),
    detalles text,
    ip_address character varying(45),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.log_auditoria OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 74097)
-- Name: log_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.log_auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.log_auditoria_id_seq OWNER TO postgres;

--
-- TOC entry 3743 (class 0 OID 0)
-- Dependencies: 251
-- Name: log_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.log_auditoria_id_seq OWNED BY public.log_auditoria.id;


--
-- TOC entry 227 (class 1259 OID 73799)
-- Name: materia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materia (
    codigo character varying(15) NOT NULL,
    nombre character varying(150) NOT NULL,
    creditos integer NOT NULL,
    horas_teoricas integer DEFAULT 0 NOT NULL,
    horas_practicas integer DEFAULT 0 NOT NULL,
    nota_minima numeric(3,1) DEFAULT 6.0 NOT NULL,
    descripcion text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT materia_creditos_check CHECK ((creditos > 0))
);


ALTER TABLE public.materia OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 73813)
-- Name: materia_x_pensum; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materia_x_pensum (
    id integer NOT NULL,
    id_pensum integer NOT NULL,
    codigo_materia character varying(15) NOT NULL,
    ciclo integer NOT NULL,
    id_tipo_materia integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT materia_x_pensum_ciclo_check CHECK (((ciclo >= 1) AND (ciclo <= 10)))
);


ALTER TABLE public.materia_x_pensum OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 73812)
-- Name: materia_x_pensum_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materia_x_pensum_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materia_x_pensum_id_seq OWNER TO postgres;

--
-- TOC entry 3744 (class 0 OID 0)
-- Dependencies: 228
-- Name: materia_x_pensum_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materia_x_pensum_id_seq OWNED BY public.materia_x_pensum.id;


--
-- TOC entry 224 (class 1259 OID 73774)
-- Name: pensum; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pensum (
    id integer NOT NULL,
    codigo character varying(20) NOT NULL,
    id_carrera integer NOT NULL,
    anio integer NOT NULL,
    creditos_totales integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pensum OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 73773)
-- Name: pensum_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pensum_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pensum_id_seq OWNER TO postgres;

--
-- TOC entry 3745 (class 0 OID 0)
-- Dependencies: 223
-- Name: pensum_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pensum_id_seq OWNED BY public.pensum.id;


--
-- TOC entry 231 (class 1259 OID 73837)
-- Name: prerequisito; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prerequisito (
    id integer NOT NULL,
    codigo_materia character varying(15) NOT NULL,
    codigo_prerequisito character varying(15) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.prerequisito OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 73836)
-- Name: prerequisito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prerequisito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prerequisito_id_seq OWNER TO postgres;

--
-- TOC entry 3746 (class 0 OID 0)
-- Dependencies: 230
-- Name: prerequisito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prerequisito_id_seq OWNED BY public.prerequisito.id;


--
-- TOC entry 248 (class 1259 OID 74046)
-- Name: solicitud_electiva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitud_electiva (
    id integer NOT NULL,
    carnet character varying(15) NOT NULL,
    codigo_materia character varying(15) NOT NULL,
    id_ciclo_academico integer NOT NULL,
    justificacion text,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_resolucion timestamp without time zone,
    observaciones text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT solicitud_electiva_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'aprobada'::character varying, 'rechazada'::character varying])::text[])))
);


ALTER TABLE public.solicitud_electiva OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 74045)
-- Name: solicitud_electiva_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitud_electiva_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitud_electiva_id_seq OWNER TO postgres;

--
-- TOC entry 3747 (class 0 OID 0)
-- Dependencies: 247
-- Name: solicitud_electiva_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitud_electiva_id_seq OWNED BY public.solicitud_electiva.id;


--
-- TOC entry 226 (class 1259 OID 73791)
-- Name: tipo_materia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_materia (
    id integer NOT NULL,
    tipo character varying(60) NOT NULL
);


ALTER TABLE public.tipo_materia OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 73790)
-- Name: tipo_materia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_materia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipo_materia_id_seq OWNER TO postgres;

--
-- TOC entry 3748 (class 0 OID 0)
-- Dependencies: 225
-- Name: tipo_materia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_materia_id_seq OWNED BY public.tipo_materia.id;


--
-- TOC entry 239 (class 1259 OID 73924)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id integer NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    rol character varying(20) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT usuario_rol_check CHECK (((rol)::text = ANY ((ARRAY['estudiante'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 73923)
-- Name: usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_id_seq OWNER TO postgres;

--
-- TOC entry 3749 (class 0 OID 0)
-- Dependencies: 238
-- Name: usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;


--
-- TOC entry 3388 (class 2604 OID 73892)
-- Name: asignacion_docente id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_docente ALTER COLUMN id SET DEFAULT nextval('public.asignacion_docente_id_seq'::regclass);


--
-- TOC entry 3364 (class 2604 OID 73757)
-- Name: carrera id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera ALTER COLUMN id SET DEFAULT nextval('public.carrera_id_seq'::regclass);


--
-- TOC entry 3385 (class 2604 OID 73876)
-- Name: catedratico id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catedratico ALTER COLUMN id SET DEFAULT nextval('public.catedratico_id_seq'::regclass);


--
-- TOC entry 3382 (class 2604 OID 73867)
-- Name: ciclo_academico id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ciclo_academico ALTER COLUMN id SET DEFAULT nextval('public.ciclo_academico_id_seq'::regclass);


--
-- TOC entry 3410 (class 2604 OID 74077)
-- Name: demanda_electiva id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demanda_electiva ALTER COLUMN id SET DEFAULT nextval('public.demanda_electiva_id_seq'::regclass);


--
-- TOC entry 3363 (class 2604 OID 73745)
-- Name: departamento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento ALTER COLUMN id SET DEFAULT nextval('public.departamento_id_seq'::regclass);


--
-- TOC entry 3404 (class 2604 OID 74021)
-- Name: detalle_horario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_horario ALTER COLUMN id SET DEFAULT nextval('public.detalle_horario_id_seq'::regclass);


--
-- TOC entry 3362 (class 2604 OID 73734)
-- Name: facultad id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facultad ALTER COLUMN id SET DEFAULT nextval('public.facultad_id_seq'::regclass);


--
-- TOC entry 3396 (class 2604 OID 73970)
-- Name: historial_materia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_materia ALTER COLUMN id SET DEFAULT nextval('public.historial_materia_id_seq'::regclass);


--
-- TOC entry 3400 (class 2604 OID 74000)
-- Name: horario_estudiante id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_estudiante ALTER COLUMN id SET DEFAULT nextval('public.horario_estudiante_id_seq'::regclass);


--
-- TOC entry 3413 (class 2604 OID 74101)
-- Name: log_auditoria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_auditoria ALTER COLUMN id SET DEFAULT nextval('public.log_auditoria_id_seq'::regclass);


--
-- TOC entry 3378 (class 2604 OID 73816)
-- Name: materia_x_pensum id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia_x_pensum ALTER COLUMN id SET DEFAULT nextval('public.materia_x_pensum_id_seq'::regclass);


--
-- TOC entry 3368 (class 2604 OID 73777)
-- Name: pensum id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pensum ALTER COLUMN id SET DEFAULT nextval('public.pensum_id_seq'::regclass);


--
-- TOC entry 3380 (class 2604 OID 73840)
-- Name: prerequisito id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisito ALTER COLUMN id SET DEFAULT nextval('public.prerequisito_id_seq'::regclass);


--
-- TOC entry 3406 (class 2604 OID 74049)
-- Name: solicitud_electiva id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_electiva ALTER COLUMN id SET DEFAULT nextval('public.solicitud_electiva_id_seq'::regclass);


--
-- TOC entry 3372 (class 2604 OID 73794)
-- Name: tipo_materia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_materia ALTER COLUMN id SET DEFAULT nextval('public.tipo_materia_id_seq'::regclass);


--
-- TOC entry 3390 (class 2604 OID 73927)
-- Name: usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);


--
-- TOC entry 3712 (class 0 OID 73889)
-- Dependencies: 237
-- Data for Name: asignacion_docente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asignacion_docente (id, id_catedratico, codigo_materia, id_ciclo_academico, id_pensum, horario_inicio, horario_fin, aula, created_at) FROM stdin;
\.


--
-- TOC entry 3697 (class 0 OID 73754)
-- Dependencies: 222
-- Data for Name: carrera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carrera (id, codigo, nombre, id_facultad, activa, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3710 (class 0 OID 73873)
-- Dependencies: 235
-- Data for Name: catedratico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.catedratico (id, nombres, apellidos, email, id_departamento, activo, created_at) FROM stdin;
\.


--
-- TOC entry 3708 (class 0 OID 73864)
-- Dependencies: 233
-- Data for Name: ciclo_academico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ciclo_academico (id, tipo, anio, fecha_inicio, fecha_fin, activo, created_at) FROM stdin;
\.


--
-- TOC entry 3725 (class 0 OID 74074)
-- Dependencies: 250
-- Data for Name: demanda_electiva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demanda_electiva (id, codigo_materia, id_ciclo_academico, cantidad_solicitudes, fecha_actualizacion) FROM stdin;
\.


--
-- TOC entry 3695 (class 0 OID 73742)
-- Dependencies: 220
-- Data for Name: departamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departamento (id, nombre, id_facultad) FROM stdin;
\.


--
-- TOC entry 3721 (class 0 OID 74018)
-- Dependencies: 246
-- Data for Name: detalle_horario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_horario (id, id_horario_estudiante, codigo_materia, id_asignacion_docente, dia, horario_inicio, horario_fin, created_at) FROM stdin;
\.


--
-- TOC entry 3715 (class 0 OID 73936)
-- Dependencies: 240
-- Data for Name: estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estudiante (carnet, id_usuario, nombres, apellidos, dui, id_carrera, id_pensum, foto_url, anio_ingreso, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3693 (class 0 OID 73731)
-- Dependencies: 218
-- Data for Name: facultad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facultad (id, nombre, codigo) FROM stdin;
\.


--
-- TOC entry 3717 (class 0 OID 73967)
-- Dependencies: 242
-- Data for Name: historial_materia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_materia (id, carnet, codigo_materia, id_ciclo_academico, nota, estado, veces_reprobada, fecha_aprobacion, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3719 (class 0 OID 73997)
-- Dependencies: 244
-- Data for Name: horario_estudiante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horario_estudiante (id, carnet, id_ciclo_academico, nombre, estado, fecha_creacion, fecha_modificacion) FROM stdin;
\.


--
-- TOC entry 3727 (class 0 OID 74098)
-- Dependencies: 252
-- Data for Name: log_auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.log_auditoria (id, id_usuario, accion, entidad, entidad_id, detalles, ip_address, created_at) FROM stdin;
\.


--
-- TOC entry 3702 (class 0 OID 73799)
-- Dependencies: 227
-- Data for Name: materia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materia (codigo, nombre, creditos, horas_teoricas, horas_practicas, nota_minima, descripcion, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3704 (class 0 OID 73813)
-- Dependencies: 229
-- Data for Name: materia_x_pensum; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materia_x_pensum (id, id_pensum, codigo_materia, ciclo, id_tipo_materia, created_at) FROM stdin;
\.


--
-- TOC entry 3699 (class 0 OID 73774)
-- Dependencies: 224
-- Data for Name: pensum; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pensum (id, codigo, id_carrera, anio, creditos_totales, activo, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3706 (class 0 OID 73837)
-- Dependencies: 231
-- Data for Name: prerequisito; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prerequisito (id, codigo_materia, codigo_prerequisito, created_at) FROM stdin;
\.


--
-- TOC entry 3723 (class 0 OID 74046)
-- Dependencies: 248
-- Data for Name: solicitud_electiva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitud_electiva (id, carnet, codigo_materia, id_ciclo_academico, justificacion, estado, fecha_solicitud, fecha_resolucion, observaciones, created_at) FROM stdin;
\.


--
-- TOC entry 3701 (class 0 OID 73791)
-- Dependencies: 226
-- Data for Name: tipo_materia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_materia (id, tipo) FROM stdin;
\.


--
-- TOC entry 3714 (class 0 OID 73924)
-- Dependencies: 239
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id, email, password_hash, rol, activo, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3750 (class 0 OID 0)
-- Dependencies: 236
-- Name: asignacion_docente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asignacion_docente_id_seq', 1, false);


--
-- TOC entry 3751 (class 0 OID 0)
-- Dependencies: 221
-- Name: carrera_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrera_id_seq', 1, false);


--
-- TOC entry 3752 (class 0 OID 0)
-- Dependencies: 234
-- Name: catedratico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.catedratico_id_seq', 1, false);


--
-- TOC entry 3753 (class 0 OID 0)
-- Dependencies: 232
-- Name: ciclo_academico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ciclo_academico_id_seq', 1, false);


--
-- TOC entry 3754 (class 0 OID 0)
-- Dependencies: 249
-- Name: demanda_electiva_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demanda_electiva_id_seq', 1, false);


--
-- TOC entry 3755 (class 0 OID 0)
-- Dependencies: 219
-- Name: departamento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departamento_id_seq', 1, false);


--
-- TOC entry 3756 (class 0 OID 0)
-- Dependencies: 245
-- Name: detalle_horario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_horario_id_seq', 1, false);


--
-- TOC entry 3757 (class 0 OID 0)
-- Dependencies: 217
-- Name: facultad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facultad_id_seq', 1, false);


--
-- TOC entry 3758 (class 0 OID 0)
-- Dependencies: 241
-- Name: historial_materia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_materia_id_seq', 1, false);


--
-- TOC entry 3759 (class 0 OID 0)
-- Dependencies: 243
-- Name: horario_estudiante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horario_estudiante_id_seq', 1, false);


--
-- TOC entry 3760 (class 0 OID 0)
-- Dependencies: 251
-- Name: log_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.log_auditoria_id_seq', 1, false);


--
-- TOC entry 3761 (class 0 OID 0)
-- Dependencies: 228
-- Name: materia_x_pensum_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materia_x_pensum_id_seq', 1, false);


--
-- TOC entry 3762 (class 0 OID 0)
-- Dependencies: 223
-- Name: pensum_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pensum_id_seq', 1, false);


--
-- TOC entry 3763 (class 0 OID 0)
-- Dependencies: 230
-- Name: prerequisito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prerequisito_id_seq', 1, false);


--
-- TOC entry 3764 (class 0 OID 0)
-- Dependencies: 247
-- Name: solicitud_electiva_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitud_electiva_id_seq', 1, false);


--
-- TOC entry 3765 (class 0 OID 0)
-- Dependencies: 225
-- Name: tipo_materia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_materia_id_seq', 1, false);


--
-- TOC entry 3766 (class 0 OID 0)
-- Dependencies: 238
-- Name: usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_id_seq', 1, false);


--
-- TOC entry 3470 (class 2606 OID 73895)
-- Name: asignacion_docente asignacion_docente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_docente
    ADD CONSTRAINT asignacion_docente_pkey PRIMARY KEY (id);


--
-- TOC entry 3431 (class 2606 OID 73764)
-- Name: carrera carrera_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera
    ADD CONSTRAINT carrera_codigo_key UNIQUE (codigo);


--
-- TOC entry 3433 (class 2606 OID 73762)
-- Name: carrera carrera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera
    ADD CONSTRAINT carrera_pkey PRIMARY KEY (id);


--
-- TOC entry 3464 (class 2606 OID 73882)
-- Name: catedratico catedratico_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catedratico
    ADD CONSTRAINT catedratico_email_key UNIQUE (email);


--
-- TOC entry 3466 (class 2606 OID 73880)
-- Name: catedratico catedratico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catedratico
    ADD CONSTRAINT catedratico_pkey PRIMARY KEY (id);


--
-- TOC entry 3460 (class 2606 OID 73871)
-- Name: ciclo_academico ciclo_academico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ciclo_academico
    ADD CONSTRAINT ciclo_academico_pkey PRIMARY KEY (id);


--
-- TOC entry 3510 (class 2606 OID 74081)
-- Name: demanda_electiva demanda_electiva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demanda_electiva
    ADD CONSTRAINT demanda_electiva_pkey PRIMARY KEY (id);


--
-- TOC entry 3428 (class 2606 OID 73747)
-- Name: departamento departamento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_pkey PRIMARY KEY (id);


--
-- TOC entry 3500 (class 2606 OID 74024)
-- Name: detalle_horario detalle_horario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_horario
    ADD CONSTRAINT detalle_horario_pkey PRIMARY KEY (id);


--
-- TOC entry 3481 (class 2606 OID 73946)
-- Name: estudiante estudiante_dui_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_dui_key UNIQUE (dui);


--
-- TOC entry 3483 (class 2606 OID 73944)
-- Name: estudiante estudiante_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_id_usuario_key UNIQUE (id_usuario);


--
-- TOC entry 3485 (class 2606 OID 73942)
-- Name: estudiante estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_pkey PRIMARY KEY (carnet);


--
-- TOC entry 3422 (class 2606 OID 73740)
-- Name: facultad facultad_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facultad
    ADD CONSTRAINT facultad_codigo_key UNIQUE (codigo);


--
-- TOC entry 3424 (class 2606 OID 73738)
-- Name: facultad facultad_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facultad
    ADD CONSTRAINT facultad_nombre_key UNIQUE (nombre);


--
-- TOC entry 3426 (class 2606 OID 73736)
-- Name: facultad facultad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facultad
    ADD CONSTRAINT facultad_pkey PRIMARY KEY (id);


--
-- TOC entry 3489 (class 2606 OID 73976)
-- Name: historial_materia historial_materia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_materia
    ADD CONSTRAINT historial_materia_pkey PRIMARY KEY (id);


--
-- TOC entry 3495 (class 2606 OID 74006)
-- Name: horario_estudiante horario_estudiante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_estudiante
    ADD CONSTRAINT horario_estudiante_pkey PRIMARY KEY (id);


--
-- TOC entry 3516 (class 2606 OID 74106)
-- Name: log_auditoria log_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_auditoria
    ADD CONSTRAINT log_auditoria_pkey PRIMARY KEY (id);


--
-- TOC entry 3449 (class 2606 OID 73811)
-- Name: materia materia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia
    ADD CONSTRAINT materia_pkey PRIMARY KEY (codigo);


--
-- TOC entry 3454 (class 2606 OID 73820)
-- Name: materia_x_pensum materia_x_pensum_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia_x_pensum
    ADD CONSTRAINT materia_x_pensum_pkey PRIMARY KEY (id);


--
-- TOC entry 3440 (class 2606 OID 73784)
-- Name: pensum pensum_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pensum
    ADD CONSTRAINT pensum_codigo_key UNIQUE (codigo);


--
-- TOC entry 3442 (class 2606 OID 73782)
-- Name: pensum pensum_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pensum
    ADD CONSTRAINT pensum_pkey PRIMARY KEY (id);


--
-- TOC entry 3458 (class 2606 OID 73843)
-- Name: prerequisito prerequisito_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisito
    ADD CONSTRAINT prerequisito_pkey PRIMARY KEY (id);


--
-- TOC entry 3508 (class 2606 OID 74057)
-- Name: solicitud_electiva solicitud_electiva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_electiva
    ADD CONSTRAINT solicitud_electiva_pkey PRIMARY KEY (id);


--
-- TOC entry 3444 (class 2606 OID 73796)
-- Name: tipo_materia tipo_materia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_materia
    ADD CONSTRAINT tipo_materia_pkey PRIMARY KEY (id);


--
-- TOC entry 3446 (class 2606 OID 73798)
-- Name: tipo_materia tipo_materia_tipo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_materia
    ADD CONSTRAINT tipo_materia_tipo_key UNIQUE (tipo);


--
-- TOC entry 3477 (class 2606 OID 73935)
-- Name: usuario usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_email_key UNIQUE (email);


--
-- TOC entry 3479 (class 2606 OID 73933)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 3471 (class 1259 OID 73921)
-- Name: idx_asignacion_docente_codigo_materia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asignacion_docente_codigo_materia ON public.asignacion_docente USING btree (codigo_materia);


--
-- TOC entry 3472 (class 1259 OID 73920)
-- Name: idx_asignacion_docente_id_catedratico; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asignacion_docente_id_catedratico ON public.asignacion_docente USING btree (id_catedratico);


--
-- TOC entry 3473 (class 1259 OID 73922)
-- Name: idx_asignacion_docente_id_ciclo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asignacion_docente_id_ciclo ON public.asignacion_docente USING btree (id_ciclo_academico);


--
-- TOC entry 3434 (class 1259 OID 73772)
-- Name: idx_carrera_activa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carrera_activa ON public.carrera USING btree (activa);


--
-- TOC entry 3435 (class 1259 OID 73771)
-- Name: idx_carrera_id_facultad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_carrera_id_facultad ON public.carrera USING btree (id_facultad);


--
-- TOC entry 3467 (class 1259 OID 73919)
-- Name: idx_catedratico_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_catedratico_activo ON public.catedratico USING btree (activo);


--
-- TOC entry 3468 (class 1259 OID 73918)
-- Name: idx_catedratico_id_departamento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_catedratico_id_departamento ON public.catedratico USING btree (id_departamento);


--
-- TOC entry 3461 (class 1259 OID 73917)
-- Name: idx_ciclo_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ciclo_activo ON public.ciclo_academico USING btree (activo);


--
-- TOC entry 3462 (class 1259 OID 73916)
-- Name: idx_ciclo_tipo_anio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_ciclo_tipo_anio ON public.ciclo_academico USING btree (tipo, anio);


--
-- TOC entry 3511 (class 1259 OID 74096)
-- Name: idx_demanda_electiva_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_demanda_electiva_unique ON public.demanda_electiva USING btree (codigo_materia, id_ciclo_academico);


--
-- TOC entry 3429 (class 1259 OID 73770)
-- Name: idx_departamento_id_facultad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_departamento_id_facultad ON public.departamento USING btree (id_facultad);


--
-- TOC entry 3501 (class 1259 OID 74044)
-- Name: idx_detalle_horario_codigo_materia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detalle_horario_codigo_materia ON public.detalle_horario USING btree (codigo_materia);


--
-- TOC entry 3502 (class 1259 OID 74043)
-- Name: idx_detalle_horario_id_horario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detalle_horario_id_horario ON public.detalle_horario USING btree (id_horario_estudiante);


--
-- TOC entry 3486 (class 1259 OID 73964)
-- Name: idx_estudiante_id_carrera; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_estudiante_id_carrera ON public.estudiante USING btree (id_carrera);


--
-- TOC entry 3487 (class 1259 OID 73965)
-- Name: idx_estudiante_id_pensum; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_estudiante_id_pensum ON public.estudiante USING btree (id_pensum);


--
-- TOC entry 3490 (class 1259 OID 73993)
-- Name: idx_historial_carnet; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historial_carnet ON public.historial_materia USING btree (carnet);


--
-- TOC entry 3491 (class 1259 OID 73994)
-- Name: idx_historial_carnet_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historial_carnet_estado ON public.historial_materia USING btree (carnet, estado);


--
-- TOC entry 3492 (class 1259 OID 73995)
-- Name: idx_historial_codigo_materia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_historial_codigo_materia ON public.historial_materia USING btree (codigo_materia);


--
-- TOC entry 3493 (class 1259 OID 73992)
-- Name: idx_historial_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_historial_unique ON public.historial_materia USING btree (carnet, codigo_materia, id_ciclo_academico);


--
-- TOC entry 3496 (class 1259 OID 74040)
-- Name: idx_horario_estudiante_carnet; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horario_estudiante_carnet ON public.horario_estudiante USING btree (carnet);


--
-- TOC entry 3497 (class 1259 OID 74041)
-- Name: idx_horario_estudiante_ciclo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horario_estudiante_ciclo ON public.horario_estudiante USING btree (id_ciclo_academico);


--
-- TOC entry 3498 (class 1259 OID 74042)
-- Name: idx_horario_estudiante_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horario_estudiante_estado ON public.horario_estudiante USING btree (estado);


--
-- TOC entry 3512 (class 1259 OID 74113)
-- Name: idx_log_auditoria_accion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_log_auditoria_accion ON public.log_auditoria USING btree (accion);


--
-- TOC entry 3513 (class 1259 OID 74114)
-- Name: idx_log_auditoria_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_log_auditoria_created_at ON public.log_auditoria USING btree (created_at);


--
-- TOC entry 3514 (class 1259 OID 74112)
-- Name: idx_log_auditoria_id_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_log_auditoria_id_usuario ON public.log_auditoria USING btree (id_usuario);


--
-- TOC entry 3447 (class 1259 OID 73857)
-- Name: idx_materia_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_materia_nombre ON public.materia USING btree (nombre);


--
-- TOC entry 3450 (class 1259 OID 73858)
-- Name: idx_materia_pensum_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_materia_pensum_unique ON public.materia_x_pensum USING btree (id_pensum, codigo_materia);


--
-- TOC entry 3451 (class 1259 OID 73860)
-- Name: idx_materia_x_pensum_codigo_materia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_materia_x_pensum_codigo_materia ON public.materia_x_pensum USING btree (codigo_materia);


--
-- TOC entry 3452 (class 1259 OID 73859)
-- Name: idx_materia_x_pensum_id_pensum; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_materia_x_pensum_id_pensum ON public.materia_x_pensum USING btree (id_pensum);


--
-- TOC entry 3436 (class 1259 OID 73856)
-- Name: idx_pensum_carrera_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pensum_carrera_activo ON public.pensum USING btree (id_carrera, activo);


--
-- TOC entry 3437 (class 1259 OID 73854)
-- Name: idx_pensum_carrera_anio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_pensum_carrera_anio ON public.pensum USING btree (id_carrera, anio);


--
-- TOC entry 3438 (class 1259 OID 73855)
-- Name: idx_pensum_id_carrera; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pensum_id_carrera ON public.pensum USING btree (id_carrera);


--
-- TOC entry 3455 (class 1259 OID 73862)
-- Name: idx_prerequisito_codigo_materia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_prerequisito_codigo_materia ON public.prerequisito USING btree (codigo_materia);


--
-- TOC entry 3456 (class 1259 OID 73861)
-- Name: idx_prerequisito_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_prerequisito_unique ON public.prerequisito USING btree (codigo_materia, codigo_prerequisito);


--
-- TOC entry 3503 (class 1259 OID 74092)
-- Name: idx_solicitud_electiva_carnet; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_solicitud_electiva_carnet ON public.solicitud_electiva USING btree (carnet);


--
-- TOC entry 3504 (class 1259 OID 74094)
-- Name: idx_solicitud_electiva_ciclo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_solicitud_electiva_ciclo ON public.solicitud_electiva USING btree (id_ciclo_academico);


--
-- TOC entry 3505 (class 1259 OID 74095)
-- Name: idx_solicitud_electiva_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_solicitud_electiva_estado ON public.solicitud_electiva USING btree (estado);


--
-- TOC entry 3506 (class 1259 OID 74093)
-- Name: idx_solicitud_electiva_materia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_solicitud_electiva_materia ON public.solicitud_electiva USING btree (codigo_materia);


--
-- TOC entry 3474 (class 1259 OID 73962)
-- Name: idx_usuario_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuario_email ON public.usuario USING btree (email);


--
-- TOC entry 3475 (class 1259 OID 73963)
-- Name: idx_usuario_rol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuario_rol ON public.usuario USING btree (rol);


--
-- TOC entry 3526 (class 2606 OID 73901)
-- Name: asignacion_docente asignacion_docente_codigo_materia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_docente
    ADD CONSTRAINT asignacion_docente_codigo_materia_fkey FOREIGN KEY (codigo_materia) REFERENCES public.materia(codigo);


--
-- TOC entry 3527 (class 2606 OID 73896)
-- Name: asignacion_docente asignacion_docente_id_catedratico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_docente
    ADD CONSTRAINT asignacion_docente_id_catedratico_fkey FOREIGN KEY (id_catedratico) REFERENCES public.catedratico(id);


--
-- TOC entry 3528 (class 2606 OID 73906)
-- Name: asignacion_docente asignacion_docente_id_ciclo_academico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_docente
    ADD CONSTRAINT asignacion_docente_id_ciclo_academico_fkey FOREIGN KEY (id_ciclo_academico) REFERENCES public.ciclo_academico(id);


--
-- TOC entry 3529 (class 2606 OID 73911)
-- Name: asignacion_docente asignacion_docente_id_pensum_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignacion_docente
    ADD CONSTRAINT asignacion_docente_id_pensum_fkey FOREIGN KEY (id_pensum) REFERENCES public.pensum(id);


--
-- TOC entry 3518 (class 2606 OID 73765)
-- Name: carrera carrera_id_facultad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrera
    ADD CONSTRAINT carrera_id_facultad_fkey FOREIGN KEY (id_facultad) REFERENCES public.facultad(id) ON DELETE CASCADE;


--
-- TOC entry 3525 (class 2606 OID 73883)
-- Name: catedratico catedratico_id_departamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.catedratico
    ADD CONSTRAINT catedratico_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES public.departamento(id);


--
-- TOC entry 3544 (class 2606 OID 74082)
-- Name: demanda_electiva demanda_electiva_codigo_materia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demanda_electiva
    ADD CONSTRAINT demanda_electiva_codigo_materia_fkey FOREIGN KEY (codigo_materia) REFERENCES public.materia(codigo) ON DELETE CASCADE;


--
-- TOC entry 3545 (class 2606 OID 74087)
-- Name: demanda_electiva demanda_electiva_id_ciclo_academico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demanda_electiva
    ADD CONSTRAINT demanda_electiva_id_ciclo_academico_fkey FOREIGN KEY (id_ciclo_academico) REFERENCES public.ciclo_academico(id) ON DELETE CASCADE;


--
-- TOC entry 3517 (class 2606 OID 73748)
-- Name: departamento departamento_id_facultad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_id_facultad_fkey FOREIGN KEY (id_facultad) REFERENCES public.facultad(id) ON DELETE CASCADE;


--
-- TOC entry 3538 (class 2606 OID 74030)
-- Name: detalle_horario detalle_horario_codigo_materia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_horario
    ADD CONSTRAINT detalle_horario_codigo_materia_fkey FOREIGN KEY (codigo_materia) REFERENCES public.materia(codigo);


--
-- TOC entry 3539 (class 2606 OID 74035)
-- Name: detalle_horario detalle_horario_id_asignacion_docente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_horario
    ADD CONSTRAINT detalle_horario_id_asignacion_docente_fkey FOREIGN KEY (id_asignacion_docente) REFERENCES public.asignacion_docente(id) ON DELETE SET NULL;


--
-- TOC entry 3540 (class 2606 OID 74025)
-- Name: detalle_horario detalle_horario_id_horario_estudiante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_horario
    ADD CONSTRAINT detalle_horario_id_horario_estudiante_fkey FOREIGN KEY (id_horario_estudiante) REFERENCES public.horario_estudiante(id) ON DELETE CASCADE;


--
-- TOC entry 3530 (class 2606 OID 73952)
-- Name: estudiante estudiante_id_carrera_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_id_carrera_fkey FOREIGN KEY (id_carrera) REFERENCES public.carrera(id);


--
-- TOC entry 3531 (class 2606 OID 73957)
-- Name: estudiante estudiante_id_pensum_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_id_pensum_fkey FOREIGN KEY (id_pensum) REFERENCES public.pensum(id);


--
-- TOC entry 3532 (class 2606 OID 73947)
-- Name: estudiante estudiante_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estudiante
    ADD CONSTRAINT estudiante_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id) ON DELETE CASCADE;


--
-- TOC entry 3533 (class 2606 OID 73977)
-- Name: historial_materia historial_materia_carnet_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_materia
    ADD CONSTRAINT historial_materia_carnet_fkey FOREIGN KEY (carnet) REFERENCES public.estudiante(carnet) ON DELETE CASCADE;


--
-- TOC entry 3534 (class 2606 OID 73982)
-- Name: historial_materia historial_materia_codigo_materia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_materia
    ADD CONSTRAINT historial_materia_codigo_materia_fkey FOREIGN KEY (codigo_materia) REFERENCES public.materia(codigo);


--
-- TOC entry 3535 (class 2606 OID 73987)
-- Name: historial_materia historial_materia_id_ciclo_academico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_materia
    ADD CONSTRAINT historial_materia_id_ciclo_academico_fkey FOREIGN KEY (id_ciclo_academico) REFERENCES public.ciclo_academico(id);


--
-- TOC entry 3536 (class 2606 OID 74007)
-- Name: horario_estudiante horario_estudiante_carnet_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_estudiante
    ADD CONSTRAINT horario_estudiante_carnet_fkey FOREIGN KEY (carnet) REFERENCES public.estudiante(carnet) ON DELETE CASCADE;


--
-- TOC entry 3537 (class 2606 OID 74012)
-- Name: horario_estudiante horario_estudiante_id_ciclo_academico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_estudiante
    ADD CONSTRAINT horario_estudiante_id_ciclo_academico_fkey FOREIGN KEY (id_ciclo_academico) REFERENCES public.ciclo_academico(id);


--
-- TOC entry 3546 (class 2606 OID 74107)
-- Name: log_auditoria log_auditoria_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_auditoria
    ADD CONSTRAINT log_auditoria_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id) ON DELETE SET NULL;


--
-- TOC entry 3520 (class 2606 OID 73826)
-- Name: materia_x_pensum materia_x_pensum_codigo_materia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia_x_pensum
    ADD CONSTRAINT materia_x_pensum_codigo_materia_fkey FOREIGN KEY (codigo_materia) REFERENCES public.materia(codigo) ON DELETE CASCADE;


--
-- TOC entry 3521 (class 2606 OID 73821)
-- Name: materia_x_pensum materia_x_pensum_id_pensum_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia_x_pensum
    ADD CONSTRAINT materia_x_pensum_id_pensum_fkey FOREIGN KEY (id_pensum) REFERENCES public.pensum(id) ON DELETE CASCADE;


--
-- TOC entry 3522 (class 2606 OID 73831)
-- Name: materia_x_pensum materia_x_pensum_id_tipo_materia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materia_x_pensum
    ADD CONSTRAINT materia_x_pensum_id_tipo_materia_fkey FOREIGN KEY (id_tipo_materia) REFERENCES public.tipo_materia(id);


--
-- TOC entry 3519 (class 2606 OID 73785)
-- Name: pensum pensum_id_carrera_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pensum
    ADD CONSTRAINT pensum_id_carrera_fkey FOREIGN KEY (id_carrera) REFERENCES public.carrera(id) ON DELETE CASCADE;


--
-- TOC entry 3523 (class 2606 OID 73844)
-- Name: prerequisito prerequisito_codigo_materia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisito
    ADD CONSTRAINT prerequisito_codigo_materia_fkey FOREIGN KEY (codigo_materia) REFERENCES public.materia(codigo) ON DELETE CASCADE;


--
-- TOC entry 3524 (class 2606 OID 73849)
-- Name: prerequisito prerequisito_codigo_prerequisito_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prerequisito
    ADD CONSTRAINT prerequisito_codigo_prerequisito_fkey FOREIGN KEY (codigo_prerequisito) REFERENCES public.materia(codigo) ON DELETE CASCADE;


--
-- TOC entry 3541 (class 2606 OID 74058)
-- Name: solicitud_electiva solicitud_electiva_carnet_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_electiva
    ADD CONSTRAINT solicitud_electiva_carnet_fkey FOREIGN KEY (carnet) REFERENCES public.estudiante(carnet) ON DELETE CASCADE;


--
-- TOC entry 3542 (class 2606 OID 74063)
-- Name: solicitud_electiva solicitud_electiva_codigo_materia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_electiva
    ADD CONSTRAINT solicitud_electiva_codigo_materia_fkey FOREIGN KEY (codigo_materia) REFERENCES public.materia(codigo);


--
-- TOC entry 3543 (class 2606 OID 74068)
-- Name: solicitud_electiva solicitud_electiva_id_ciclo_academico_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_electiva
    ADD CONSTRAINT solicitud_electiva_id_ciclo_academico_fkey FOREIGN KEY (id_ciclo_academico) REFERENCES public.ciclo_academico(id);


-- Completed on 2026-06-11 23:02:29 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict JqYX6Dd9pZ5YqKG36vgE9FzgTeWr0YRvsN2DURrhoY7KLKnuMPdbzu5i2gGxPEp

