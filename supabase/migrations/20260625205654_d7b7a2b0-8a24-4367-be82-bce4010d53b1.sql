CREATE OR REPLACE FUNCTION public.update_structured_protocol(
  _protocolo_id uuid,
  _nome text,
  _tipo_protocolo text,
  _plano_alimentar text DEFAULT ''::text,
  _treino text DEFAULT ''::text,
  _suplementacao text DEFAULT ''::text,
  _cardio text DEFAULT ''::text,
  _observacoes text DEFAULT ''::text,
  _exercise_weeks integer DEFAULT 4,
  _exercise_days jsonb DEFAULT '[]'::jsonb,
  _exercise_days_per_week jsonb DEFAULT NULL::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
  _day jsonb;
  _ex jsonb;
  _week integer;
  _sort integer;
  _total_exercises integer := 0;
  _existing_id uuid;
  _week_days jsonb;
  _use_per_week boolean;
  _db_id_text text;
  _db_id uuid;
  _new_row_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Permissão negada';
  END IF;

  IF _exercise_weeks < 1 OR _exercise_weeks > 52 THEN
    RAISE EXCEPTION 'Número de semanas inválido';
  END IF;

  SELECT user_id INTO _user_id FROM public.protocolos WHERE id = _protocolo_id;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Protocolo não encontrado';
  END IF;

  _use_per_week := _exercise_days_per_week IS NOT NULL AND jsonb_array_length(_exercise_days_per_week) = _exercise_weeks;

  -- Conta exercícios
  IF _use_per_week THEN
    FOR _week_days IN SELECT * FROM jsonb_array_elements(_exercise_days_per_week)
    LOOP
      FOR _day IN SELECT * FROM jsonb_array_elements(_week_days)
      LOOP
        _total_exercises := _total_exercises + jsonb_array_length(COALESCE(_day->'exercises', '[]'::jsonb));
      END LOOP;
    END LOOP;
  ELSE
    FOR _day IN SELECT * FROM jsonb_array_elements(_exercise_days)
    LOOP
      _total_exercises := _total_exercises + jsonb_array_length(COALESCE(_day->'exercises', '[]'::jsonb));
    END LOOP;
  END IF;

  IF _total_exercises = 0 THEN
    RAISE EXCEPTION 'É necessário ao menos 1 exercício';
  END IF;

  UPDATE public.protocolos SET
    nome = _nome,
    tipo_protocolo = _tipo_protocolo,
    plano_alimentar = _plano_alimentar,
    treino = _treino,
    suplementacao = _suplementacao,
    cardio = _cardio,
    observacoes = _observacoes,
    updated_at = now()
  WHERE id = _protocolo_id;

  -- Tabela temp com todos os exercícios novos para todas as semanas
  CREATE TEMP TABLE _new_exercises (
    db_id uuid,
    week_number integer,
    day_label text,
    sort_order integer,
    table_type text,
    exercise_name text,
    metodo text,
    admin_obs text
  ) ON COMMIT DROP;

  -- Track which row ids we end up touching (preserved or inserted)
  CREATE TEMP TABLE _kept_ids (id uuid PRIMARY KEY) ON COMMIT DROP;

  FOR _week IN 1.._exercise_weeks
  LOOP
    _sort := 0;
    IF _use_per_week THEN
      _week_days := _exercise_days_per_week->(_week - 1);
    ELSE
      _week_days := _exercise_days;
    END IF;

    FOR _day IN SELECT * FROM jsonb_array_elements(_week_days)
    LOOP
      FOR _ex IN SELECT * FROM jsonb_array_elements(COALESCE(_day->'exercises', '[]'::jsonb))
      LOOP
        _db_id_text := NULLIF(_ex->>'db_id', '');
        BEGIN
          _db_id := _db_id_text::uuid;
        EXCEPTION WHEN OTHERS THEN
          _db_id := NULL;
        END;

        INSERT INTO _new_exercises VALUES (
          _db_id,
          _week,
          COALESCE(_day->>'day_label', ''),
          _sort,
          COALESCE(_day->>'table_type', 'standard'),
          COALESCE(_ex->>'exercise_name', ''),
          COALESCE(_ex->>'metodo', ''),
          COALESCE(_ex->>'admin_obs', '')
        );
        _sort := _sort + 1;
      END LOOP;
    END LOOP;
  END LOOP;

  -- Processa cada exercício: prioriza match por db_id, faz UPDATE preservando client_*
  FOR _ex IN
    SELECT to_jsonb(ne.*) FROM _new_exercises ne ORDER BY ne.week_number, ne.sort_order
  LOOP
    _existing_id := NULL;

    IF (_ex->>'db_id') IS NOT NULL THEN
      SELECT id INTO _existing_id
      FROM public.protocol_exercises
      WHERE id = (_ex->>'db_id')::uuid
        AND protocolo_id = _protocolo_id
      LIMIT 1;
    END IF;

    IF _existing_id IS NOT NULL THEN
      -- Match por id real: atualiza tudo do admin (incluindo nome), preserva client_*
      UPDATE public.protocol_exercises SET
        week_number = (_ex->>'week_number')::integer,
        day_label = _ex->>'day_label',
        sort_order = (_ex->>'sort_order')::integer,
        table_type = _ex->>'table_type',
        exercise_name = _ex->>'exercise_name',
        metodo = _ex->>'metodo',
        admin_obs = _ex->>'admin_obs',
        updated_at = now()
      WHERE id = _existing_id;

      INSERT INTO _kept_ids(id) VALUES (_existing_id) ON CONFLICT DO NOTHING;
    ELSE
      -- Insere novo exercício em branco para o cliente
      INSERT INTO public.protocol_exercises (
        protocolo_id, user_id, week_number, day_label, sort_order,
        table_type, exercise_name, metodo, admin_obs,
        client_top_set, client_back_off, client_resultado, client_obs, client_carga_rep
      ) VALUES (
        _protocolo_id, _user_id,
        (_ex->>'week_number')::integer,
        _ex->>'day_label',
        (_ex->>'sort_order')::integer,
        _ex->>'table_type',
        _ex->>'exercise_name',
        _ex->>'metodo',
        _ex->>'admin_obs',
        '', '', '', '', ''
      ) RETURNING id INTO _new_row_id;

      INSERT INTO _kept_ids(id) VALUES (_new_row_id) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  -- Remove apenas linhas cujo id não foi preservado nem inserido nesta operação
  DELETE FROM public.protocol_exercises pe
  WHERE pe.protocolo_id = _protocolo_id
    AND pe.id NOT IN (SELECT id FROM _kept_ids);

  RETURN _protocolo_id;
END;
$function$;