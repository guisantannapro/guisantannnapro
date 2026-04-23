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
  _exercise_days jsonb DEFAULT '[]'::jsonb
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
  _existing_carga text;
  _existing_top text;
  _existing_back text;
  _existing_res text;
  _existing_obs text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Permissão negada';
  END IF;

  IF _exercise_weeks < 1 OR _exercise_weeks > 52 THEN
    RAISE EXCEPTION 'Número de semanas inválido';
  END IF;

  -- Pega o user_id do protocolo
  SELECT user_id INTO _user_id FROM public.protocolos WHERE id = _protocolo_id;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Protocolo não encontrado';
  END IF;

  -- Conta exercícios
  FOR _day IN SELECT * FROM jsonb_array_elements(_exercise_days)
  LOOP
    _total_exercises := _total_exercises + jsonb_array_length(COALESCE(_day->'exercises', '[]'::jsonb));
  END LOOP;

  IF _total_exercises = 0 THEN
    RAISE EXCEPTION 'É necessário ao menos 1 exercício';
  END IF;

  -- Atualiza os campos de texto do protocolo
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

  -- Tabela temporária para os exercícios novos
  CREATE TEMP TABLE _new_exercises (
    week_number integer,
    day_label text,
    sort_order integer,
    table_type text,
    exercise_name text,
    metodo text,
    admin_obs text
  ) ON COMMIT DROP;

  -- Popula a tabela temp com exercícios para todas as semanas
  FOR _week IN 1.._exercise_weeks
  LOOP
    _sort := 0;
    FOR _day IN SELECT * FROM jsonb_array_elements(_exercise_days)
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

  -- Remove exercícios que não existem mais (match por week + day_label + exercise_name)
  DELETE FROM public.protocol_exercises pe
  WHERE pe.protocolo_id = _protocolo_id
    AND NOT EXISTS (
      SELECT 1 FROM _new_exercises ne
      WHERE ne.week_number = pe.week_number
        AND ne.day_label = pe.day_label
        AND ne.exercise_name = pe.exercise_name
    );

  -- Atualiza ou insere cada exercício, preservando os dados do cliente quando bate o match
  FOR _week, _sort IN
    SELECT week_number, sort_order FROM _new_exercises ORDER BY week_number, sort_order
  LOOP
    NULL; -- placeholder, fazemos abaixo
  END LOOP;

  -- Loop principal: para cada exercício novo, tenta achar o existente e preserva dados do cliente
  FOR _ex IN
    SELECT to_jsonb(ne.*) FROM _new_exercises ne ORDER BY ne.week_number, ne.sort_order
  LOOP
    _existing_id := NULL;

    SELECT id, client_carga_rep, client_top_set, client_back_off, client_resultado, client_obs
      INTO _existing_id, _existing_carga, _existing_top, _existing_back, _existing_res, _existing_obs
    FROM public.protocol_exercises
    WHERE protocolo_id = _protocolo_id
      AND week_number = (_ex->>'week_number')::integer
      AND day_label = (_ex->>'day_label')
      AND exercise_name = (_ex->>'exercise_name')
    LIMIT 1;

    IF _existing_id IS NOT NULL THEN
      -- Atualiza campos do admin, preserva os do cliente
      UPDATE public.protocol_exercises SET
        sort_order = (_ex->>'sort_order')::integer,
        table_type = _ex->>'table_type',
        metodo = _ex->>'metodo',
        admin_obs = _ex->>'admin_obs',
        updated_at = now()
      WHERE id = _existing_id;
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
      );
    END IF;
  END LOOP;

  RETURN _protocolo_id;
END;
$function$;