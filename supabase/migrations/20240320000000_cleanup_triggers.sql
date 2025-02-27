-- Listar e remover todos os triggers na tabela reviews
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN (
        SELECT tgname as trigger_name
        FROM pg_trigger
        WHERE tgrelid = 'public.reviews'::regclass
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.reviews', trigger_record.trigger_name);
    END LOOP;
END $$; 