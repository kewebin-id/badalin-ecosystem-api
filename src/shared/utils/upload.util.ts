import { createClient } from '@supabase/supabase-js';
import { globalLogger as Logger } from './logger';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  Logger.warn('Supabase credentials missing. Supabase client will fail.', 'SupabaseUtil');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadFile = async (
  fileOrBase64: string,
  bucket: string = process.env.SUPABASE_BUCKET || 'insights',
  fileName?: string,
) => {
  try {
    let body: Buffer;
    let finalFileName = fileName || `${Math.random().toString(36).substring(2)}-${Date.now()}`;
    let contentType: string | undefined;

    if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
      // Handle base64 with data URL header
      const [header, content] = fileOrBase64.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
      
      body = Buffer.from(content, 'base64');
      contentType = mime;
      
      const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];
      if (!finalFileName.includes('.')) {
        finalFileName = `${finalFileName}.${ext}`;
      }
    } else {
      // Handle raw base64
      body = Buffer.from(fileOrBase64, 'base64');
      contentType = 'image/png';
      if (!finalFileName.includes('.')) {
        finalFileName = `${finalFileName}.png`;
      }
    }

    const { data, error } = await supabase.storage.from(bucket).upload(finalFileName, body, {
      contentType,
      upsert: true,
    });

    if (error) {
      Logger.error(`Supabase upload error in bucket "${bucket}":`, error.message, 'SupabaseUtil');
      throw error;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(finalFileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    Logger.error(`Unexpected error during file upload to bucket "${bucket}":`, error, 'SupabaseUtil');
    throw error;
  }
};
