CREATE OR REPLACE FUNCTION public.create_structured_protocol(
  _user_id uuid,
  _nome text,
  _tipo_protocolo text,
  _plano_alimentar text DEFAULT ''::text,
  _treino text DEFAULT ''::text,
  _suplementacao text DEFAULT ''::text,
  _cardio text DEFAULT ''::text,
  _observacoes text DEFAULT ''::text,
  _exercise_weeks integer DEFAULT 4,
  _exercise_days jsonb DEFAULT '[]'::jsonb,
  _exercise_days_per_week jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _protocolo_id uuid;
  _day jsonb;
  _ex jsonb;
  _week integer;
  _sort integer;
  _total_exercises integer := 0;
  _week_days jsonb;
  _use_per_week boolean;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Permissão negada';
  END IF;

  IF _exercise_weeks < 1 OR _exercise_weeks > 52 THEN
    RAISE EXCEPTION 'Número de semanas inválido';
  END IF;

  _use_per_week := _exercise_days_per_week IS NOT NULL AND jsonb_array_length(_exercise_days_per_week) = _exercise_weeks;

  -- Conta exercícios para validação
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

  INSERT INTO public.protocolos (
    user_id, nome, tipo_protocolo, plano_alimentar, treino, suplementacao, cardio, observacoes, updated_at
  )
  VALUES (
    _user_id, _nome, _tipo_protocolo, _plano_alimentar, _treino, _suplementacao, _cardio, _observacoes, now()
  )
  RETURNING id INTO _protocolo_id;

  FOR _week IN 1.._exercise_weeks
  LOOP
    _sort := 0;
    -- Pega os dias para esta semana específica (per_week) ou os mesmos dias para todas (legacy)
    IF _use_per_week THEN
      _week_days := _exercise_days_per_week->(_week - 1);
    ELSE
      _week_days := _exercise_days;
    END IF;

    FOR _day IN SELECT * FROM jsonb_array_elements(_week_days)
    LOOP
      FOR _ex IN SELECT * FROM jsonb_array_elements(COALESCE(_day->'exercises', '[]'::jsonb))
      LOOP
        INSERT INTO public.protocol_exercises (
          protocolo_id, user_id, week_number, day_label, sort_order,
          table_type, exercise_name, metodo, admin_obs,
          client_top_set, client_back_off, client_resultado, client_obs
        ) VALUES (
          _protocolo_id, _user_id, _week,
          COALESCE(_day->>'day_label', ''),
          _sort,
          COALESCE(_day->>'table_type', 'standard'),
          COALESCE(_ex->>'exercise_name', ''),
          COALESCE(_ex->>'metodo', ''),
          COALESCE(_ex->>'admin_obs', ''),
          '', '', '', ''
        );
        _sort := _sort + 1;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN _protocolo_id;
END;
$function$;

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
  _exercise_days_per_week jsonb DEFAULT NULL
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
    week_number integer,
    day_label text,
    sort_order integer,
    table_type text,
    exercise_name text,
    metodo text,
    admin_obs text
  ) ON COMMIT DROP;

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
        INSERT INTO _new_exercises VALUES (
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

  -- Remove exercícios que não existem mais
  DELETE FROM public.protocol_exercises pe
  WHERE pe.protocolo_id = _protocolo_id
    AND NOT EXISTS (
      SELECT 1 FROM _new_exercises ne
      WHERE ne.week_number = pe.week_number
        AND ne.day_label = pe.day_label
        AND ne.exercise_name = pe.exercise_name
    );

  -- Update or insert preservando dados do cliente
  FOR _ex IN
    SELECT to_jsonb(ne.*) FROM _new_exercises ne ORDER BY ne.week_number, ne.sort_order
  LOOP
    SELECT id INTO _existing_id
    FROM public.protocol_exercises
    WHERE protocolo_id = _protocolo_id
      AND week_number = (_ex->>'week_number')::integer
      AND day_label = (_ex->>'day_label')
      AND exercise_name = (_ex->>'exercise_name')
    LIMIT 1;

    IF _existing_id IS NOT NULL THEN
      UPDATE public.protocol_exercises SET
        sort_order = (_ex->>'sort_order')::integer,
        table_type = _ex->>'table_type',
        metodo = _ex->>'metodo',
        admin_obs = _ex->>'admin_obs',
        updated_at = now()
      WHERE id = _existing_id;
    ELSE
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
      );
      _existing_id := NULL;
    END IF;
  END LOOP;

  RETURN _protocolo_id;
END;
$function$;

-- Conserta o protocolo do Miguel: replica semana 1 nas semanas 2, 3, 4
INSERT INTO public.protocol_exercises (
  protocolo_id, user_id, week_number, day_label, sort_order,
  table_type, exercise_name, metodo, admin_obs,
  client_top_set, client_back_off, client_resultado, client_obs, client_carga_rep
)
SELECT
  pe.protocolo_id, pe.user_id, w.week_number, pe.day_label, pe.sort_order,
  pe.table_type, pe.exercise_name, pe.metodo, pe.admin_obs,
  '', '', '', '', ''
FROM public.protocol_exercises pe
CROSS JOIN (VALUES (2),(3),(4)) AS w(week_number)
WHERE pe.protocolo_id = 'da49e2b5-518a-4ab3-9ca8-e846f4268405'
  AND pe.week_number = 1
  AND NOT EXISTS (
    SELECT 1 FROM public.protocol_exercises pe2
    WHERE pe2.protocolo_id = pe.protocolo_id
      AND pe2.week_number = w.week_number
      AND pe2.day_label = pe.day_label
      AND pe2.exercise_name = pe.exercise_name
  );