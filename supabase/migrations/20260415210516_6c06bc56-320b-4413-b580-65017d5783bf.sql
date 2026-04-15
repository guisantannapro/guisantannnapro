
CREATE OR REPLACE FUNCTION public.create_structured_protocol(
  _user_id uuid,
  _nome text,
  _tipo_protocolo text,
  _plano_alimentar text DEFAULT '',
  _treino text DEFAULT '',
  _suplementacao text DEFAULT '',
  _cardio text DEFAULT '',
  _observacoes text DEFAULT '',
  _exercise_weeks integer DEFAULT 4,
  _exercise_days jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _protocolo_id uuid;
  _day jsonb;
  _ex jsonb;
  _week integer;
  _sort integer;
  _total_exercises integer := 0;
BEGIN
  -- Only admins can call this
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Permissão negada';
  END IF;

  -- Validate weeks
  IF _exercise_weeks < 1 OR _exercise_weeks > 52 THEN
    RAISE EXCEPTION 'Número de semanas inválido';
  END IF;

  -- Count total exercises
  FOR _day IN SELECT * FROM jsonb_array_elements(_exercise_days)
  LOOP
    _total_exercises := _total_exercises + jsonb_array_length(COALESCE(_day->'exercises', '[]'::jsonb));
  END LOOP;

  IF _total_exercises = 0 THEN
    RAISE EXCEPTION 'É necessário ao menos 1 exercício';
  END IF;

  -- Insert protocol header
  INSERT INTO public.protocolos (user_id, nome, tipo_protocolo, plano_alimentar, treino, suplementacao, cardio, observacoes)
  VALUES (_user_id, _nome, _tipo_protocolo, _plano_alimentar, _treino, _suplementacao, _cardio, _observacoes)
  RETURNING id INTO _protocolo_id;

  -- Insert exercises for each week
  FOR _week IN 1.._exercise_weeks
  LOOP
    _sort := 0;
    FOR _day IN SELECT * FROM jsonb_array_elements(_exercise_days)
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
$$;
