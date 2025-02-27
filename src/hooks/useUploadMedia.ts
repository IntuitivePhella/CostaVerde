import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';
import type { Database } from '@/types/supabase';

interface UploadResult {
  url: string;
  path: string;
}

export const useUploadMedia = () => {
  const supabase = createClientComponentClient<Database>();

  const uploadMedia = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${uuidv4()}.${fileExt}`;
    const bucket = file.type.startsWith('image/') ? 'review-images' : 'review-videos';

    try {
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            onProgress?.(percentage);
          },
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: `${bucket}/${filePath}`,
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      throw new Error('Falha ao fazer upload do arquivo. Por favor, tente novamente.');
    }
  };

  const deleteMedia = async (path: string): Promise<void> => {
    const [bucket, ...pathParts] = path.split('/');
    const filePath = pathParts.join('/');

    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath]);
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw new Error('Falha ao deletar arquivo. Por favor, tente novamente.');
    }
  };

  return {
    uploadMedia,
    deleteMedia,
  };
}; 